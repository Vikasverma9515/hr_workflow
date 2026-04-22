'use client'

import { Plus, Trash2 } from 'lucide-react'
import { inputCls } from './FormField'

interface KeyValueEditorProps {
  value: Record<string, string>
  onChange: (value: Record<string, string>) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
}

export function KeyValueEditor({
  value,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: KeyValueEditorProps) {
  const entries = Object.entries(value)

  function addRow() {
    const newKey = `key${entries.length + 1}`
    onChange({ ...value, [newKey]: '' })
  }

  function updateKey(oldKey: string, newKey: string) {
    const updated: Record<string, string> = {}
    for (const [k, v] of Object.entries(value)) {
      updated[k === oldKey ? newKey : k] = v
    }
    onChange(updated)
  }

  function updateValue(key: string, val: string) {
    onChange({ ...value, [key]: val })
  }

  function removeRow(key: string) {
    const updated = { ...value }
    delete updated[key]
    onChange(updated)
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map(([k, v]) => (
        <div key={k} className="flex gap-2 items-center">
          <input
            className={`${inputCls} flex-1 !py-1.5`}
            value={k}
            placeholder={keyPlaceholder}
            onChange={(e) => updateKey(k, e.target.value)}
          />
          <input
            className={`${inputCls} flex-1 !py-1.5`}
            value={v}
            placeholder={valuePlaceholder}
            onChange={(e) => updateValue(k, e.target.value)}
          />
          <button
            type="button"
            onClick={() => removeRow(k)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 w-fit py-1 px-2 rounded-lg hover:bg-indigo-50 transition"
      >
        <Plus size={12} />
        Add field
      </button>
    </div>
  )
}
