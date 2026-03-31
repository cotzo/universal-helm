export interface StepConfig {
  id: string
  label: string
  icon: string
  /** Dot-separated path into the schema (e.g., "networking.services") */
  schemaPath: string
  /** Description shown at the top of the step */
  description: string
  /** Workload types for which this step is hidden */
  hiddenFor?: string[]
  /** Use a special renderer instead of the generic schema renderer */
  renderer?: 'workloadType' | 'workloadSettings'
}

export const STEP_CONFIG: StepConfig[] = [
  {
    id: 'workloadType',
    label: 'Workload Type',
    icon: 'Box',
    schemaPath: 'workloadType',
    description: 'Choose the type of Kubernetes workload you want to deploy.',
    renderer: 'workloadType',
  },
  {
    id: 'workloadSettings',
    label: 'Workload Settings',
    icon: 'Settings',
    schemaPath: 'workloads',
    description: 'Configure settings specific to your workload type (replicas, strategy, schedule, etc.).',
    renderer: 'workloadSettings',
  },
  {
    id: 'containers',
    label: 'Containers',
    icon: 'Container',
    schemaPath: 'containers',
    description: 'Define the main application containers. At least one container with an image is required.',
  },
  {
    id: 'initContainers',
    label: 'Init Containers',
    icon: 'PlayCircle',
    schemaPath: 'initContainers',
    description: 'Init containers run before the main containers start. Keys are sorted alphabetically - use numeric prefixes (01-, 02-) to control order.',
  },
  {
    id: 'podSettings',
    label: 'Pod Settings',
    icon: 'Cpu',
    schemaPath: 'podSettings',
    description: 'Pod-level settings that apply to all containers: security context, scheduling, tolerations, volumes.',
  },
  {
    id: 'nodeTargeting',
    label: 'Node Targeting',
    icon: 'Target',
    schemaPath: 'nodeTargeting',
    description: 'Control which nodes your pods can be scheduled on. Use "soft" for best-effort, "hard" for strict requirements.',
  },
  {
    id: 'services',
    label: 'Services',
    icon: 'Network',
    schemaPath: 'networking.services',
    description: 'Configure Kubernetes Services to expose your application.',
    hiddenFor: ['Job'],
  },
  {
    id: 'ingresses',
    label: 'Ingresses',
    icon: 'Globe',
    schemaPath: 'networking.ingresses',
    description: 'Configure Kubernetes Ingresses for external access.',
    hiddenFor: ['Job', 'CronJob'],
  },
  {
    id: 'gatewayApi',
    label: 'Gateway API',
    icon: 'Network',
    schemaPath: 'networking.gatewayApi',
    description: 'Configure Gateway API routes (HTTPRoute, GRPCRoute, TLSRoute, etc.).',
    hiddenFor: ['Job', 'CronJob'],
  },
  {
    id: 'oauth2Proxies',
    label: 'OAuth2 Proxy',
    icon: 'Lock',
    schemaPath: 'networking.oauth2Proxies',
    description: 'Configure OAuth2 proxy for authentication (sidecar or separate deployment).',
    hiddenFor: ['Job', 'CronJob'],
  },
  {
    id: 'certificates',
    label: 'Certificates',
    icon: 'FileKey',
    schemaPath: 'networking.certificates',
    description: 'Configure cert-manager Certificate resources for TLS. Certificates auto-mount when a mount path is set.',
  },
  {
    id: 'networkPolicies',
    label: 'Network Policies',
    icon: 'ShieldCheck',
    schemaPath: 'networking.networkPolicies',
    description: 'Configure Kubernetes NetworkPolicies to control pod-to-pod traffic.',
  },
  {
    id: 'istio',
    label: 'Istio',
    icon: 'Shield',
    schemaPath: 'networking.istio',
    description: 'Configure Istio service mesh resources: VirtualServices, DestinationRules, PeerAuthentication, AuthorizationPolicies.',
    hiddenFor: ['Job', 'CronJob'],
  },
  {
    id: 'configMaps',
    label: 'ConfigMaps',
    icon: 'FileText',
    schemaPath: 'config.configMaps',
    description: 'Manage ConfigMaps. Chart-managed ConfigMaps are auto-prefixed and include checksum annotations for automatic pod rollouts.',
  },
  {
    id: 'secrets',
    label: 'Secrets',
    icon: 'Lock',
    schemaPath: 'config.secrets',
    description: 'Manage Secrets with optional auto-generation via ESO Password generators.',
  },
  {
    id: 'externalSecrets',
    label: 'External Secrets',
    icon: 'FileKey',
    schemaPath: 'config.externalSecrets',
    description: 'Configure ExternalSecrets to sync secrets from external stores (AWS Secrets Manager, Vault, etc.).',
  },
  {
    id: 'persistence',
    label: 'Persistence',
    icon: 'HardDrive',
    schemaPath: 'persistence',
    description: 'Configure persistent storage. For StatefulSets, entries become volumeClaimTemplates.',
  },
  {
    id: 'rbac',
    label: 'RBAC',
    icon: 'Users',
    schemaPath: 'rbac',
    description: 'Configure ServiceAccount, Roles, ClusterRoles, and their Bindings.',
  },
  {
    id: 'autoscaling',
    label: 'Autoscaling',
    icon: 'TrendingUp',
    schemaPath: 'autoscaling',
    description: 'Configure HPA, VPA, and KEDA autoscaling. Note: HPA and KEDA are mutually exclusive.',
    hiddenFor: ['Job', 'CronJob', 'DaemonSet'],
  },
  {
    id: 'pdb',
    label: 'Pod Disruption Budget',
    icon: 'ShieldCheck',
    schemaPath: 'pdb',
    description: 'Configure Pod Disruption Budget to ensure availability during voluntary disruptions.',
    hiddenFor: ['Job', 'CronJob'],
  },
  {
    id: 'monitors',
    label: 'Monitors',
    icon: 'Activity',
    schemaPath: 'monitors',
    description: 'Configure ServiceMonitor/PodMonitor for Prometheus or VictoriaMetrics.',
  },
  {
    id: 'alerting',
    label: 'Alerting Rules',
    icon: 'Activity',
    schemaPath: 'alerting',
    description: 'Configure PrometheusRule or VMRule alerting and recording rules.',
  },
  {
    id: 'dashboards',
    label: 'Dashboards',
    icon: 'Activity',
    schemaPath: 'dashboards',
    description: 'Configure Grafana dashboards via the Grafana Operator.',
  },
  {
    id: 'hooks',
    label: 'Hooks',
    icon: 'Anchor',
    schemaPath: 'hooks',
    description: 'Configure Helm lifecycle hooks (pre-install, pre-upgrade, etc.) that run as Jobs.',
  },
  {
    id: 'argocd',
    label: 'Argo CD',
    icon: 'GitBranch',
    schemaPath: 'argocd',
    description: 'Configure Argo CD integration: sync waves and sync options.',
  },
  {
    id: 'global',
    label: 'Global Settings',
    icon: 'Globe',
    schemaPath: 'global',
    description: 'Global labels and annotations applied to ALL generated resources.',
  },
  {
    id: 'infraSettings',
    label: 'Infrastructure Settings',
    icon: 'Settings',
    schemaPath: 'infraSettings',
    description: 'Customize node label keys for your cluster (used by nodeTargeting).',
  },
  {
    id: 'extraResources',
    label: 'Extra Resources',
    icon: 'Plus',
    schemaPath: 'extraResources',
    description: 'Add arbitrary Kubernetes resources not covered by the chart.',
  },
  {
    id: 'review',
    label: 'Review & Export',
    icon: 'Download',
    schemaPath: '',
    description: '',
    renderer: 'workloadType', // placeholder, handled separately
  },
]

export function getVisibleSteps(workloadType: string): StepConfig[] {
  return STEP_CONFIG.filter(step => !step.hiddenFor?.includes(workloadType))
}
