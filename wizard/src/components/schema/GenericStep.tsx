import { type JsonSchema, getSchemaAtPath, resolveSchema, isStructuredObject } from '../../lib/schema-utils'
import { type StepConfig } from '../../lib/step-config'
import { SchemaField, SchemaObjectFields } from './SchemaField'

interface GenericStepProps {
  step: StepConfig
  schema: JsonSchema
  values: Record<string, unknown>
  onChange: (values: Record<string, unknown>) => void
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && !Array.isArray(acc)) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split('.')
  const result = structuredClone(obj)
  let current: Record<string, unknown> = result
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
      current[keys[i]] = {}
    }
    current = current[keys[i]] as Record<string, unknown>
  }
  if (value === undefined || value === null || (typeof value === 'object' && !Array.isArray(value) && Object.keys(value as object).length === 0)) {
    delete current[keys[keys.length - 1]]
  } else {
    current[keys[keys.length - 1]] = value
  }
  return result
}

export function GenericStep({ step, schema, values, onChange }: GenericStepProps) {
  const fieldSchema = getSchemaAtPath(step.schemaPath, schema)
  if (!fieldSchema) {
    return <p className="text-sm text-red-500">Schema not found for path: {step.schemaPath}</p>
  }

  const resolved = resolveSchema(fieldSchema, schema)
  const currentValue = getNestedValue(values, step.schemaPath)

  const handleChange = (newValue: unknown) => {
    onChange(setNestedValue(values, step.schemaPath, newValue))
  }

  // For top-level structured objects, render fields directly (no wrapping collapsible)
  if (isStructuredObject(resolved)) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">{step.description}</p>
        <SchemaObjectFields
          schema={resolved}
          rootSchema={schema}
          value={(currentValue ?? {}) as Record<string, unknown>}
          onChange={handleChange}
          depth={0}
        />
      </div>
    )
  }

  // For maps and other types, render with SchemaField
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">{step.description}</p>
      <SchemaField
        schema={resolved}
        rootSchema={schema}
        value={currentValue}
        onChange={handleChange}
        label={step.label}
        depth={0}
      />
    </div>
  )
}
