import { useState, useEffect } from 'react'
import { Package, ShoppingCart, Eye, TrendingUp, Tag, DollarSign, Heart, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { getStats } from '../../lib/api'
import { categories } from '../../data/demoProducts'

// Vintage-styled chart colors (no bright colors)
const COLORS = ['#5B3A29', '#B08D57', '#B08D57', '#B08D57', '#0C0A08', '#7A5340']

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

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28" style={{ backgroundColor: '#1A1410', borderRadius: '2px' }} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80" style={{ backgroundColor: '#1A1410', borderRadius: '2px' }} />
          <div className="h-80" style={{ backgroundColor: '#1A1410', borderRadius: '2px' }} />
        </div>
      </div>
    )
  }

  if (!stats) return null

  const categoryData = Object.entries(stats.categories).map(([key, value]) => ({
    name: categories.find(c => c.id === key)?.name || key,
    value,
  }))

  const conversionRate = stats.total > 0 ? ((stats.sold / stats.total) * 100).toFixed(1) : 0
  const totalRevenue = stats.totalRevenue || 0
  const favCount = stats.totalFavorites || 0

  const statCards = [
    { label: 'Всего товаров', value: stats.total, icon: Package, color: '#B08D57' },
    { label: 'Активные', value: stats.active, icon: ShoppingCart, color: '#B08D57' },
    { label: 'Проданные', value: stats.sold, icon: Tag, color: '#B08D57' },
    { label: 'Конверсия', value: `${conversionRate}%`, icon: TrendingUp, color: '#B08D57' },
    { label: 'Средняя цена', value: `${stats.avgPrice}\u20ac`, icon: DollarSign, color: '#B08D57' },
    { label: 'Просмотры', value: stats.totalViews, icon: Eye, color: '#B08D57' },
    { label: 'Выручка', value: `${totalRevenue}\u20ac`, icon: BarChart3, color: '#B08D57' },
    { label: 'В избранном', value: favCount, icon: Heart, color: '#B08D57' },
  ]

  const chartTabs = [
    { id: 'trends', label: 'Тренды' },
    { id: 'categories', label: 'Категории' },
    { id: 'prices', label: 'Цены' },
    { id: 'revenue', label: 'Выручка' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-sans text-xl font-semibold" style={{ color: '#F0E6D6' }}>Панель управления</h1>
        <p className="font-sans text-sm mt-1" style={{ color: 'rgba(240, 230, 214, 0.4)' }}>Полная аналитика вашего маркетплейса</p>
      </div>

      {/* Stat Cards — Dark navy cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-btn flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${card.color}20` }}>
              <card.icon size={18} style={{ color: card.color }} />
            </div>
            <div className="min-w-0">
              <p className="font-sans text-[10px] uppercase tracking-wider truncate"
                style={{ color: 'rgba(240, 230, 214, 0.35)' }}>{card.label}</p>
              <p className="font-sans text-xl font-bold" style={{ color: '#F0E6D6' }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Area */}
      <div style={{ backgroundColor: '#1A1410', border: '1px solid rgba(240, 230, 214, 0.06)', borderRadius: '2px' }}>
        <div className="flex items-center gap-1 p-4" style={{ borderBottom: '1px solid rgba(240, 230, 214, 0.06)' }}>
          {chartTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className="px-4 py-2 font-sans text-xs transition-colors"
              style={{
                backgroundColor: activeChart === tab.id ? 'rgba(176, 141, 87, 0.15)' : 'transparent',
                color: activeChart === tab.id ? '#C9A96E' : 'rgba(240, 230, 214, 0.35)',
                borderRadius: '2px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeChart === 'trends' && stats.monthlyData?.length > 0 && (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={stats.monthlyData}>
                <defs>
                  <linearGradient id="gradProducts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B08D57" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#B08D57" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B08D57" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#B08D57" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(240, 230, 214, 0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgba(240, 230, 214, 0.35)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'rgba(240, 230, 214, 0.35)' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0C0A08', border: '1px solid rgba(240, 230, 214, 0.1)', borderRadius: '2px', color: '#F0E6D6', fontSize: '13px', fontFamily: 'DM Sans' }} />
                <Area type="monotone" dataKey="products" stroke="#B08D57" strokeWidth={2} fill="url(#gradProducts)" name="Товары" />
                <Area type="monotone" dataKey="views" stroke="#B08D57" strokeWidth={2} fill="url(#gradViews)" name="Просмотры" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0C0A08', border: '1px solid rgba(240, 230, 214, 0.1)', borderRadius: '2px', color: '#F0E6D6' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                <h4 className="font-sans text-sm font-medium mb-4" style={{ color: 'rgba(240, 230, 214, 0.5)' }}>Распределение</h4>
                {categoryData.sort((a, b) => b.value - a.value).map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="font-sans text-sm flex-1" style={{ color: 'rgba(240, 230, 214, 0.6)' }}>{cat.name}</span>
                    <span className="font-sans text-sm font-semibold" style={{ color: '#F0E6D6' }}>{cat.value}</span>
                    <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(240, 230, 214, 0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(cat.value / stats.total) * 100}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeChart === 'prices' && (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.priceRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(240, 230, 214, 0.06)" />
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: 'rgba(240, 230, 214, 0.35)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'rgba(240, 230, 214, 0.35)' }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0C0A08', border: '1px solid rgba(240, 230, 214, 0.1)', borderRadius: '2px', color: '#F0E6D6' }} />
                <Bar dataKey="count" fill="#5B3A29" radius={[4, 4, 0, 0]} name="Количество" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'revenue' && (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.revenueByCategory || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(240, 230, 214, 0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'rgba(240, 230, 214, 0.35)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'rgba(240, 230, 214, 0.35)' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0C0A08', border: '1px solid rgba(240, 230, 214, 0.1)', borderRadius: '2px', color: '#F0E6D6' }} formatter={(v) => [`${v}\u20ac`, 'Выручка']} />
                <Bar dataKey="revenue" fill="#B08D57" radius={[4, 4, 0, 0]} name="Выручка" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row: Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top by Views */}
        <div className="p-6" style={{ backgroundColor: '#1A1410', border: '1px solid rgba(240, 230, 214, 0.06)', borderRadius: '2px' }}>
          <h3 className="font-sans text-sm font-medium mb-4 flex items-center gap-2" style={{ color: 'rgba(240, 230, 214, 0.7)' }}>
            <Eye size={16} style={{ color: 'rgba(240, 230, 214, 0.3)' }} />
            Топ по просмотрам
          </h3>
          <div className="space-y-3">
            {(stats.topByViews || []).slice(0, 5).map((item, i) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="font-sans text-xs w-5 text-right" style={{ color: 'rgba(240, 230, 214, 0.2)' }}>{i + 1}</span>
                <img src={item.image_url} alt="" className="w-10 h-10 object-cover shrink-0" style={{ borderRadius: '2px', backgroundColor: 'rgba(240, 230, 214, 0.05)' }} />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm truncate" style={{ color: 'rgba(240, 230, 214, 0.7)' }}>{item.title}</p>
                  <p className="font-sans text-xs" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>{item.price}&euro;</p>
                </div>
                <span className="font-sans text-sm font-semibold" style={{ color: '#B08D57' }}>{item.views}</span>
                <Eye size={12} style={{ color: 'rgba(240, 230, 214, 0.2)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Top by Favorites */}
        <div className="p-6" style={{ backgroundColor: '#1A1410', border: '1px solid rgba(240, 230, 214, 0.06)', borderRadius: '2px' }}>
          <h3 className="font-sans text-sm font-medium mb-4 flex items-center gap-2" style={{ color: 'rgba(240, 230, 214, 0.7)' }}>
            <Heart size={16} style={{ color: '#B08D57' }} />
            Топ по избранному
          </h3>
          <div className="space-y-3">
            {(stats.topByFavorites || []).slice(0, 5).map((item, i) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="font-sans text-xs w-5 text-right" style={{ color: 'rgba(240, 230, 214, 0.2)' }}>{i + 1}</span>
                <img src={item.image_url} alt="" className="w-10 h-10 object-cover shrink-0" style={{ borderRadius: '2px', backgroundColor: 'rgba(240, 230, 214, 0.05)' }} />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm truncate" style={{ color: 'rgba(240, 230, 214, 0.7)' }}>{item.title}</p>
                  <p className="font-sans text-xs" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>{item.price}&euro;</p>
                </div>
                <span className="font-sans text-sm font-semibold" style={{ color: '#B08D57' }}>{item.favCount || 0}</span>
                <Heart size={12} style={{ color: 'rgba(176, 141, 87, 0.4)' }} />
              </div>
            ))}
            {(!stats.topByFavorites || stats.topByFavorites.length === 0) && (
              <p className="font-sans text-sm text-center py-6" style={{ color: 'rgba(240, 230, 214, 0.25)' }}>Пока нет данных</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
