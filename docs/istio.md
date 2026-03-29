# Istio

Istio resources are defined under `networking.istio`. Requires [Istio](https://istio.io/) CRDs installed in the cluster.

## VirtualService

Routes traffic to services with retries, timeouts, traffic splitting, and fault injection. `destination.host` references a key from `networking.services` and is auto-prefixed with `<fullname>-`.

```yaml
networking:
  istio:
    virtualServices:
      http:
        hosts:
          - app.example.com
        gateways:
          - istio-system/my-gateway
        http:
          - match:
              - uri:
                  prefix: /api
            route:
              - destination:
                  host: http              # auto-prefixed to <fullname>-http
                  port:
                    number: 80
            timeout: 10s
            retries:
              attempts: 3
              perTryTimeout: 2s
```

### Traffic Splitting

```yaml
networking:
  istio:
    virtualServices:
      canary:
        hosts:
          - app.example.com
        http:
          - route:
              - destination:
                  host: http
                  port:
                    number: 80
                weight: 90
              - destination:
                  host: http
                  port:
                    number: 80
                weight: 10
```

### External Services

Set `external: true` on a destination to skip auto-prefixing for cross-namespace FQDNs:

```yaml
networking:
  istio:
    virtualServices:
      cross-ns:
        hosts:
          - app.example.com
        http:
          - route:
              - destination:
                  host: reviews.other-ns.svc.cluster.local
                  external: true
                  port:
                    number: 80
```

[VirtualService reference](https://istio.io/latest/docs/reference/config/networking/virtual-service/)

## DestinationRule

Defines load balancing, circuit breaking, outlier detection, and version subsets. `host` references a service key and is auto-prefixed. Set `externalHost: true` to skip prefixing.

```yaml
networking:
  istio:
    destinationRules:
      http:
        host: http                        # auto-prefixed to <fullname>-http
        trafficPolicy:
          loadBalancer:
            simple: LEAST_REQUEST
          connectionPool:
            tcp:
              maxConnections: 100
            http:
              h2UpgradePolicy: DEFAULT
              http1MaxPendingRequests: 100
          outlierDetection:
            consecutive5xxErrors: 5
            interval: 30s
            baseEjectionTime: 30s
        subsets:
          - name: v1
            labels:
              version: v1
          - name: v2
            labels:
              version: v2
```

[DestinationRule reference](https://istio.io/latest/docs/reference/config/networking/destination-rule/)

## PeerAuthentication

Configures mutual TLS for workloads. The `selector` defaults to the chart's selectorLabels if not specified.

```yaml
networking:
  istio:
    peerAuthentication:
      default:
        mtls:
          mode: STRICT              # PERMISSIVE | STRICT | DISABLE | UNSET
```

### Per-port mTLS override

```yaml
networking:
  istio:
    peerAuthentication:
      mixed:
        mtls:
          mode: STRICT
        portLevelMtls:
          8080:
            mode: PERMISSIVE
```

[PeerAuthentication reference](https://istio.io/latest/docs/reference/config/security/peer_authentication/)

## AuthorizationPolicy

Fine-grained access control. The `selector` defaults to the chart's selectorLabels if not specified.

```yaml
networking:
  istio:
    authorizationPolicies:
      allow-frontend:
        action: ALLOW                 # ALLOW | DENY | CUSTOM | AUDIT
        rules:
          - from:
              - source:
                  principals: ["cluster.local/ns/default/sa/frontend"]
            to:
              - operation:
                  methods: ["GET", "POST"]
                  paths: ["/api/*"]
```

### Deny policy

```yaml
networking:
  istio:
    authorizationPolicies:
      deny-admin:
        action: DENY
        rules:
          - to:
              - operation:
                  paths: ["/admin*"]
```

[AuthorizationPolicy reference](https://istio.io/latest/docs/reference/config/security/authorization-policy/)

## Resource Naming

Each resource is named `<fullname>-<key>`. Custom annotations and labels can be set per entry.

[Istio documentation](https://istio.io/latest/docs/)
