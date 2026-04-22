'use client'

import { create } from 'zustand'
import { temporal } from 'zundo'
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import type { Node, Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react'
import type { HRNodeData, NodeType } from '@/lib/types/nodes'
import { DEFAULT_NODE_DATA } from '@/lib/types/nodes'

let nodeIdCounter = 1
function generateId(type: string) {
  return `${type}-${Date.now()}-${nodeIdCounter++}`
}

type HRNode = Node<HRNodeData>

interface WorkflowState {
  nodes: HRNode[]
  edges: Edge[]
}

interface WorkflowStore extends WorkflowState {
  selectedNodeId: string | null
  workflowName: string
  clipboard: HRNode | null

  onNodesChange: (changes: NodeChange<HRNode>[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => boolean

  addNode: (type: NodeType, position: { x: number; y: number }) => void
  updateNodeData: (id: string, data: Partial<HRNodeData>) => void
  setSelectedNode: (id: string | null) => void
  setWorkflowName: (name: string) => void
  clearAll: () => void
  setNodesAndEdges: (nodes: HRNode[], edges: Edge[]) => void
  copySelectedNode: () => void
  pasteNode: () => void
}

function loadFromStorage(): Partial<WorkflowState> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('hr-workflow-state')
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveToStorage(state: WorkflowState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('hr-workflow-state', JSON.stringify({ nodes: state.nodes, edges: state.edges }))
  } catch { /* ignore */ }
}

const saved = loadFromStorage()

export const useWorkflowStore = create<WorkflowStore>()(
  temporal(
    (set, get) => ({
      nodes: (saved.nodes as HRNode[]) ?? [],
      edges: saved.edges ?? [],
      selectedNodeId: null,
      workflowName: 'Untitled Workflow',
      clipboard: null,

      onNodesChange: (changes) => {
        const next = applyNodeChanges(changes, get().nodes)
        set({ nodes: next })
        saveToStorage({ nodes: next, edges: get().edges })
      },

      onEdgesChange: (changes) => {
        const next = applyEdgeChanges(changes, get().edges)
        set({ edges: next })
        saveToStorage({ nodes: get().nodes, edges: next })
      },

      onConnect: (connection) => {
        // Guard: prevent duplicate edges on the same source→target pair
        const existing = get().edges
        const duplicate = existing.some(
          (e) => e.source === connection.source && e.target === connection.target
            && e.sourceHandle === (connection.sourceHandle ?? null)
        )
        if (duplicate) return false
        // Guard: prevent connecting anything TO a start node
        const targetNode = get().nodes.find((n) => n.id === connection.target)
        if (targetNode?.type === 'start') return false
        // Guard: prevent connecting FROM an end node
        const sourceNode = get().nodes.find((n) => n.id === connection.source)
        if (sourceNode?.type === 'end') return false

        const newEdge: Edge = {
          id: generateId('edge'),
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
          type: connection.sourceHandle === 'approved' || connection.sourceHandle === 'rejected'
            ? 'approval'
            : 'default',
          animated: true,
          data: {
            label: connection.sourceHandle === 'approved' ? 'Approved'
              : connection.sourceHandle === 'rejected' ? 'Rejected'
              : undefined,
          },
          style: {
            stroke: connection.sourceHandle === 'approved' ? '#22c55e'
              : connection.sourceHandle === 'rejected' ? '#f87171'
              : '#6366f1',
            strokeWidth: 2,
          },
        }
        const next = [...get().edges, newEdge]
        set({ edges: next })
        saveToStorage({ nodes: get().nodes, edges: next })
        return true
      },

      addNode: (type, position) => {
        const id = generateId(type)
        const defaultData = { ...DEFAULT_NODE_DATA[type] }
        const newNode: HRNode = { id, type, position, data: defaultData }
        const next = [...get().nodes, newNode]
        set({ nodes: next })
        saveToStorage({ nodes: next, edges: get().edges })
      },

      updateNodeData: (id, data) => {
        const next = get().nodes.map((n) => {
          if (n.id !== id) return n
          const merged = { ...n.data, ...data } as HRNodeData
          const label = 'title' in merged && merged.title ? String(merged.title)
            : 'endMessage' in merged ? 'End' : n.data.label
          return { ...n, data: { ...merged, label } }
        })
        set({ nodes: next })
        saveToStorage({ nodes: next, edges: get().edges })
      },

      copySelectedNode: () => {
        const { selectedNodeId, nodes } = get()
        if (!selectedNodeId) return
        const node = nodes.find((n) => n.id === selectedNodeId)
        if (node) set({ clipboard: node })
      },

      pasteNode: () => {
        const { clipboard } = get()
        if (!clipboard) return
        const id = generateId(clipboard.type ?? 'task')
        const newNode: HRNode = {
          ...clipboard,
          id,
          position: { x: clipboard.position.x + 40, y: clipboard.position.y + 40 },
          selected: false,
        }
        const next = [...get().nodes, newNode]
        set({ nodes: next, selectedNodeId: id })
        saveToStorage({ nodes: next, edges: get().edges })
      },

      setSelectedNode: (id) => set({ selectedNodeId: id }),

      setWorkflowName: (name) => set({ workflowName: name }),

      clearAll: () => {
        set({ nodes: [], edges: [], selectedNodeId: null })
        saveToStorage({ nodes: [], edges: [] })
      },

      setNodesAndEdges: (nodes, edges) => {
        set({ nodes, edges, selectedNodeId: null })
        saveToStorage({ nodes, edges })
      },
    }),
    {
      // Only track nodes and edges in undo history (not selection/name)
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
      limit: 50,
    }
  )
)
