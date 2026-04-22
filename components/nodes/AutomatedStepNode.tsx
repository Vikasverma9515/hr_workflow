'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Zap, AlertCircle } from 'lucide-react'
import type { AutomatedStepNodeData } from '@/lib/types/nodes'
import { useGraphValidation } from '@/hooks/useGraphValidation'
import { useWorkflowStore } from '@/hooks/useWorkflowStore'

export function AutomatedStepNode({ data, selected, id }: NodeProps) {
  const nodeData = data as unknown as AutomatedStepNodeData
  const { nodes, edges } = useWorkflowStore()
  const { errorsForNode } = useGraphValidation(nodes, edges)
  const hasError = errorsForNode(id).length > 0

  return (
    <div
      className={`
        relative bg-white rounded-xl border border-l-[3px] border-gray-200 border-l-violet-500
        shadow-sm min-w-[185px] max-w-[225px] transition-all duration-150
        ${selected ? 'ring-2 ring-violet-500/25 shadow-md border-gray-300' : 'hover:shadow-md hover:border-gray-300'}
        ${hasError ? 'border-red-300 border-l-red-500 ring-2 ring-red-500/20' : ''}
      `}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-violet-500 !border-2 !border-white !shadow" />

      <div className="px-3.5 py-3">
        <div className="flex items-start gap-2.5">
          <Zap size={13} className={`mt-0.5 shrink-0 ${hasError ? 'text-red-400' : 'text-violet-500'}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-semibold text-violet-600">Automated</span>
              {hasError && <AlertCircle size={10} className="text-red-500" />}
            </div>
            <p className="text-sm font-semibold text-gray-900 truncate leading-snug">
              {nodeData.title || 'Automated Step'}
            </p>
          </div>
        </div>

        {nodeData.actionId ? (
          <div className="mt-2.5 pt-2.5 border-t border-gray-100 pl-[25px]">
            <span className="text-[11px] text-gray-500">
              {String(nodeData.actionId).replace(/_/g, ' ')}
            </span>
          </div>
        ) : (
          <div className="mt-2.5 pt-2.5 border-t border-gray-100 pl-[25px]">
            <span className="text-[11px] text-gray-300 italic">No action selected</span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-violet-500 !border-2 !border-white !shadow" />
    </div>
  )
}
