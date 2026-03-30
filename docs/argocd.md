# Argo CD Integration

Chartpack has first-class support for Argo CD deployments. Features are designed to work with both Argo CD and Flux (Helm-native) without configuration changes.

## Sync Waves

Argo CD [sync waves](https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/) control the order in which resources are applied during a sync. Enable auto-assigned sync waves:

```yaml
argocd:
  syncWaves:
    enabled: true
```

### Default Wave Ordering

| Wave | Resources |
|------|-----------|
| `-5` | ConfigMaps, Secrets, ExternalSecrets, Generated Secrets |
| `-3` | ServiceAccount, Roles, ClusterRoles, Bindings |
| `-2` | PersistentVolumeClaims |
| `-1` | NetworkPolicies, Certificates, PeerAuthentication, AuthorizationPolicy |
| `0`  | Workloads (Deployment, StatefulSet, DaemonSet, Job, CronJob, Rollout), HPA, VPA, ScaledObject, ScaledJob, PDB |
| `1`  | Services, DestinationRules |
| `2`  | Ingresses, Gateway API routes, VirtualServices |
| `3`  | Monitors (ServiceMonitor, PodMonitor, etc.), Alerting Rules |
| `5`  | Grafana Dashboards, Envoy BackendTrafficPolicy |

This ensures configuration and credentials exist before the workload starts, and ingress rules are applied after pods are running.

### Per-Resource Override

Override the default wave on any individual resource using `syncWave`:

```yaml
argocd:
  syncWaves:
    enabled: true

config:
  secrets:
    db-creds:
      syncWave: -10           # deploy before everything else
      stringData:
        password: s3cret

  configMaps:
    feature-flags:
      syncWave: 0             # deploy alongside workloads instead of early
      data:
        flags: "{}"
```

Per-resource `syncWave` works **even without `argocd.syncWaves.enabled`** — explicit overrides are always honored:

```yaml
# No auto waves, but this specific secret gets a wave annotation
config:
  secrets:
    critical:
      syncWave: -10
      stringData:
        key: value
```

## Sync Options

Apply [sync options](https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/) to all resources:

```yaml
argocd:
  syncOptions:
    - ServerSideApply=true
    - SkipDryRunOnMissingResource=true
```

This renders `argocd.argoproj.io/sync-options: ServerSideApply=true,SkipDryRunOnMissingResource=true` on every resource.

### Common Sync Options

| Option | Use case |
|--------|----------|
| `ServerSideApply=true` | Large CRDs, field ownership conflicts |
| `SkipDryRunOnMissingResource=true` | CRDs that may not exist yet |
| `Prune=false` | Prevent deletion when removed from Git |
| `Replace=true` | Force replace instead of patch |
| `RespectIgnoreDifferences=true` | Honor ignoreDifferences settings |

## Hooks

Chartpack automatically renders both Helm and Argo CD hook annotations on [hook Jobs](hooks.md). No additional configuration needed:

```yaml
hooks:
  db-migrate:
    events:
      - pre-install
      - pre-upgrade
    containers:
      migrate:
        image: { repository: my-app }
        command: ["./migrate"]
```

This renders:
- `helm.sh/hook: pre-install,pre-upgrade` (for Flux/Helm)
- `argocd.argoproj.io/hook: PreSync` (for Argo CD)
- `argocd.argoproj.io/hook-delete-policy: BeforeHookCreation`

See [Hooks](hooks.md) for the full event mapping table and details.

## Full Example

```yaml
argocd:
  syncWaves:
    enabled: true
  syncOptions:
    - ServerSideApply=true

config:
  secrets:
    db-creds:
      stringData:
        password: s3cret      # auto wave: -5

networking:
  services:
    http:
      ports:
        http:
          port: 80              # auto wave: 1
  ingresses:
    public:
      hosts:
        - host: app.example.com
          paths:
            - path: /           # auto wave: 2

hooks:
  db-migrate:
    events: [pre-install, pre-upgrade]
    containers:
      run:
        image: { repository: my-app }
        command: ["./migrate"]   # runs as Argo CD PreSync

containers:
  app:
    image:
      repository: my-app        # auto wave: 0 (Deployment)
```

## Compatibility

| Tool | Sync Waves | Sync Options | Hooks |
|------|-----------|-------------|-------|
| **Argo CD** | `argocd.argoproj.io/sync-wave` | `argocd.argoproj.io/sync-options` | `argocd.argoproj.io/hook` |
| **Flux** | Ignored (harmless) | Ignored (harmless) | `helm.sh/hook` (native) |
| **Helm CLI** | Ignored (harmless) | Ignored (harmless) | `helm.sh/hook` (native) |

All annotations are safe to have on resources regardless of which tool manages the deployment.

[Argo CD sync waves](https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/) |
[Argo CD sync options](https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/) |
[Argo CD resource hooks](https://argo-cd.readthedocs.io/en/stable/user-guide/resource_hooks/)
