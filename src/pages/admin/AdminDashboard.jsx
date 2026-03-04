import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, ShoppingCart, Eye, TrendingUp, Tag,
  DollarSign, Heart, BarChart3, MessageSquare, Plus,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, AreaChart, Area,
} from 'recharts'
import { getStats } from '../../lib/api'
import { categories } from '../../data/demoProducts'

/* ── Theme tokens ────────────────────────────────────────────── */
const PIE_COLORS = ['#5B3A29', '#B08D57', '#B08D57', '#B08D57', '#0C0A08', '#7A5340']

const colors = {
  cream:     '#F0E6D6',
  gold:      '#B08D57',
  goldLight: '#C9A96E',
  panel:     '#1A1410',
}

const alpha = {
  cream06: 'rgba(240, 230, 214, 0.06)',
  cream05: 'rgba(240, 230, 214, 0.05)',
  cream35: 'rgba(240, 230, 214, 0.35)',
  cream40: 'rgba(240, 230, 214, 0.4)',
  cream20: 'rgba(240, 230, 214, 0.2)',
  cream25: 'rgba(240, 230, 214, 0.25)',
  cream30: 'rgba(240, 230, 214, 0.3)',
  cream50: 'rgba(240, 230, 214, 0.5)',
  cream60: 'rgba(240, 230, 214, 0.6)',
  cream70: 'rgba(240, 230, 214, 0.7)',
  gold15:  'rgba(176, 141, 87, 0.15)',
  gold40:  'rgba(176, 141, 87, 0.4)',
}

const panelStyle = {
  backgroundColor: colors.panel,
  border: `1px solid ${alpha.cream06}`,
  borderRadius: '2px',
}

const skeletonBg = { backgroundColor: colors.panel, borderRadius: '2px' }

const axisTick = { fontSize: 12, fill: alpha.cream35 }

const tooltipStyle = {
  backgroundColor: '#0C0A08',
  border: `1px solid rgba(240, 230, 214, 0.1)`,
  borderRadius: '2px',
  color: colors.cream,
  fontSize: '13px',
  fontFamily: 'DM Sans',
}

/* ── Chart tabs config ───────────────────────────────────────── */
const CHART_TABS = [
  { id: 'trends',     label: 'Тренды' },
  { id: 'categories', label: 'Категории' },
  { id: 'prices',     label: 'Цены' },
  { id: 'revenue',    label: 'Выручка' },
]

/* ── Loading skeleton ────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-28" style={skeletonBg} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80" style={skeletonBg} />
        <div className="h-80" style={skeletonBg} />
      </div>
    </div>
  )
}

/* ── Top-products list (views or favorites) ──────────────────── */
function TopProductsList({ title, icon: Icon, items, valueKey, iconColor, emptyText }) {
  return (
    <div className="p-6" style={panelStyle}>
      <h3
        className="font-sans text-sm font-medium mb-4 flex items-center gap-2"
        style={{ color: alpha.cream70 }}
      >
        <Icon size={16} style={{ color: iconColor }} />
        {title}
      </h3>

      <div className="space-y-3">
        {items.length > 0 ? (
          items.slice(0, 5).map((item, i) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="font-sans text-xs w-5 text-right" style={{ color: alpha.cream20 }}>
                {i + 1}
              </span>
              <img
                src={item.image_url}
                alt=""
                className="w-10 h-10 object-cover shrink-0"
                style={{ borderRadius: '2px', backgroundColor: alpha.cream05 }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm truncate" style={{ color: alpha.cream70 }}>
                  {item.title}
                </p>
                <p className="font-sans text-xs" style={{ color: alpha.cream30 }}>
                  {item.price}&euro;
                </p>
              </div>
              <span className="font-sans text-sm font-semibold" style={{ color: colors.gold }}>
                {item[valueKey] || 0}
              </span>
              <Icon size={12} style={{ color: alpha.cream20 }} />
            </div>
          ))
        ) : (
          <p
            className="font-sans text-sm text-center py-6"
            style={{ color: alpha.cream25 }}
          >
            {emptyText}
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────── */
export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeChart, setActiveChart] = useState('trends')

  useEffect(() => {
    async function load() {
      try {
        const { data } = await getStats()
        setStats(data)
      } catch (e) {
        console.error('Stats load error:', e)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <DashboardSkeleton />
  if (!stats) return null

  /* derived data */
  const categoryData = Object.entries(stats.categories).map(([key, value]) => ({
    name: categories.find((c) => c.id === key)?.name || key,
    value,
  }))

  const conversionRate = stats.total > 0 ? ((stats.sold / stats.total) * 100).toFixed(1) : 0
  const totalRevenue   = stats.totalRevenue || 0
  const favCount       = stats.totalFavorites || 0

  const statCards = [
    { label: 'Всего товаров', value: stats.total,           icon: Package,      color: colors.gold },
    { label: 'Активные',      value: stats.active,          icon: ShoppingCart,  color: colors.gold },
    { label: 'Проданные',     value: stats.sold,            icon: Tag,           color: colors.gold },
    { label: 'Конверсия',     value: `${conversionRate}%`,  icon: TrendingUp,    color: colors.gold },
    { label: 'Средняя цена',  value: `${stats.avgPrice}\u20ac`, icon: DollarSign, color: colors.gold },
    { label: 'Просмотры',     value: stats.totalViews,      icon: Eye,           color: colors.gold },
    { label: 'Выручка',       value: `${totalRevenue}\u20ac`, icon: BarChart3,    color: colors.gold },
    { label: 'В избранном',   value: favCount,              icon: Heart,         color: colors.gold },
    {
      label: 'Запросы',
      value: stats.newInquiries || 0,
      icon: MessageSquare,
      color: stats.newInquiries > 0 ? colors.goldLight : colors.gold,
      highlight: stats.newInquiries > 0,
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-xl font-semibold" style={{ color: colors.cream }}>
            Панель управления
          </h1>
          <p className="font-sans text-sm mt-1" style={{ color: alpha.cream40 }}>
            Полная аналитика вашего маркетплейса
          </p>
        </div>
        <Link to="/admin/products/new" className="btn-primary text-sm py-2 px-4">
          <Plus size={14} className="mr-2" /> Добавить товар
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card flex items-center gap-3 p-4">
            <div
              className="w-10 h-10 rounded-btn flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${card.color}20` }}
            >
              <card.icon size={18} style={{ color: card.color }} />
            </div>
            <div className="min-w-0">
              <p
                className="font-sans text-[10px] uppercase tracking-wider truncate"
                style={{ color: alpha.cream35 }}
              >
                {card.label}
              </p>
              <p className="font-sans text-xl font-bold" style={{ color: colors.cream }}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts panel */}
      <div style={panelStyle}>
        {/* Tab bar */}
        <div
          className="flex items-center gap-1 p-4"
          style={{ borderBottom: `1px solid ${alpha.cream06}` }}
        >
          {CHART_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className="px-4 py-2 font-sans text-xs transition-colors"
              style={{
                backgroundColor: activeChart === tab.id ? alpha.gold15 : 'transparent',
                color: activeChart === tab.id ? colors.goldLight : alpha.cream35,
                borderRadius: '2px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chart body */}
        <div className="p-6">
          {activeChart === 'trends' && <TrendsChart data={stats.monthlyData} />}
          {activeChart === 'categories' && <CategoriesChart data={categoryData} total={stats.total} />}
          {activeChart === 'prices' && <PricesChart data={stats.priceRanges} />}
          {activeChart === 'revenue' && <RevenueChart data={stats.revenueByCategory} />}
        </div>
      </div>

      {/* Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsList
          title="Топ по просмотрам"
          icon={Eye}
          items={stats.topByViews || []}
          valueKey="views"
          iconColor={alpha.cream30}
          emptyText="Пока нет данных"
        />
        <TopProductsList
          title="Топ по избранному"
          icon={Heart}
          items={stats.topByFavorites || []}
          valueKey="favCount"
          iconColor={colors.gold}
          emptyText="Пока нет данных"
        />
      </div>

      {/* Floating action button */}
      <Link
        to="/admin/products/new"
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

/* ── Chart sub-components ────────────────────────────────────── */

function TrendsChart({ data }) {
  if (!data?.length) return null

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="gradProducts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.gold} stopOpacity={0.2} />
            <stop offset="95%" stopColor={colors.gold} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.gold} stopOpacity={0.2} />
            <stop offset="95%" stopColor={colors.gold} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={alpha.cream06} />
        <XAxis dataKey="month" tick={axisTick} />
        <YAxis tick={axisTick} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="products" stroke={colors.gold} strokeWidth={2} fill="url(#gradProducts)" name="Товары" />
        <Area type="monotone" dataKey="views"    stroke={colors.gold} strokeWidth={2} fill="url(#gradViews)"    name="Просмотры" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function CategoriesChart({ data, total }) {
  const sorted = [...data].sort((a, b) => b.value - a.value)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-3">
        <h4 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.cream50 }}>
          Распределение
        </h4>
        {sorted.map((cat, i) => (
          <div key={cat.name} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            <span className="font-sans text-sm flex-1" style={{ color: alpha.cream60 }}>
              {cat.name}
            </span>
            <span className="font-sans text-sm font-semibold" style={{ color: colors.cream }}>
              {cat.value}
            </span>
            <div
              className="w-24 h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: alpha.cream06 }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(cat.value / total) * 100}%`,
                  background: PIE_COLORS[i % PIE_COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PricesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={alpha.cream06} />
        <XAxis dataKey="range" tick={axisTick} />
        <YAxis tick={axisTick} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" fill="#5B3A29" radius={[4, 4, 0, 0]} name="Количество" />
      </BarChart>
    </ResponsiveContainer>
  )
}

function RevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data || []}>
        <CartesianGrid strokeDasharray="3 3" stroke={alpha.cream06} />
        <XAxis dataKey="name" tick={axisTick} />
        <YAxis tick={axisTick} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [`${v}\u20ac`, 'Выручка']}
        />
        <Bar dataKey="revenue" fill={colors.gold} radius={[4, 4, 0, 0]} name="Выручка" />
      </BarChart>
    </ResponsiveContainer>
  )
}
