import type { EdgeTypes } from '@xyflow/react'
import { SmartEdge } from './SmartEdge'

export const edgeTypes: EdgeTypes = {
  default: SmartEdge,
  approval: SmartEdge,
}
