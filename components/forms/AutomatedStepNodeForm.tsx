'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField, inputCls, selectCls } from './shared/FormField'
import { useWorkflowStore } from '@/hooks/useWorkflowStore'
import { useAutomations } from '@/hooks/useAutomations'
import type { AutomatedStepNodeData } from '@/lib/types/nodes'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  actionId: z.string(),
  actionParams: z.record(z.string(), z.string()),
})

type FormValues = z.infer<typeof schema>

interface Props { nodeId: string; data: AutomatedStepNodeData }

export function AutomatedStepNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore()
  const { automations, loading } = useAutomations()
  const { register, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title,
      actionId: data.actionId,
      actionParams: data.actionParams,
    },
  })

  const watchedActionId = watch('actionId')
  const selectedAction = automations.find((a) => a.id === watchedActionId)
  const watchedParams = watch('actionParams') ?? {}

  useEffect(() => {
    const sub = watch((values) => {
      updateNodeData(nodeId, {
        title: values.title ?? '',
        actionId: values.actionId ?? '',
        actionParams: (values.actionParams ?? {}) as Record<string, string>,
      })
    })
    return () => sub.unsubscribe()
  }, [watch, nodeId, updateNodeData])

  useEffect(() => {
    setValue('title', data.title)
    setValue('actionId', data.actionId)
    setValue('actionParams', data.actionParams)
  }, [nodeId, setValue, data.title, data.actionId, data.actionParams])

  function handleParamChange(param: string, val: string) {
    const updated = { ...watchedParams, [param]: val }
    setValue('actionParams', updated)
    updateNodeData(nodeId, { actionParams: updated })
  }

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Title" required error={errors.title?.message}>
        <input {...register('title')} className={inputCls} placeholder="e.g. Send Welcome Email" />
      </FormField>

      <FormField label="Action" required error={errors.actionId?.message}>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
            <Loader2 size={14} className="animate-spin" />
            Loading actions...
          </div>
        ) : (
          <select {...register('actionId')} className={selectCls}>
            <option value="">Select an action...</option>
            {automations.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        )}
      </FormField>

      {selectedAction && selectedAction.params.length > 0 && (
        <div className="flex flex-col gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-xs font-semibold text-purple-700">Action Parameters</p>
          {selectedAction.params.map((param) => (
            <FormField key={param} label={param.charAt(0).toUpperCase() + param.slice(1)}>
              <input
                className={inputCls}
                value={watchedParams[param] ?? ''}
                placeholder={`Enter ${param}...`}
                onChange={(e) => handleParamChange(param, e.target.value)}
              />
            </FormField>
          ))}
        </div>
      )}
    </div>
  )
}
