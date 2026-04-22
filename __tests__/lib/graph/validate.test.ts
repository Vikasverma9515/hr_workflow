import { describe, it, expect } from 'vitest'
import type { Node, Edge } from '@xyflow/react'
import type { HRNodeData } from '@/lib/types/nodes'
import { validateWorkflow } from '@/lib/graph/validate'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeNode(id: string, type: string, extra: Record<string, unknown> = {}): Node<HRNodeData> {
  const bases: Record<string, HRNodeData> = {
    start: { type: 'start', label: 'Start', title: 'Start', metadata: {} },
    task:  { type: 'task',  label: 'Task',  title: 'My Task', description: '', assignee: '', dueDate: '', customFields: {} },
    approval: { type: 'approval', label: 'Approval', title: 'Approval', approverRole: 'Manager', autoApproveThreshold: 0 },
    automated: { type: 'automated', label: 'Auto', title: 'Auto', actionId: 'send_email', actionParams: {} },
    end:   { type: 'end',   label: 'End',   endMessage: 'Done', showSummary: false },
  }
  return {
    id,
    type,
    position: { x: 0, y: 0 },
    data: { ...bases[type], ...extra } as HRNodeData,
  }
}

function makeEdge(id: string, source: string, target: string, sourceHandle?: string): Edge {
  return { id, source, target, sourceHandle }
}

// ─── exactly_one_start ────────────────────────────────────────────────────────

describe('exactly_one_start', () => {
  it('errors when there is no start node', () => {
    const nodes = [makeNode('t1', 'task'), makeNode('e1', 'end')]
    const errors = validateWorkflow(nodes, [])
    expect(errors.some((e) => e.rule === 'exactly_one_start')).toBe(true)
  })

  it('errors when there are two start nodes', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('s2', 'start'), makeNode('e1', 'end')]
    const edges = [makeEdge('e-1', 's1', 'e1'), makeEdge('e-2', 's2', 'e1')]
    const errors = validateWorkflow(nodes, edges)
    const startErrors = errors.filter((e) => e.rule === 'exactly_one_start')
    expect(startErrors.length).toBeGreaterThan(0)
    // Both start nodes should be flagged
    expect(startErrors.some((e) => e.nodeId === 's1')).toBe(true)
    expect(startErrors.some((e) => e.nodeId === 's2')).toBe(true)
  })

  it('passes with exactly one start node', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('e1', 'end')]
    const edges = [makeEdge('e-1', 's1', 'e1')]
    const errors = validateWorkflow(nodes, edges)
    expect(errors.filter((e) => e.rule === 'exactly_one_start')).toHaveLength(0)
  })
})

// ─── at_least_one_end ─────────────────────────────────────────────────────────

describe('at_least_one_end', () => {
  it('errors when there is no end node', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('t1', 'task')]
    const edges = [makeEdge('e-1', 's1', 't1')]
    const errors = validateWorkflow(nodes, edges)
    expect(errors.some((e) => e.rule === 'at_least_one_end')).toBe(true)
  })

  it('passes with one end node', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('e1', 'end')]
    const edges = [makeEdge('e-1', 's1', 'e1')]
    const errors = validateWorkflow(nodes, edges)
    expect(errors.filter((e) => e.rule === 'at_least_one_end')).toHaveLength(0)
  })
})

// ─── start_no_incoming ───────────────────────────────────────────────────────

describe('start_no_incoming', () => {
  it('errors when start node has an incoming edge', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('t1', 'task'), makeNode('e1', 'end')]
    const edges = [makeEdge('e-1', 't1', 's1'), makeEdge('e-2', 's1', 'e1')]
    const errors = validateWorkflow(nodes, edges)
    expect(errors.some((e) => e.rule === 'start_no_incoming' && e.nodeId === 's1')).toBe(true)
  })

  it('passes when start node has no incoming edges', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('e1', 'end')]
    const edges = [makeEdge('e-1', 's1', 'e1')]
    const errors = validateWorkflow(nodes, edges)
    expect(errors.filter((e) => e.rule === 'start_no_incoming')).toHaveLength(0)
  })
})

// ─── end_no_outgoing ─────────────────────────────────────────────────────────

describe('end_no_outgoing', () => {
  it('errors when end node has an outgoing edge', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('e1', 'end'), makeNode('t1', 'task')]
    const edges = [makeEdge('e-1', 's1', 'e1'), makeEdge('e-2', 'e1', 't1')]
    const errors = validateWorkflow(nodes, edges)
    expect(errors.some((e) => e.rule === 'end_no_outgoing' && e.nodeId === 'e1')).toBe(true)
  })

  it('passes when end node has no outgoing edges', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('e1', 'end')]
    const edges = [makeEdge('e-1', 's1', 'e1')]
    const errors = validateWorkflow(nodes, edges)
    expect(errors.filter((e) => e.rule === 'end_no_outgoing')).toHaveLength(0)
  })
})

// ─── all_reachable ───────────────────────────────────────────────────────────

describe('all_reachable', () => {
  it('errors when a node is disconnected from start', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('t1', 'task'), makeNode('e1', 'end')]
    // t1 is not connected — s1 → e1 only
    const edges = [makeEdge('e-1', 's1', 'e1')]
    const errors = validateWorkflow(nodes, edges)
    expect(errors.some((e) => e.rule === 'all_reachable' && e.nodeId === 't1')).toBe(true)
  })

  it('passes when all nodes are reachable from start', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('t1', 'task'), makeNode('e1', 'end')]
    const edges = [makeEdge('e-1', 's1', 't1'), makeEdge('e-2', 't1', 'e1')]
    const errors = validateWorkflow(nodes, edges)
    expect(errors.filter((e) => e.rule === 'all_reachable')).toHaveLength(0)
  })
})

// ─── no_cycles ───────────────────────────────────────────────────────────────

describe('no_cycles', () => {
  it('errors when there is a cycle', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('t1', 'task'), makeNode('t2', 'task'), makeNode('e1', 'end')]
    const edges = [
      makeEdge('e-1', 's1', 't1'),
      makeEdge('e-2', 't1', 't2'),
      makeEdge('e-3', 't2', 't1'), // cycle: t1 → t2 → t1
      makeEdge('e-4', 't2', 'e1'),
    ]
    const errors = validateWorkflow(nodes, edges)
    expect(errors.some((e) => e.rule === 'no_cycles')).toBe(true)
  })

  it('passes for a linear acyclic workflow', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('t1', 'task'), makeNode('e1', 'end')]
    const edges = [makeEdge('e-1', 's1', 't1'), makeEdge('e-2', 't1', 'e1')]
    const errors = validateWorkflow(nodes, edges)
    expect(errors.filter((e) => e.rule === 'no_cycles')).toHaveLength(0)
  })
})

// ─── task_has_title ──────────────────────────────────────────────────────────

describe('task_has_title', () => {
  it('errors when a task node has an empty title', () => {
    const nodes = [
      makeNode('s1', 'start'),
      makeNode('t1', 'task', { title: '' }),
      makeNode('e1', 'end'),
    ]
    const edges = [makeEdge('e-1', 's1', 't1'), makeEdge('e-2', 't1', 'e1')]
    const errors = validateWorkflow(nodes, edges)
    expect(errors.some((e) => e.rule === 'task_has_title' && e.nodeId === 't1')).toBe(true)
  })

  it('passes when task node has a non-empty title', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('t1', 'task'), makeNode('e1', 'end')]
    const edges = [makeEdge('e-1', 's1', 't1'), makeEdge('e-2', 't1', 'e1')]
    const errors = validateWorkflow(nodes, edges)
    expect(errors.filter((e) => e.rule === 'task_has_title')).toHaveLength(0)
  })
})

// ─── automated_has_action ────────────────────────────────────────────────────

describe('automated_has_action', () => {
  it('errors when automated node has no actionId', () => {
    const nodes = [
      makeNode('s1', 'start'),
      makeNode('a1', 'automated', { actionId: '' }),
      makeNode('e1', 'end'),
    ]
    const edges = [makeEdge('e-1', 's1', 'a1'), makeEdge('e-2', 'a1', 'e1')]
    const errors = validateWorkflow(nodes, edges)
    expect(errors.some((e) => e.rule === 'automated_has_action' && e.nodeId === 'a1')).toBe(true)
  })

  it('passes when automated node has an actionId', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('a1', 'automated'), makeNode('e1', 'end')]
    const edges = [makeEdge('e-1', 's1', 'a1'), makeEdge('e-2', 'a1', 'e1')]
    const errors = validateWorkflow(nodes, edges)
    expect(errors.filter((e) => e.rule === 'automated_has_action')).toHaveLength(0)
  })
})

// ─── Full valid workflow ──────────────────────────────────────────────────────

describe('full valid workflow', () => {
  it('returns zero errors for a complete valid workflow', () => {
    const nodes = [
      makeNode('s1', 'start'),
      makeNode('t1', 'task'),
      makeNode('ap1', 'approval'),
      makeNode('au1', 'automated'),
      makeNode('e1', 'end'),
    ]
    const edges = [
      makeEdge('e-1', 's1', 't1'),
      makeEdge('e-2', 't1', 'ap1'),
      makeEdge('e-3', 'ap1', 'au1'),
      makeEdge('e-4', 'au1', 'e1'),
    ]
    const errors = validateWorkflow(nodes, edges)
    expect(errors).toHaveLength(0)
  })
})
