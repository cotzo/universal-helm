# Autoscaling & Availability

## Horizontal Pod Autoscaler

Uses the [autoscaling/v2 API](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/horizontal-pod-autoscaler-v2/). Only applies to Deployment and StatefulSet workloads.

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 75
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "1000"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 30
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
  annotations: {}
  labels: {}
```

When `autoscaling.enabled: true`, the `replicaCount` field in the workload config is omitted (HPA controls replicas).

[HPA reference](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) |
[HPA walkthrough](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/)

## Pod Disruption Budget

Ensures minimum availability during voluntary disruptions. Applies to Deployment, StatefulSet, and DaemonSet.

```yaml
pdb:
  enabled: true
  minAvailable: "50%"          # number or percentage
  # or:
  # maxUnavailable: 1
  unhealthyPodEvictionPolicy: ""  # IfHealthy | AlwaysAllow
  annotations: {}
  labels: {}
```

[PDB reference](https://kubernetes.io/docs/tasks/run-application/configure-pdb/) |
[Disruptions](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/)
