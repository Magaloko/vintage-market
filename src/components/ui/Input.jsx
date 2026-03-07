import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(function Input(
  { label, error, icon: Icon, variant = 'light', className, ...props },
  ref
) {
  const inputClass = variant === 'dark' ? 'gdt-input-dark' : 'gdt-input'

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-gdt-ink/50">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gdt-bronze/40" />
        )}
        <input
          ref={ref}
          className={cn(
            inputClass,
            'w-full',
            Icon && 'pl-10',
            error && 'border-gdt-rose',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="font-body text-xs text-gdt-rose">{error}</p>
      )}
    </div>
  )
})

export default Input

export const Textarea = forwardRef(function Textarea(
  { label, error, variant = 'light', className, ...props },
  ref
) {
  const inputClass = variant === 'dark' ? 'gdt-input-dark' : 'gdt-input'

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-gdt-ink/50">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(inputClass, 'w-full resize-y min-h-[100px]', error && 'border-gdt-rose', className)}
        {...props}
      />
      {error && (
        <p className="font-body text-xs text-gdt-rose">{error}</p>
      )}
    </div>
  )
})
