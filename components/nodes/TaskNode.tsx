'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { ClipboardList, User, Calendar, AlertCircle } from 'lucide-react'
import type { TaskNodeData } from '@/lib/types/nodes'
import { useGraphValidation } from '@/hooks/useGraphValidation'
import { useWorkflowStore } from '@/hooks/useWorkflowStore'

export function TaskNode({ data, selected, id }: NodeProps) {
  const nodeData = data as unknown as TaskNodeData
  const { nodes, edges } = useWorkflowStore()
  const { errorsForNode } = useGraphValidation(nodes, edges)
  const hasError = errorsForNode(id).length > 0

  return (
    <div
      className={`
        relative bg-white rounded-xl border border-l-[3px] border-gray-200 border-l-blue-500
        shadow-sm min-w-[190px] max-w-[230px] transition-all duration-150
        ${selected ? 'ring-2 ring-blue-500/25 shadow-md border-gray-300' : 'hover:shadow-md hover:border-gray-300'}
        ${hasError ? 'border-red-300 border-l-red-500 ring-2 ring-red-500/20' : ''}
      `}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white !shadow" />

      <div className="px-3.5 py-3">
        <div className="flex items-start gap-2.5">
          <ClipboardList size={13} className={`mt-0.5 shrink-0 ${hasError ? 'text-red-400' : 'text-blue-500'}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-semibold text-blue-600">Task</span>
              {hasError && <AlertCircle size={10} className="text-red-500" />}
            </div>
            <p className="text-sm font-semibold text-gray-900 truncate leading-snug">
              {nodeData.title || 'Untitled Task'}
            </p>
          </div>
        </div>

        {nodeData.description && (
          <p className="mt-2 text-xs text-gray-400 line-clamp-2 leading-relaxed pl-[25px]">
            {nodeData.description}
          </p>
        )}

        {(nodeData.assignee || nodeData.dueDate) && (
          <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex flex-col gap-1 pl-[25px]">
            {nodeData.assignee && (
              <div className="flex items-center gap-1.5">
                <User size={10} className="text-gray-400 shrink-0" />
                <span className="text-[11px] text-gray-500 truncate">{nodeData.assignee}</span>
              </div>
            )}
            {nodeData.dueDate && (
              <div className="flex items-center gap-1.5">
                <Calendar size={10} className="text-gray-400 shrink-0" />
                <span className="text-[11px] text-gray-500">{nodeData.dueDate}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white !shadow" />
    </div>
  )
}
