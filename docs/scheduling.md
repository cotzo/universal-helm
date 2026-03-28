# Scheduling

## Node Settings

High-level node targeting. Values are always lists, rendered as [nodeAffinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node-affinity) `In` expressions.

```yaml
nodeSettings:
  os:
    - linux
  arch:
    - amd64
    - arm64
```

This generates:

```yaml
nodeAffinity:
  requiredDuringSchedulingIgnoredDuringExecution:
    nodeSelectorTerms:
      - matchExpressions:
          - key: kubernetes.io/os
            operator: In
            values: [linux]
          - key: kubernetes.io/arch
            operator: In
            values: [amd64, arm64]
```

These expressions are **merged** with any existing `podSettings.affinity.nodeAffinity`.

## Pod Settings

All pod-level scheduling lives under `podSettings`:

### Node Selector

Simple key-value node selection (AND logic):

```yaml
podSettings:
  nodeSelector:
    node.kubernetes.io/instance-type: m5.xlarge
    topology.kubernetes.io/zone: us-east-1a
```

[nodeSelector reference](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodeselector)

### Affinity

Full affinity rules. `nodeSettings` expressions are merged into `nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution`.

```yaml
podSettings:
  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchExpressions:
                - key: app.kubernetes.io/name
                  operator: In
                  values: [my-app]
            topologyKey: kubernetes.io/hostname
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: topology.kubernetes.io/zone
                operator: In
                values: [us-east-1a, us-east-1b]
```

[Affinity reference](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity)

### Tolerations

```yaml
podSettings:
  tolerations:
    - key: "dedicated"
      operator: "Equal"
      value: "app"
      effect: "NoSchedule"
    - key: "node.kubernetes.io/not-ready"
      operator: "Exists"
      effect: "NoExecute"
      tolerationSeconds: 300
```

[Tolerations reference](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)

### Topology Spread Constraints

Supports `minDomains` (GA in K8s 1.30) for cluster autoscaler integration.

```yaml
podSettings:
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: DoNotSchedule
      minDomains: 3              # K8s 1.30+ — minimum number of domains
      labelSelector:
        matchLabels:
          app.kubernetes.io/name: my-app
    - maxSkew: 1
      topologyKey: kubernetes.io/hostname
      whenUnsatisfiable: ScheduleAnyway
      labelSelector:
        matchLabels:
          app.kubernetes.io/name: my-app
```

[Topology spread reference](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/)

### Priority

```yaml
podSettings:
  priorityClassName: high-priority
```

[Priority and preemption reference](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/)
