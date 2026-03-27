# Monitoring

The `monitors` map creates monitoring CRDs. Each entry specifies its `kind` and `operator` to determine the exact resource type.

## CRD Mapping

| `kind` | `operator` | Creates | API Version |
|--------|-----------|---------|-------------|
| `service` | `prometheus` | ServiceMonitor | `monitoring.coreos.com/v1` |
| `pod` | `prometheus` | PodMonitor | `monitoring.coreos.com/v1` |
| `service` | `victoriametrics` | VMServiceScrape | `operator.victoriametrics.com/v1beta1` |
| `pod` | `victoriametrics` | VMPodScrape | `operator.victoriametrics.com/v1beta1` |

Defaults: `kind: service`, `operator: prometheus`.

## Examples

### Prometheus ServiceMonitor

```yaml
monitors:
  metrics:
    kind: service
    operator: prometheus
    port: metrics
    path: /metrics
    interval: 15s
    scrapeTimeout: 10s
    labels:
      release: prometheus
```

### VictoriaMetrics VMServiceScrape

```yaml
monitors:
  vm-metrics:
    kind: service
    operator: victoriametrics
    port: metrics
    path: /metrics
    interval: 15s
    vmScrapeParams:
      stream_parse: true
      disable_compression: true
```

### Prometheus PodMonitor

```yaml
monitors:
  pod-metrics:
    kind: pod
    operator: prometheus
    port: metrics
    path: /metrics
    interval: 30s
    podTargetLabels:
      - app.kubernetes.io/name
```

## Convenience vs Full Override

Simple cases use convenience fields (`port`, `path`, `interval`, etc.) to generate a single endpoint. For complex multi-endpoint configs, use the `endpoints` array which replaces all convenience fields:

```yaml
monitors:
  multi-endpoint:
    kind: service
    operator: prometheus
    endpoints:
      - port: http
        path: /metrics
        interval: 15s
      - port: grpc
        path: /grpc-metrics
        interval: 30s
        metricRelabelings:
          - sourceLabels: [__name__]
            regex: "grpc_.*"
            action: keep
```

## All Options

```yaml
monitors:
  example:
    kind: service                  # service | pod
    operator: prometheus           # prometheus | victoriametrics
    port: metrics
    path: /metrics
    interval: 15s
    scrapeTimeout: 10s
    scheme: ""                     # http | https
    honorLabels: false
    honorTimestamps: true
    followRedirects: true
    params: {}
    tlsConfig: {}
    bearerTokenSecret: {}
    basicAuth: {}
    authorization: {}
    oauth2: {}
    proxyURL: ""
    metricRelabelings: []
    relabelings: []
    endpoints: []                  # full override
    selector: {}                   # extra matchLabels
    namespaceSelector: {}
    jobLabel: ""
    targetLabels: []               # service kind only
    podTargetLabels: []            # pod kind only
    sampleLimit: 0
    # VM-specific
    vmScrapeParams: {}
    maxScrapeSize: ""
    seriesLimit: 0
    labels: {}
    annotations: {}
```

[Prometheus Operator docs](https://prometheus-operator.dev/docs/getting-started/introduction/) |
[VictoriaMetrics Operator docs](https://docs.victoriametrics.com/operator/)
