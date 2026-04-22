'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField, inputCls, textareaCls } from './shared/FormField'
import { KeyValueEditor } from './shared/KeyValueEditor'
import { useWorkflowStore } from '@/hooks/useWorkflowStore'
import type { TaskNodeData } from '@/lib/types/nodes'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  assignee: z.string(),
  dueDate: z.string(),
  customFields: z.record(z.string(), z.string()),
})

type FormValues = z.infer<typeof schema>

interface Props { nodeId: string; data: TaskNodeData }

export function TaskNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useWorkflowStore()
  const { register, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title,
      description: data.description,
      assignee: data.assignee,
      dueDate: data.dueDate,
      customFields: data.customFields,
    },
  })

  useEffect(() => {
    const sub = watch((values) => {
      updateNodeData(nodeId, {
        title: values.title ?? '',
        description: values.description ?? '',
        assignee: values.assignee ?? '',
        dueDate: values.dueDate ?? '',
        customFields: (values.customFields ?? {}) as Record<string, string>,
      })
    })
    return () => sub.unsubscribe()
  }, [watch, nodeId, updateNodeData])

  useEffect(() => {
    setValue('title', data.title)
    setValue('description', data.description)
    setValue('assignee', data.assignee)
    setValue('dueDate', data.dueDate)
    setValue('customFields', data.customFields)
  }, [nodeId, setValue, data.title, data.description, data.assignee, data.dueDate, data.customFields])

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Title" required error={errors.title?.message}>
        <input {...register('title')} className={inputCls} placeholder="e.g. Collect Documents" />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <textarea {...register('description')} className={textareaCls} rows={3} placeholder="Describe this task..." />
      </FormField>

      <FormField label="Assignee" error={errors.assignee?.message}>
        <input {...register('assignee')} className={inputCls} placeholder="e.g. hr@company.com" />
      </FormField>

      <FormField label="Due Date" error={errors.dueDate?.message}>
        <input {...register('dueDate')} type="date" className={inputCls} />
      </FormField>

      <FormField label="Custom Fields" hint="Add extra metadata for this task">
        <KeyValueEditor
          value={watch('customFields') ?? {}}
          onChange={(val) => {
            setValue('customFields', val)
            updateNodeData(nodeId, { customFields: val })
          }}
        />
      </FormField>
    </div>
  )
}
