import { useState, useMemo } from 'react'
import { Copy, Download, Check, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Ajv from 'ajv/dist/2020'
import { generateYaml } from '../../lib/yaml-generator'
import type { JsonSchema } from '../../lib/schema-utils'

interface StepReviewProps {
  values: Record<string, unknown>
  schema: JsonSchema | null
}

interface ValidationError {
  path: string
  message: string
}

function validateValues(values: Record<string, unknown>, schema: JsonSchema | null): ValidationError[] {
  if (!schema) return []

  const ajv = new Ajv({ allErrors: true, strict: false })
  const validate = ajv.compile(schema)
  validate(values)

  if (!validate.errors) return []

  return validate.errors.map(err => ({
    path: err.instancePath || '/',
    message: `${err.instancePath || '/'}: ${err.message}${err.params ? ` (${formatParams(err.params)})` : ''}`,
  }))
}

function formatParams(params: Record<string, unknown>): string {
  const parts: string[] = []
  for (const [k, v] of Object.entries(params)) {
    if (k === 'type') parts.push(`expected ${v}`)
    else if (k === 'allowedValues') parts.push(`allowed: ${(v as string[]).join(', ')}`)
    else if (k === 'missingProperty') parts.push(`missing: ${v}`)
    else if (k === 'additionalProperty') parts.push(`unknown: ${v}`)
    else if (k === 'limit') parts.push(`${k}: ${v}`)
  }
  return parts.join(', ')
}

export function StepReview({ values, schema }: StepReviewProps) {
  const [copied, setCopied] = useState(false)

  const yamlOutput = useMemo(() => generateYaml(values), [values])
  const errors = useMemo(() => validateValues(values, schema), [values, schema])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yamlOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([yamlOutput], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'values.yaml'
    a.click()
    URL.revokeObjectURL(url)
  }

  const lineCount = yamlOutput.split('\n').length

  return (
    <div className="space-y-4">
      {/* Validation result */}
      {errors.length > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800">
              Validation: {errors.length} {errors.length === 1 ? 'issue' : 'issues'} found
            </h3>
          </div>
          <ul className="space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-xs text-amber-700 font-mono">
                {err.message}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h3 className="text-sm font-semibold text-green-800">Validation passed</h3>
          </div>
          <p className="text-xs text-green-600 mt-1">All values conform to the schema.</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Review your generated values.yaml. Copy or download when ready.
          </p>
          <p className="text-xs text-gray-400 mt-1">{lineCount} lines</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            <Download className="h-4 w-4" /> Download
          </button>
        </div>
      </div>

      <div className="relative rounded-lg border border-gray-200 bg-gray-900 overflow-hidden">
        <div className="flex">
          {/* Line numbers */}
          <div className="select-none px-3 py-4 text-right text-xs leading-relaxed text-gray-500 bg-gray-950 border-r border-gray-700">
            {yamlOutput.split('\n').map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          {/* Code */}
          <pre className="flex-1 overflow-x-auto px-4 py-4 text-xs leading-relaxed text-gray-100">
            <code>{yamlOutput}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
