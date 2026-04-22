import { useMemo } from 'react'
import type { Node, Edge } from '@xyflow/react'
import type { HRNodeData } from '@/lib/types/nodes'

export interface WorkflowStats {
  total: number
  byType: Record<string, number>
  edgeCount: number
  approvalGates: number
  automationCount: number
  branchCount: number
  complexity: 'Simple' | 'Moderate' | 'Complex'
  complexityScore: number
}

export function useWorkflowStats(nodes: Node<HRNodeData>[], edges: Edge[]): WorkflowStats {
  return useMemo(() => {
    const byType: Record<string, number> = {}
    for (const n of nodes) {
      const t = n.type ?? 'task'
      byType[t] = (byType[t] ?? 0) + 1
    }

    const approvalGates = byType['approval'] ?? 0
    const automationCount = byType['automated'] ?? 0
    // branch = any node with 2+ outgoing edges
    const sourceCounts = new Map<string, number>()
    for (const e of edges) sourceCounts.set(e.source, (sourceCounts.get(e.source) ?? 0) + 1)
    const branchCount = [...sourceCounts.values()].filter((c) => c >= 2).length

    const complexityScore = nodes.length + approvalGates * 2 + automationCount + branchCount * 3
    const complexity: WorkflowStats['complexity'] =
      complexityScore <= 4 ? 'Simple' :
      complexityScore <= 10 ? 'Moderate' : 'Complex'

    return {
      total: nodes.length,
      byType,
      edgeCount: edges.length,
      approvalGates,
      automationCount,
      branchCount,
      complexity,
      complexityScore,
    }
  }, [nodes, edges])
}
