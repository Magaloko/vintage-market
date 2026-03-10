import { useState, useEffect } from 'react'
import { Package, Eye, ShoppingBag, MessageCircle } from 'lucide-react'
import CostCalculator from '../../components/shared/CostCalculator'
import { useCurrency } from '../../lib/contexts/CurrencyContext'
import { useAuth } from '../../lib/contexts/AuthContext'
import { getShopStats } from '../../lib/api'

export default function SellerCalculator() {
  const { currency } = useCurrency()
  const { shopId } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!shopId) return
    getShopStats(shopId).then(({ data }) => data && setStats(data))
  }, [shopId])

  const symbol = currency === 'USD' ? '$' : currency === 'RUB' ? '₽' : currency === 'KZT' ? '₸' : '€'

  return (
    <div className="page-enter space-y-6">
      {/* Shop Stats */}
      {stats && (
        <div className="p-5 flex flex-wrap gap-6" style={{
          backgroundColor: '#1A1410',
          border: '1px solid rgba(176, 141, 87, 0.08)',
          borderRadius: '2px',
        }}>
          <Stat icon={Package} label="Товаров" value={stats.total || 0} />
          <Stat icon={ShoppingBag} label="Активных" value={stats.active || 0} />
          <Stat icon={ShoppingBag} label="Продано" value={stats.sold || 0} />
          <Stat icon={Eye} label="Просмотров" value={stats.totalViews || 0} />
          <Stat icon={MessageCircle} label="Запросов" value={stats.totalInquiries || 0} />
        </div>
      )}

      <CostCalculator currencySymbol={symbol} />
    </div>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      {Icon && <Icon size={14} style={{ color: 'rgba(176, 141, 87, 0.4)' }} />}
      <div>
        <span className="font-body text-[10px] tracking-wider uppercase block" style={{ color: 'rgba(240, 230, 214, 0.25)' }}>
          {label}
        </span>
        <span className="font-display text-lg" style={{ color: '#F0E6D6' }}>
          {typeof value === 'number' ? value.toLocaleString('ru-RU') : value}
        </span>
      </div>
    </div>
  )
}
