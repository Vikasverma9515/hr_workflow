'use client'

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react'
import { X } from 'lucide-react'

export function SmartEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
  markerEnd,
  selected,
}: EdgeProps) {
  const { setEdges } = useReactFlow()
  const edgeData = data as { label?: string } | undefined

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  function deleteEdge() {
    setEdges((edges) => edges.filter((e) => e.id !== id))
  }

  const isApprovalEdge = edgeData?.label === 'Approved' || edgeData?.label === 'Rejected'
  const labelBg = edgeData?.label === 'Approved' ? '#dcfce7' : edgeData?.label === 'Rejected' ? '#fee2e2' : '#eef2ff'
  const labelColor = edgeData?.label === 'Approved' ? '#16a34a' : edgeData?.label === 'Rejected' ? '#dc2626' : '#4f46e5'

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

      <EdgeLabelRenderer>
        <div
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
          className="absolute pointer-events-all nodrag nopan flex items-center gap-1"
        >
          {/* Edge label (Approved / Rejected) */}
          {edgeData?.label && (
            <div
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{ background: labelBg, color: labelColor, borderColor: labelColor + '44' }}
            >
              {edgeData.label}
            </div>
          )}

          {/* Delete button — only visible when edge is selected or hovered */}
          <button
            onClick={deleteEdge}
            className={`
              w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm
              flex items-center justify-center text-gray-400 hover:text-red-500
              hover:border-red-300 transition-all
              ${selected || isApprovalEdge ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}
            title="Delete edge"
          >
            <X size={9} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
