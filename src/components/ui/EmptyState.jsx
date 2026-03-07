import { cn } from '@/lib/utils'
import Button from './Button'

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {Icon && <Icon className="w-12 h-12 text-gdt-bronze/30 mb-4" />}
      <h3 className="font-display text-xl italic text-gdt-ink mb-2">{title}</h3>
      {description && (
        <p className="font-body text-sm text-gdt-ink/50 max-w-sm">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          <Button variant={action.variant || 'primary'} onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}
