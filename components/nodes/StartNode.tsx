'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Play, AlertCircle } from 'lucide-react'
import type { StartNodeData } from '@/lib/types/nodes'
import { useGraphValidation } from '@/hooks/useGraphValidation'
import { useWorkflowStore } from '@/hooks/useWorkflowStore'

export function StartNode({ data, selected, id }: NodeProps) {
  const nodeData = data as unknown as StartNodeData
  const { nodes, edges } = useWorkflowStore()
  const { errorsForNode } = useGraphValidation(nodes, edges)
  const hasError = errorsForNode(id).length > 0

  return (
    <div
      className={`
        relative bg-white rounded-xl border border-l-[3px] border-gray-200 border-l-emerald-500
        shadow-sm min-w-[180px] transition-all duration-150
        ${selected ? 'ring-2 ring-emerald-500/25 shadow-md border-gray-300' : 'hover:shadow-md hover:border-gray-300'}
        ${hasError ? 'border-red-300 border-l-red-500 ring-2 ring-red-500/20' : ''}
      `}
    >
      <div className="px-3.5 py-3">
        <div className="flex items-start gap-2.5">
          <Play size={13} className={`mt-0.5 shrink-0 ${hasError ? 'text-red-400' : 'text-emerald-500'}`} fill="currentColor" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-semibold text-emerald-600">Start</span>
              {hasError && <AlertCircle size={10} className="text-red-500" />}
            </div>
            <p className="text-sm font-semibold text-gray-900 truncate leading-snug">
              {nodeData.title || 'Workflow Start'}
            </p>
          </div>
        </div>

        {nodeData.metadata && Object.keys(nodeData.metadata).length > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex flex-wrap gap-1">
            {Object.entries(nodeData.metadata).slice(0, 3).map(([k, v]) => (
              <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                {k}: {v}
              </span>
            ))}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white !shadow"
      />
    </div>
  )
}
