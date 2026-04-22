export interface AutomationAction {
  id: string
  label: string
  params: string[]
}

export interface SimulateRequest {
  nodes: SimulateNode[]
  edges: SimulateEdge[]
}

export interface SimulateNode {
  id: string
  type: string
  data: Record<string, unknown>
}

export interface SimulateEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
}

export interface SimulationStep {
  nodeId: string
  nodeType: string
  title: string
  status: 'running' | 'done' | 'skipped' | 'error'
  message?: string
  startedAt: number
  completedAt?: number
}

export interface SimulateResponse {
  success: boolean
  steps: SimulationStep[]
  summary?: string
  error?: string
}

export interface ValidationError {
  nodeId?: string
  rule: string
  message: string
}
