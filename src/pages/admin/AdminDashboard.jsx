import { useState, useEffect } from 'react'
import { Package, ShoppingCart, Eye, TrendingUp, Tag, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { getStats } from '../../lib/api'
import { categories } from '../../data/demoProducts'

const COLORS = ['#6B4C3B', '#2D4A3E', '#B8943E', '#8B4513', '#3A2A1D', '#D4C5A9']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await getStats()
      setStats(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  const categoryData = Object.entries(stats.categories).map(([key, value]) => ({
    name: categories.find(c => c.id === key)?.name || key,
    value,
  }))

  const statCards = [
    { label: 'Всего товаров', value: stats.total, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Активные', value: stats.active, icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Проданные', value: stats.sold, icon: Tag, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Средняя цена', value: `${stats.avgPrice}€`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Просмотры', value: stats.totalViews, icon: Eye, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Топ категория', value: categories.find(c => c.id === stats.topCategory)?.name || stats.topCategory, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-sans text-xl font-semibold text-gray-900">Панель управления</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Обзор вашего винтажного маркетплейса</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card flex items-center gap-4">
            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}>
              <card.icon size={20} className={card.color} />
            </div>
            <div>
              <p className="font-sans text-xs text-gray-400 uppercase tracking-wider">{card.label}</p>
              <p className="font-sans text-2xl font-bold text-gray-900 mt-0.5">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Chart */}
        {stats.monthlyData && stats.monthlyData.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-sans text-sm font-medium text-gray-900 mb-6">Товары и просмотры по месяцам</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '13px' }}
                />
                <Line type="monotone" dataKey="products" stroke="#6B4C3B" strokeWidth={2} name="Товары" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="views" stroke="#B8943E" strokeWidth={2} name="Просмотры" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-sans text-sm font-medium text-gray-900 mb-6">Распределение по категориям</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Price Distribution */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-sans text-sm font-medium text-gray-900 mb-6">Распределение цен</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stats.priceRanges}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="range" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '13px' }} />
            <Bar dataKey="count" fill="#6B4C3B" radius={[6, 6, 0, 0]} name="Количество" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
