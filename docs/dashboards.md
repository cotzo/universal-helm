# Dashboards

## Grafana Dashboards

Creates [GrafanaDashboard](https://grafana-operator.github.io/grafana-operator/docs/dashboards/) resources for the [Grafana Operator](https://grafana-operator.github.io/grafana-operator/). Requires `integrations.grafana.enabled: true`.

### 1. Define Grafana instances

```yaml
integrations:
  grafana:
    enabled: true
    instances:
      primary:
        matchLabels:
          dashboards: grafana
```

### 2. Add dashboards

Each dashboard specifies `instances` (which Grafana instances to deploy to), a `source` (where the dashboard JSON comes from), and optionally a `destination` (folder/uid).

### Source: Inline JSON

```yaml
dashboards:
  grafana:
    app-overview:
      instances: [primary]
      source:
        type: json
        json: |
          { "title": "App Overview", "uid": "app-overview", "panels": [] }
      destination:
        folder: My App
```

### Source: grafana.com

```yaml
dashboards:
  grafana:
    node-exporter:
      instances: [primary, staging]
      source:
        type: grafanaCom
        grafanaCom:
          id: 1860
          revision: 37
```

### Source: URL

```yaml
dashboards:
  grafana:
    from-url:
      instances: [primary]
      source:
        type: url
        url: https://example.com/dashboard.json
        contentCacheDuration: 1h
        urlAuthorization:
          type: bearer
          credential:
            name: grafana-token
            key: token
```

### Source: ConfigMap

```yaml
dashboards:
  grafana:
    from-configmap:
      instances: [primary]
      source:
        type: configMap
        configMap: my-dashboards
        key: app-dashboard.json
```

### Source: Gzip JSON

```yaml
dashboards:
  grafana:
    compressed:
      instances: [primary]
      source:
        type: gzipJson
        gzipJson: H4sIAAAAAAAAA...
```

### Datasource Mapping

```yaml
dashboards:
  grafana:
    with-datasource:
      instances: [primary]
      source:
        type: json
        json: '...'
      datasources:
        - inputName: DS_PROMETHEUS
          datasourceName: Prometheus
```

### Source Types

| `source.type` | Fields | Description |
|----------------|--------|-------------|
| `url` | `url`, `urlAuthorization`, `contentCacheDuration` | Fetch from URL |
| `grafanaCom` | `grafanaCom.id`, `grafanaCom.revision` | Import from grafana.com |
| `json` | `json` | Inline JSON |
| `gzipJson` | `gzipJson` | Gzip-compressed base64 JSON |
| `configMap` | `configMap`, `key` | Load from ConfigMap |

### Destination Options

| Field | Description |
|-------|-------------|
| `destination.folder` | Grafana folder name |
| `destination.folderUID` | Folder UID (takes precedence) |
| `destination.folderRef` | GrafanaFolder resource name |
| `destination.uid` | Dashboard UID (max 40 chars, auto-generated if omitted) |

### Other Options

| Field | Description |
|-------|-------------|
| `instances` | **Required.** Array of instance keys from `integrations.grafana.instances` |
| `datasources` | Datasource variable substitutions |
| `plugins` | Required Grafana plugins |
| `resyncPeriod` | Re-sync interval (default `10m0s`) |
| `allowCrossNamespaceImport` | Allow matching Grafana instances in other namespaces |
| `suspend` | Pause synchronization |

[Grafana Operator docs](https://grafana-operator.github.io/grafana-operator/) |
[GrafanaDashboard API](https://grafana-operator.github.io/grafana-operator/docs/dashboards/)
