# Gateway API Routes

The `routes` map creates [Gateway API](https://gateway-api.sigs.k8s.io/) route resources. Each entry specifies its `kind` to determine the CRD type. Gateways are **not** created by this chart — they are pre-existing cluster infrastructure that routes attach to via `parentRefs`.

## Route Types

| `kind` | API Version | Status |
|--------|------------|--------|
| `HTTPRoute` | `gateway.networking.k8s.io/v1` | GA |
| `GRPCRoute` | `gateway.networking.k8s.io/v1` | GA |
| `TLSRoute` | `gateway.networking.k8s.io/v1` | GA |
| `TCPRoute` | `gateway.networking.k8s.io/v1alpha2` | Alpha |
| `UDPRoute` | `gateway.networking.k8s.io/v1alpha2` | Alpha |

Default: `HTTPRoute`.

## HTTPRoute

```yaml
routes:
  web:
    kind: HTTPRoute
    parentRefs:
      - name: my-gateway
        namespace: gateway-system
        sectionName: https          # optional — gateway listener name
    hostnames:
      - app.example.com
    rules:
      - matches:
          - path:
              type: PathPrefix
              value: /
        backendRefs:
          - name: http              # key from services map, auto-prefixed
            port: 80
        timeouts:
          request: 30s
          backendRequest: 15s
```

### Traffic Splitting

```yaml
routes:
  canary:
    kind: HTTPRoute
    parentRefs:
      - name: my-gateway
    hostnames:
      - app.example.com
    rules:
      - matches:
          - path:
              type: PathPrefix
              value: /
        backendRefs:
          - name: http
            port: 80
            weight: 90
          - name: http-canary
            port: 80
            weight: 10
```

### Header Matching & Filters

```yaml
routes:
  api-v2:
    kind: HTTPRoute
    parentRefs:
      - name: my-gateway
    hostnames:
      - api.example.com
    rules:
      - matches:
          - headers:
              - name: X-Api-Version
                value: v2
        backendRefs:
          - name: http
            port: 80
        filters:
          - type: RequestHeaderModifier
            requestHeaderModifier:
              set:
                - name: X-Forwarded-Prefix
                  value: /v2
```

[HTTPRoute reference](https://gateway-api.sigs.k8s.io/api-types/httproute/)

## GRPCRoute

```yaml
routes:
  grpc:
    kind: GRPCRoute
    parentRefs:
      - name: my-gateway
        sectionName: grpc
    hostnames:
      - grpc.example.com
    rules:
      - matches:
          - method:
              service: myapp.v1.ItemService
              method: GetItem
        backendRefs:
          - name: grpc
            port: 9090
```

[GRPCRoute reference](https://gateway-api.sigs.k8s.io/api-types/grpcroute/)

## TLSRoute

For TLS passthrough — traffic is forwarded without termination.

```yaml
routes:
  tls:
    kind: TLSRoute
    parentRefs:
      - name: my-gateway
        sectionName: tls-passthrough
    hostnames:
      - secure.example.com
    rules:
      - backendRefs:
          - name: http
            port: 443
```

[TLSRoute reference](https://gateway-api.sigs.k8s.io/api-types/tlsroute/)

## TCPRoute (Alpha)

```yaml
routes:
  postgres:
    kind: TCPRoute
    parentRefs:
      - name: my-gateway
        sectionName: postgres
    rules:
      - backendRefs:
          - name: postgres
            port: 5432
```

[TCP routing guide](https://gateway-api.sigs.k8s.io/guides/tcp/)

## UDPRoute (Alpha)

```yaml
routes:
  dns:
    kind: UDPRoute
    parentRefs:
      - name: my-gateway
        sectionName: dns
    rules:
      - backendRefs:
          - name: dns
            port: 53
```

## Backend References

`backendRefs[].name` references a key from the `services` map and is auto-prefixed with `<fullname>-`. The `port` is the service port number.

[Gateway API reference](https://gateway-api.sigs.k8s.io/) |
[API specification](https://gateway-api.sigs.k8s.io/reference/spec/)
