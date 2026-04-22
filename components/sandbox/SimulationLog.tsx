'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Play, ClipboardList, CheckSquare, Zap, Flag, XCircle, PartyPopper } from 'lucide-react'
import type { SimulationStep } from '@/lib/types/api'

const TYPE_META: Record<string, { icon: React.ReactNode; dot: string; bg: string; border: string }> = {
  start:    { icon: <Play size={12} fill="currentColor" className="text-emerald-600" />, dot: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  task:     { icon: <ClipboardList size={12} className="text-blue-600" />,               dot: 'bg-blue-500',    bg: 'bg-blue-50',    border: 'border-blue-200'    },
  approval: { icon: <CheckSquare size={12} className="text-orange-600" />,              dot: 'bg-orange-500',  bg: 'bg-orange-50',  border: 'border-orange-200'  },
  automated:{ icon: <Zap size={12} className="text-purple-600" />,                      dot: 'bg-purple-500',  bg: 'bg-purple-50',  border: 'border-purple-200'  },
  end:      { icon: <Flag size={12} className="text-rose-600" />,                        dot: 'bg-rose-500',    bg: 'bg-rose-50',    border: 'border-rose-200'    },
}

interface Props {
  steps: SimulationStep[]
  summary?: string
  success: boolean
}

export function SimulationLog({ steps, summary, success }: Props) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    setVisibleCount(0)
    if (steps.length === 0) return
    let i = 0
    const interval = setInterval(() => {
      i += 1
      setVisibleCount(i)
      if (i >= steps.length) clearInterval(interval)
    }, 380)
    return () => clearInterval(interval)
  }, [steps])

  const visibleSteps = steps.slice(0, visibleCount)
  const allVisible = visibleCount >= steps.length

  return (
    <div className="flex flex-col">
      {visibleSteps.map((step, idx) => {
        const meta = TYPE_META[step.nodeType] ?? TYPE_META.task
        const isDone = idx < visibleCount - 1 || allVisible
        return (
          <div key={step.nodeId} className="flex gap-3 animate-in">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full border-2 ${isDone ? meta.border + ' ' + meta.bg : 'border-gray-200 bg-gray-50'} flex items-center justify-center shrink-0 z-10`}>
                {isDone ? meta.icon : <Loader2 size={10} className="text-gray-400 animate-spin" />}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-0.5 flex-1 my-1 ${isDone ? meta.dot.replace('bg-', 'bg-').replace('500', '200') : 'bg-gray-100'}`} style={{ minHeight: '20px' }} />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-3 ${idx < steps.length - 1 ? 'mb-0' : ''}`}>
              <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${meta.border} ${meta.bg}`}>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{step.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">{step.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[9px] text-gray-400 font-mono hidden sm:block">
                    {new Date(step.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  {isDone
                    ? <CheckCircle2 size={14} className="text-emerald-500" />
                    : <Loader2 size={14} className="text-gray-400 animate-spin" />
                  }
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {allVisible && steps.length > 0 && (
        <div className={`mt-2 p-4 rounded-2xl border-2 text-center transition-all ${
          success ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50' : 'border-red-200 bg-red-50'
        }`}>
          {success ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <PartyPopper size={16} className="text-emerald-500" />
                <p className="text-sm font-bold text-emerald-700">Workflow Completed Successfully</p>
              </div>
              {summary && <p className="text-xs text-emerald-600">{summary}</p>}
              <p className="text-[10px] text-emerald-500 mt-1">{steps.length} step{steps.length !== 1 ? 's' : ''} executed</p>
            </>
          ) : (
            <>
              <XCircle size={20} className="text-red-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-red-700">Simulation Failed</p>
            </>
          )}
        </div>
      )}

      {visibleCount > 0 && !allVisible && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-2 ml-9">
          <Loader2 size={11} className="animate-spin" />
          Executing step {visibleCount} of {steps.length}
        </div>
      )}
    </div>
  )
}
