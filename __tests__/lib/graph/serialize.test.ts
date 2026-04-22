import { describe, it, expect } from 'vitest'
import type { Node, Edge } from '@xyflow/react'
import type { HRNodeData } from '@/lib/types/nodes'
import { serializeWorkflow } from '@/lib/graph/serialize'

function node(id: string, type: string): Node<HRNodeData> {
  return {
    id,
    type,
    position: { x: 0, y: 0 },
    data: { type, label: type, title: type } as unknown as HRNodeData,
  }
}

function edge(id: string, source: string, target: string, sourceHandle?: string): Edge {
  return { id, source, target, sourceHandle }
}

describe('serializeWorkflow', () => {
  it('maps all nodes to serialized form', () => {
    const nodes = [node('s1', 'start'), node('t1', 'task'), node('e1', 'end')]
    const result = serializeWorkflow(nodes, [])
    expect(result.nodes).toHaveLength(3)
    expect(result.nodes.map((n) => n.id)).toEqual(['s1', 't1', 'e1'])
  })

  it('maps all edges to serialized form', () => {
    const nodes = [node('s1', 'start'), node('e1', 'end')]
    const edges = [edge('e-1', 's1', 'e1')]
    const result = serializeWorkflow(nodes, edges)
    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]).toMatchObject({ id: 'e-1', source: 's1', target: 'e1' })
  })

  it('preserves sourceHandle on edges', () => {
    const nodes = [node('s1', 'approval'), node('e1', 'end')]
    const edges = [edge('e-1', 's1', 'e1', 'approved')]
    const result = serializeWorkflow(nodes, edges)
    expect(result.edges[0].sourceHandle).toBe('approved')
  })

  it('preserves node type even when it differs from id prefix', () => {
    const nodes = [node('abc-123', 'approval')]
    const result = serializeWorkflow(nodes, [])
    expect(result.nodes[0].type).toBe('approval')
  })

  it('falls back to "task" type when node.type is undefined', () => {
    const n: Node<HRNodeData> = {
      id: 'x1',
      type: undefined,
      position: { x: 0, y: 0 },
      data: { type: 'task', label: 'Task', title: 'T' } as unknown as HRNodeData,
    }
    const result = serializeWorkflow([n], [])
    expect(result.nodes[0].type).toBe('task')
  })

  it('returns empty arrays for empty inputs', () => {
    const result = serializeWorkflow([], [])
    expect(result.nodes).toHaveLength(0)
    expect(result.edges).toHaveLength(0)
  })

  it('preserves node data as record', () => {
    const n = node('s1', 'start')
    ;(n.data as Record<string, unknown>).title = 'My Title'
    const result = serializeWorkflow([n], [])
    expect((result.nodes[0].data as Record<string, unknown>).title).toBe('My Title')
  })
})
