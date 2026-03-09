import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Send, StickyNote, History, Mail, Phone, ExternalLink,
  Sparkles, CircleDot, Clock, PauseCircle, CheckCircle2, Lock,
  Star, ChevronDown, ChevronRight, ChevronLeft, ArrowLeft,
  MessageSquare, AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../lib/AuthContext'
import {
  getAgentInquiries, updateTicketStatus, addInquiryNote,
  getInquiryNotes, getStatusLog, recordFirstReply,
  assignTicket, OBZOR_TRANSITIONS,
} from '../../lib/api'
import { ticketMacros } from '../../data/demoProducts'

/* ── Theme ──────────────────────────────────────────────────── */
const C = {
  accent: '#4A8B6E',
  accentBg: 'rgba(74, 139, 110, 0.08)',
  accentBorder: 'rgba(74, 139, 110, 0.2)',
  gold: '#B08D57',
  ink: '#2C2420',
  ink03: 'rgba(44, 36, 32, 0.03)',
  ink05: 'rgba(44, 36, 32, 0.05)',
  ink08: 'rgba(44, 36, 32, 0.08)',
  ink10: 'rgba(44, 36, 32, 0.1)',
  ink15: 'rgba(44, 36, 32, 0.15)',
  ink20: 'rgba(44, 36, 32, 0.2)',
  ink30: 'rgba(44, 36, 32, 0.3)',
  ink40: 'rgba(44, 36, 32, 0.4)',
  ink60: 'rgba(44, 36, 32, 0.6)',
  gold10: 'rgba(176, 141, 87, 0.1)',
  gold12: 'rgba(176, 141, 87, 0.12)',
  gold15: 'rgba(176, 141, 87, 0.15)',
  gold20: 'rgba(176, 141, 87, 0.2)',
  gold60: 'rgba(176, 141, 87, 0.6)',
  cardBg: 'rgba(255, 255, 255, 0.7)',
  white: '#FFFFFF',
  internalBg: 'rgba(176, 141, 87, 0.06)',
  internalBorder: 'rgba(176, 141, 87, 0.15)',
}

const STATUS_MAP = {
  new:     { label: 'Новый',        icon: Sparkles,     color: '#B08D57',                bg: C.gold15 },
  open:    { label: 'Открыт',       icon: CircleDot,    color: '#5A6B3C',                bg: 'rgba(122, 139, 111, 0.12)' },
  pending: { label: 'В ожидании',   icon: Clock,        color: '#C17F3E',                bg: 'rgba(193, 127, 62, 0.12)' },
  on_hold: { label: 'На удержании', icon: PauseCircle,  color: '#7A5340',                bg: 'rgba(122, 83, 64, 0.12)' },
  solved:  { label: 'Решён',        icon: CheckCircle2, color: '#4A7A5C',                bg: 'rgba(74, 122, 92, 0.12)' },
  closed:  { label: 'Закрыт',       icon: Lock,         color: 'rgba(44, 36, 32, 0.25)', bg: C.ink03 },
  read:    { label: 'Открыт',       icon: CircleDot,    color: '#5A6B3C',                bg: 'rgba(122, 139, 111, 0.12)' },
  replied: { label: 'Решён',        icon: CheckCircle2, color: '#4A7A5C',                bg: 'rgba(74, 122, 92, 0.12)' },
}

const SLA_COLORS = {
  green:  { color: '#4A7A5C', bg: 'rgba(74, 122, 92, 0.1)' },
  yellow: { color: '#C17F3E', bg: 'rgba(193, 127, 62, 0.1)' },
  red:    { color: '#B5736A', bg: 'rgba(181, 115, 106, 0.1)' },
}

const ACTION_BUTTONS = {
  new:     [{ to: 'open',    label: 'Открыть' }],
  open:    [{ to: 'pending', label: 'Ожидание' }, { to: 'on_hold', label: 'Удержание' }, { to: 'solved', label: 'Решён' }],
  pending: [{ to: 'open',    label: 'Открыть' }],
  on_hold: [{ to: 'open',    label: 'Открыть' }],
  solved:  [{ to: 'open',    label: 'Переоткрыть' }, { to: 'closed', label: 'Закрыть' }],
  closed:  [],
}

/* ── Helpers ────────────────────────────────────────────────── */
function computeSLA(inq) {
  const created = new Date(inq.created_at).getTime()
  const nowMs = Date.now()
  const isFinal = ['solved', 'closed'].includes(inq.status)
  const frtHours = inq.first_reply_at
    ? (new Date(inq.first_reply_at).getTime() - created) / 3600000
    : isFinal ? null : (nowMs - created) / 3600000
  const resHours = inq.resolved_at
    ? (new Date(inq.resolved_at).getTime() - created) / 3600000
    : isFinal ? null : (nowMs - created) / 3600000
  let frtLevel = 'green'
  if (frtHours != null) { if (frtHours > 8) frtLevel = 'red'; else if (frtHours > 4) frtLevel = 'yellow' }
  return { frtHours, resHours, frtLevel, isFinal }
}

function formatHours(h) {
  if (h == null) return '—'
  if (h < 1) return `${Math.round(h * 60)}м`
  if (h < 24) return `${Math.round(h)}ч`
  return `${Math.round(h / 24)}д`
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'только что'
  if (mins < 60) return `${mins}м`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}ч`
  return `${Math.floor(hrs / 24)}д`
}

/* ── Left Panel: Ticket List ───────────────────────────────── */
function TicketListPanel({ tickets, selectedId, onSelect, filter, setFilter, search, setSearch, userId }) {
  const filters = [
    { id: 'assigned', label: 'Мои', count: tickets.filter(t => t.assigned_to === userId).length },
    { id: 'unassigned', label: 'Свободные', count: tickets.filter(t => !t.assigned_to && !['solved', 'closed'].includes(t.status)).length },
    { id: 'all', label: 'Все', count: tickets.length },
  ]

  const filtered = tickets.filter(t => {
    if (filter === 'assigned') return t.assigned_to === userId
    if (filter === 'unassigned') return !t.assigned_to && !['solved', 'closed'].includes(t.status)
    return true
  }).filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return (t.name || '').toLowerCase().includes(q) ||
           (t.email || '').toLowerCase().includes(q) ||
           (t.product_title || '').toLowerCase().includes(q) ||
           (t.message || '').toLowerCase().includes(q)
  })

  // Sort: SLA breaches first, then by created_at desc
  filtered.sort((a, b) => {
    const aFinal = ['solved', 'closed'].includes(a.status)
    const bFinal = ['solved', 'closed'].includes(b.status)
    if (aFinal !== bFinal) return aFinal ? 1 : -1
    const aHours = (Date.now() - new Date(a.created_at).getTime()) / 3600000
    const bHours = (Date.now() - new Date(b.created_at).getTime()) / 3600000
    const aBreach = !aFinal && aHours > 8
    const bBreach = !bFinal && bHours > 8
    if (aBreach !== bBreach) return aBreach ? -1 : 1
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: C.white, borderRight: `1px solid ${C.ink08}` }}>
      {/* Search */}
      <div className="p-3" style={{ borderBottom: `1px solid ${C.ink08}` }}>
        <div className="flex items-center gap-2 px-2 py-1.5" style={{ backgroundColor: C.ink03, borderRadius: '2px' }}>
          <Search size={14} style={{ color: C.ink30 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="flex-1 bg-transparent outline-none font-sans text-xs"
            style={{ color: C.ink }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex px-3 pt-2 gap-1" style={{ borderBottom: `1px solid ${C.ink08}` }}>
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="pb-2 px-2 font-sans text-xs transition-colors"
            style={{
              color: filter === f.id ? C.accent : C.ink30,
              borderBottom: filter === f.id ? `2px solid ${C.accent}` : '2px solid transparent',
              fontWeight: filter === f.id ? 500 : 400,
            }}
          >
            {f.label} <span style={{ opacity: 0.5 }}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* Ticket list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare size={24} style={{ color: C.ink15, margin: '0 auto' }} />
            <p className="font-sans text-xs mt-2" style={{ color: C.ink30 }}>Нет тикетов</p>
          </div>
        ) : filtered.map(t => {
          const st = STATUS_MAP[t.status] || STATUS_MAP.new
          const sla = computeSLA(t)
          const isActive = t.id === selectedId
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="w-full text-left p-3 transition-all duration-150"
              style={{
                backgroundColor: isActive ? C.accentBg : 'transparent',
                borderLeft: isActive ? `3px solid ${C.accent}` : '3px solid transparent',
                borderBottom: `1px solid ${C.ink05}`,
              }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === 'new' ? 'animate-pulse' : ''}`} style={{ backgroundColor: st.color }} />
                <span className="font-sans text-sm font-medium truncate" style={{ color: C.ink }}>
                  {t.name}
                </span>
                {!sla.isFinal && sla.frtLevel !== 'green' && (
                  <span
                    className="font-sans text-[9px] px-1 py-0.5 flex-shrink-0"
                    style={{ backgroundColor: SLA_COLORS[sla.frtLevel].bg, color: SLA_COLORS[sla.frtLevel].color, borderRadius: '1px' }}
                  >
                    {formatHours(sla.frtHours)}
                  </span>
                )}
                <span className="font-sans text-[10px] ml-auto flex-shrink-0" style={{ color: C.ink20 }}>
                  {timeAgo(t.created_at)}
                </span>
              </div>
              {t.product_title && (
                <p className="font-sans text-[10px] mt-0.5 truncate pl-4" style={{ color: C.gold60 }}>
                  {t.product_title}
                </p>
              )}
              <p className="font-sans text-xs mt-0.5 truncate pl-4" style={{ color: C.ink30 }}>
                {t.message?.slice(0, 60)}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Center Panel: Conversation ────────────────────────────── */
function ConversationPanel({ ticket, notes, onSendNote, onStatusChange, userId }) {
  const [text, setText] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [macroOpen, setMacroOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [statusLoading, setStatusLoading] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [notes])

  if (!ticket) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: C.ink03 }}>
        <div className="text-center">
          <MessageSquare size={32} style={{ color: C.ink15, margin: '0 auto' }} />
          <p className="font-sans text-sm mt-3" style={{ color: C.ink30 }}>Выберите тикет</p>
        </div>
      </div>
    )
  }

  const st = STATUS_MAP[ticket.status] || STATUS_MAP.new
  const StIcon = st.icon
  const isClosed = ticket.status === 'closed'
  const actions = ACTION_BUTTONS[ticket.status] || []

  const handleSend = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    await onSendNote(ticket.id, text.trim(), isInternal)
    setText('')
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend()
  }

  const applyMacro = (template) => {
    setText(prev => prev ? prev + '\n\n' + template : template)
    setMacroOpen(false)
  }

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: C.ink03 }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: C.white, borderBottom: `1px solid ${C.ink08}` }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: st.color }} />
          <span className="font-sans text-sm font-medium truncate" style={{ color: C.ink }}>{ticket.name}</span>
          <span
            className="font-sans text-[10px] px-1.5 py-0.5 flex items-center gap-1 flex-shrink-0"
            style={{ backgroundColor: st.bg, color: st.color, borderRadius: '1px' }}
          >
            <StIcon size={10} />{st.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {actions.map(a => {
            const isLoading = statusLoading === a.to
            return (
              <button
                key={a.to}
                onClick={async () => { setStatusLoading(a.to); await onStatusChange(ticket.id, a.to); setStatusLoading(null) }}
                disabled={!!statusLoading}
                className="px-2 py-1 font-sans text-[10px] tracking-wider uppercase transition-colors flex items-center gap-1"
                style={{
                  backgroundColor: a.to === 'solved' ? 'rgba(74, 122, 92, 0.1)' : C.ink05,
                  color: a.to === 'solved' ? '#4A7A5C' : C.ink40,
                  borderRadius: '2px',
                  border: `1px solid ${a.to === 'solved' ? 'rgba(74, 122, 92, 0.2)' : C.ink10}`,
                  opacity: statusLoading && !isLoading ? 0.4 : 1,
                }}
              >
                {isLoading && <div className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" />}
                {a.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Original message */}
        <div className="p-3" style={{ backgroundColor: C.white, border: `1px solid ${C.ink10}`, borderRadius: '2px' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-sans text-[10px] font-medium uppercase tracking-wider" style={{ color: C.accent }}>
              Клиент
            </span>
            <span className="font-sans text-[10px]" style={{ color: C.ink20 }}>{formatDate(ticket.created_at)}</span>
          </div>
          <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap" style={{ color: C.ink60 }}>
            {ticket.message}
          </p>
        </div>

        {/* Notes */}
        {notes.map(n => (
          <div
            key={n.id}
            className="p-3"
            style={{
              backgroundColor: n.is_internal ? C.internalBg : C.white,
              border: `1px solid ${n.is_internal ? C.internalBorder : C.ink10}`,
              borderRadius: '2px',
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-sans text-[10px] font-medium uppercase tracking-wider" style={{ color: n.is_internal ? C.gold : C.accent }}>
                {n.author || 'Агент'}
              </span>
              {n.is_internal && (
                <span className="font-sans text-[9px] px-1 py-0.5" style={{ backgroundColor: C.gold10, color: C.gold, borderRadius: '1px' }}>
                  внутренняя
                </span>
              )}
              <span className="font-sans text-[10px]" style={{ color: C.ink20 }}>{formatDate(n.created_at)}</span>
            </div>
            <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap" style={{ color: C.ink60 }}>
              {n.content}
            </p>
          </div>
        ))}
      </div>

      {/* Composer */}
      {!isClosed && (
        <div className="p-3" style={{ backgroundColor: C.white, borderTop: `1px solid ${C.ink08}` }}>
          {/* Toggle */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setIsInternal(false)}
              className="font-sans text-[10px] px-2 py-1 tracking-wider uppercase"
              style={{
                backgroundColor: !isInternal ? C.accentBg : 'transparent',
                color: !isInternal ? C.accent : C.ink30,
                borderRadius: '2px',
                border: `1px solid ${!isInternal ? C.accentBorder : 'transparent'}`,
              }}
            >
              Ответ клиенту
            </button>
            <button
              onClick={() => setIsInternal(true)}
              className="font-sans text-[10px] px-2 py-1 tracking-wider uppercase"
              style={{
                backgroundColor: isInternal ? C.gold10 : 'transparent',
                color: isInternal ? C.gold : C.ink30,
                borderRadius: '2px',
                border: `1px solid ${isInternal ? C.gold20 : 'transparent'}`,
              }}
            >
              Внутренняя заметка
            </button>

            {/* Macros */}
            <div className="relative ml-auto">
              <button
                onClick={() => setMacroOpen(!macroOpen)}
                className="font-sans text-[10px] px-2 py-1 flex items-center gap-1"
                style={{ color: C.ink30 }}
              >
                Макрос <ChevronDown size={10} />
              </button>
              {macroOpen && (
                <div
                  className="absolute right-0 bottom-full mb-1 w-56 py-1 z-20 shadow-lg"
                  style={{ backgroundColor: C.white, border: `1px solid ${C.ink10}`, borderRadius: '2px' }}
                >
                  {ticketMacros.map(m => (
                    <button
                      key={m.id}
                      onClick={() => applyMacro(m.template)}
                      className="w-full text-left px-3 py-2 font-sans text-xs transition-colors hover:bg-gray-50"
                      style={{ color: C.ink60 }}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isInternal ? 'Внутренняя заметка...' : 'Ответ клиенту...'}
              rows={2}
              disabled={sending}
              className="flex-1 px-3 py-2 font-sans text-sm outline-none resize-none"
              style={{
                backgroundColor: isInternal ? C.internalBg : C.ink03,
                border: `1px solid ${isInternal ? C.internalBorder : C.ink10}`,
                borderRadius: '2px',
                color: C.ink,
                opacity: sending ? 0.6 : 1,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="self-end px-3 py-2 transition-opacity disabled:opacity-30"
              style={{ backgroundColor: isInternal ? C.gold : C.accent, borderRadius: '2px' }}
            >
              {sending ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={14} style={{ color: '#fff' }} />
              )}
            </button>
          </div>
          <p className="font-sans text-[10px] mt-1" style={{ color: C.ink20 }}>Ctrl+Enter для отправки</p>
        </div>
      )}
    </div>
  )
}

/* ── Right Panel: Context ──────────────────────────────────── */
function ContextPanel({ ticket, statusLog, onBack }) {
  const [historyOpen, setHistoryOpen] = useState(false)
  const sla = ticket ? computeSLA(ticket) : null

  if (!ticket) return null

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: C.white, borderLeft: `1px solid ${C.ink08}` }}>
      {/* Mobile back */}
      {onBack && (
        <button onClick={onBack} className="lg:hidden flex items-center gap-1 px-4 py-2 font-sans text-xs" style={{ color: C.accent }}>
          <ArrowLeft size={14} /> Назад
        </button>
      )}

      {/* Customer */}
      <div className="p-4" style={{ borderBottom: `1px solid ${C.ink05}` }}>
        <p className="font-sans text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: C.ink30 }}>Клиент</p>
        <p className="font-sans text-sm font-medium" style={{ color: C.ink }}>{ticket.name}</p>
        <div className="mt-2 space-y-1">
          <a href={`mailto:${ticket.email}`} className="flex items-center gap-2 font-sans text-xs" style={{ color: C.accent }}>
            <Mail size={12} /> {ticket.email}
          </a>
          {ticket.phone && (
            <a href={`tel:${ticket.phone}`} className="flex items-center gap-2 font-sans text-xs" style={{ color: C.accent }}>
              <Phone size={12} /> {ticket.phone}
            </a>
          )}
        </div>
      </div>

      {/* Product */}
      {ticket.product_id && (
        <div className="p-4" style={{ borderBottom: `1px solid ${C.ink05}` }}>
          <p className="font-sans text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: C.ink30 }}>Товар</p>
          <Link
            to={`/product/${ticket.product_id}`}
            className="flex items-center gap-2 font-sans text-xs"
            style={{ color: C.accent }}
          >
            <ExternalLink size={12} /> {ticket.product_title || 'Открыть товар'}
          </Link>
        </div>
      )}

      {/* SLA */}
      <div className="p-4" style={{ borderBottom: `1px solid ${C.ink05}` }}>
        <p className="font-sans text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: C.ink30 }}>SLA</p>
        <div className="space-y-1.5">
          {sla?.frtHours != null && (
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs" style={{ color: C.ink40 }}>Первый ответ</span>
              <span
                className="font-sans text-xs font-medium px-1.5 py-0.5"
                style={{ backgroundColor: SLA_COLORS[sla.frtLevel].bg, color: SLA_COLORS[sla.frtLevel].color, borderRadius: '1px' }}
              >
                {formatHours(sla.frtHours)}
              </span>
            </div>
          )}
          {sla?.resHours != null && (
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs" style={{ color: C.ink40 }}>Решение</span>
              <span className="font-sans text-xs" style={{ color: C.ink30 }}>{formatHours(sla.resHours)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="p-4" style={{ borderBottom: `1px solid ${C.ink05}` }}>
        <p className="font-sans text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: C.ink30 }}>Детали</p>
        <div className="space-y-1.5 font-sans text-xs" style={{ color: C.ink40 }}>
          <div className="flex justify-between"><span>Создан</span><span>{formatDate(ticket.created_at)}</span></div>
          <div className="flex justify-between"><span>Обновлён</span><span>{formatDate(ticket.updated_at)}</span></div>
          {ticket.priority && <div className="flex justify-between"><span>Приоритет</span><span>{ticket.priority}</span></div>}
          {ticket.assigned_to && <div className="flex justify-between"><span>Назначен</span><span style={{ color: C.accent }}>Вы</span></div>}
        </div>
      </div>

      {/* CSAT */}
      {ticket.csat_rating && (
        <div className="p-4" style={{ borderBottom: `1px solid ${C.ink05}` }}>
          <p className="font-sans text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: C.ink30 }}>Оценка клиента</p>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={14} fill={s <= ticket.csat_rating ? '#B08D57' : 'none'} style={{ color: s <= ticket.csat_rating ? '#B08D57' : C.ink15 }} />
            ))}
          </div>
        </div>
      )}

      {/* Status history */}
      <div className="p-4">
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="flex items-center gap-2 font-sans text-[10px] tracking-[0.15em] uppercase w-full"
          style={{ color: C.ink30 }}
        >
          <History size={12} />
          История ({statusLog.length})
          {historyOpen ? <ChevronDown size={10} className="ml-auto" /> : <ChevronRight size={10} className="ml-auto" />}
        </button>
        {historyOpen && statusLog.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {statusLog.map(l => {
              const from = STATUS_MAP[l.from_status]
              const to = STATUS_MAP[l.to_status]
              return (
                <div key={l.id} className="font-sans text-[10px]" style={{ color: C.ink30 }}>
                  <span style={{ color: from?.color }}>{from?.label}</span>
                  {' → '}
                  <span style={{ color: to?.color }}>{to?.label}</span>
                  <span className="ml-2">{formatDate(l.changed_at)}</span>
                  {l.changed_by === 'system_autoclose' && (
                    <span className="ml-1 px-1 py-0.5" style={{ backgroundColor: C.ink05, borderRadius: '1px' }}>авто</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main Workspace ────────────────────────────────────────── */
export default function AgentWorkspace() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('assigned')
  const [search, setSearch] = useState('')
  const [notes, setNotes] = useState([])
  const [statusLog, setStatusLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [mobileView, setMobileView] = useState('list') // 'list' | 'detail'

  const userId = user?.id

  // Load tickets
  useEffect(() => {
    if (!userId) return
    getAgentInquiries(userId).then(({ data }) => {
      setTickets(data || [])
      setLoading(false)
    })
  }, [userId])

  // Load notes & log when ticket selected
  useEffect(() => {
    if (!selectedId) { setNotes([]); setStatusLog([]); return }
    getInquiryNotes(selectedId).then(({ data }) => setNotes(data || []))
    getStatusLog(selectedId).then(({ data }) => setStatusLog(data || []))
  }, [selectedId])

  const selectedTicket = tickets.find(t => t.id === selectedId) || null

  const handleSelect = async (id) => {
    setSelectedId(id)
    setMobileView('detail')
    // Auto-open new tickets
    const ticket = tickets.find(t => t.id === id)
    if (ticket?.status === 'new') {
      await handleStatusChange(id, 'open')
    }
    // Auto-assign if unassigned
    if (ticket && !ticket.assigned_to && userId) {
      await assignTicket(id, userId)
      setTickets(prev => prev.map(t => t.id === id ? { ...t, assigned_to: userId } : t))
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await updateTicketStatus(id, newStatus)
    if (error) { toast.error(error.message || 'Ошибка'); return }
    setTickets(prev => prev.map(t =>
      t.id === id ? {
        ...t, status: newStatus, updated_at: new Date().toISOString(),
        ...(newStatus === 'solved' ? { resolved_at: new Date().toISOString() } : {}),
        ...(newStatus === 'closed' ? { closed_at: new Date().toISOString() } : {}),
      } : t
    ))
    const label = STATUS_MAP[newStatus]?.label || newStatus
    toast.success(`→ ${label}`)
    // Reload status log
    getStatusLog(id).then(({ data }) => setStatusLog(data || []))
  }

  const handleSendNote = async (ticketId, content, isInternal) => {
    const authorName = user?.email?.split('@')[0] || 'agent'
    const { data, error } = await addInquiryNote(ticketId, content, isInternal, authorName)
    if (error) { toast.error('Ошибка'); return }

    // Record first reply
    if (!isInternal) {
      const ticket = tickets.find(t => t.id === ticketId)
      if (ticket && !ticket.first_reply_at) {
        await recordFirstReply(ticketId)
        setTickets(prev => prev.map(t =>
          t.id === ticketId ? { ...t, first_reply_at: new Date().toISOString() } : t
        ))
      }
    }

    // Refresh notes
    getInquiryNotes(ticketId).then(({ data }) => setNotes(data || []))
    toast.success(isInternal ? 'Заметка добавлена' : 'Ответ отправлен')
  }

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
    <div
      className="flex rounded-sm overflow-hidden"
      style={{
        height: 'calc(100vh - 120px)',
        border: `1px solid ${C.ink08}`,
        backgroundColor: C.white,
      }}
    >
      {/* Left: Ticket list — hidden on mobile when detail is shown */}
      <div className={`w-72 md:w-56 lg:w-72 flex-shrink-0 ${mobileView === 'detail' ? 'hidden lg:flex lg:flex-col' : 'flex flex-col flex-1 lg:flex-none'}`}>
        <TicketListPanel
          tickets={tickets}
          selectedId={selectedId}
          onSelect={handleSelect}
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
          userId={userId}
        />
      </div>

      {/* Center: Conversation — on mobile shows when detail view */}
      <div className={`flex-1 flex flex-col min-w-0 ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}`}>
        {mobileView === 'detail' && (
          <button
            onClick={() => { setMobileView('list'); setSelectedId(null) }}
            className="lg:hidden flex items-center gap-1 px-4 py-2 font-sans text-xs"
            style={{ color: C.accent, borderBottom: `1px solid ${C.ink08}` }}
          >
            <ArrowLeft size={14} /> Назад к списку
          </button>
        )}
        <ConversationPanel
          ticket={selectedTicket}
          notes={notes}
          onSendNote={handleSendNote}
          onStatusChange={handleStatusChange}
          userId={userId}
        />
      </div>

      {/* Right: Context — hidden on mobile */}
      <div className={`w-80 flex-shrink-0 hidden lg:flex lg:flex-col`}>
        <ContextPanel ticket={selectedTicket} statusLog={statusLog} />
      </div>
    </div>
  )
}
