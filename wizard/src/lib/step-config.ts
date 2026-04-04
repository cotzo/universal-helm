import { type JsonSchema, type WizardMeta } from './schema-utils'
import { getAtPath } from './values-utils'

export interface StepConfig {
  id: string
  label: string
  icon: string
  /** Dot-separated path into the schema (e.g., "networking.services") */
  schemaPath: string
  /** Description shown at the top of the step */
  description: string
  /** Group name for sidebar grouping */
  group?: string
  /** Workload types for which this step is hidden */
  hiddenFor?: string[]
  /** Use a special renderer instead of the generic schema renderer */
  renderer?: 'workloadType' | 'review' | 'integrations'
  /** Render only the child property matching this value path (lcFirst) */
  selectByValue?: string
  /** Show this step only when the boolean at this dot-separated path is true. Array = OR (any path truthy). */
  visibleIf?: string | string[]
}

export interface StepGroup {
  label: string
  steps: StepConfig[]
}

/** The review step is always appended last and has no schema property */
const REVIEW_STEP: StepConfig = {
  id: 'review',
  label: 'Review & Export',
  icon: 'Download',
  schemaPath: '',
  description: '',
  renderer: 'review',
}

function collectWizardSteps(
  schema: JsonSchema,
  parentPath: string,
): StepConfig[] {
  const steps: StepConfig[] = []
  if (!schema.properties) return steps

  for (const [key, prop] of Object.entries(schema.properties)) {
    const wizard: WizardMeta | undefined = prop['x-wizard']
    const path = parentPath ? `${parentPath}.${key}` : key

    if (wizard && wizard.label) {
      steps.push({
        id: path.replace(/\./g, '-'),
        label: wizard.label,
        icon: wizard.icon,
        schemaPath: path,
        description: wizard.description,
        group: wizard.group,
        hiddenFor: wizard.hiddenFor,
        renderer: wizard.renderer,
        selectByValue: wizard.selectByValue,
        visibleIf: wizard.visibleIf,
      })
      // Also recurse into children that may have their own x-wizard steps
      if (prop.type === 'object' && prop.properties) {
        steps.push(...collectWizardSteps(prop, path))
      }
    } else if (prop.type === 'object' && prop.properties) {
      // Recurse into objects without their own x-wizard (e.g., networking, config)
      steps.push(...collectWizardSteps(prop, path))
    }
  }

  return steps
}

/** Extract ordered step configs from the loaded schema */
export function buildStepConfig(schema: JsonSchema): StepConfig[] {
  const steps = collectWizardSteps(schema, '')
  steps.sort((a, b) => {
    const orderA = getNestedWizard(schema, a.schemaPath)?.order ?? 999
    const orderB = getNestedWizard(schema, b.schemaPath)?.order ?? 999
    return orderA - orderB
  })
  steps.push(REVIEW_STEP)
  return steps
}

function getNestedWizard(schema: JsonSchema, path: string): WizardMeta | undefined {
  const segments = path.split('.')
  let current: JsonSchema = schema
  for (const seg of segments) {
    current = current.properties?.[seg] as JsonSchema
    if (!current) return undefined
  }
  return current['x-wizard']
}

export function getVisibleSteps(steps: StepConfig[], workloadType: string, values: Record<string, unknown>): StepConfig[] {
  return steps.filter(step => {
    if (step.hiddenFor?.includes(workloadType)) return false
    if (step.visibleIf) {
      const paths = Array.isArray(step.visibleIf) ? step.visibleIf : [step.visibleIf]
      if (!paths.some(p => getAtPath(values, p))) return false
    }
    return true
  })
}

/** Group visible steps by their group label, preserving order */
export function groupSteps(steps: StepConfig[]): StepGroup[] {
  const groups: StepGroup[] = []
  let currentGroup: StepGroup | null = null

  for (const step of steps) {
    const groupLabel = step.group ?? step.label
    if (!currentGroup || currentGroup.label !== groupLabel) {
      currentGroup = { label: groupLabel, steps: [] }
      groups.push(currentGroup)
    }
    currentGroup.steps.push(step)
  }

  return groups
}
