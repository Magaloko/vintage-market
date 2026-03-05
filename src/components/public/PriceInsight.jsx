import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { useCurrency } from '../../lib/CurrencyContext'

const THRESHOLDS = { low: -15, high: 15 }

const VARIANTS = {
  below: {
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    Icon: TrendingDown,
    label: (pct) => `${pct}% ниже среднего`,
    compactLabel: (pct) => `-${pct}%`,
  },
  above: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    Icon: TrendingUp,
    label: (pct) => `${pct}% выше среднего`,
    compactLabel: (pct) => `+${pct}%`,
  },
  average: {
    color: 'text-vintage-brown/60',
    bgColor: 'border',
    Icon: Minus,
    label: () => 'В пределах среднего',
    compactLabel: () => '\u2248 \u00d8',
  },
}

function getVariant(diff) {
  if (diff <= THRESHOLDS.low) return VARIANTS.below
  if (diff >= THRESHOLDS.high) return VARIANTS.above
  return VARIANTS.average
}

export default function PriceInsight({ price, avgPrice, compact = false }) {
  const { formatPrice } = useCurrency()
  if (!price || !avgPrice || avgPrice === 0) return null

  const diff = ((price - avgPrice) / avgPrice * 100).toFixed(0)
  const diffAbs = Math.abs(diff)
  const variant = getVariant(diff)
  const { color, bgColor, Icon } = variant

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body ${color} ${bgColor}`}>
        <Icon size={10} />
        {variant.compactLabel(diffAbs)}
      </span>
    )
  }

  const isAverage = diff > THRESHOLDS.low && diff < THRESHOLDS.high
  const containerStyle = isAverage
    ? { backgroundColor: 'rgba(44, 36, 32, 0.04)', borderColor: 'rgba(44, 36, 32, 0.15)' }
    : undefined

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bgColor}`} style={containerStyle}>
      <Icon size={16} className={color} />
      <div>
        <p className={`font-body text-sm font-medium ${color}`}>{variant.label(diffAbs)}</p>
        <p className="font-body text-xs" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
          Средняя по категории: {formatPrice(avgPrice)}
        </p>
      </div>
    </div>
  )
}
