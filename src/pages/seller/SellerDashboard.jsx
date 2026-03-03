import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Eye, MessageSquare, TrendingUp, Plus, Store } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { getShopStats, getMyShop } from '../../lib/api'

export default function SellerDashboard() {
  const { shopId } = useAuth()
  const [stats, setStats] = useState(null)
  const [shop, setShop] = useState(null)

  useEffect(() => {
    if (!shopId) return
    getShopStats(shopId).then(r => setStats(r.data))
    getMyShop(shopId).then(r => setShop(r.data))
  }, [shopId])

  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: '#B08D57' }} />
    </div>
  )

  const cards = [
    { label: 'Товары', value: stats.total, icon: Package, color: '#B08D57' },
    { label: 'Активные', value: stats.active, icon: TrendingUp, color: '#B08D57' },
    { label: 'Просмотры', value: stats.totalViews, icon: Eye, color: '#B08D57' },
    { label: 'Запросы', value: stats.newInquiries || 0, icon: MessageSquare, color: stats.newInquiries > 0 ? '#C9A96E' : '#B08D57' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl italic" style={{ color: '#F0E6D6' }}>
            {shop?.name || 'Мой магазин'}
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>
            Панель управления
          </p>
        </div>
        <Link to="/seller/products/new" className="btn-primary text-sm py-2 px-4">
          <Plus size={14} className="mr-2" /> Добавить
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="stat-card flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${card.color}20` }}>
              <card.icon size={18} style={{ color: card.color }} />
            </div>
            <div>
              <p className="font-body text-[10px] uppercase tracking-wider" style={{ color: 'rgba(240, 230, 214, 0.35)' }}>{card.label}</p>
              <p className="font-body text-xl font-bold" style={{ color: '#F0E6D6' }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/seller/products" className="p-6 transition-all duration-300"
          style={{ backgroundColor: 'rgba(176, 141, 87, 0.05)', border: '1px solid rgba(176, 141, 87, 0.1)', borderRadius: '2px' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.1)'}>
          <Package size={24} className="mb-3" style={{ color: '#B08D57' }} />
          <h3 className="font-display text-lg italic" style={{ color: '#F0E6D6' }}>Мои товары</h3>
          <p className="font-body text-xs mt-1" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>Управление каталогом</p>
        </Link>
        <Link to="/seller/inquiries" className="p-6 transition-all duration-300"
          style={{ backgroundColor: 'rgba(176, 141, 87, 0.05)', border: '1px solid rgba(176, 141, 87, 0.1)', borderRadius: '2px' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.1)'}>
          <MessageSquare size={24} className="mb-3" style={{ color: stats.newInquiries > 0 ? '#C9A96E' : '#B08D57' }} />
          <h3 className="font-display text-lg italic" style={{ color: '#F0E6D6' }}>Запросы</h3>
          <p className="font-body text-xs mt-1" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>
            {stats.newInquiries > 0 ? `${stats.newInquiries} новых` : 'Нет новых'}
          </p>
        </Link>
        <Link to="/seller/profile" className="p-6 transition-all duration-300"
          style={{ backgroundColor: 'rgba(176, 141, 87, 0.05)', border: '1px solid rgba(176, 141, 87, 0.1)', borderRadius: '2px' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.1)'}>
          <Store size={24} className="mb-3" style={{ color: '#B08D57' }} />
          <h3 className="font-display text-lg italic" style={{ color: '#F0E6D6' }}>Профиль магазина</h3>
          <p className="font-body text-xs mt-1" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>
            {shop ? <span>/{shop.slug}</span> : 'Настроить'}
          </p>
        </Link>
      </div>
    </div>
  )
}
