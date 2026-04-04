import { ExternalLink } from 'lucide-react'
import type { StepProps } from './StepProps'
import { useWizardNavigate } from '../../lib/use-wizard'

interface Integration {
  key: string
  label: string
  description: string
  url: string
  logo: string
  /** values path for the enabled toggle, e.g. "integrations.eso.enabled" */
  enabledPath?: string
  /** wizard step ID to navigate to for detailed config */
  stepId?: string
  /** Show as disabled with "Coming Soon" badge */
  comingSoon?: boolean
  category: string
}

const INTEGRATIONS: Integration[] = [
  // Secrets & Certificates
  {
    key: 'eso',
    label: 'External Secrets Operator',
    description: 'Sync secrets from external stores (Vault, AWS, GCP, Azure)',
    url: 'https://external-secrets.io/',
    logo: 'https://raw.githubusercontent.com/external-secrets/external-secrets/main/assets/eso-logo-large.png',
    enabledPath: 'integrations.eso.enabled',
    stepId: 'integrations-eso',
    category: 'Secrets & Certificates',
  },
  {
    key: 'cert-manager',
    label: 'cert-manager',
    description: 'Automatic TLS certificate management with Let\'s Encrypt and more',
    url: 'https://cert-manager.io/',
    logo: 'https://raw.githubusercontent.com/cert-manager/cert-manager/master/logo/logo.png',
    enabledPath: 'integrations.certManager.enabled',
    category: 'Secrets & Certificates',
  },

  // Observability
  {
    key: 'prometheus',
    label: 'Prometheus',
    description: 'Monitoring and alerting with ServiceMonitor and PrometheusRule',
    url: 'https://prometheus.io/',
    logo: 'https://raw.githubusercontent.com/prometheus/prometheus/main/documentation/images/prometheus-logo.svg',
    enabledPath: 'integrations.prometheus.enabled',
    category: 'Observability',
  },
  {
    key: 'victoria-metrics',
    label: 'VictoriaMetrics',
    description: 'High-performance monitoring with VMServiceScrape and VMRule',
    url: 'https://victoriametrics.com/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShtlomlF4W-UQFqbEe6IrezjS8BQrWpgdDgA&s',
    enabledPath: 'integrations.victoriaMetrics.enabled',
    category: 'Observability',
  },
  {
    key: 'grafana',
    label: 'Grafana Operator',
    description: 'Deploy Grafana dashboards as code via GrafanaDashboard CRD',
    url: 'https://grafana-operator.github.io/grafana-operator/',
    logo: 'https://raw.githubusercontent.com/grafana/grafana/main/public/img/grafana_icon.svg',
    enabledPath: 'integrations.grafana.enabled',
    stepId: 'integrations-grafana',
    category: 'Observability',
  },

  // Networking
  {
    key: 'envoy-gateway',
    label: 'Envoy Gateway',
    description: 'Gateway API implementation with traffic policies and rate limiting',
    url: 'https://gateway.envoyproxy.io/',
    logo: 'https://raw.githubusercontent.com/envoyproxy/artwork/main/PNG/Envoy_Logo_Final_PANTONE.png',
    enabledPath: 'integrations.envoyGateway.enabled',
    category: 'Networking',
  },
  {
    key: 'istio',
    label: 'Istio',
    description: 'Service mesh with VirtualService, DestinationRule, and mTLS',
    url: 'https://istio.io/',
    logo: 'https://raw.githubusercontent.com/istio/istio/master/logo/istio-bluelogo-whitebackground-unframed.svg',
    enabledPath: 'integrations.istio.enabled',
    category: 'Networking',
  },

  // Scaling
  {
    key: 'keda',
    label: 'KEDA',
    description: 'Event-driven autoscaling with ScaledObject and ScaledJob',
    url: 'https://keda.sh/',
    logo: 'https://keda.sh/img/logos/keda-icon-color.png',
    enabledPath: 'integrations.keda.enabled',
    category: 'Scaling',
  },
  {
    key: 'vpa',
    label: 'Vertical Pod Autoscaler',
    description: 'Automatic CPU and memory right-sizing recommendations',
    url: 'https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler',
    logo: 'https://raw.githubusercontent.com/kubernetes/kubernetes/master/logo/logo.svg',
    enabledPath: 'integrations.vpa.enabled',
    category: 'Scaling',
  },

  // Storage & Data
  {
    key: 'cloudnativepg',
    label: 'CloudNativePG',
    description: 'PostgreSQL operator for cloud-native database management',
    url: 'https://cloudnative-pg.io/',
    logo: 'https://cloudnative-pg.io/images/hero_image.svg',
    enabledPath: 'integrations.cloudnativepg.enabled',
    comingSoon: true,
    category: 'Storage & Data',
  },
  {
    key: 'rook',
    label: 'Rook Ceph',
    description: 'Cloud-native storage orchestration with Ceph',
    url: 'https://rook.io/',
    logo: 'https://raw.githubusercontent.com/rook/rook/master/Documentation/media/logo.svg',
    enabledPath: 'integrations.rook.enabled',
    comingSoon: true,
    category: 'Storage & Data',
  },

  // Operations
  {
    key: 'reloader',
    label: 'Stakater Reloader',
    description: 'Automatically restart pods when ConfigMaps or Secrets change',
    url: 'https://github.com/stakater/Reloader',
    logo: 'https://avatars.githubusercontent.com/u/15930712?s=48&v=4',
    enabledPath: 'integrations.reloader.enabled',
    category: 'Operations',
  },
]

const CATEGORIES = [...new Set(INTEGRATIONS.map(i => i.category))]

export function StepIntegrations({ getValue, setValue }: StepProps) {
  const navigateTo = useWizardNavigate()

  return (
    <div className="space-y-8">
      <p className="text-sm text-gray-600">
        Enable integrations with third-party operators installed in your cluster. Enabled integrations unlock additional configuration sections.
      </p>

      {CATEGORIES.map(category => (
        <div key={category}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INTEGRATIONS.filter(i => i.category === category).map(integration => {
              const enabled = !integration.comingSoon && integration.enabledPath ? !!getValue(integration.enabledPath) : false

              return (
                <div
                  key={integration.key}
                  className={`relative rounded-lg border p-4 transition-colors ${
                    integration.comingSoon
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : enabled
                        ? 'border-blue-300 bg-blue-50/50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={integration.logo}
                      alt=""
                      className="h-8 w-8 shrink-0 object-contain"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{integration.label}</h4>
                        {integration.comingSoon && (
                          <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500 uppercase">Coming Soon</span>
                        )}
                        <a
                          href={integration.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-gray-400 hover:text-blue-600"
                          title="Open documentation"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{integration.description}</p>

                      {enabled && integration.stepId && navigateTo && (
                        <button
                          type="button"
                          onClick={() => navigateTo(integration.stepId!)}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Configure &rarr;
                        </button>
                      )}
                    </div>

                    {integration.enabledPath && !integration.comingSoon && (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        aria-label={`Enable ${integration.label}`}
                        onClick={() => setValue(integration.enabledPath!, !enabled)}
                        className={`relative shrink-0 inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                          enabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                          enabled ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
