export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end'

// React Flow requires data extends Record<string, unknown>
export interface BaseNodeData {
  label: string
  validationErrors?: string[]
  [key: string]: unknown
}

export interface StartNodeData extends BaseNodeData {
  type: 'start'
  title: string
  metadata: Record<string, string>
}

export interface TaskNodeData extends BaseNodeData {
  type: 'task'
  title: string
  description: string
  assignee: string
  dueDate: string
  customFields: Record<string, string>
}

export interface ApprovalNodeData extends BaseNodeData {
  type: 'approval'
  title: string
  approverRole: string
  autoApproveThreshold: number
}

export interface AutomatedStepNodeData extends BaseNodeData {
  type: 'automated'
  title: string
  actionId: string
  actionParams: Record<string, string>
}

export interface EndNodeData extends BaseNodeData {
  type: 'end'
  endMessage: string
  showSummary: boolean
}

export type HRNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedStepNodeData
  | EndNodeData

export const DEFAULT_NODE_DATA: Record<NodeType, HRNodeData> = {
  start: { type: 'start', label: 'Start', title: 'Workflow Start', metadata: {} },
  task: { type: 'task', label: 'Task', title: 'New Task', description: '', assignee: '', dueDate: '', customFields: {} },
  approval: { type: 'approval', label: 'Approval', title: 'Approval Step', approverRole: 'Manager', autoApproveThreshold: 0 },
  automated: { type: 'automated', label: 'Automated Step', title: 'Automated Step', actionId: '', actionParams: {} },
  end: { type: 'end', label: 'End', endMessage: 'Workflow completed successfully.', showSummary: true },
}
