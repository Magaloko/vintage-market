import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3, TrendingUp, Globe, MousePointerClick, Share2,
  ShoppingBag, Target, Users, ArrowUp, ArrowDown, Eye,
  Clock, Heart, MessageSquare, Monitor, Smartphone, Tablet,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  getAnalyticsOverview, getAnalyticsVisitors, getAnalyticsActions,
  getAnalyticsChannels, getAnalyticsSales, getAnalyticsGoals,
  getAnalyticsSellers,
} from '../../lib/api'

/* ── Theme tokens (matching AdminDashboard) ─────────────────── */
const colors = { ink: '#2C2420', gold: '#B08D57', goldLight: '#C9A96E', white: '#FFFFFF' }
const alpha = {
  ink10: 'rgba(44,36,32,0.1)', ink15: 'rgba(44,36,32,0.15)', ink20: 'rgba(44,36,32,0.2)',
  ink30: 'rgba(44,36,32,0.3)', ink40: 'rgba(44,36,32,0.4)', ink50: 'rgba(44,36,32,0.5)',
  ink60: 'rgba(44,36,32,0.6)', ink70: 'rgba(44,36,32,0.7)',
  gold08: 'rgba(176,141,87,0.08)', gold10: 'rgba(176,141,87,0.1)',
  gold12: 'rgba(176,141,87,0.12)', gold15: 'rgba(176,141,87,0.15)',
}
const panelStyle = {
  backgroundColor: 'rgba(255,255,255,0.85)', border: `1px solid ${alpha.gold12}`,
  borderRadius: '2px', backdropFilter: 'blur(4px)',
}
const axisTick = { fontSize: 12, fill: alpha.ink40 }
const tooltipStyle = {
  backgroundColor: '#FFFFFF', border: `1px solid ${alpha.gold12}`, borderRadius: '4px',
  color: colors.ink, fontSize: '13px', fontFamily: 'DM Sans',
  boxShadow: '0 4px 16px rgba(44,36,32,0.1)',
}
const skeletonBg = { backgroundColor: 'rgba(176,141,87,0.06)', borderRadius: '2px' }

const PIE_COLORS = ['#B08D57', '#7A5340', '#5B3A29', '#9B7E4A', '#C9A96E', '#6E5535']
const CHANNEL_COLORS = { direct: '#B08D57', whatsapp: '#25D366', telegram: '#0088CC', instagram: '#E4405F', search: '#4285F4', referral: '#7A5340' }

/* ── Tabs ────────────────────────────────────────────────────── */
const TABS = [
  { key: 'overview', label: 'Обзор', icon: TrendingUp },
  { key: 'visitors', label: 'Посетители', icon: Globe },
  { key: 'actions', label: 'Действия', icon: MousePointerClick },
  { key: 'channels', label: 'Каналы', icon: Share2 },
  { key: 'sales', label: 'Продажи', icon: ShoppingBag },
  { key: 'goals', label: 'Цели', icon: Target },
  { key: 'sellers', label: 'Продавцы', icon: Users },
]

const PERIODS = [
  { days: 7, label: '7д' },
  { days: 30, label: '30д' },
  { days: 90, label: '90д' },
  { days: 365, label: 'Все' },
]

/* ── Helpers ─────────────────────────────────────────────────── */
function fmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

function fmtDuration(sec) {
  if (sec >= 3600) return Math.floor(sec / 3600) + 'ч ' + Math.round((sec % 3600) / 60) + 'м'
  if (sec >= 60) return Math.floor(sec / 60) + 'м ' + (sec % 60) + 'с'
  return sec + 'с'
}

function shortDate(d) {
  const parts = d.split('-')
  return parts[2] + '.' + parts[1]
}

/* ── Reusable pieces ─────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-28" style={skeletonBg} />)}
      </div>
      <div className="h-80" style={skeletonBg} />
    </div>
  )
}

function KpiCard({ label, value, delta, icon: Icon, suffix }) {
  const isPositive = delta > 0
  return (
    <div className="p-5" style={panelStyle}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-sans text-xs uppercase tracking-wider" style={{ color: alpha.ink50 }}>{label}</span>
        {Icon && <Icon size={16} style={{ color: alpha.ink30 }} />}
      </div>
      <p className="font-display text-2xl font-semibold" style={{ color: colors.ink }}>
        {value}{suffix && <span className="text-sm font-sans ml-1" style={{ color: alpha.ink40 }}>{suffix}</span>}
      </p>
      {delta !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {isPositive ? <ArrowUp size={14} style={{ color: '#4A8B6E' }} /> : <ArrowDown size={14} style={{ color: '#B05757' }} />}
          <span className="font-sans text-xs font-medium" style={{ color: isPositive ? '#4A8B6E' : '#B05757' }}>
            {isPositive ? '+' : ''}{delta}%
          </span>
          <span className="font-sans text-xs" style={{ color: alpha.ink30 }}>vs пред.</span>
        </div>
      )}
    </div>
  )
}

function MiniTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-sans">
        <thead>
          <tr style={{ borderBottom: `1px solid ${alpha.gold10}` }}>
            {columns.map(c => (
              <th key={c.key} className="text-left py-2 px-3 font-medium" style={{ color: alpha.ink50, fontSize: '12px' }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${alpha.gold08}` }}>
              {columns.map(c => (
                <td key={c.key} className="py-2 px-3" style={{ color: colors.ink }}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TAB COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function OverviewTab({ data }) {
  if (!data) return <Skeleton />
  const { totalVisits, uniqueVisitors, pagesPerVisit, avgSessionDuration, bounceRate, totalVisitsDelta, uniqueVisitorsDelta, bounceRateDelta, dailyVisits } = data
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard label="Визиты" value={fmt(totalVisits)} delta={totalVisitsDelta} icon={Eye} />
        <KpiCard label="Уникальные" value={fmt(uniqueVisitors)} delta={uniqueVisitorsDelta} icon={Users} />
        <KpiCard label="Стр. / визит" value={pagesPerVisit} icon={MousePointerClick} />
        <KpiCard label="Ср. время" value={fmtDuration(avgSessionDuration)} icon={Clock} />
        <KpiCard label="Отказы" value={bounceRate + '%'} delta={bounceRateDelta} icon={TrendingUp} />
      </div>
      <div className="p-6" style={panelStyle}>
        <h3 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.ink70 }}>Визиты по дням</h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={dailyVisits}>
            <defs>
              <linearGradient id="gradVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.gold} stopOpacity={0.2} />
                <stop offset="95%" stopColor={colors.gold} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha.ink10} />
            <XAxis dataKey="date" tickFormatter={shortDate} tick={axisTick} />
            <YAxis tick={axisTick} />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={shortDate} />
            <Area type="monotone" dataKey="visits" stroke={colors.gold} fill="url(#gradVisits)" name="Визиты" />
            <Area type="monotone" dataKey="unique" stroke={colors.goldLight} fill="none" strokeDasharray="4 4" name="Уникальные" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function VisitorsTab({ data }) {
  if (!data) return <Skeleton />
  const { geography, newVsReturning, devices, browsers } = data
  const nvr = [{ name: 'Новые', value: newVsReturning.new }, { name: 'Возвращ.', value: newVsReturning.returning }]
  const devData = devices.map(d => ({ name: d.type, value: d.count }))
  return (
    <div className="space-y-6">
      <div className="p-6" style={panelStyle}>
        <h3 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.ink70 }}>География</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={geography} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={alpha.ink10} />
            <XAxis type="number" tick={axisTick} />
            <YAxis type="category" dataKey="city" width={90} tick={axisTick} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="visits" fill={colors.gold} radius={[0, 2, 2, 0]} name="Визиты" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6" style={panelStyle}>
          <h3 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.ink70 }}>Новые / Возвращ.</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={nvr} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {nvr.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="p-6" style={panelStyle}>
          <h3 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.ink70 }}>Устройства</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={devData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {devData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i + 2]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="p-6" style={panelStyle}>
          <h3 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.ink70 }}>Браузеры</h3>
          <MiniTable
            columns={[
              { key: 'name', label: 'Браузер' },
              { key: 'percent', label: '%', render: r => r.percent + '%' },
            ]}
            rows={browsers}
          />
        </div>
      </div>
    </div>
  )
}

function ActionsTab({ data }) {
  if (!data) return <Skeleton />
  const { totalPageViews, uniquePageViews, avgTimeOnPage, topProducts, interactionTimeline } = data
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KpiCard label="Просмотры" value={fmt(totalPageViews)} icon={Eye} />
        <KpiCard label="Уникальные" value={fmt(uniquePageViews)} icon={MousePointerClick} />
        <KpiCard label="Ср. время" value={fmtDuration(avgTimeOnPage)} icon={Clock} />
      </div>
      <div className="p-6" style={panelStyle}>
        <h3 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.ink70 }}>Взаимодействия</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={interactionTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha.ink10} />
            <XAxis dataKey="date" tickFormatter={shortDate} tick={axisTick} />
            <YAxis tick={axisTick} />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={shortDate} />
            <Area type="monotone" dataKey="views" stackId="1" stroke={colors.gold} fill={alpha.gold15} name="Просмотры" />
            <Area type="monotone" dataKey="favorites" stackId="1" stroke="#B05757" fill="rgba(176,87,87,0.15)" name="Избранное" />
            <Area type="monotone" dataKey="inquiries" stackId="1" stroke="#4A8B6E" fill="rgba(74,139,110,0.15)" name="Заявки" />
            <Area type="monotone" dataKey="shares" stackId="1" stroke="#6E5535" fill="rgba(110,85,53,0.15)" name="Поделились" />
            <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'DM Sans' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="p-6" style={panelStyle}>
        <h3 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.ink70 }}>Топ-10 товаров</h3>
        <MiniTable
          columns={[
            { key: 'title', label: 'Товар', render: r => (
              <div className="flex items-center gap-2">
                {r.image_url && <img src={r.image_url} alt="" className="w-8 h-8 rounded object-cover" />}
                <span className="truncate max-w-[200px]">{r.title}</span>
              </div>
            )},
            { key: 'views', label: 'Просмотры' },
            { key: 'uniqueViews', label: 'Уник.' },
            { key: 'avgTime', label: 'Ср. время', render: r => fmtDuration(r.avgTime) },
          ]}
          rows={topProducts}
        />
      </div>
    </div>
  )
}

function ChannelsTab({ data }) {
  if (!data) return <Skeleton />
  const { channels, channelTrend } = data
  const pieData = channels.map(c => ({ name: c.name, value: c.visits }))
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6" style={panelStyle}>
          <h3 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.ink70 }}>Каналы трафика</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {channels.map((c, i) => <Cell key={i} fill={c.color || PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="p-6" style={panelStyle}>
          <h3 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.ink70 }}>Статистика каналов</h3>
          <MiniTable
            columns={[
              { key: 'name', label: 'Канал', render: r => (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                  {r.name}
                </div>
              )},
              { key: 'visits', label: 'Визиты' },
              { key: 'bounceRate', label: 'Отказы', render: r => r.bounceRate + '%' },
              { key: 'conversionRate', label: 'Конв.', render: r => r.conversionRate + '%' },
            ]}
            rows={channels}
          />
        </div>
      </div>
      <div className="p-6" style={panelStyle}>
        <h3 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.ink70 }}>Тренд по каналам</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={channelTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha.ink10} />
            <XAxis dataKey="date" tickFormatter={shortDate} tick={axisTick} />
            <YAxis tick={axisTick} />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={shortDate} />
            {channels.map(ch => (
              <Line key={ch.key} type="monotone" dataKey={ch.key} stroke={ch.color || colors.gold} dot={false} name={ch.name} strokeWidth={2} />
            ))}
            <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'DM Sans' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function SalesTab({ data }) {
  if (!data) return <Skeleton />
  const { totalRevenue, ordersCount, avgOrderValue, conversionRate, revenueDelta, revenueTimeline, revenueByCategory, funnel, topByRevenue } = data
  const funnelSteps = [
    { label: 'Просмотры', value: funnel.views, color: alpha.ink50 },
    { label: 'Избранное', value: funnel.favorites, color: '#B08D57' },
    { label: 'Заявки', value: funnel.inquiries, color: '#C9A96E' },
    { label: 'Продажи', value: funnel.sales, color: '#4A8B6E' },
  ]
  const maxFunnel = funnelSteps[0].value || 1
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Выручка" value={fmt(totalRevenue)} suffix="€" delta={revenueDelta} icon={ShoppingBag} />
        <KpiCard label="Заказы" value={ordersCount} icon={ShoppingBag} />
        <KpiCard label="Ср. чек" value={avgOrderValue} suffix="€" icon={TrendingUp} />
        <KpiCard label="Конверсия" value={conversionRate + '%'} icon={Target} />
      </div>
      <div className="p-6" style={panelStyle}>
        <h3 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.ink70 }}>Выручка по дням</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueTimeline}>
            <defs>
              <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4A8B6E" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#4A8B6E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha.ink10} />
            <XAxis dataKey="date" tickFormatter={shortDate} tick={axisTick} />
            <YAxis tick={axisTick} />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={shortDate} formatter={v => v + ' €'} />
            <Area type="monotone" dataKey="revenue" stroke="#4A8B6E" fill="url(#gradRev)" name="Выручка" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6" style={panelStyle}>
          <h3 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.ink70 }}>Воронка конверсии</h3>
          <div className="space-y-3">
            {funnelSteps.map((step, i) => {
              const pct = maxFunnel > 0 ? (step.value / maxFunnel * 100) : 0
              const convPct = i === 0 ? 100 : (funnelSteps[0].value > 0 ? (step.value / funnelSteps[0].value * 100).toFixed(1) : 0)
              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-sans text-xs" style={{ color: alpha.ink60 }}>{step.label}</span>
                    <span className="font-sans text-xs font-medium" style={{ color: colors.ink }}>
                      {fmt(step.value)} <span style={{ color: alpha.ink30 }}>({convPct}%)</span>
                    </span>
                  </div>
                  <div className="h-6 rounded-sm" style={{ backgroundColor: alpha.gold08 }}>
                    <div
                      className="h-full rounded-sm transition-all"
                      style={{ width: pct + '%', backgroundColor: step.color, minWidth: pct > 0 ? '4px' : 0 }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="p-6" style={panelStyle}>
          <h3 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.ink70 }}>Выручка по категориям</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByCategory.slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={alpha.ink10} />
              <XAxis type="number" tick={axisTick} />
              <YAxis type="category" dataKey="name" width={90} tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => v + ' €'} />
              <Bar dataKey="revenue" fill={colors.gold} radius={[0, 2, 2, 0]} name="Выручка" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="p-6" style={panelStyle}>
        <h3 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.ink70 }}>Топ по выручке</h3>
        <MiniTable
          columns={[
            { key: 'title', label: 'Товар', render: r => (
              <div className="flex items-center gap-2">
                {r.image_url && <img src={r.image_url} alt="" className="w-8 h-8 rounded object-cover" />}
                <span className="truncate max-w-[180px]">{r.title}</span>
              </div>
            )},
            { key: 'revenue', label: 'Выручка', render: r => r.revenue + ' €' },
            { key: 'category', label: 'Категория' },
          ]}
          rows={topByRevenue}
        />
      </div>
    </div>
  )
}

function GoalsTab({ data }) {
  if (!data) return <Skeleton />
  const { goals } = data
  const goalIcons = { inquiry: MessageSquare, favorite: Heart, inquiry_to_sale: ShoppingBag, response_time: Clock }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(g => {
          const Icon = goalIcons[g.id] || Target
          return (
            <div key={g.id} className="p-6" style={panelStyle}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded flex items-center justify-center" style={{ backgroundColor: alpha.gold08 }}>
                  <Icon size={18} style={{ color: colors.gold }} />
                </div>
                <div>
                  <h4 className="font-sans text-sm font-medium" style={{ color: colors.ink }}>{g.name}</h4>
                  <p className="font-sans text-xs" style={{ color: alpha.ink40 }}>Конверсия: {g.conversionRate}%</p>
                </div>
              </div>
              <p className="font-display text-3xl font-semibold mb-3" style={{ color: colors.ink }}>{g.completions}</p>
              <div className="h-1.5 rounded-full mb-4" style={{ backgroundColor: alpha.gold08 }}>
                <div className="h-full rounded-full" style={{ width: Math.min(g.conversionRate, 100) + '%', backgroundColor: colors.gold }} />
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={g.trend}>
                  <Area type="monotone" dataKey="completions" stroke={colors.gold} fill={alpha.gold10} strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SellersTab({ data }) {
  if (!data) return <Skeleton />
  const { sellers, activityTimeline } = data
  const roleBadge = { seller: { bg: 'rgba(176,141,87,0.1)', color: '#B08D57', label: 'Продавец' }, agent: { bg: 'rgba(74,139,110,0.1)', color: '#4A8B6E', label: 'Агент' } }
  return (
    <div className="space-y-6">
      <div className="p-6" style={panelStyle}>
        <h3 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.ink70 }}>Производительность</h3>
        <MiniTable
          columns={[
            { key: 'name', label: 'Имя' },
            { key: 'role', label: 'Роль', render: r => {
              const b = roleBadge[r.role] || roleBadge.seller
              return <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: b.bg, color: b.color }}>{b.label}</span>
            }},
            { key: 'products', label: 'Товары' },
            { key: 'views', label: 'Просмотры' },
            { key: 'inquiries', label: 'Заявки' },
            { key: 'sales', label: 'Продажи' },
            { key: 'revenue', label: 'Выручка', render: r => r.revenue + ' €' },
          ]}
          rows={sellers}
        />
      </div>
      <div className="p-6" style={panelStyle}>
        <h3 className="font-sans text-sm font-medium mb-4" style={{ color: alpha.ink70 }}>Новые листинги по дням</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={activityTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha.ink10} />
            <XAxis dataKey="date" tickFormatter={shortDate} tick={axisTick} />
            <YAxis tick={axisTick} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={shortDate} />
            <Bar dataKey="newListings" fill={colors.gold} radius={[2, 2, 0, 0]} name="Листинги" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState('overview')
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(false)
  const [tabData, setTabData] = useState({})

  const loaders = {
    overview: getAnalyticsOverview,
    visitors: getAnalyticsVisitors,
    actions: getAnalyticsActions,
    channels: getAnalyticsChannels,
    sales: getAnalyticsSales,
    goals: getAnalyticsGoals,
    sellers: getAnalyticsSellers,
  }

  const loadTab = useCallback(async (tab, d) => {
    setLoading(true)
    try {
      const res = await loaders[tab](d)
      setTabData(prev => ({ ...prev, [`${tab}_${d}`]: res.data }))
    } catch (_) { /* noop */ }
    setLoading(false)
  }, [])

  useEffect(() => {
    const cacheKey = `${activeTab}_${days}`
    if (!tabData[cacheKey]) loadTab(activeTab, days)
  }, [activeTab, days])

  const currentData = tabData[`${activeTab}_${days}`]

  const TabContent = { overview: OverviewTab, visitors: VisitorsTab, actions: ActionsTab, channels: ChannelsTab, sales: SalesTab, goals: GoalsTab, sellers: SellersTab }
  const ActiveTabComponent = TabContent[activeTab]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: alpha.gold08, border: `1px solid ${alpha.gold12}` }}>
            <BarChart3 size={20} style={{ color: colors.gold }} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold" style={{ color: colors.ink }}>Аналитика</h1>
            <p className="font-sans text-xs" style={{ color: alpha.ink40 }}>Подробная статистика и отчёты</p>
          </div>
        </div>
        {/* Period selector */}
        <div className="flex gap-1 p-1 rounded" style={{ backgroundColor: alpha.gold08, border: `1px solid ${alpha.gold12}` }}>
          {PERIODS.map(p => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className="px-3 py-1.5 rounded font-sans text-xs font-medium transition-colors"
              style={{
                backgroundColor: days === p.days ? colors.gold : 'transparent',
                color: days === p.days ? '#fff' : alpha.ink50,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded font-sans text-sm whitespace-nowrap transition-colors"
              style={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.85)' : 'transparent',
                color: isActive ? colors.ink : alpha.ink50,
                border: isActive ? `1px solid ${alpha.gold12}` : '1px solid transparent',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              <Icon size={16} style={{ color: isActive ? colors.gold : alpha.ink30 }} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {loading && !currentData ? <Skeleton /> : <ActiveTabComponent data={currentData} />}
    </div>
  )
}
