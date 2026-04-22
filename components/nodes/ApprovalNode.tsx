'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { CheckSquare, User2, AlertCircle } from 'lucide-react'
import type { ApprovalNodeData } from '@/lib/types/nodes'
import { useGraphValidation } from '@/hooks/useGraphValidation'
import { useWorkflowStore } from '@/hooks/useWorkflowStore'

export function ApprovalNode({ data, selected, id }: NodeProps) {
  const nodeData = data as unknown as ApprovalNodeData
  const { nodes, edges } = useWorkflowStore()
  const { errorsForNode } = useGraphValidation(nodes, edges)
  const hasError = errorsForNode(id).length > 0

  return (
    <div
      className={`
        relative bg-white rounded-xl border border-l-[3px] border-gray-200 border-l-amber-500
        shadow-sm min-w-[200px] max-w-[240px] transition-all duration-150
        ${selected ? 'ring-2 ring-amber-500/25 shadow-md border-gray-300' : 'hover:shadow-md hover:border-gray-300'}
        ${hasError ? 'border-red-300 border-l-red-500 ring-2 ring-red-500/20' : ''}
      `}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white !shadow" />

      <div className="px-3.5 py-3">
        <div className="flex items-start gap-2.5">
          <CheckSquare size={13} className={`mt-0.5 shrink-0 ${hasError ? 'text-red-400' : 'text-amber-500'}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-semibold text-amber-600">Approval</span>
              {hasError && <AlertCircle size={10} className="text-red-500" />}
            </div>
            <p className="text-sm font-semibold text-gray-900 truncate leading-snug">
              {nodeData.title || 'Approval Step'}
            </p>
          </div>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-gray-100 pl-[25px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <User2 size={10} className="text-gray-400 shrink-0" />
              <span className="text-[11px] text-gray-500">{nodeData.approverRole || 'Manager'}</span>
            </div>
            {nodeData.autoApproveThreshold > 0 && (
              <span className="text-[10px] text-amber-600 font-semibold">
                Auto {nodeData.autoApproveThreshold}%
              </span>
            )}
          </div>
        </div>

        {/* Output row */}
        <div className="mt-2.5 flex justify-between px-1">
          <span className="text-[10px] text-emerald-600 font-medium">↙ Approved</span>
          <span className="text-[10px] text-red-500 font-medium">Rejected ↘</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="approved"
        className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white !left-[30%] !shadow"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="rejected"
        className="!w-2.5 !h-2.5 !bg-red-400 !border-2 !border-white !left-[70%] !shadow"
      />
    </div>
  )
}
