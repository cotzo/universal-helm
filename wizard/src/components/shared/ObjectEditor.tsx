import { useState, useCallback } from 'react'
import yaml from 'js-yaml'

interface ObjectEditorProps {
  label: string
  value: Record<string, unknown>
  onChange: (value: Record<string, unknown>) => void
  helpText?: string
  rows?: number
}

export function ObjectEditor({ label, value = {}, onChange, helpText, rows = 6 }: ObjectEditorProps) {
  const [text, setText] = useState(() => {
    if (!value || Object.keys(value).length === 0) return ''
    return yaml.dump(value, { lineWidth: -1, noRefs: true }).trim()
  })
  const [error, setError] = useState<string | null>(null)

  const handleChange = useCallback((newText: string) => {
    setText(newText)
    if (!newText.trim()) {
      setError(null)
      onChange({})
      return
    }
    try {
      const parsed = yaml.load(newText)
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        setError(null)
        onChange(parsed as Record<string, unknown>)
      } else {
        setError('Must be a YAML object')
      }
    } catch (e) {
      setError((e as Error).message)
    }
  }, [onChange])

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
      <textarea
        value={text}
        onChange={e => handleChange(e.target.value)}
        rows={rows}
        spellCheck={false}
        className={`block w-full rounded-md border px-3 py-2 font-mono text-xs shadow-sm focus:outline-none focus:ring-2 ${
          error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
