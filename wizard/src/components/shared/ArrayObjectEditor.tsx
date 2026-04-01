import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { HelpText } from './HelpText'

interface ArrayObjectEditorProps {
  label: string
  value: Record<string, unknown>[]
  onChange: (value: Record<string, unknown>[]) => void
  renderItem: (item: Record<string, unknown>, onChange: (item: Record<string, unknown>) => void) => React.ReactNode
  createDefault: () => Record<string, unknown>
  helpText?: string
  itemLabel?: (item: Record<string, unknown>, index: number) => string
}

export function ArrayObjectEditor({ label, value = [], onChange, renderItem, createDefault, helpText, itemLabel }: ArrayObjectEditorProps) {
  const [stableIds] = useState(() => new Map<number, string>())
  const [nextId, setNextId] = useState(0)

  // Ensure each index has a stable ID; grow as items are added
  while (stableIds.size < value.length) {
    stableIds.set(stableIds.size, crypto.randomUUID())
  }

  const addItem = () => {
    stableIds.set(value.length, crypto.randomUUID())
    setNextId(nextId + 1) // trigger re-render
    onChange([...value, createDefault()])
  }

  const removeItem = (idx: number) => {
    // Shift stable IDs down
    const newIds = new Map<number, string>()
    for (let i = 0; i < value.length; i++) {
      if (i < idx) newIds.set(i, stableIds.get(i)!)
      else if (i > idx) newIds.set(i - 1, stableIds.get(i)!)
    }
    stableIds.clear()
    for (const [k, v] of newIds) stableIds.set(k, v)

    const next = [...value]
    next.splice(idx, 1)
    onChange(next)
  }

  const updateItem = (idx: number, item: Record<string, unknown>) => {
    const next = [...value]
    next[idx] = item
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label} <span className="text-gray-400">({value.length})</span></label>
        <button type="button" onClick={addItem} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
      {helpText && <HelpText text={helpText} />}

      {value.map((item, idx) => (
        <div key={stableIds.get(idx) ?? idx} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
            <span className="text-sm font-medium text-gray-600">
              {itemLabel ? itemLabel(item, idx) : `#${idx + 1}`}
            </span>
            <button type="button" aria-label="Remove item" onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="px-4 py-4 space-y-4 border-t border-gray-200">
            {renderItem(item, (updated) => updateItem(idx, updated))}
          </div>
        </div>
      ))}

      {value.length === 0 && <p className="text-xs text-gray-400 italic">No items</p>}
    </div>
  )
}
