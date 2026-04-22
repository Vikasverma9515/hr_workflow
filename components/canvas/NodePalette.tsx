'use client'

import { useState } from 'react'
import { Play, ClipboardList, CheckSquare, Zap, Flag, ChevronLeft, ChevronRight, LayoutTemplate, Search, X } from 'lucide-react'
import type { NodeType } from '@/lib/types/nodes'
import { WORKFLOW_TEMPLATES } from '@/lib/templates'
import { useWorkflowStore } from '@/hooks/useWorkflowStore'
import { useToast } from '@/components/ui/Toast'
import type { Node, Edge } from '@xyflow/react'
import type { HRNodeData } from '@/lib/types/nodes'

interface PaletteItem {
  type: NodeType
  label: string
  description: string
  icon: React.ReactNode
  accent: string
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'start',     label: 'Start',     description: 'Entry point of the workflow',    icon: <Play size={13} fill="currentColor" />,  accent: 'text-emerald-500 border-l-emerald-500' },
  { type: 'task',      label: 'Task',      description: 'A manual step assigned to a person', icon: <ClipboardList size={13} />,            accent: 'text-blue-500    border-l-blue-500'    },
  { type: 'approval',  label: 'Approval',  description: 'Gate with Approved / Rejected outputs', icon: <CheckSquare size={13} />,          accent: 'text-amber-500   border-l-amber-500'   },
  { type: 'automated', label: 'Automated', description: 'System action (email, slack, etc.)',    icon: <Zap size={13} />,                   accent: 'text-violet-500  border-l-violet-500'  },
  { type: 'end',       label: 'End',       description: 'Terminal point of the workflow',  icon: <Flag size={13} />,                      accent: 'text-rose-500    border-l-rose-500'    },
]

export function NodePalette() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<'nodes' | 'templates'>('nodes')
  const [search, setSearch] = useState('')
  const { setNodesAndEdges, nodes } = useWorkflowStore()
  const { toast } = useToast()

  function onDragStart(e: React.DragEvent, type: NodeType) {
    e.dataTransfer.setData('application/reactflow-type', type)
    e.dataTransfer.effectAllowed = 'move'
  }

  function loadTemplate(templateId: string) {
    const tpl = WORKFLOW_TEMPLATES.find((t) => t.id === templateId)
    if (!tpl) return
    if (nodes.length > 0 && !confirm(`Load "${tpl.name}" template? This will replace your current workflow.`)) return
    setNodesAndEdges(tpl.nodes as Node<HRNodeData>[], tpl.edges as Edge[])
    toast(`Loaded "${tpl.name}"`, 'success')
  }

  const filteredItems = PALETTE_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  )

  if (collapsed) {
    return (
      <aside className="w-10 shrink-0 flex flex-col items-center py-3 bg-white border-r border-gray-200 h-full gap-3">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
          title="Expand palette"
        >
          <ChevronRight size={14} />
        </button>
        <div className="flex flex-col gap-2 mt-1">
          {PALETTE_ITEMS.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item.type)}
              title={item.label}
              className={`p-1.5 rounded-lg border border-gray-200 bg-white cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm transition ${item.accent.split(' ')[0]}`}
            >
              {item.icon}
            </div>
          ))}
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-white border-r border-gray-200 h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center px-2 pt-2 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('nodes')}
          className={`flex-1 text-xs font-semibold py-2.5 border-b-2 transition ${activeTab === 'nodes' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Nodes
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 text-xs font-semibold py-2.5 border-b-2 transition flex items-center justify-center gap-1.5 ${activeTab === 'templates' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <LayoutTemplate size={11} />
          Templates
        </button>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition ml-1 mb-1"
          title="Collapse"
        >
          <ChevronLeft size={13} />
        </button>
      </div>

      {/* Nodes tab */}
      {activeTab === 'nodes' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Search */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 focus-within:border-gray-400 focus-within:bg-white transition">
              <Search size={11} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500 transition">
                  <X size={10} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 px-3 pb-3 overflow-y-auto flex-1">
            {filteredItems.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No results for &quot;{search}&quot;</p>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg border border-l-[3px] border-gray-200
                    bg-white cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm
                    transition-all duration-150 select-none
                    ${item.accent}
                  `}
                >
                  <span className={item.accent.split(' ')[0]}>{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{item.label}</p>
                    <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-3 py-2.5 border-t border-gray-100 mt-auto">
            <p className="text-[10px] text-gray-400 space-y-0.5">
              <span className="block">Drag to canvas · Click node to edit</span>
              <span className="block">Ctrl+C/V copy · ? for shortcuts</span>
            </p>
          </div>
        </div>
      )}

      {/* Templates tab */}
      {activeTab === 'templates' && (
        <div className="flex flex-col gap-2 p-3 overflow-y-auto flex-1">
          <p className="text-[10px] text-gray-400 mb-1">Click to load a pre-built workflow</p>
          {WORKFLOW_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => loadTemplate(tpl.id)}
              className="flex flex-col gap-1 p-3 rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-sm transition text-left group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm leading-none">{tpl.icon}</span>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">{tpl.name}</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">{tpl.description}</p>
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}
