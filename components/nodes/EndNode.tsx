'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Flag, AlertCircle, BarChart2 } from 'lucide-react'
import type { EndNodeData } from '@/lib/types/nodes'
import { useGraphValidation } from '@/hooks/useGraphValidation'
import { useWorkflowStore } from '@/hooks/useWorkflowStore'

export function EndNode({ data, selected, id }: NodeProps) {
  const nodeData = data as unknown as EndNodeData
  const { nodes, edges } = useWorkflowStore()
  const { errorsForNode } = useGraphValidation(nodes, edges)
  const hasError = errorsForNode(id).length > 0

  return (
    <div
      className={`
        relative bg-white rounded-xl border border-l-[3px] border-gray-200 border-l-rose-500
        shadow-sm min-w-[180px] transition-all duration-150
        ${selected ? 'ring-2 ring-rose-500/25 shadow-md border-gray-300' : 'hover:shadow-md hover:border-gray-300'}
        ${hasError ? 'border-red-400 border-l-red-600 ring-2 ring-red-500/20' : ''}
      `}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-rose-500 !border-2 !border-white !shadow" />

      <div className="px-3.5 py-3">
        <div className="flex items-start gap-2.5">
          <Flag size={13} className={`mt-0.5 shrink-0 ${hasError ? 'text-red-400' : 'text-rose-500'}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-semibold text-rose-600">End</span>
              {hasError && <AlertCircle size={10} className="text-red-500" />}
            </div>
            <p className="text-xs text-gray-500 leading-snug line-clamp-2">
              {nodeData.endMessage || 'Workflow complete'}
            </p>
          </div>
        </div>

        {nodeData.showSummary && (
          <div className="mt-2.5 pt-2.5 border-t border-gray-100 pl-[25px] flex items-center gap-1.5">
            <BarChart2 size={10} className="text-gray-400" />
            <span className="text-[11px] text-gray-400">Summary report on</span>
          </div>
        )}
      </div>
    </div>
  )
}
