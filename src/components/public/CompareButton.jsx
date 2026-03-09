import { GitCompareArrows } from 'lucide-react'
import { useCompare } from '../../lib/CompareContext'

const SIZES = {
  sm: { button: 'w-8 h-8', icon: 14 },
  md: { button: 'w-10 h-10', icon: 18 },
}

const STYLES = {
  active: { backgroundColor: '#B08D57' },
  disabled: { color: 'rgba(44, 36, 32, 0.2)' },
  default: { color: 'rgba(44, 36, 32, 0.4)' },
  darkDefault: { backgroundColor: 'rgba(176, 141, 87, 0.1)', color: 'rgba(240, 230, 214, 0.5)' },
  darkDisabled: { backgroundColor: 'rgba(176, 141, 87, 0.05)', color: 'rgba(240, 230, 214, 0.2)' },
}

export default function CompareButton({ product, size = 'sm', variant = 'light' }) {
  const { isInCompare, toggleCompare, compareCount, maxCompare } = useCompare()

  const active = isInCompare(product.id)
  const disabled = !active && compareCount >= maxCompare
  const { button, icon } = SIZES[size] || SIZES.sm
  const isDark = variant === 'dark'

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

  const getStyle = () => {
    if (active) return STYLES.active
    if (isDark) return disabled ? STYLES.darkDisabled : STYLES.darkDefault
    return disabled ? STYLES.disabled : STYLES.default
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
            ? isDark ? 'cursor-not-allowed' : 'bg-white/60 cursor-not-allowed'
            : isDark ? '' : 'bg-white/80 hover:bg-white'
      }`}
      style={getStyle()}
    >
      <GitCompareArrows size={icon} />
    </button>
  )
}
