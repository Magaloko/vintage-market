import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Eye, MessageSquare, TrendingUp, Plus, Store } from 'lucide-react'
import { useAuth } from '../../lib/contexts/AuthContext'
import { getShopStats, getMyShop } from '../../lib/api'

// -- Constants ----------------------------------------------------------------

const GOLD = '#B08D57'
const GOLD_ACCENT = '#C9A96E'
const TEXT = '#F0E6D6'
const TEXT_DIM = 'rgba(240, 230, 214, 0.35)'
const TEXT_MUTED = 'rgba(240, 230, 214, 0.3)'

const CARD_STYLE = {
  backgroundColor: 'rgba(176, 141, 87, 0.05)',
  border: '1px solid rgba(176, 141, 87, 0.1)',
  borderRadius: '2px',
}

// -- Helpers ------------------------------------------------------------------

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div
        className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"
        style={{ color: GOLD }}
      />
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="stat-card flex items-center gap-3 p-4">
      <div
        className="w-10 h-10 rounded flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="font-body text-[10px] uppercase tracking-wider" style={{ color: TEXT_DIM }}>
          {label}
        </p>
        <p className="font-body text-xl font-bold" style={{ color: TEXT }}>
          {value}
        </p>
      </div>
    </div>
  )
}

function QuickLink({ to, icon: Icon, iconColor, title, subtitle }) {
  return (
    <Link
      to={to}
      className="p-6 transition-all duration-300"
      style={CARD_STYLE}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.3)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.1)')}
    >
      <Icon size={24} className="mb-3" style={{ color: iconColor }} />
      <h3 className="font-display text-lg italic" style={{ color: TEXT }}>
        {title}
      </h3>
      <p className="font-body text-xs mt-1" style={{ color: TEXT_MUTED }}>
        {subtitle}
      </p>
    </Link>
  )
}

// -- Component ----------------------------------------------------------------

export default function SellerDashboard() {
  const { shopId } = useAuth()
  const [stats, setStats] = useState(null)
  const [shop, setShop] = useState(null)

  useEffect(() => {
    if (!shopId) return
    getShopStats(shopId).then((r) => setStats(r.data))
    getMyShop(shopId).then((r) => setShop(r.data))
  }, [shopId])

  if (!stats) return <Spinner />

  const hasNewInquiries = stats.newInquiries > 0

  const statCards = [
    { label: 'Товары', value: stats.total, icon: Package, color: GOLD },
    { label: 'Активные', value: stats.active, icon: TrendingUp, color: GOLD },
    { label: 'Просмотры', value: stats.totalViews, icon: Eye, color: GOLD },
    { label: 'Запросы', value: stats.newInquiries || 0, icon: MessageSquare, color: hasNewInquiries ? GOLD_ACCENT : GOLD },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl italic" style={{ color: TEXT }}>
            {shop?.name || 'Мой магазин'}
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: TEXT_MUTED }}>
            Панель управления
          </p>
        </div>
        <Link to="/seller/products/new" className="btn-primary text-sm py-2 px-4">
          <Plus size={14} className="mr-2" /> Добавить
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLink
          to="/seller/products"
          icon={Package}
          iconColor={GOLD}
          title="Мои товары"
          subtitle="Управление каталогом"
        />
        <QuickLink
          to="/seller/inquiries"
          icon={MessageSquare}
          iconColor={hasNewInquiries ? GOLD_ACCENT : GOLD}
          title="Запросы"
          subtitle={hasNewInquiries ? `${stats.newInquiries} новых` : 'Нет новых'}
        />
        <QuickLink
          to="/seller/profile"
          icon={Store}
          iconColor={GOLD}
          title="Профиль магазина"
          subtitle={shop ? `/${shop.slug}` : 'Настроить'}
        />
      </div>

      {/* Floating action button */}
      <Link
        to="/seller/products/new"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 z-40"
        style={{
          background: 'linear-gradient(135deg, #B08D57, #C9A96E)',
          color: '#0C0A08',
          boxShadow: '0 4px 20px rgba(176, 141, 87, 0.4)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(176, 141, 87, 0.5)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(176, 141, 87, 0.4)' }}
        title="Добавить товар"
      >
        <Plus size={24} />
      </Link>
    </div>
  )
}
