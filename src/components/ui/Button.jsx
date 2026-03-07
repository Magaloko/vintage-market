import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import Spinner from './Spinner'

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  light: 'btn-light',
  dark: 'btn-dark',
  ghost: 'bg-transparent text-gdt-bronze hover:bg-gdt-bronze/10 border border-transparent',
  danger: 'bg-gdt-rose text-white hover:bg-gdt-rose/90 border border-transparent',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading, disabled, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-body tracking-wide transition-all duration-300',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
})

export default Button
