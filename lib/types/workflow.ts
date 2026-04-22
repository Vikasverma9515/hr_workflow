import type { HRNodeData } from './nodes'

export interface WorkflowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: HRNodeData
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  animated?: boolean
  label?: string
}

export interface Workflow {
  id: string
  name: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  createdAt: number
  updatedAt: number
}
