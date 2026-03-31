import { Rocket, Database, Layers, Clock, Zap, GitMerge } from 'lucide-react'
import type { StepProps } from './StepProps'

const WORKLOAD_TYPES = [
  { value: 'Deployment', label: 'Deployment', description: 'Stateless application with rolling updates', icon: 'Rocket' },
  { value: 'StatefulSet', label: 'StatefulSet', description: 'Stateful application with stable identity', icon: 'Database' },
  { value: 'DaemonSet', label: 'DaemonSet', description: 'Run a pod on every node', icon: 'Layers' },
  { value: 'CronJob', label: 'CronJob', description: 'Scheduled recurring jobs', icon: 'Clock' },
  { value: 'Job', label: 'Job', description: 'One-off batch processing', icon: 'Zap' },
  { value: 'Rollout', label: 'Rollout', description: 'Argo Rollouts canary/blue-green', icon: 'GitMerge' },
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
            <button
              key={wt.value}
              type="button"
              onClick={() => setValue('workloadType', wt.value)}
              className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-all ${
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
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
