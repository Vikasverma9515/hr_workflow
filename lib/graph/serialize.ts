import type { Node, Edge } from '@xyflow/react'
import type { HRNodeData } from '@/lib/types/nodes'
import type { SimulateRequest } from '@/lib/types/api'

export function serializeWorkflow(nodes: Node<HRNodeData>[], edges: Edge[]): SimulateRequest {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type ?? 'task',
      data: n.data as Record<string, unknown>,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
    })),
  }
}
