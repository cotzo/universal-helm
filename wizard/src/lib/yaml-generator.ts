import yaml from 'js-yaml'

function deepClean(obj: unknown): unknown {
  if (obj === null || obj === undefined || obj === '') return undefined
  if (typeof obj === 'boolean' || typeof obj === 'number') return obj
  if (typeof obj === 'string') return obj

  if (Array.isArray(obj)) {
    const cleaned = obj.map(deepClean).filter(v => v !== undefined)
    return cleaned.length > 0 ? cleaned : undefined
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    let hasKeys = false
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const cleaned = deepClean(val)
      if (cleaned !== undefined) {
        result[key] = cleaned
        hasKeys = true
      }
    }
    return hasKeys ? result : undefined
  }

  return obj
}

const SECTION_COMMENTS: Record<string, string> = {
  workloadType: '# Workload Type',
  containers: '# Containers',
  initContainers: '# Init Containers',
  podSettings: '# Pod Settings',
  nodeTargeting: '# Node Targeting',
  workloads: '# Workload-specific Settings',
  networking: '# Networking',
  config: '# Configuration',
  persistence: '# Persistence',
  autoscaling: '# Autoscaling',
  pdb: '# Pod Disruption Budget',
  rbac: '# RBAC',
  monitors: '# Monitoring',
  alerting: '# Alerting Rules',
  dashboards: '# Dashboards',
  hooks: '# Hooks',
  argocd: '# Argo CD',
  global: '# Global Settings',
  infraSettings: '# Infrastructure Settings',
  extraResources: '# Extra Resources',
}

export function generateYaml(values: Record<string, unknown>): string {
  const cleaned = deepClean(values) as Record<string, unknown> | undefined
  if (!cleaned) return ''

  const yamlStr = yaml.dump(cleaned, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
    forceQuotes: false,
  })

  const lines = yamlStr.split('\n')
  const result: string[] = []

  for (const line of lines) {
    const topLevelKey = line.match(/^(\w+):/)
    if (topLevelKey && SECTION_COMMENTS[topLevelKey[1]]) {
      if (result.length > 0) result.push('')
      result.push(SECTION_COMMENTS[topLevelKey[1]])
    }
    result.push(line)
  }

  return result.join('\n').trim() + '\n'
}

export function parseYaml(yamlStr: string): Record<string, unknown> {
  return (yaml.load(yamlStr) as Record<string, unknown>) || {}
}
