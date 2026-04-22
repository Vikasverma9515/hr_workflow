'use client'

import { useMemo } from 'react'
import type { Node, Edge } from '@xyflow/react'
import type { HRNodeData } from '@/lib/types/nodes'
import { validateWorkflow, getNodeErrors } from '@/lib/graph/validate'
import type { ValidationError } from '@/lib/types/api'

export function useGraphValidation(nodes: Node<HRNodeData>[], edges: Edge[]) {
  const errors = useMemo(() => validateWorkflow(nodes, edges), [nodes, edges])

  const globalErrors = useMemo(() => errors.filter((e) => !e.nodeId), [errors])

  const hasErrors = errors.length > 0

  function errorsForNode(nodeId: string): ValidationError[] {
    return getNodeErrors(errors, nodeId)
  }

  return { errors, globalErrors, hasErrors, errorsForNode }
}
