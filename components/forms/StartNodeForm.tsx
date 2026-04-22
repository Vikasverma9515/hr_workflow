'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField, inputCls } from './shared/FormField'
import { KeyValueEditor } from './shared/KeyValueEditor'
import { useWorkflowStore } from '@/hooks/useWorkflowStore'
import type { StartNodeData } from '@/lib/types/nodes'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  metadata: z.record(z.string(), z.string()),
})

type FormValues = z.infer<typeof schema>

interface Props { nodeId: string; data: StartNodeData }

export function StartNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore()
  const { register, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: data.title, metadata: data.metadata },
  })

  useEffect(() => {
    const sub = watch((values) => {
      updateNodeData(nodeId, {
        title: values.title ?? '',
        metadata: (values.metadata ?? {}) as Record<string, string>,
      })
    })
    return () => sub.unsubscribe()
  }, [watch, nodeId, updateNodeData])

  useEffect(() => {
    setValue('title', data.title)
    setValue('metadata', data.metadata)
  }, [nodeId, setValue, data.title, data.metadata])

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Workflow Title" required error={errors.title?.message}>
        <input
          {...register('title')}
          className={inputCls}
          placeholder="e.g. Employee Onboarding"
        />
      </FormField>

      <FormField label="Metadata" hint="Optional key-value pairs for workflow context">
        <KeyValueEditor
          value={watch('metadata') ?? {}}
          onChange={(val) => {
            setValue('metadata', val)
            updateNodeData(nodeId, { metadata: val })
          }}
        />
      </FormField>
    </div>
  )
}
