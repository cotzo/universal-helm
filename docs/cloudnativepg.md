# PostgreSQL (CloudNativePG)

Creates a [CloudNativePG](https://cloudnative-pg.io/) `Cluster` with optional backups and auto-injects connection credentials into your app containers.

**Requires:** CloudNativePG operator installed on the cluster.

## Basic usage

```yaml
dependencies:
  postgres:
    enabled: true
    instances: 3
    database: myapp
    owner: myapp
    storage:
      size: 20Gi
    inject:
      containers: [app]
```

This creates a 3-instance CNPG Cluster named `<release>-pg` and injects the CNPG-generated app secret (`<release>-pg-app`) as `envFrom` into the `app` container. The secret contains: `dbname`, `host`, `port`, `user`, `password`, `uri`, `jdbc-uri`.

## Injection

Injection is explicit -- you must list which containers receive the database credentials.

**Bulk injection (envFrom)** -- all secret keys available as env vars:

```yaml
dependencies:
  postgres:
    enabled: true
    inject:
      containers: [app, worker]
      method: envFrom
```

**Individual env vars** -- map specific keys to custom env var names:

```yaml
dependencies:
  postgres:
    enabled: true
    inject:
      containers: [app]
      method: env
      envMapping:
        DATABASE_URL: uri
        PGHOST: host
        PGPORT: port
        PGDATABASE: dbname
        PGUSER: user
        PGPASSWORD: password
```

Disable injection entirely (e.g. if you wire credentials manually):

```yaml
dependencies:
  postgres:
    enabled: true
    inject:
      enabled: false
```

## Storage

```yaml
dependencies:
  postgres:
    enabled: true
    storage:
      size: 50Gi
      storageClass: fast-ssd
    inject:
      containers: [app]
```

## Image version

Defaults to PostgreSQL 16. Override the major version or provide a full image:

```yaml
dependencies:
  postgres:
    enabled: true
    version: "15"          # uses ghcr.io/cloudnative-pg/postgresql:15
    # or
    imageName: my-registry.io/pg:16.2-custom
    inject:
      containers: [app]
```

## Password management

**Default (`cnpg`)** -- CNPG auto-generates the password. Simplest option:

```yaml
dependencies:
  postgres:
    enabled: true
    password:
      mode: cnpg
    inject:
      containers: [app]
```

**ESO mode** -- generates password via External Secrets Operator Password generator (ArgoCD-safe, no plaintext in Helm output):

```yaml
dependencies:
  postgres:
    enabled: true
    password:
      mode: eso
      generate:
        length: 64
        digits: 10
        symbols: 0
    inject:
      containers: [app]
```

This creates a `Password` generator, a `Secret` with the owner username, and an `ExternalSecret` that merges the generated password into the credential secret. CNPG references this secret during bootstrap.

## Backups

Backups use credentials from `infraSettings.backups`, so developers don't need to know about storage credentials. The infra/devops team provides a base values file with credentials, and developers just enable backups.

### S3

**Infra team provides** (base values file):

```yaml
infraSettings:
  backups:
    s3:
      bucket: company-backups
      path: databases
      region: us-east-1
      endpoint: ""                    # set for S3-compatible stores (MinIO, etc.)
      credentials:
        secretName: s3-backup-creds   # pre-existing K8s secret
        accessKeyId: ACCESS_KEY_ID    # key name within the secret
        secretAccessKey: ACCESS_SECRET_KEY
```

**Developer enables** (app values file):

```yaml
dependencies:
  postgres:
    enabled: true
    backup:
      enabled: true
      type: s3
      retentionPolicy: "30d"
      schedule: "0 0 * * *"
    inject:
      containers: [app]
```

The destination path is auto-built as `s3://<bucket>/<path>/<namespace>/<release>`.

### Azure Blob Storage

**Infra team provides:**

```yaml
infraSettings:
  backups:
    azure:
      storageAccount: myaccount
      path: backups
      credentials:
        secretName: azure-backup-creds
        connectionString: AZURE_CONNECTION_STRING
        storageAccount: AZURE_STORAGE_ACCOUNT
        storageKey: AZURE_STORAGE_KEY
```

**Developer enables:**

```yaml
dependencies:
  postgres:
    enabled: true
    backup:
      enabled: true
      type: azure
    inject:
      containers: [app]
```

### Google Cloud Storage

**Infra team provides:**

```yaml
infraSettings:
  backups:
    gcs:
      bucket: my-gcs-bucket
      path: pg-backups
      credentials:
        secretName: gcs-backup-creds
        applicationCredentials: gcsCredentials
```

**Developer enables:**

```yaml
dependencies:
  postgres:
    enabled: true
    backup:
      enabled: true
      type: gcs
    inject:
      containers: [app]
```

### Explicit destination path

Override the auto-built path when you need full control:

```yaml
dependencies:
  postgres:
    enabled: true
    backup:
      enabled: true
      type: s3
      destinationPath: s3://custom-bucket/custom/path
    inject:
      containers: [app]
```

### WAL compression

Defaults to `gzip`. Supported: `gzip`, `bzip2`, `snappy`, `lz4`, `lzo`, `zstd`.

```yaml
dependencies:
  postgres:
    enabled: true
    backup:
      enabled: true
      type: s3
      walCompression: zstd
    inject:
      containers: [app]
```

## Extra CNPG spec fields

Use `extraSpec` for any CNPG Cluster spec field not directly exposed by the chart. These are merged into the Cluster resource's `spec`:

```yaml
dependencies:
  postgres:
    enabled: true
    extraSpec:
      enableSuperuserAccess: true
      postgresql:
        parameters:
          max_connections: "200"
          shared_buffers: "256MB"
      resources:
        requests:
          memory: "512Mi"
          cpu: "500m"
        limits:
          memory: "1Gi"
    inject:
      containers: [app]
```

## Point-in-Time Recovery (PITR)

PITR restores a cluster from a backup at a specific point in time. When `recovery.enabled` is set, the chart switches bootstrap from `initdb` to `recovery` and auto-wires the backup credentials from `infraSettings.backups`.

### Basic recovery

```yaml
dependencies:
  postgres:
    enabled: true
    backup:
      enabled: true
      type: s3
    recovery:
      enabled: true
      target:
        targetTime: "2026-03-30T10:00:00Z"
    inject:
      containers: [app]
```

This uses the same `infraSettings.backups` credentials and auto-built destination path as the backup section. The chart generates the `externalClusters` entry automatically.

### Recovery from a different path

If recovering from a different cluster's backup or a specific path:

```yaml
dependencies:
  postgres:
    recovery:
      enabled: true
      destinationPath: s3://other-bucket/old-backups/other-app-pg
      target:
        targetTime: "2026-03-30T10:00:00Z"
```

### Recovery from a different provider

By default, `recovery.type` inherits from `backup.type`. Override it to recover from a different provider:

```yaml
dependencies:
  postgres:
    backup:
      type: s3
    recovery:
      enabled: true
      type: gcs
      destinationPath: gs://migration-bucket/old-backups/my-app
      target:
        targetTime: "2026-03-30T10:00:00Z"
```

### Recovery targets

| Field | Description |
|-------|-------------|
| `targetTime` | Restore to a specific timestamp (e.g. `"2026-03-30T10:00:00Z"`) |
| `targetLSN` | Restore to a specific Log Sequence Number |
| `targetXID` | Restore to a specific transaction ID |
| `targetName` | Restore to a named restore point (created with `pg_create_restore_point()`) |
| `targetImmediate` | Restore to the end of the base backup (set to `true`) |
| `exclusive` | When `true`, stop just before the target instead of including it |

At least one target field is required. Examples:

```yaml
# Restore to a timestamp
recovery:
  enabled: true
  target:
    targetTime: "2026-03-30T10:00:00Z"

# Restore to a specific LSN
recovery:
  enabled: true
  target:
    targetLSN: "0/1234568"

# Restore to end of base backup
recovery:
  enabled: true
  target:
    targetImmediate: true
```

### Recovery workflow

1. Identify the target time (or LSN/XID) you want to recover to
2. Set `recovery.enabled: true` and `recovery.target.targetTime` (or other target)
3. Deploy -- CNPG creates a new cluster restored to that point in time
4. Verify the recovered data is correct
5. Set `recovery.enabled: false` (or remove the recovery section)
6. Redeploy so future pod restarts use normal `initdb` bootstrap

> **Important:** If you leave recovery enabled, CNPG will attempt recovery again on any cluster recreation. Always disable after a successful recovery.

### What happens during recovery

- Bootstrap switches from `initdb` to `recovery`
- An `externalClusters` entry is auto-generated with the backup credentials
- ESO password generation resources are skipped (not needed during recovery)
- Backup and ScheduledBackup resources are still rendered (CNPG continues backing up after recovery)

## Argo CD

When `argocd.syncWaves.enabled: true`, the CNPG Cluster gets sync wave `-2` (after config at `-5`, before workloads at `0`). Override per-resource:

```yaml
dependencies:
  postgres:
    enabled: true
    syncWave: "-4"
    inject:
      containers: [app]
```

## Reloader

The CNPG app secret is automatically added to [Stakater Reloader](https://github.com/stakater/Reloader) annotations on the workload, so your pods restart when credentials rotate.

## Generated resources

When `dependencies.postgres.enabled: true`, the chart creates:

| Resource | Name | Condition |
|----------|------|-----------|
| CNPG `Cluster` | `<release>-pg` | Always |
| CNPG `ScheduledBackup` | `<release>-pg-backup` | `backup.enabled` and `backup.schedule` set |
| `Secret` (credentials) | `<release>-pg-credentials` | `password.mode: eso` and not recovering |
| ESO `Password` generator | `<release>-pg-credentials-password` | `password.mode: eso` and not recovering |
| ESO `ExternalSecret` | `<release>-pg-credentials-gen` | `password.mode: eso` and not recovering |

CNPG operator auto-creates these secrets (not managed by the chart):

| Secret | Contents |
|--------|----------|
| `<release>-pg-app` | `dbname`, `host`, `port`, `user`, `password`, `uri`, `jdbc-uri` |
| `<release>-pg-superuser` | Superuser credentials (when `enableSuperuserAccess: true`) |

## Full example

```yaml
containers:
  app:
    image:
      repository: my-app
      tag: "1.0"
    ports:
      http:
        port: 8080

networking:
  services:
    http:
      ports:
        http:
          port: 8080

infraSettings:
  backups:
    s3:
      bucket: company-backups
      path: databases
      region: us-east-1
      credentials:
        secretName: s3-backup-creds

dependencies:
  postgres:
    enabled: true
    version: "16"
    instances: 3
    database: myapp
    owner: myapp
    storage:
      size: 20Gi
      storageClass: gp3
    password:
      mode: eso
      generate:
        length: 32
    backup:
      enabled: true
      type: s3
      retentionPolicy: "30d"
      schedule: "0 0 * * *"
    inject:
      containers: [app]
      method: env
      envMapping:
        DATABASE_URL: uri
        PGHOST: host
        PGPORT: port
        PGDATABASE: dbname
        PGUSER: user
        PGPASSWORD: password
    extraSpec:
      postgresql:
        parameters:
          max_connections: "200"
```
