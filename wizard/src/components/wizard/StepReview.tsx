import { useState, useMemo } from 'react'
import { Copy, Download, Check } from 'lucide-react'
import { generateYaml } from '../../lib/yaml-generator'

interface StepReviewProps {
  values: Record<string, unknown>
}

export function StepReview({ values }: StepReviewProps) {
  const [copied, setCopied] = useState(false)

  const yamlOutput = useMemo(() => generateYaml(values), [values])

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
