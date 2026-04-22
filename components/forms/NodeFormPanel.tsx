'use client'

import { X, Play, ClipboardList, CheckSquare, Zap, Flag } from 'lucide-react'
import { useWorkflowStore } from '@/hooks/useWorkflowStore'
import { StartNodeForm } from './StartNodeForm'
import { TaskNodeForm } from './TaskNodeForm'
import { ApprovalNodeForm } from './ApprovalNodeForm'
import { AutomatedStepNodeForm } from './AutomatedStepNodeForm'
import { EndNodeForm } from './EndNodeForm'
import type { HRNodeData, StartNodeData, TaskNodeData, ApprovalNodeData, AutomatedStepNodeData, EndNodeData } from '@/lib/types/nodes'
import { useGraphValidation } from '@/hooks/useGraphValidation'

const NODE_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  start:    { label: 'Start Node',     icon: <Play size={14} fill="currentColor" />, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  task:     { label: 'Task Node',      icon: <ClipboardList size={14} />,            color: 'text-blue-700',    bg: 'bg-blue-50'    },
  approval: { label: 'Approval Node',  icon: <CheckSquare size={14} />,              color: 'text-orange-700',  bg: 'bg-orange-50'  },
  automated:{ label: 'Automated Step', icon: <Zap size={14} />,                      color: 'text-purple-700',  bg: 'bg-purple-50'  },
  end:      { label: 'End Node',       icon: <Flag size={14} />,                     color: 'text-rose-700',    bg: 'bg-rose-50'    },
}

function EmptyState({ mobile }: { mobile?: boolean }) {
  return (
    <div className={`flex flex-col bg-white border-l border-gray-200 h-full items-center justify-center ${mobile ? 'hidden' : 'w-80 shrink-0 hidden lg:flex'}`}>
      <div className="text-center p-6">
        <div className="text-3xl mb-3">👆</div>
        <p className="text-sm font-medium text-gray-500">Select a node to edit</p>
        <p className="text-xs text-gray-400 mt-1">Click any node on the canvas</p>
      </div>
    </div>
  )
}

function FormBody({ nodeId, type, data }: { nodeId: string; type: string; data: HRNodeData }) {
  if (type === 'start')    return <StartNodeForm     nodeId={nodeId} data={data as StartNodeData} />
  if (type === 'task')     return <TaskNodeForm      nodeId={nodeId} data={data as TaskNodeData} />
  if (type === 'approval') return <ApprovalNodeForm  nodeId={nodeId} data={data as ApprovalNodeData} />
  if (type === 'automated')return <AutomatedStepNodeForm nodeId={nodeId} data={data as AutomatedStepNodeData} />
  if (type === 'end')      return <EndNodeForm       nodeId={nodeId} data={data as EndNodeData} />
  return null
}

export function NodeFormPanel() {
  const { nodes, edges, selectedNodeId, setSelectedNode } = useWorkflowStore()
  const { errorsForNode } = useGraphValidation(nodes, edges)

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  if (!selectedNode) return <EmptyState />

  const type = selectedNode.type ?? 'task'
  const meta = NODE_META[type] ?? NODE_META.task
  const data = selectedNode.data as HRNodeData
  const nodeErrors = errorsForNode(selectedNode.id)

  const inner = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold ${meta.color} flex items-center gap-1.5`}>
            {meta.icon}
            {meta.label}
          </span>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X size={13} />
        </button>
      </div>

      {/* Validation errors */}
      {nodeErrors.length > 0 && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-100 rounded-lg shrink-0">
          <p className="text-xs font-semibold text-red-600 mb-1">Validation Issues</p>
          {nodeErrors.map((err, i) => (
            <p key={i} className="text-xs text-red-500">• {err.message}</p>
          ))}
        </div>
      )}

      {/* Form body */}
      <div className="flex-1 overflow-y-auto p-4">
        <FormBody nodeId={selectedNode.id} type={type} data={data} />
      </div>

      {/* Node ID footer */}
      <div className="px-4 py-2 border-t border-gray-100 shrink-0">
        <p className="text-[9px] text-gray-300 font-mono truncate">ID: {selectedNode.id}</p>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop panel — right side */}
      <aside className="w-80 shrink-0 hidden lg:flex flex-col bg-white border-l border-gray-200 h-full">
        {inner}
      </aside>

      {/* Mobile/tablet — bottom sheet overlay */}
      <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end pointer-events-none">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30 pointer-events-auto"
          onClick={() => setSelectedNode(null)}
        />
        {/* Sheet */}
        <div className="relative z-10 bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[75vh] pointer-events-auto">
          {inner}
        </div>
      </div>
    </>
  )
}
