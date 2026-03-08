import { useState, useEffect } from 'react'
import { BarChart3 } from 'lucide-react'
import CostCalculator from '../../components/shared/CostCalculator'
import { useCurrency } from '../../lib/CurrencyContext'
import { getStats } from '../../lib/api'

export default function AdminCalculator() {
  const { currency, formatPrice } = useCurrency()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getStats().then(({ data }) => data && setStats(data))
  }, [])

  const symbol = currency === 'USD' ? '$' : currency === 'RUB' ? '₽' : currency === 'KZT' ? '₸' : '€'

  return (
    <div className="page-enter space-y-6">
      {/* Marketplace Stats */}
      {stats && (
        <div className="p-5 flex flex-wrap gap-8" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(176, 141, 87, 0.1)',
          borderRadius: '2px',
          backdropFilter: 'blur(4px)',
        }}>
          <div className="flex items-center gap-3">
            <BarChart3 size={16} style={{ color: 'rgba(176, 141, 87, 0.5)' }} />
            <span className="font-body text-xs tracking-wider uppercase" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
              Маркетплейс
            </span>
          </div>
          <Stat label="Товаров" value={stats.totalProducts || 0} />
          <Stat label="Ср. цена" value={formatPrice ? formatPrice(stats.avgPrice || 0) : `${Math.round(stats.avgPrice || 0)}€`} />
          <Stat label="Выручка" value={formatPrice ? formatPrice(stats.totalRevenue || 0) : `${Math.round(stats.totalRevenue || 0)}€`} />
        </div>
      )}

      <CostCalculator currencySymbol={symbol} />
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <span className="font-body text-[10px] tracking-wider uppercase block" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>
        {label}
      </span>
      <span className="font-display text-lg" style={{ color: '#2C2420' }}>
        {value}
      </span>
    </div>
  )
}
