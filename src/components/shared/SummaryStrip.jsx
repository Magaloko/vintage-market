import { cn } from '@/lib/utils'

const COLOR_MAP = {
  default: 'text-gdt-ink',
  green: 'text-gdt-sage',
  red: 'text-gdt-rose',
  gold: 'text-gdt-bronze',
}

export default function SummaryStrip({ items, className }) {
  return (
    <div className={cn('grid gap-4', className)} style={{
      gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))`
    }}>
      {items.map((item, i) => (
        <div key={i} className="vintage-card p-4">
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-gdt-ink/40 mb-1">
            {item.label}
          </p>
          <p className={cn('font-display text-2xl italic', COLOR_MAP[item.color] || COLOR_MAP.default)}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}
