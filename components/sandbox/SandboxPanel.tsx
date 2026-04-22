'use client'

import { useState } from 'react'
import { X, Play, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useWorkflowStore } from '@/hooks/useWorkflowStore'
import { useGraphValidation } from '@/hooks/useGraphValidation'
import { useSimulate } from '@/hooks/useSimulate'
import { serializeWorkflow } from '@/lib/graph/serialize'
import { SimulationLog } from './SimulationLog'

interface Props {
  open: boolean
  onClose: () => void
}

export function SandboxPanel({ open, onClose }: Props) {
  const { nodes, edges } = useWorkflowStore()
  const { errors, globalErrors, hasErrors } = useGraphValidation(nodes, edges)
  const { simulate, result, loading, error, reset } = useSimulate()
  const [ran, setRan] = useState(false)

  if (!open) return null

  async function handleSimulate() {
    if (hasErrors) return
    const payload = serializeWorkflow(nodes, edges)
    setRan(true)
    reset()
    await simulate(payload)
  }

  function handleClose() {
    reset()
    setRan(false)
    onClose()
  }

  const nodeErrors = errors.filter((e) => e.nodeId)
  const allErrors = [...globalErrors, ...nodeErrors]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50">
              <Play size={15} className="text-indigo-600" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">Workflow Simulator</h2>
              <p className="text-xs text-gray-400">{nodes.length} node(s) · {edges.length} connection(s)</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* Validation section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {hasErrors ? (
                <AlertCircle size={15} className="text-red-500" />
              ) : (
                <CheckCircle2 size={15} className="text-green-500" />
              )}
              <span className="text-sm font-semibold text-gray-700">
                {hasErrors ? `${allErrors.length} validation issue(s) found` : 'Workflow is valid'}
              </span>
            </div>

            {allErrors.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {allErrors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 bg-red-50 rounded-lg border border-red-100">
                    <AlertCircle size={11} className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      {err.nodeId && <p className="text-[10px] font-mono text-red-400">{err.nodeId}</p>}
                      <p className="text-xs text-red-600">{err.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Simulation log */}
          {ran && result && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Execution Log</p>
              <SimulationLog steps={result.steps} summary={result.summary} success={result.success} />
            </div>
          )}

          {ran && error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {nodes.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">No nodes on canvas</p>
              <p className="text-xs mt-1">Add nodes to the workflow first</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleSimulate}
            disabled={hasErrors || loading || nodes.length === 0}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition
              ${hasErrors || nodes.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md'}
            `}
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Simulating...</>
            ) : (
              <><Play size={14} fill="currentColor" /> Run Simulation</>
            )}
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
