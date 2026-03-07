import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gdt-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'relative w-full rounded-lg border animate-scale-in',
          SIZES[size]
        )}
        style={{
          backgroundColor: '#1A1410',
          borderColor: 'rgba(176, 141, 87, 0.15)',
        }}
      >
        {/* Header */}
        {title && (
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(176, 141, 87, 0.1)' }}
          >
            <h3 className="font-display text-lg italic text-gdt-cream">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded transition-colors hover:bg-gdt-bronze/10"
            >
              <X className="w-4 h-4 text-gdt-bronze/50" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 text-gdt-cream/80 font-body text-sm">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="px-6 py-4 flex justify-end gap-3"
            style={{ borderTop: '1px solid rgba(176, 141, 87, 0.1)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
