'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField, textareaCls } from './shared/FormField'
import { useWorkflowStore } from '@/hooks/useWorkflowStore'
import type { EndNodeData } from '@/lib/types/nodes'

const schema = z.object({
  endMessage: z.string(),
  showSummary: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface Props { nodeId: string; data: EndNodeData }

export function EndNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore()
  const { register, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { endMessage: data.endMessage, showSummary: data.showSummary },
  })

  const showSummaryValue = watch('showSummary')

  useEffect(() => {
    const sub = watch((values) => {
      updateNodeData(nodeId, {
        endMessage: values.endMessage ?? '',
        showSummary: values.showSummary ?? false,
      })
    })
    return () => sub.unsubscribe()
  }, [watch, nodeId, updateNodeData])

  useEffect(() => {
    setValue('endMessage', data.endMessage)
    setValue('showSummary', data.showSummary)
  }, [nodeId, setValue, data.endMessage, data.showSummary])

  return (
    <div className="flex flex-col gap-4">
      <FormField label="End Message" error={errors.endMessage?.message} hint="Shown to users when workflow completes">
        <textarea
          {...register('endMessage')}
          className={textareaCls}
          rows={3}
          placeholder="e.g. Onboarding completed successfully!"
        />
      </FormField>

      <FormField label="Show Summary">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative inline-flex items-center">
            <input
              {...register('showSummary')}
              type="checkbox"
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-indigo-500 transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
            {showSummaryValue ? 'Summary enabled' : 'Summary disabled'}
          </span>
        </label>
      </FormField>
    </div>
  )
}
