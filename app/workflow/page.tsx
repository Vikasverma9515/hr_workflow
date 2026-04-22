'use client'

import { useState, useCallback, useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { NodePalette } from '@/components/canvas/NodePalette'
import { WorkflowCanvas } from '@/components/canvas/WorkflowCanvas'
import { NodeFormPanel } from '@/components/forms/NodeFormPanel'
import { TopBar } from '@/components/canvas/TopBar'
import { SandboxPanel } from '@/components/sandbox/SandboxPanel'
import { KeyboardShortcutsModal } from '@/components/ui/KeyboardShortcutsModal'

export default function WorkflowPage() {
  const [sandboxOpen, setSandboxOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [, setSelectedNodeId] = useState<string | null>(null)

  const handleNodeSelect = useCallback((id: string | null) => {
    setSelectedNodeId(id)
  }, [])

  // Global '?' shortcut to open shortcuts modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) setShortcutsOpen(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
        <TopBar onSimulate={() => setSandboxOpen(true)} onShortcuts={() => setShortcutsOpen(true)} />

        <div className="flex flex-1 overflow-hidden">
          <NodePalette />
          <WorkflowCanvas onNodeSelect={handleNodeSelect} />
          <NodeFormPanel />
        </div>

        <SandboxPanel open={sandboxOpen} onClose={() => setSandboxOpen(false)} />
        <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      </div>
    </ReactFlowProvider>
  )
}
