import type { SimulateRequest, SimulateResponse, SimulationStep } from '@/lib/types/api'

function topologicalSort(nodes: SimulateRequest['nodes'], edges: SimulateRequest['edges']): string[] {
  const inDegree = new Map<string, number>()
  const adj = new Map<string, string[]>()

  for (const n of nodes) {
    inDegree.set(n.id, 0)
    adj.set(n.id, [])
  }

  for (const e of edges) {
    adj.get(e.source)?.push(e.target)
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1)
  }

  const queue: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }

  const sorted: string[] = []
  while (queue.length > 0) {
    const current = queue.shift()!
    sorted.push(current)
    for (const neighbor of (adj.get(current) ?? [])) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1
      inDegree.set(neighbor, newDeg)
      if (newDeg === 0) queue.push(neighbor)
    }
  }

  return sorted
}

function getNodeTitle(node: SimulateRequest['nodes'][0]): string {
  const data = node.data as Record<string, unknown>
  return (data.title as string) || (data.label as string) || node.type
}

export function simulateWorkflow(request: SimulateRequest): SimulateResponse {
  try {
    const sortedIds = topologicalSort(request.nodes, request.edges)

    if (sortedIds.length !== request.nodes.length) {
      return { success: false, steps: [], error: 'Workflow contains a cycle and cannot be simulated.' }
    }

    const nodeMap = new Map(request.nodes.map((n) => [n.id, n]))
    const now = Date.now()
    const steps: SimulationStep[] = sortedIds.map((id, i) => {
      const node = nodeMap.get(id)!
      return {
        nodeId: id,
        nodeType: node.type,
        title: getNodeTitle(node),
        status: 'done',
        message: getStepMessage(node),
        startedAt: now + i * 500,
        completedAt: now + i * 500 + 300,
      }
    })

    const endNode = request.nodes.find((n) => n.type === 'end')
    const endMessage = endNode ? ((endNode.data as Record<string, unknown>).endMessage as string) : 'Workflow complete.'

    return { success: true, steps, summary: endMessage }
  } catch {
    return { success: false, steps: [], error: 'Simulation failed due to an unexpected error.' }
  }
}

function getStepMessage(node: SimulateRequest['nodes'][0]): string {
  const data = node.data as Record<string, unknown>
  switch (node.type) {
    case 'start': return 'Workflow initiated'
    case 'task': return `Assigned to ${(data.assignee as string) || 'Unassigned'}`
    case 'approval': return `Pending approval from ${(data.approverRole as string) || 'Manager'}`
    case 'automated': return `Executing action: ${(data.actionId as string) || 'none'}`
    case 'end': return (data.endMessage as string) || 'Workflow completed'
    default: return 'Step processed'
  }
}
