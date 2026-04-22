import { describe, it, expect } from 'vitest'
import { simulateWorkflow } from '@/lib/mocks/data/simulate'
import type { SimulateRequest } from '@/lib/types/api'

function req(
  nodes: { id: string; type: string; data?: Record<string, unknown> }[],
  edges: { id: string; source: string; target: string }[]
): SimulateRequest {
  return {
    nodes: nodes.map((n) => ({ ...n, data: n.data ?? { label: n.type, title: n.type } })),
    edges,
  }
}

describe('simulateWorkflow', () => {
  it('returns success for a linear workflow', () => {
    const result = simulateWorkflow(req(
      [
        { id: 's1', type: 'start', data: { label: 'Start', title: 'Start', metadata: {} } },
        { id: 't1', type: 'task',  data: { label: 'Task',  title: 'My Task', assignee: 'hr@co.com' } },
        { id: 'e1', type: 'end',   data: { label: 'End',   endMessage: 'Done!' } },
      ],
      [{ id: 'e-1', source: 's1', target: 't1' }, { id: 'e-2', source: 't1', target: 'e1' }]
    ))
    expect(result.success).toBe(true)
    expect(result.steps).toHaveLength(3)
    expect(result.steps[0].nodeId).toBe('s1')
    expect(result.steps[2].nodeId).toBe('e1')
  })

  it('returns correct statuses for all steps', () => {
    const result = simulateWorkflow(req(
      [
        { id: 's1', type: 'start', data: { label: 'Start', title: 'Start', metadata: {} } },
        { id: 'e1', type: 'end',   data: { label: 'End', endMessage: 'Complete' } },
      ],
      [{ id: 'e-1', source: 's1', target: 'e1' }]
    ))
    for (const step of result.steps) {
      expect(step.status).toBe('done')
    }
  })

  it('returns the end node endMessage as summary', () => {
    const result = simulateWorkflow(req(
      [
        { id: 's1', type: 'start', data: { label: 'Start', title: 'Start', metadata: {} } },
        { id: 'e1', type: 'end',   data: { label: 'End', endMessage: 'Workflow finished!' } },
      ],
      [{ id: 'e-1', source: 's1', target: 'e1' }]
    ))
    expect(result.summary).toBe('Workflow finished!')
  })

  it('returns failure when workflow has a cycle', () => {
    // t1 → t2 → t1 (cycle) — topological sort returns fewer nodes than expected
    const result = simulateWorkflow(req(
      [
        { id: 's1', type: 'start' },
        { id: 't1', type: 'task' },
        { id: 't2', type: 'task' },
        { id: 'e1', type: 'end' },
      ],
      [
        { id: 'e-1', source: 's1', target: 't1' },
        { id: 'e-2', source: 't1', target: 't2' },
        { id: 'e-3', source: 't2', target: 't1' }, // cycle
        { id: 'e-4', source: 't2', target: 'e1' },
      ]
    ))
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('steps are ordered topologically (start before end)', () => {
    const result = simulateWorkflow(req(
      [
        { id: 's1', type: 'start', data: { label: 'Start', title: 'Start', metadata: {} } },
        { id: 't1', type: 'task',  data: { label: 'Task', title: 'Task' } },
        { id: 'ap1', type: 'approval', data: { label: 'Approval', approverRole: 'Manager' } },
        { id: 'e1', type: 'end',   data: { label: 'End', endMessage: 'Done' } },
      ],
      [
        { id: 'e-1', source: 's1', target: 't1' },
        { id: 'e-2', source: 't1', target: 'ap1' },
        { id: 'e-3', source: 'ap1', target: 'e1' },
      ]
    ))
    expect(result.success).toBe(true)
    const ids = result.steps.map((s) => s.nodeId)
    expect(ids.indexOf('s1')).toBeLessThan(ids.indexOf('t1'))
    expect(ids.indexOf('t1')).toBeLessThan(ids.indexOf('ap1'))
    expect(ids.indexOf('ap1')).toBeLessThan(ids.indexOf('e1'))
  })

  it('step messages reflect node type', () => {
    const result = simulateWorkflow(req(
      [
        { id: 's1', type: 'start', data: { label: 'Start', title: 'Start', metadata: {} } },
        { id: 't1', type: 'task',  data: { label: 'Task', title: 'Review', assignee: 'alice@co.com' } },
        { id: 'e1', type: 'end',   data: { label: 'End', endMessage: 'Done' } },
      ],
      [{ id: 'e-1', source: 's1', target: 't1' }, { id: 'e-2', source: 't1', target: 'e1' }]
    ))
    const taskStep = result.steps.find((s) => s.nodeId === 't1')!
    expect(taskStep.message).toContain('alice@co.com')
  })

  it('handles single-node workflow (start + end only)', () => {
    const result = simulateWorkflow(req(
      [
        { id: 's1', type: 'start', data: { label: 'Start', title: 'Start', metadata: {} } },
        { id: 'e1', type: 'end',   data: { label: 'End', endMessage: 'Immediate end' } },
      ],
      [{ id: 'e-1', source: 's1', target: 'e1' }]
    ))
    expect(result.success).toBe(true)
    expect(result.steps).toHaveLength(2)
  })
})
