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
      title={active ? 'Убрать из сравнения' : disabled ? `Максимум ${maxCompare} товара` : 'Сравнить'}
      className={`${sizes[size]} rounded-full flex items-center justify-center transition-all duration-200
        ${active
          ? 'text-white shadow-md scale-110'
          : disabled
            ? 'bg-white/60 cursor-not-allowed'
            : 'bg-white/80 hover:bg-white'
        }`}
      style={
        active
          ? { backgroundColor: '#5A6B3C' }
          : disabled
            ? { color: 'rgba(91, 58, 41, 0.2)' }
            : { color: 'rgba(91, 58, 41, 0.4)' }
      }
    >
      <GitCompareArrows size={size === 'sm' ? 14 : 18} />
    </button>
  )
}
