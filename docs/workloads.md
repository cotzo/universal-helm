# Workload Types

The `workloadType` field selects which Kubernetes workload controller to create. Only one is active per release.

```yaml
workloadType: Deployment  # Deployment | StatefulSet | DaemonSet | CronJob | Job
```

## Deployment

Standard stateless workload. Supports replicas, rolling updates, and HPA.

```yaml
workloadType: Deployment
deployment:
  replicaCount: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: "25%"
      maxUnavailable: 0
  revisionHistoryLimit: 5
```

[Kubernetes Deployment reference](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)

## StatefulSet

For stateful applications requiring stable network identities and persistent storage.

A headless service is **auto-generated** from all service ports. Persistence entries become [volumeClaimTemplates](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#volume-claim-templates).

```yaml
workloadType: StatefulSet
statefulSet:
  replicaCount: 3
  podManagementPolicy: OrderedReady  # or Parallel
  publishNotReadyAddresses: true
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      partition: 0
  persistentVolumeClaimRetentionPolicy:
    whenDeleted: Retain
    whenScaled: Retain
```

[Kubernetes StatefulSet reference](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)

## DaemonSet

Runs one pod per node. No replica count -- one pod per matched node.

```yaml
workloadType: DaemonSet
daemonSet:
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
```

[Kubernetes DaemonSet reference](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/)

## CronJob

Scheduled batch workload. Services, HPA, and PDB are automatically skipped.

```yaml
workloadType: CronJob
cronJob:
  schedule: "0 2 * * *"
  timeZone: "UTC"
  concurrencyPolicy: Forbid    # Allow | Forbid | Replace
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  startingDeadlineSeconds: 300
job:
  backoffLimit: 3
  activeDeadlineSeconds: 3600
  ttlSecondsAfterFinished: 86400
```

[Kubernetes CronJob reference](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)

## Job

One-off batch workload.

```yaml
workloadType: Job
job:
  backoffLimit: 3
  completions: 1
  parallelism: 1
  completionMode: NonIndexed   # or Indexed
  ttlSecondsAfterFinished: 3600
```

[Kubernetes Job reference](https://kubernetes.io/docs/concepts/workloads/controllers/job/)
