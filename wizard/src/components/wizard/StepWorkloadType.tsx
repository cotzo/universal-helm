import { Rocket, Database, Layers, Clock, Zap, GitMerge, ExternalLink } from 'lucide-react'
import type { StepProps } from './StepProps'
import { TextInput } from '../shared/TextInput'

const WORKLOAD_TYPES = [
  { value: 'Deployment', label: 'Deployment', description: 'Stateless application with rolling updates', icon: 'Rocket', docsUrl: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/' },
  { value: 'StatefulSet', label: 'StatefulSet', description: 'Stateful application with stable identity', icon: 'Database', docsUrl: 'https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/' },
  { value: 'DaemonSet', label: 'DaemonSet', description: 'Run a pod on every node', icon: 'Layers', docsUrl: 'https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/' },
  { value: 'CronJob', label: 'CronJob', description: 'Scheduled recurring jobs', icon: 'Clock', docsUrl: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/' },
  { value: 'Job', label: 'Job', description: 'One-off batch processing or Scaled Job', icon: 'Zap', docsUrl: 'https://kubernetes.io/docs/concepts/workloads/controllers/job/' },
  { value: 'Rollout', label: 'Rollout', description: 'Argo Rollouts canary/blue-green', icon: 'GitMerge', docsUrl: 'https://argo-rollouts.readthedocs.io/en/stable/' },
] as const

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket, Database, Layers, Clock, Zap, GitMerge,
}

export function StepWorkloadType({ getValue, setValue }: StepProps) {
  const selected = (getValue('workloadType') as string) || 'Deployment'

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600">
          Choose the type of Kubernetes workload you want to deploy. This determines which configuration options are available.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {WORKLOAD_TYPES.map(wt => {
          const Icon = ICONS[wt.icon] || Rocket
          const isSelected = selected === wt.value
          return (
            <div
              key={wt.value}
              role="button"
              aria-label={`Select ${wt.label}`}
              tabIndex={0}
              onClick={() => setValue('workloadType', wt.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setValue('workloadType', wt.value) } }}
              className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className={`rounded-full p-3 ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Icon className={`h-6 w-6 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
              </div>
              <div>
                <h3 className={`text-sm font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                  {wt.label}
                </h3>
                <p className="mt-1 text-xs text-gray-500">{wt.description}</p>
                <a
                  href={wt.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                >
                  Docs <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TextInput
          label="Name Override"
          value={(getValue('nameOverride') as string) || ''}
          onChange={v => setValue('nameOverride', v || undefined)}
          placeholder="Optional"
          helpText="Override the chart name"
        />
        <TextInput
          label="Full Name Override"
          value={(getValue('fullnameOverride') as string) || ''}
          onChange={v => setValue('fullnameOverride', v || undefined)}
          placeholder="Optional"
          helpText="Override the full release name"
        />
      </div>
    </div>
  )
}
