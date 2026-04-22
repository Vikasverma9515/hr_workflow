'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField, inputCls, selectCls } from './shared/FormField'
import { useWorkflowStore } from '@/hooks/useWorkflowStore'
import type { ApprovalNodeData } from '@/lib/types/nodes'

const APPROVER_ROLES = ['Manager', 'HRBP', 'Director', 'VP', 'C-Suite']

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  approverRole: z.string().min(1, 'Approver role is required'),
  autoApproveThreshold: z.number().min(0).max(100),
})

type FormValues = z.infer<typeof schema>

interface Props { nodeId: string; data: ApprovalNodeData }

export function ApprovalNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore()
  const { register, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title,
      approverRole: data.approverRole,
      autoApproveThreshold: data.autoApproveThreshold,
    },
  })

  useEffect(() => {
    const sub = watch((values) => {
      updateNodeData(nodeId, {
        title: values.title ?? '',
        approverRole: values.approverRole ?? 'Manager',
        autoApproveThreshold: values.autoApproveThreshold ?? 0,
      })
    })
    return () => sub.unsubscribe()
  }, [watch, nodeId, updateNodeData])

  useEffect(() => {
    setValue('title', data.title)
    setValue('approverRole', data.approverRole)
    setValue('autoApproveThreshold', data.autoApproveThreshold)
  }, [nodeId, setValue, data.title, data.approverRole, data.autoApproveThreshold])

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Title" required error={errors.title?.message}>
        <input {...register('title')} className={inputCls} placeholder="e.g. Manager Approval" />
      </FormField>

      <FormField label="Approver Role" required error={errors.approverRole?.message}>
        <select {...register('approverRole')} className={selectCls}>
          {APPROVER_ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Auto-approve Threshold (%)"
        error={errors.autoApproveThreshold?.message}
        hint="Set 0 to disable auto-approval"
      >
        <input
          {...register('autoApproveThreshold', { valueAsNumber: true })}
          type="number"
          min={0}
          max={100}
          className={inputCls}
          placeholder="0"
        />
      </FormField>

      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 font-semibold mb-1.5">Outputs</p>
        <div className="flex gap-2">
          <span className="text-[10px] px-2 py-0.5 bg-white text-emerald-600 border border-emerald-200 rounded">✓ Approved</span>
          <span className="text-[10px] px-2 py-0.5 bg-white text-red-500 border border-red-200 rounded">✗ Rejected</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">Connect both outputs to continue the workflow</p>
      </div>
    </div>
  )
}
