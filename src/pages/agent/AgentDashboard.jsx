import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Headphones, Ticket, AlertTriangle, Star, Inbox } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { getAgentDashboard } from '../../lib/api'

const COLORS = {
  accent: '#4A8B6E',
  accentBg: 'rgba(74, 139, 110, 0.08)',
  accentBorder: 'rgba(74, 139, 110, 0.2)',
  gold: '#B08D57',
  goldBg: 'rgba(176, 141, 87, 0.08)',
  goldBorder: 'rgba(176, 141, 87, 0.2)',
  red: '#C0392B',
  redBg: 'rgba(192, 57, 43, 0.08)',
  redBorder: 'rgba(192, 57, 43, 0.2)',
  ink: '#2C2420',
  ink50: 'rgba(44, 36, 32, 0.5)',
  ink30: 'rgba(44, 36, 32, 0.3)',
  cardBg: 'rgba(255, 255, 255, 0.7)',
  cardBorder: 'rgba(176, 141, 87, 0.1)',
}

function StatCard({ icon: Icon, label, value, color, bgColor, borderColor }) {
  return (
    <div
      className="p-5"
      style={{
        backgroundColor: COLORS.cardBg,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: '2px',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-sans text-[10px] tracking-[0.15em] uppercase" style={{ color: COLORS.ink50 }}>
            {label}
          </p>
          <p className="font-display text-2xl mt-1" style={{ color: COLORS.ink }}>
            {value ?? '—'}
          </p>
        </div>
        <div
          className="w-9 h-9 flex items-center justify-center"
          style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}`, borderRadius: '2px' }}
        >
          <Icon size={16} style={{ color }} />
        </div>
      </div>
    </div>
  )
}

function SlaAlertRow({ ticket }) {
  const hours = ((Date.now() - new Date(ticket.created_at).getTime()) / 3600000).toFixed(1)
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: `1px solid ${COLORS.cardBorder}` }}
    >
      <div className="flex-1 min-w-0">
        <p className="font-sans text-sm truncate" style={{ color: COLORS.ink }}>
          {ticket.name || 'Без имени'}
        </p>
        <p className="font-sans text-xs truncate" style={{ color: COLORS.ink50 }}>
          {ticket.product_title || ticket.message?.slice(0, 40)}
        </p>
      </div>
      <span
        className="font-sans text-xs font-medium px-2 py-0.5 flex-shrink-0"
        style={{ backgroundColor: COLORS.redBg, color: COLORS.red, borderRadius: '2px' }}
      >
        {hours}ч
      </span>
    </div>
  )
}

export default function AgentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    getAgentDashboard(user.id).then(({ data }) => {
      setStats(data)
      setLoading(false)
    })
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(74, 139, 110, 0.2)', borderTopColor: '#4A8B6E' }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl" style={{ color: COLORS.ink }}>
          Обзор
        </h1>
        <p className="font-sans text-sm mt-1" style={{ color: COLORS.ink50 }}>
          {user?.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Ticket}
          label="Мои тикеты"
          value={stats?.myTickets ?? 0}
          color={COLORS.accent}
          bgColor={COLORS.accentBg}
          borderColor={COLORS.accentBorder}
        />
        <StatCard
          icon={Inbox}
          label="Без назначения"
          value={stats?.unassigned ?? 0}
          color={COLORS.gold}
          bgColor={COLORS.goldBg}
          borderColor={COLORS.goldBorder}
        />
        <StatCard
          icon={AlertTriangle}
          label="Нарушения SLA"
          value={stats?.slaBreaches ?? 0}
          color={COLORS.red}
          bgColor={COLORS.redBg}
          borderColor={COLORS.redBorder}
        />
        <StatCard
          icon={Star}
          label="Средняя оценка"
          value={stats?.avgCsat ?? '—'}
          color={COLORS.gold}
          bgColor={COLORS.goldBg}
          borderColor={COLORS.goldBorder}
        />
      </div>

      {/* SLA Alerts */}
      {stats?.slaAlerts?.length > 0 && (
        <div
          style={{
            backgroundColor: COLORS.cardBg,
            border: `1px solid ${COLORS.redBorder}`,
            borderRadius: '2px',
          }}
        >
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${COLORS.cardBorder}` }}>
            <AlertTriangle size={14} style={{ color: COLORS.red }} />
            <span className="font-sans text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.red }}>
              SLA-нарушения
            </span>
          </div>
          {stats.slaAlerts.map(t => (
            <SlaAlertRow key={t.id} ticket={t} />
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="pt-2">
        <Link
          to="/agent/workspace"
          className="inline-flex items-center gap-2 px-6 py-3 font-sans text-sm tracking-[0.1em] uppercase transition-all duration-300"
          style={{
            backgroundColor: COLORS.accent,
            color: '#fff',
            borderRadius: '2px',
          }}
        >
          <Headphones size={16} />
          Открыть рабочее место
        </Link>
      </div>
    </div>
  )
}
