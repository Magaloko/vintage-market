import { cn } from '@/lib/utils'

const COLORS = {
  bronze: 'bg-gdt-bronze/15 text-gdt-bronze',
  gold: 'bg-gdt-gold/15 text-gdt-gold',
  sage: 'bg-gdt-sage/15 text-gdt-sage',
  rose: 'bg-gdt-rose/15 text-gdt-rose',
  copper: 'bg-gdt-copper/15 text-gdt-copper',
  gray: 'bg-gray-100 text-gray-600',
}

export default function Badge({ color = 'bronze', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body tracking-wide',
        COLORS[color],
        className
      )}
    >
      {children}
    </span>
  )
}
