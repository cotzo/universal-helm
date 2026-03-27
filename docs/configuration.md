# Configuration

## ConfigMaps

Pure data definitions. Mounting and env injection is configured per container.

```yaml
configMaps:
  app-config:
    data:
      config.yaml: |
        server:
          port: 8080
      log-level: info
    annotations: {}
    labels: {}
```

Checksum annotations are automatically added to the pod template, triggering rollouts when ConfigMap data changes.

[ConfigMap reference](https://kubernetes.io/docs/concepts/configuration/configmap/)

## Secrets

```yaml
secrets:
  app-credentials:
    type: Opaque                   # defaults to Opaque
    stringData:
      api-key: "my-key"

  tls-certs:
    type: kubernetes.io/tls
    data:                          # base64-encoded
      tls.crt: LS0tLS1CRUdJTi...
      tls.key: LS0tLS1CRUdJTi...

  docker-registry:
    type: kubernetes.io/dockerconfigjson
    data:
      .dockerconfigjson: eyJhdXRocyI6e319
```

Checksum annotations are automatically added for `stringData`-based secrets.

[Secret reference](https://kubernetes.io/docs/concepts/configuration/secret/) |
[Secret types](https://kubernetes.io/docs/concepts/configuration/secret/#secret-types)

## External Secrets

Integrates with [External Secrets Operator](https://external-secrets.io/) to sync secrets from external providers.

```yaml
externalSecrets:
  aws-credentials:
    refreshInterval: 1h
    secretStoreRef:
      name: aws-secrets-manager
      kind: ClusterSecretStore     # SecretStore | ClusterSecretStore
    target:
      creationPolicy: Owner
      deletionPolicy: Retain
      template:                    # optional: template the output secret
        type: Opaque
        data:
          conn: "postgresql://{{ .username }}:{{ .password }}@db:5432/mydb"
    data:
      - secretKey: access-key-id
        remoteRef:
          key: /prod/app/credentials
          property: access_key_id
    # or bulk extract:
    dataFrom:
      - extract:
          key: database/creds/my-role
```

[External Secrets Operator docs](https://external-secrets.io/)

## How Containers Reference Config

Containers declare their own config dependencies -- see [Containers](containers.md) for the unified `env` and `mounts` syntax. The chart auto-prefixes resource names and auto-generates pod-level volumes.
