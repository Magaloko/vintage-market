import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

export default function PriceInsight({ price, avgPrice, compact = false }) {
  if (!price || !avgPrice || avgPrice === 0) return null

  const diff = ((price - avgPrice) / avgPrice * 100).toFixed(0)
  const diffAbs = Math.abs(diff)

  let label, color, Icon, bgColor
  if (diff <= -15) {
    label = compact ? `-${diffAbs}%` : `${diffAbs}% unter Durchschnitt`
    color = 'text-green-700'
    bgColor = 'bg-green-50 border-green-200'
    Icon = TrendingDown
  } else if (diff >= 15) {
    label = compact ? `+${diffAbs}%` : `${diffAbs}% \u00fcber Durchschnitt`
    color = 'text-amber-700'
    bgColor = 'bg-amber-50 border-amber-200'
    Icon = TrendingUp
  } else {
    label = compact ? '\u2248 \u00d8' : 'Im Durchschnitt'
    color = 'text-vintage-brown/60'
    bgColor = 'bg-vintage-beige/30 border-vintage-sand/50'
    Icon = Minus
  }

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-sans ${color} ${bgColor} border`}>
        <Icon size={10} />
        {label}
      </span>
    )
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bgColor}`}>
      <Icon size={16} className={color} />
      <div>
        <p className={`font-sans text-sm font-medium ${color}`}>{label}</p>
        <p className="font-sans text-xs text-vintage-brown/40">
          Kategorie-\u00d8: {avgPrice}\u20ac
        </p>
      </div>
    </div>
  )
}
