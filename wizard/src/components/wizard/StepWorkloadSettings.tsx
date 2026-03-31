import type { StepProps } from './StepProps'
import { TextInput } from '../shared/TextInput'
import { EnumSelect } from '../shared/EnumSelect'
import { CollapsibleSection } from '../shared/CollapsibleSection'

export function StepWorkloadSettings({ getValue, setValue }: StepProps) {
  const workloadType = (getValue('workloadType') as string) || 'Deployment'

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Configure settings specific to the <strong>{workloadType}</strong> workload type.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <TextInput
          label="Name Override"
          value={(getValue('nameOverride') as string) || ''}
          onChange={v => setValue('nameOverride', v)}
          placeholder="Optional"
          helpText="Override the chart name"
        />
        <TextInput
          label="Full Name Override"
          value={(getValue('fullnameOverride') as string) || ''}
          onChange={v => setValue('fullnameOverride', v)}
          placeholder="Optional"
          helpText="Override the full release name"
        />
      </div>

      {(workloadType === 'Deployment' || workloadType === 'StatefulSet' || workloadType === 'Rollout') && (
        <TextInput
          label="Replica Count"
          value={String(getValue('workloads.' + lcFirst(workloadType) + '.replicaCount') ?? '1')}
          onChange={v => setValue('workloads.' + lcFirst(workloadType) + '.replicaCount', v ? parseInt(v) : undefined)}
          type="number"
          min={0}
          helpText="Number of pod replicas"
        />
      )}

      {workloadType === 'Deployment' && (
        <CollapsibleSection title="Deployment Strategy">
          <EnumSelect
            label="Strategy Type"
            value={(getValue('workloads.deployment.strategy.type') as string) || ''}
            onChange={v => setValue('workloads.deployment.strategy.type', v)}
            options={['RollingUpdate', 'Recreate']}
            placeholder="Select strategy..."
          />
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Max Surge"
              value={(getValue('workloads.deployment.strategy.rollingUpdate.maxSurge') as string) || ''}
              onChange={v => setValue('workloads.deployment.strategy.rollingUpdate.maxSurge', v)}
              placeholder="25%"
            />
            <TextInput
              label="Max Unavailable"
              value={(getValue('workloads.deployment.strategy.rollingUpdate.maxUnavailable') as string) || ''}
              onChange={v => setValue('workloads.deployment.strategy.rollingUpdate.maxUnavailable', v)}
              placeholder="25%"
            />
          </div>
        </CollapsibleSection>
      )}

      {workloadType === 'StatefulSet' && (
        <>
          <EnumSelect
            label="Pod Management Policy"
            value={(getValue('workloads.statefulSet.podManagementPolicy') as string) || ''}
            onChange={v => setValue('workloads.statefulSet.podManagementPolicy', v)}
            options={['OrderedReady', 'Parallel']}
            placeholder="Select..."
          />
          <TextInput
            label="Service Name"
            value={(getValue('workloads.statefulSet.serviceName') as string) || ''}
            onChange={v => setValue('workloads.statefulSet.serviceName', v)}
            placeholder="Auto-generated headless service"
            helpText="Override the headless service name"
          />
        </>
      )}

      {workloadType === 'CronJob' && (
        <>
          <TextInput
            label="Schedule"
            value={(getValue('workloads.cronJob.schedule') as string) || ''}
            onChange={v => setValue('workloads.cronJob.schedule', v)}
            placeholder="0 * * * *"
            required
            helpText="Cron expression (e.g., '0 */6 * * *' for every 6 hours)"
          />
          <TextInput
            label="Time Zone"
            value={(getValue('workloads.cronJob.timeZone') as string) || ''}
            onChange={v => setValue('workloads.cronJob.timeZone', v)}
            placeholder="UTC"
          />
          <EnumSelect
            label="Concurrency Policy"
            value={(getValue('workloads.cronJob.concurrencyPolicy') as string) || ''}
            onChange={v => setValue('workloads.cronJob.concurrencyPolicy', v)}
            options={['Allow', 'Forbid', 'Replace']}
            placeholder="Select..."
          />
        </>
      )}

      {(workloadType === 'Job' || workloadType === 'CronJob') && (
        <CollapsibleSection title="Job Settings">
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Backoff Limit"
              value={String(getValue('workloads.job.backoffLimit') ?? '')}
              onChange={v => setValue('workloads.job.backoffLimit', v ? parseInt(v) : undefined)}
              type="number"
              min={0}
            />
            <TextInput
              label="Active Deadline (seconds)"
              value={String(getValue('workloads.job.activeDeadlineSeconds') ?? '')}
              onChange={v => setValue('workloads.job.activeDeadlineSeconds', v ? parseInt(v) : undefined)}
              type="number"
              min={0}
            />
            <TextInput
              label="TTL After Finished (seconds)"
              value={String(getValue('workloads.job.ttlSecondsAfterFinished') ?? '')}
              onChange={v => setValue('workloads.job.ttlSecondsAfterFinished', v ? parseInt(v) : undefined)}
              type="number"
              min={0}
            />
            <TextInput
              label="Completions"
              value={String(getValue('workloads.job.completions') ?? '')}
              onChange={v => setValue('workloads.job.completions', v ? parseInt(v) : undefined)}
              type="number"
              min={1}
            />
          </div>
        </CollapsibleSection>
      )}

      {workloadType === 'DaemonSet' && (
        <CollapsibleSection title="Update Strategy">
          <EnumSelect
            label="Strategy Type"
            value={(getValue('workloads.daemonSet.updateStrategy.type') as string) || ''}
            onChange={v => setValue('workloads.daemonSet.updateStrategy.type', v)}
            options={['RollingUpdate', 'OnDelete']}
            placeholder="Select..."
          />
          <TextInput
            label="Max Unavailable"
            value={String(getValue('workloads.daemonSet.updateStrategy.rollingUpdate.maxUnavailable') ?? '')}
            onChange={v => setValue('workloads.daemonSet.updateStrategy.rollingUpdate.maxUnavailable', v)}
            placeholder="1"
          />
        </CollapsibleSection>
      )}

      {workloadType === 'Rollout' && (
        <CollapsibleSection title="Rollout Strategy" defaultOpen>
          <p className="text-xs text-gray-500 mb-3">Configure Argo Rollouts canary or blue-green strategy using the YAML editor below.</p>
          <TextInput
            label="Strategy (paste YAML or use review step)"
            value=""
            onChange={() => {}}
            helpText="Configure via the Extra Resources step or directly in the exported YAML"
          />
        </CollapsibleSection>
      )}
    </div>
  )
}

function lcFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1)
}
