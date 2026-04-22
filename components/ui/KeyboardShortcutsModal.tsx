'use client'

import { useEffect } from 'react'
import { X, Keyboard } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

const SHORTCUTS = [
  { group: 'History', items: [
    { keys: ['Ctrl', 'Z'], label: 'Undo' },
    { keys: ['Ctrl', 'Y'], label: 'Redo' },
  ]},
  { group: 'Clipboard', items: [
    { keys: ['Ctrl', 'C'], label: 'Copy selected node' },
    { keys: ['Ctrl', 'V'], label: 'Paste node (offset +40px)' },
  ]},
  { group: 'Canvas', items: [
    { keys: ['Del'], label: 'Delete selected node / edge' },
    { keys: ['Esc'], label: 'Deselect node' },
    { keys: ['?'], label: 'Open this shortcuts panel' },
  ]},
  { group: 'Viewport', items: [
    { keys: ['Scroll'], label: 'Zoom in / out' },
    { keys: ['Drag'], label: 'Pan canvas' },
    { keys: ['Ctrl', 'Shift', 'F'], label: 'Fit view' },
  ]},
]

export function KeyboardShortcutsModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gray-100">
              <Keyboard size={15} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">Keyboard Shortcuts</h2>
              <p className="text-xs text-gray-400">Press <kbd className="px-1 py-0.5 rounded border border-gray-200 font-mono text-[10px] bg-white">?</kbd> to toggle</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/80 transition">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5">
          {SHORTCUTS.map((group) => (
            <div key={group.group}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{group.group}</p>
              <div className="flex flex-col gap-1.5">
                {group.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <kbd className="px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 font-mono text-xs text-gray-700 shadow-sm">{k}</kbd>
                          {i < item.keys.length - 1 && <span className="text-gray-300 text-xs">+</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
