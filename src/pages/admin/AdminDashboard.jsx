import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingCart, Eye, TrendingUp, Tag, DollarSign, Heart, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { getStats } from '../../lib/api'
import { categories } from '../../data/demoProducts'

const COLORS = ['#6B4C3B', '#2D4A3E', '#B8943E', '#8B4513', '#3A2A1D', '#D4C5A9']

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
            <div key={i} className="h-28 bg-white rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white rounded-xl" />
          <div className="h-80 bg-white rounded-xl" />
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
    { label: '\u0412\u0441\u0435\u0433\u043e \u0442\u043e\u0432\u0430\u0440\u043e\u0432', value: stats.total, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', trend: null },
    { label: '\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0435', value: stats.active, icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-50', trend: '+' },
    { label: '\u041f\u0440\u043e\u0434\u0430\u043d\u043d\u044b\u0435', value: stats.sold, icon: Tag, color: 'text-amber-600', bg: 'bg-amber-50', trend: null },
    { label: '\u041a\u043e\u043d\u0432\u0435\u0440\u0441\u0438\u044f', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', trend: null },
    { label: '\u0421\u0440\u0435\u0434\u043d\u044f\u044f \u0446\u0435\u043d\u0430', value: `${stats.avgPrice}\u20ac`, icon: DollarSign, color: 'text-teal-600', bg: 'bg-teal-50', trend: null },
    { label: '\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u044b', value: stats.totalViews, icon: Eye, color: 'text-rose-600', bg: 'bg-rose-50', trend: null },
    { label: '\u0412\u044b\u0440\u0443\u0447\u043a\u0430', value: `${totalRevenue}\u20ac`, icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+' },
    { label: '\u0412 \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u043c', value: favCount, icon: Heart, color: 'text-red-500', bg: 'bg-red-50', trend: null },
  ]

  const chartTabs = [
    { id: 'trends', label: '\u0422\u0440\u0435\u043d\u0434\u044b' },
    { id: 'categories', label: '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438' },
    { id: 'prices', label: '\u0426\u0435\u043d\u044b' },
    { id: 'revenue', label: '\u0412\u044b\u0440\u0443\u0447\u043a\u0430' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-sans text-xl font-semibold text-gray-900">{'\u041f\u0430\u043d\u0435\u043b\u044c \u0443\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f'}</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">{'\u041f\u043e\u043b\u043d\u0430\u044f \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430 \u0432\u0430\u0448\u0435\u0433\u043e \u043c\u0430\u0440\u043a\u0435\u0442\u043f\u043b\u0435\u0439\u0441\u0430'}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card flex items-center gap-3 p-4">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <card.icon size={18} className={card.color} />
            </div>
            <div className="min-w-0">
              <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider truncate">{card.label}</p>
              <p className="font-sans text-xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Area */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-1 p-4 border-b border-gray-100">
          {chartTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`px-4 py-2 font-sans text-xs rounded-lg transition-colors ${
                activeChart === tab.id
                  ? 'bg-vintage-dark text-vintage-cream'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
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
                    <stop offset="5%" stopColor="#6B4C3B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6B4C3B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B8943E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#B8943E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5', fontSize: '13px', fontFamily: 'Outfit' }} />
                <Area type="monotone" dataKey="products" stroke="#6B4C3B" strokeWidth={2} fill="url(#gradProducts)" name={'\u0422\u043e\u0432\u0430\u0440\u044b'} />
                <Area type="monotone" dataKey="views" stroke="#B8943E" strokeWidth={2} fill="url(#gradViews)" name={'\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u044b'} />
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                <h4 className="font-sans text-sm font-medium text-gray-600 mb-4">{'\u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435'}</h4>
                {categoryData.sort((a, b) => b.value - a.value).map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="font-sans text-sm text-gray-700 flex-1">{cat.name}</span>
                    <span className="font-sans text-sm font-semibold text-gray-900">{cat.value}</span>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5', fontSize: '13px' }} />
                <Bar dataKey="count" fill="#6B4C3B" radius={[8, 8, 0, 0]} name={'\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e'} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'revenue' && (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.revenueByCategory || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5', fontSize: '13px' }} formatter={(v) => [`${v}\u20ac`, '\u0412\u044b\u0440\u0443\u0447\u043a\u0430']} />
                <Bar dataKey="revenue" fill="#2D4A3E" radius={[8, 8, 0, 0]} name={'\u0412\u044b\u0440\u0443\u0447\u043a\u0430'} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row: Top Products + Top Favorites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Views */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-sans text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Eye size={16} className="text-gray-400" />
            {'\u0422\u043e\u043f \u043f\u043e \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430\u043c'}
          </h3>
          <div className="space-y-3">
            {(stats.topByViews || []).slice(0, 5).map((item, i) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="font-sans text-xs text-gray-300 w-5 text-right">{i + 1}</span>
                <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-gray-800 truncate">{item.title}</p>
                  <p className="font-sans text-xs text-gray-400">{item.price}\u20ac</p>
                </div>
                <span className="font-sans text-sm font-semibold text-gray-600">{item.views}</span>
                <Eye size={12} className="text-gray-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Top by Favorites */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-sans text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Heart size={16} className="text-red-400" />
            {'\u0422\u043e\u043f \u043f\u043e \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u043c\u0443'}
          </h3>
          <div className="space-y-3">
            {(stats.topByFavorites || []).slice(0, 5).map((item, i) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="font-sans text-xs text-gray-300 w-5 text-right">{i + 1}</span>
                <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-gray-800 truncate">{item.title}</p>
                  <p className="font-sans text-xs text-gray-400">{item.price}\u20ac</p>
                </div>
                <span className="font-sans text-sm font-semibold text-red-500">{item.favCount || 0}</span>
                <Heart size={12} className="text-red-300" />
              </div>
            ))}
            {(!stats.topByFavorites || stats.topByFavorites.length === 0) && (
              <p className="font-sans text-sm text-gray-400 text-center py-6">{'\u041f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
