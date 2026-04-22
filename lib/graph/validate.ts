import type { Node, Edge } from '@xyflow/react'
import type { HRNodeData } from '@/lib/types/nodes'
import type { ValidationError } from '@/lib/types/api'

export function validateWorkflow(nodes: Node<HRNodeData>[], edges: Edge[]): ValidationError[] {
  const errors: ValidationError[] = []

  const startNodes = nodes.filter((n) => n.type === 'start')
  if (startNodes.length === 0) {
    errors.push({ rule: 'exactly_one_start', message: 'Workflow must have a Start node.' })
  } else if (startNodes.length > 1) {
    for (const n of startNodes) {
      errors.push({ nodeId: n.id, rule: 'exactly_one_start', message: 'Only one Start node is allowed.' })
    }
  }

  const endNodes = nodes.filter((n) => n.type === 'end')
  if (endNodes.length === 0) {
    errors.push({ rule: 'at_least_one_end', message: 'Workflow must have at least one End node.' })
  }

  if (startNodes.length === 1) {
    const startId = startNodes[0].id
    const startIncoming = edges.filter((e) => e.target === startId)
    if (startIncoming.length > 0) {
      errors.push({ nodeId: startId, rule: 'start_no_incoming', message: 'Start node cannot have incoming connections.' })
    }
  }

  for (const endNode of endNodes) {
    const outgoing = edges.filter((e) => e.source === endNode.id)
    if (outgoing.length > 0) {
      errors.push({ nodeId: endNode.id, rule: 'end_no_outgoing', message: 'End node cannot have outgoing connections.' })
    }
  }

  if (startNodes.length === 1 && nodes.length > 1) {
    const startId = startNodes[0].id
    const adj = new Map<string, string[]>()
    for (const n of nodes) adj.set(n.id, [])
    for (const e of edges) adj.get(e.source)?.push(e.target)

    const visited = new Set<string>()
    const queue = [startId]
    while (queue.length > 0) {
      const cur = queue.shift()!
      if (visited.has(cur)) continue
      visited.add(cur)
      for (const neighbor of (adj.get(cur) ?? [])) {
        if (!visited.has(neighbor)) queue.push(neighbor)
      }
    }

    for (const n of nodes) {
      if (!visited.has(n.id)) {
        errors.push({ nodeId: n.id, rule: 'all_reachable', message: 'This node is not reachable from the Start node.' })
      }
    }
  }

  // Cycle detection via DFS
  const color = new Map<string, 'white' | 'grey' | 'black'>()
  const adjFwd = new Map<string, string[]>()
  for (const n of nodes) { color.set(n.id, 'white'); adjFwd.set(n.id, []) }
  for (const e of edges) adjFwd.get(e.source)?.push(e.target)

  let hasCycle = false
  const cycleNodes = new Set<string>()

  function dfs(id: string) {
    color.set(id, 'grey')
    for (const neighbor of (adjFwd.get(id) ?? [])) {
      if (color.get(neighbor) === 'grey') {
        hasCycle = true
        cycleNodes.add(id)
        cycleNodes.add(neighbor)
      } else if (color.get(neighbor) === 'white') {
        dfs(neighbor)
      }
    }
    color.set(id, 'black')
  }

  for (const n of nodes) {
    if (color.get(n.id) === 'white') dfs(n.id)
  }

  if (hasCycle) {
    errors.push({ rule: 'no_cycles', message: 'Workflow contains a cycle. Cycles are not allowed.' })
    for (const id of cycleNodes) {
      errors.push({ nodeId: id, rule: 'no_cycles', message: 'Part of a cycle.' })
    }
  }

  for (const n of nodes) {
    if (n.type === 'task') {
      const d = n.data as import('@/lib/types/nodes').TaskNodeData
      if (!d.title?.trim()) {
        errors.push({ nodeId: n.id, rule: 'task_has_title', message: 'Task node requires a title.' })
      }
    }
    if (n.type === 'automated') {
      const d = n.data as import('@/lib/types/nodes').AutomatedStepNodeData
      if (!d.actionId) {
        errors.push({ nodeId: n.id, rule: 'automated_has_action', message: 'Automated node requires an action to be selected.' })
      }
    }
  }

  return errors
}

export function getNodeErrors(errors: ValidationError[], nodeId: string): ValidationError[] {
  return errors.filter((e) => e.nodeId === nodeId)
}
