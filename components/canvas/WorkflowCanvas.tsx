'use client'

import { useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type OnConnect,
  type NodeMouseHandler,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useWorkflowStore } from '@/hooks/useWorkflowStore'
import { nodeTypes } from '@/components/nodes'
import { edgeTypes } from '@/components/edges'
import type { NodeType } from '@/lib/types/nodes'

interface WorkflowCanvasProps {
  onNodeSelect: (id: string | null) => void
}

function getNodeColor(node: Node): string {
  if (node.type === 'start') return '#10b981'
  if (node.type === 'task') return '#3b82f6'
  if (node.type === 'approval') return '#f97316'
  if (node.type === 'automated') return '#a855f7'
  if (node.type === 'end') return '#f43f5e'
  return '#6b7280'
}

export function WorkflowCanvas({ onNodeSelect }: WorkflowCanvasProps) {
  const { screenToFlowPosition } = useReactFlow()
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNode, copySelectedNode, pasteNode } = useWorkflowStore()
  const { undo, redo } = useWorkflowStore.temporal.getState()

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const isMac = /mac/i.test(navigator.userAgent)
      const ctrl = isMac ? e.metaKey : e.ctrlKey
      if (!ctrl) return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo() }
      if (e.key === 'c') { e.preventDefault(); copySelectedNode() }
      if (e.key === 'v') { e.preventDefault(); pasteNode() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [undo, redo, copySelectedNode, pasteNode])

  const handleConnect: OnConnect = useCallback((connection) => {
    onConnect(connection)
  }, [onConnect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('application/reactflow-type') as NodeType
    if (!type) return
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    addNode(type, position)
  }, [screenToFlowPosition, addNode])

  const handleNodeClick: NodeMouseHandler = useCallback((_e, node) => {
    setSelectedNode(node.id)
    onNodeSelect(node.id)
  }, [setSelectedNode, onNodeSelect])

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null)
    onNodeSelect(null)
  }, [setSelectedNode, onNodeSelect])

  const isEmpty = nodes.length === 0

  return (
    <div className="flex-1 h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode={['Backspace', 'Delete']}
        className="bg-[#fafafa]"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" />
        <Controls className="!shadow-lg !border !border-gray-200 !rounded-2xl overflow-hidden" />
        <MiniMap
          className="!shadow-lg !border !border-gray-200 !rounded-2xl overflow-hidden"
          nodeColor={getNodeColor}
          maskColor="rgba(0,0,0,0.03)"
          pannable
          zoomable
        />
      </ReactFlow>

      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center px-10 py-8 rounded-3xl border-2 border-dashed border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm max-w-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-700 mb-1">Build your workflow</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Drag nodes from the left panel onto the canvas, then connect them to define your HR process flow
            </p>
            <div className="flex flex-col gap-1.5 text-left">
              {[
                { n: '1', t: 'Drop a Start node' },
                { n: '2', t: 'Add Tasks or Approvals' },
                { n: '3', t: 'Connect nodes together' },
                { n: '4', t: 'Simulate to test the flow' },
              ].map((s) => (
                <div key={s.n} className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[9px] font-black flex items-center justify-center shrink-0">{s.n}</span>
                  {s.t}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
