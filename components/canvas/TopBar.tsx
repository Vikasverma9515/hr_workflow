'use client'

import { useState } from 'react'
import { Play, Download, Upload, Trash2, GitBranch, AlertCircle, CheckCircle2, Undo2, Redo2, LayoutDashboard, Keyboard, Cpu, ShieldCheck, Zap } from 'lucide-react'
import { useReactFlow } from '@xyflow/react'
import { useWorkflowStore } from '@/hooks/useWorkflowStore'
import { useGraphValidation } from '@/hooks/useGraphValidation'
import { useWorkflowStats } from '@/hooks/useWorkflowStats'
import { serializeWorkflow } from '@/lib/graph/serialize'
import { applyDagreLayout } from '@/lib/graph/autolayout'
import { useToast } from '@/components/ui/Toast'

interface TopBarProps {
  onSimulate: () => void
  onShortcuts: () => void
}

const COMPLEXITY_STYLE = {
  Simple:   'bg-gray-50 text-gray-500 border-gray-200',
  Moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  Complex:  'bg-red-50   text-red-600  border-red-200',
}

export function TopBar({ onSimulate, onShortcuts }: TopBarProps) {
  const { nodes, edges, workflowName, setWorkflowName, clearAll, setNodesAndEdges } = useWorkflowStore()
  const { hasErrors, errors } = useGraphValidation(nodes, edges)
  const stats = useWorkflowStats(nodes, edges)
  const [editingName, setEditingName] = useState(false)
  const { fitView } = useReactFlow()
  const { toast } = useToast()

  const { undo, redo, pastStates, futureStates } = useWorkflowStore.temporal.getState()
  const canUndo = pastStates.length > 0
  const canRedo = futureStates.length > 0

  function handleExport() {
    const data = serializeWorkflow(nodes, edges)
    const blob = new Blob([JSON.stringify({ name: workflowName, ...data }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflowName.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('Workflow exported', 'success')
  }

  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const json = JSON.parse(text)
        if (json.name) setWorkflowName(json.name)
        setNodesAndEdges(json.nodes ?? [], json.edges ?? [])
        toast('Workflow imported', 'success')
      } catch {
        toast('Invalid JSON file', 'error')
      }
    }
    input.click()
  }

  function handleAutoLayout() {
    if (nodes.length === 0) return
    const laid = applyDagreLayout(nodes, edges)
    setNodesAndEdges(laid, edges)
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50)
    toast('Auto-layout applied', 'info')
  }

  function handleClear() {
    if (nodes.length === 0) return
    if (!confirm('Clear all nodes and edges?')) return
    clearAll()
    toast('Canvas cleared', 'info')
  }

  return (
    <header className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200 gap-2 shrink-0 z-10 flex-wrap">
      {/* Brand + name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
            <GitBranch size={13} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-gray-900 leading-none">HR Flow</p>
            <p className="text-[9px] text-gray-400 leading-none mt-0.5">Workflow Designer</p>
          </div>
        </div>

        <div className="h-5 w-px bg-gray-200 hidden sm:block" />

        {editingName ? (
          <input
            autoFocus
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
            className="text-sm font-semibold text-gray-800 border-b-2 border-indigo-400 outline-none bg-transparent w-44"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition truncate max-w-[160px]"
            title="Click to rename"
          >
            {workflowName}
          </button>
        )}
      </div>

      {/* Centre stats */}
      {nodes.length > 0 && (
        <div className="hidden lg:flex items-center gap-3">
          {/* Complexity badge */}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${COMPLEXITY_STYLE[stats.complexity]}`}>
            {stats.complexity}
          </span>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              {stats.total} node{stats.total !== 1 ? 's' : ''}
            </span>
            {stats.approvalGates > 0 && (
              <span className="flex items-center gap-1 text-orange-500">
                <ShieldCheck size={11} />
                {stats.approvalGates} gate{stats.approvalGates !== 1 ? 's' : ''}
              </span>
            )}
            {stats.automationCount > 0 && (
              <span className="flex items-center gap-1 text-purple-500">
                <Zap size={11} />
                {stats.automationCount} action{stats.automationCount !== 1 ? 's' : ''}
              </span>
            )}
            {stats.branchCount > 0 && (
              <span className="flex items-center gap-1 text-indigo-500">
                <Cpu size={11} />
                {stats.branchCount} branch{stats.branchCount !== 1 ? 'es' : ''}
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-gray-200" />

          {hasErrors ? (
            <span className="flex items-center gap-1 text-xs text-red-500 font-semibold">
              <AlertCircle size={12} />{errors.length} issue{errors.length !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-emerald-500 font-semibold">
              <CheckCircle2 size={12} />Valid
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Undo / Redo */}
        <button
          onClick={() => undo()}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`p-2 rounded-lg transition ${canUndo ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={() => redo()}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className={`p-2 rounded-lg transition ${canRedo ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
        >
          <Redo2 size={14} />
        </button>

        <div className="h-4 w-px bg-gray-200 mx-1" />

        <button onClick={onShortcuts} title="Keyboard shortcuts (?)" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
          <Keyboard size={13} />
          <span className="hidden sm:inline">Keys</span>
        </button>

        <button onClick={handleAutoLayout} title="Auto Layout" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
          <LayoutDashboard size={13} />
          <span className="hidden sm:inline">Layout</span>
        </button>

        <button onClick={handleExport} title="Export JSON" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
          <Download size={13} />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button onClick={handleImport} title="Import JSON" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">
          <Upload size={13} />
          <span className="hidden sm:inline">Import</span>
        </button>

        <button onClick={handleClear} title="Clear canvas" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 transition">
          <Trash2 size={13} />
          <span className="hidden sm:inline">Clear</span>
        </button>

        <div className="h-4 w-px bg-gray-200 mx-1" />

        <button
          onClick={onSimulate}
          disabled={nodes.length === 0}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            nodes.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 hover:bg-gray-700 text-white shadow-sm'
          }`}
        >
          <Play size={12} fill="currentColor" />
          Simulate
        </button>
      </div>
    </header>
  )
}
