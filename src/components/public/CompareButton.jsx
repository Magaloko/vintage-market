import { GitCompareArrows } from 'lucide-react'
import { useCompare } from '../../lib/CompareContext'

export default function CompareButton({ product, size = 'sm' }) {
  const { isInCompare, toggleCompare, compareCount, maxCompare } = useCompare()
  const active = isInCompare(product.id)
  const disabled = !active && compareCount >= maxCompare

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(product) }}
      disabled={disabled}
      title={active ? 'Aus Vergleich entfernen' : disabled ? `Max ${maxCompare} Produkte` : 'Vergleichen'}
      className={`${sizes[size]} rounded-full flex items-center justify-center transition-all duration-200
        ${active
          ? 'bg-vintage-green text-white shadow-md scale-110'
          : disabled
            ? 'bg-white/60 text-vintage-brown/20 cursor-not-allowed'
            : 'bg-white/80 text-vintage-brown/40 hover:text-vintage-green hover:bg-vintage-green/10'
        }`}
    >
      <GitCompareArrows size={size === 'sm' ? 14 : 18} />
    </button>
  )
}
