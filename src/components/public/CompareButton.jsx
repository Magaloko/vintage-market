import { GitCompareArrows } from 'lucide-react'
import { useCompare } from '../../lib/contexts/CompareContext'

const SIZES = {
  sm: { button: 'w-8 h-8', icon: 14 },
  md: { button: 'w-10 h-10', icon: 18 },
}

const STYLES = {
  active: { backgroundColor: '#B08D57' },
  disabled: { color: 'rgba(44, 36, 32, 0.2)' },
  default: { color: 'rgba(44, 36, 32, 0.4)' },
}

export default function CompareButton({ product, size = 'sm' }) {
  const { isInCompare, toggleCompare, compareCount, maxCompare } = useCompare()

  const active = isInCompare(product.id)
  const disabled = !active && compareCount >= maxCompare
  const { button, icon } = SIZES[size] || SIZES.sm

  const title = active
    ? 'Убрать из сравнения'
    : disabled
      ? `Максимум ${maxCompare} товара`
      : 'Сравнить'

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleCompare(product)
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={title}
      className={`${button} rounded-full flex items-center justify-center transition-all duration-200 ${
        active
          ? 'text-white shadow-md scale-110'
          : disabled
            ? 'bg-white/60 cursor-not-allowed'
            : 'bg-white/80 hover:bg-white'
      }`}
      style={active ? STYLES.active : disabled ? STYLES.disabled : STYLES.default}
    >
      <GitCompareArrows size={icon} />
    </button>
  )
}
