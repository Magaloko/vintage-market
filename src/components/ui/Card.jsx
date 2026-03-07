import { cn } from '@/lib/utils'

const PADDINGS = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export default function Card({ padding = 'md', className, onClick, children }) {
  return (
    <div
      className={cn('vintage-card', PADDINGS[padding], onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

export function CardTitle({ className, children }) {
  return (
    <h3 className={cn('font-display text-lg italic text-gdt-ink', className)}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children }) {
  return <div className={cn('font-body text-sm', className)}>{children}</div>
}

export function CardFooter({ className, children }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gdt-bronze/10', className)}>
      {children}
    </div>
  )
}
