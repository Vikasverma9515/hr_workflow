import type { Node, Edge } from '@xyflow/react'
import type { HRNodeData } from './types/nodes'

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  icon: string
  nodes: Node<HRNodeData>[]
  edges: Edge[]
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    description: 'Start → Collect Docs → Manager Approval → Send Welcome Email → End',
    icon: '🧑‍💼',
    nodes: [
      { id: 'tpl-s1', type: 'start', position: { x: 300, y: 50 }, data: { type: 'start', label: 'Onboarding Start', title: 'Employee Onboarding', metadata: { department: 'Engineering', location: 'Bangalore' } } },
      { id: 'tpl-t1', type: 'task', position: { x: 300, y: 180 }, data: { type: 'task', label: 'Collect Documents', title: 'Collect Documents', description: 'HR collects all joining documents from the employee', assignee: 'hr@company.com', dueDate: '', customFields: { priority: 'High' } } },
      { id: 'tpl-a1', type: 'approval', position: { x: 300, y: 320 }, data: { type: 'approval', label: 'Manager Approval', title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0 } },
      { id: 'tpl-au1', type: 'automated', position: { x: 160, y: 460 }, data: { type: 'automated', label: 'Send Welcome Email', title: 'Send Welcome Email', actionId: 'send_email', actionParams: { to: 'employee@company.com', subject: 'Welcome to the team!' } } },
      { id: 'tpl-e1', type: 'end', position: { x: 300, y: 600 }, data: { type: 'end', label: 'End', endMessage: 'Onboarding complete! Welcome aboard.', showSummary: true } },
    ],
    edges: [
      { id: 'tpl-e-1', source: 'tpl-s1', target: 'tpl-t1', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'tpl-e-2', source: 'tpl-t1', target: 'tpl-a1', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'tpl-e-3', source: 'tpl-a1', target: 'tpl-au1', sourceHandle: 'approved', type: 'approval', animated: true, data: { label: 'Approved' }, style: { stroke: '#22c55e', strokeWidth: 2 } },
      { id: 'tpl-e-4', source: 'tpl-au1', target: 'tpl-e1', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
    ],
  },
  {
    id: 'leave-approval',
    name: 'Leave Approval',
    description: 'Start → Submit Request → HRBP Approval → Notify Slack → End',
    icon: '🏖️',
    nodes: [
      { id: 'tpl2-s1', type: 'start', position: { x: 300, y: 50 }, data: { type: 'start', label: 'Leave Request', title: 'Leave Approval', metadata: { policy: 'PTO' } } },
      { id: 'tpl2-t1', type: 'task', position: { x: 300, y: 180 }, data: { type: 'task', label: 'Submit Request', title: 'Submit Leave Request', description: 'Employee submits leave request with dates and reason', assignee: 'employee@company.com', dueDate: '', customFields: {} } },
      { id: 'tpl2-a1', type: 'approval', position: { x: 300, y: 320 }, data: { type: 'approval', label: 'HRBP Approval', title: 'HRBP Approval', approverRole: 'HRBP', autoApproveThreshold: 0 } },
      { id: 'tpl2-au1', type: 'automated', position: { x: 160, y: 460 }, data: { type: 'automated', label: 'Notify Slack', title: 'Notify Slack', actionId: 'notify_slack', actionParams: { channel: '#leaves', message: 'Leave approved!' } } },
      { id: 'tpl2-e1', type: 'end', position: { x: 300, y: 600 }, data: { type: 'end', label: 'End', endMessage: 'Leave request processed.', showSummary: false } },
    ],
    edges: [
      { id: 'tpl2-e-1', source: 'tpl2-s1', target: 'tpl2-t1', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'tpl2-e-2', source: 'tpl2-t1', target: 'tpl2-a1', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'tpl2-e-3', source: 'tpl2-a1', target: 'tpl2-au1', sourceHandle: 'approved', type: 'approval', animated: true, data: { label: 'Approved' }, style: { stroke: '#22c55e', strokeWidth: 2 } },
      { id: 'tpl2-e-4', source: 'tpl2-au1', target: 'tpl2-e1', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
    ],
  },
  {
    id: 'doc-verification',
    name: 'Document Verification',
    description: 'Start → Collect → Generate PDF → Director Approval → End',
    icon: '📄',
    nodes: [
      { id: 'tpl3-s1', type: 'start', position: { x: 300, y: 50 }, data: { type: 'start', label: 'Doc Verification', title: 'Document Verification', metadata: { type: 'KYC' } } },
      { id: 'tpl3-t1', type: 'task', position: { x: 300, y: 180 }, data: { type: 'task', label: 'Collect Documents', title: 'Collect KYC Documents', description: 'Collect ID proof, address proof, and certificates', assignee: 'compliance@company.com', dueDate: '', customFields: { urgent: 'yes' } } },
      { id: 'tpl3-au1', type: 'automated', position: { x: 300, y: 320 }, data: { type: 'automated', label: 'Generate PDF', title: 'Generate Verification Report', actionId: 'generate_doc', actionParams: { template: 'kyc_report', recipient: 'director@company.com' } } },
      { id: 'tpl3-a1', type: 'approval', position: { x: 300, y: 460 }, data: { type: 'approval', label: 'Director Approval', title: 'Director Sign-off', approverRole: 'Director', autoApproveThreshold: 0 } },
      { id: 'tpl3-e1', type: 'end', position: { x: 300, y: 600 }, data: { type: 'end', label: 'End', endMessage: 'Document verification complete. Records updated.', showSummary: true } },
    ],
    edges: [
      { id: 'tpl3-e-1', source: 'tpl3-s1', target: 'tpl3-t1', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'tpl3-e-2', source: 'tpl3-t1', target: 'tpl3-au1', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'tpl3-e-3', source: 'tpl3-au1', target: 'tpl3-a1', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'tpl3-e-4', source: 'tpl3-a1', target: 'tpl3-e1', sourceHandle: 'approved', type: 'approval', animated: true, data: { label: 'Approved' }, style: { stroke: '#22c55e', strokeWidth: 2 } },
    ],
  },
]
