import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'w-4 h-4 border',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-2',
}

export default function Spinner({ size = 'md', className }) {
  return (
    <div
      className={cn('rounded-full animate-spin', SIZES[size], className)}
      style={{ borderColor: 'rgba(176, 141, 87, 0.2)', borderTopColor: '#B08D57' }}
    />
  )
}

export function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0C0A08' }}>
      <Spinner size="lg" />
    </div>
  )
}
