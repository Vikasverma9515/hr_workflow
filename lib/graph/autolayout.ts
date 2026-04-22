import dagre from '@dagrejs/dagre'
import type { Node, Edge } from '@xyflow/react'
import type { HRNodeData } from '@/lib/types/nodes'

const NODE_WIDTH = 220
const NODE_HEIGHT = 100

export function applyDagreLayout(
  nodes: Node<HRNodeData>[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
): Node<HRNodeData>[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 })

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  return nodes.map((node) => {
    const pos = g.node(node.id)
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    }
  })
}
