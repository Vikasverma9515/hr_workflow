'use client'

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  hint?: string
}

export function FormField({ label, error, required, children, hint }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[10px] text-gray-400">{hint}</p>}
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  )
}

export const inputCls = `
  w-full px-3 py-2 text-sm rounded-xl border border-gray-200
  focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400
  placeholder:text-gray-300 bg-gray-50 hover:bg-white focus:bg-white transition
`

export const selectCls = `
  w-full px-3 py-2 text-sm rounded-xl border border-gray-200
  focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400
  bg-gray-50 hover:bg-white focus:bg-white transition cursor-pointer
`

export const textareaCls = `
  w-full px-3 py-2 text-sm rounded-xl border border-gray-200
  focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400
  placeholder:text-gray-300 bg-gray-50 hover:bg-white focus:bg-white transition resize-none
`
