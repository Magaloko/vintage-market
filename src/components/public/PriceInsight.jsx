import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

export default function PriceInsight({ price, avgPrice, compact = false }) {
  if (!price || !avgPrice || avgPrice === 0) return null

  const diff = ((price - avgPrice) / avgPrice * 100).toFixed(0)
  const diffAbs = Math.abs(diff)

  let label, color, Icon, bgColor
  if (diff <= -15) {
    label = compact ? `-${diffAbs}%` : `${diffAbs}% ниже среднего`
    color = 'text-green-700'
    bgColor = 'bg-green-50 border-green-200'
    Icon = TrendingDown
  } else if (diff >= 15) {
    label = compact ? `+${diffAbs}%` : `${diffAbs}% выше среднего`
    color = 'text-amber-700'
    bgColor = 'bg-amber-50 border-amber-200'
    Icon = TrendingUp
  } else {
    label = compact ? '\u2248 \u00d8' : 'В пределах среднего'
    color = 'text-vintage-brown/60'
    bgColor = 'border'
    Icon = Minus
  }

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body ${color} ${bgColor}`}>
        <Icon size={10} />
        {label}
      </span>
    )
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bgColor}`}
      style={diff > -15 && diff < 15 ? { backgroundColor: 'rgba(44, 36, 32, 0.04)', borderColor: 'rgba(44, 36, 32, 0.15)' } : undefined}>
      <Icon size={16} className={color} />
      <div>
        <p className={`font-body text-sm font-medium ${color}`}>{label}</p>
        <p className="font-body text-xs" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
          Средняя по категории: {avgPrice}\u20ac
        </p>
      </div>
    </div>
  )
}
