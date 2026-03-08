import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare, Trash2, Mail, Phone, ExternalLink,
  Sparkles, CircleDot, Clock, PauseCircle, CheckCircle2, Lock,
  StickyNote, History, ChevronDown, ChevronRight, Send,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getInquiries, updateTicketStatus, deleteInquiry,
  addInquiryNote, getInquiryNotes, getStatusLog,
  OBZOR_TRANSITIONS,
} from '../../lib/api'

/* ── Theme tokens (light) ────────────────────────────────────── */
const colors = {
  ink:   '#2C2420',
  gold:  '#B08D57',
}

const alpha = {
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
  red60: 'rgba(181, 115, 106, 0.7)',
}

/* ── Obzor status config ─────────────────────────────────────── */
const OBZOR_STATUSES = {
  new:      { label: 'Новый',        icon: Sparkles,     color: '#B08D57',                  bg: alpha.gold15 },
  open:     { label: 'Открыт',       icon: CircleDot,    color: '#5A6B3C',                  bg: 'rgba(122, 139, 111, 0.12)' },
  pending:  { label: 'В ожидании',   icon: Clock,        color: '#C17F3E',                  bg: 'rgba(193, 127, 62, 0.12)' },
  on_hold:  { label: 'На удержании', icon: PauseCircle,  color: '#7A5340',                  bg: 'rgba(122, 83, 64, 0.12)' },
  solved:   { label: 'Решён',        icon: CheckCircle2, color: '#4A7A5C',                  bg: 'rgba(74, 122, 92, 0.12)' },
  closed:   { label: 'Закрыт',       icon: Lock,         color: 'rgba(44, 36, 32, 0.25)',   bg: alpha.ink03 },
  // Legacy compat
  read:     { label: 'Открыт',       icon: CircleDot,    color: '#5A6B3C',                  bg: 'rgba(122, 139, 111, 0.12)' },
  replied:  { label: 'Решён',        icon: CheckCircle2, color: '#4A7A5C',                  bg: 'rgba(74, 122, 92, 0.12)' },
}

const PIPELINE_STEPS = ['new', 'open', 'pending', 'on_hold', 'solved', 'closed']

const ACTION_BUTTONS = {
  new:      [{ target: 'open',    label: 'Взять в работу',    icon: CircleDot,    style: 'primary' }],
  open:     [
    { target: 'pending',  label: 'Ожидание клиента', icon: Clock,        style: 'warning' },
    { target: 'on_hold',  label: 'На удержание',     icon: PauseCircle,  style: 'muted' },
    { target: 'solved',   label: 'Решено',           icon: CheckCircle2, style: 'success' },
  ],
  pending:  [{ target: 'open', label: 'Вернуть в работу', icon: CircleDot, style: 'primary' }],
  on_hold:  [{ target: 'open', label: 'Вернуть в работу', icon: CircleDot, style: 'primary' }],
  solved:   [
    { target: 'open',   label: 'Переоткрыть', icon: CircleDot, style: 'primary' },
    { target: 'closed', label: 'Закрыть',     icon: Lock,      style: 'muted' },
  ],
  closed:   [],
  read:     [
    { target: 'pending',  label: 'Ожидание клиента', icon: Clock,        style: 'warning' },
    { target: 'on_hold',  label: 'На удержание',     icon: PauseCircle,  style: 'muted' },
    { target: 'solved',   label: 'Решено',           icon: CheckCircle2, style: 'success' },
  ],
  replied:  [
    { target: 'open',   label: 'Переоткрыть', icon: CircleDot, style: 'primary' },
    { target: 'closed', label: 'Закрыть',     icon: Lock,      style: 'muted' },
  ],
}

const BTN_STYLES = {
  primary: { bg: alpha.gold15, color: colors.gold },
  success: { bg: 'rgba(74, 122, 92, 0.12)', color: '#4A7A5C' },
  warning: { bg: 'rgba(193, 127, 62, 0.12)', color: '#C17F3E' },
  muted:   { bg: alpha.ink05, color: alpha.ink30 },
}

const FILTER_TABS = [
  { id: 'all',      label: 'Все' },
  { id: 'new',      label: 'Новые' },
  { id: 'open',     label: 'Открытые' },
  { id: 'pending',  label: 'Ожидание' },
  { id: 'on_hold',  label: 'Удержание' },
  { id: 'solved',   label: 'Решённые' },
  { id: 'closed',   label: 'Закрытые' },
]

/* ── Helpers ──────────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

/* Map legacy status for filtering */
function normalizeStatus(status) {
  if (status === 'read') return 'open'
  if (status === 'replied') return 'solved'
  return status
}

/* ── Skeleton ─────────────────────────────────────────────────── */
function TicketsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="animate-pulse p-4" style={{ backgroundColor: alpha.ink03, borderRadius: '2px' }}>
          <div className="h-4 w-1/3 rounded" style={{ backgroundColor: alpha.ink08 }} />
          <div className="h-3 w-2/3 rounded mt-3" style={{ backgroundColor: alpha.ink05 }} />
        </div>
      ))}
    </div>
  )
}

/* ── Empty state ──────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="text-center py-16">
      <MessageSquare size={40} className="mx-auto mb-4" style={{ color: alpha.ink10 }} />
      <p className="font-display text-lg italic" style={{ color: alpha.ink20 }}>
        Нет тикетов
      </p>
    </div>
  )
}

/* ── Status pipeline ──────────────────────────────────────────── */
function StatusPipeline({ currentStatus }) {
  const normalized = normalizeStatus(currentStatus)
  const currentIdx = PIPELINE_STEPS.indexOf(normalized)

  return (
    <div className="flex items-center gap-1 py-3">
      {PIPELINE_STEPS.map((step, i) => {
        const cfg = OBZOR_STATUSES[step]
        const isActive = step === normalized
        const isPast = i < currentIdx
        const Icon = cfg.icon

        return (
          <div key={step} className="flex items-center">
            {i > 0 && (
              <div
                className="w-6 h-px mx-0.5"
                style={{ backgroundColor: isPast || isActive ? cfg.color : alpha.ink10 }}
              />
            )}
            <div
              className="flex items-center gap-1 px-2 py-1 transition-all"
              style={{
                backgroundColor: isActive ? cfg.bg : 'transparent',
                borderRadius: '2px',
                opacity: isPast ? 0.4 : isActive ? 1 : 0.25,
              }}
              title={cfg.label}
            >
              <Icon size={12} style={{ color: isActive || isPast ? cfg.color : alpha.ink20 }} />
              {isActive && (
                <span className="font-body text-[9px] tracking-wider uppercase" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Ticket actions ───────────────────────────────────────────── */
function TicketActions({ status, onTransition }) {
  const actions = ACTION_BUTTONS[status] || []
  if (actions.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map(({ target, label, icon: Icon, style }) => {
        const s = BTN_STYLES[style]
        return (
          <button
            key={target}
            onClick={() => onTransition(target)}
            className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs transition-all"
            style={{ backgroundColor: s.bg, color: s.color, borderRadius: '2px' }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            <Icon size={12} /> {label}
          </button>
        )
      })}
    </div>
  )
}

/* ── Notes section ────────────────────────────────────────────── */
function NotesSection({ inquiryId }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    getInquiryNotes(inquiryId).then(({ data }) => {
      setNotes(data || [])
      setLoading(false)
    })
  }, [inquiryId, open])

  const handleAdd = async () => {
    if (!text.trim()) return
    setSaving(true)
    const { data, error } = await addInquiryNote(inquiryId, text.trim())
    setSaving(false)
    if (error) { toast.error('Ошибка'); return }
    setNotes(prev => [...prev, data])
    setText('')
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 font-body text-xs transition-colors"
        style={{ color: alpha.ink30 }}
        onMouseEnter={(e) => { e.currentTarget.style.color = colors.gold }}
        onMouseLeave={(e) => { e.currentTarget.style.color = alpha.ink30 }}
      >
        <StickyNote size={12} />
        Заметки{notes.length > 0 ? ` (${notes.length})` : ''}
        {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {loading ? (
            <div className="h-8 animate-pulse" style={{ backgroundColor: alpha.ink03, borderRadius: '2px' }} />
          ) : (
            <>
              {notes.map((note) => (
                <div key={note.id} className="p-2.5" style={{ backgroundColor: 'rgba(247, 242, 235, 0.6)', borderRadius: '2px' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-body text-[10px] font-medium" style={{ color: alpha.ink40 }}>
                      {note.author}
                    </span>
                    <span className="font-body text-[9px]" style={{ color: alpha.ink20 }}>
                      {formatShortDate(note.created_at)}
                    </span>
                    {note.is_internal && (
                      <span className="font-body text-[8px] tracking-wider uppercase px-1.5 py-0.5"
                        style={{ backgroundColor: alpha.ink05, color: alpha.ink20, borderRadius: '1px' }}>
                        внутренняя
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs leading-relaxed whitespace-pre-wrap" style={{ color: alpha.ink60 }}>
                    {note.content}
                  </p>
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Добавить заметку..."
                  className="flex-1 font-body text-xs px-3 py-2 outline-none"
                  style={{
                    backgroundColor: 'rgba(247, 242, 235, 0.8)',
                    border: `1px solid ${alpha.gold12}`,
                    borderRadius: '2px',
                    color: colors.ink,
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
                />
                <button
                  onClick={handleAdd}
                  disabled={saving || !text.trim()}
                  className="flex items-center gap-1 px-3 py-2 font-body text-xs transition-all"
                  style={{
                    backgroundColor: alpha.gold15,
                    color: colors.gold,
                    borderRadius: '2px',
                    opacity: saving || !text.trim() ? 0.4 : 1,
                  }}
                >
                  <Send size={10} /> Добавить
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Status history ───────────────────────────────────────────── */
function StatusHistory({ inquiryId }) {
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    getStatusLog(inquiryId).then(({ data }) => {
      setLog(data || [])
      setLoading(false)
    })
  }, [inquiryId, open])

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 font-body text-xs transition-colors"
        style={{ color: alpha.ink20 }}
        onMouseEnter={(e) => { e.currentTarget.style.color = colors.gold }}
        onMouseLeave={(e) => { e.currentTarget.style.color = alpha.ink20 }}
      >
        <History size={12} />
        История{log.length > 0 ? ` (${log.length})` : ''}
        {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
      </button>

      {open && (
        <div className="mt-2 space-y-1">
          {loading ? (
            <div className="h-6 animate-pulse" style={{ backgroundColor: alpha.ink03, borderRadius: '2px' }} />
          ) : log.length === 0 ? (
            <p className="font-body text-[10px]" style={{ color: alpha.ink20 }}>Нет записей</p>
          ) : (
            log.map((entry) => {
              const from = OBZOR_STATUSES[entry.from_status]
              const to = OBZOR_STATUSES[entry.to_status]
              return (
                <div key={entry.id} className="flex items-center gap-2 py-1">
                  <span className="font-body text-[9px]" style={{ color: alpha.ink20 }}>
                    {formatShortDate(entry.changed_at)}
                  </span>
                  {from && (
                    <span className="font-body text-[9px] tracking-wider uppercase" style={{ color: from.color }}>
                      {from.label}
                    </span>
                  )}
                  <span className="font-body text-[9px]" style={{ color: alpha.ink15 }}>→</span>
                  {to && (
                    <span className="font-body text-[9px] tracking-wider uppercase" style={{ color: to.color }}>
                      {to.label}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

/* ── Hoverable link ───────────────────────────────────────────── */
function HoverLink({ href, to, children }) {
  const style = { color: alpha.gold60 }
  const handlers = {
    onMouseEnter: (e) => { e.currentTarget.style.color = colors.gold },
    onMouseLeave: (e) => { e.currentTarget.style.color = alpha.gold60 },
  }
  const className = "flex items-center gap-2 font-body text-xs transition-colors"

  if (to) {
    return <Link to={to} target="_blank" className={className} style={style}>{children}</Link>
  }
  return <a href={href} className={className} style={style} {...handlers}>{children}</a>
}

/* ── Ticket detail (expanded) ─────────────────────────────────── */
function TicketDetail({ inq, onStatusChange, onDelete }) {
  const isClosed = inq.status === 'closed'

  return (
    <div className="px-4 pb-4 pt-2" style={{ borderTop: `1px solid ${alpha.ink05}` }}>
      {/* Contact info */}
      <div className="flex flex-wrap gap-4 mb-3">
        <HoverLink href={`mailto:${inq.email}`}>
          <Mail size={12} /> {inq.email}
        </HoverLink>
        {inq.phone && (
          <HoverLink href={`tel:${inq.phone}`}>
            <Phone size={12} /> {inq.phone}
          </HoverLink>
        )}
        {inq.product_id && (
          <HoverLink to={`/product/${inq.product_id}`}>
            <ExternalLink size={12} /> {inq.product_title || 'Товар'}
          </HoverLink>
        )}
      </div>

      {/* Status pipeline */}
      <StatusPipeline currentStatus={inq.status} />

      {/* Full message */}
      <div className="p-3 mb-4" style={{ backgroundColor: 'rgba(247, 242, 235, 0.8)', borderRadius: '2px' }}>
        <p className="font-body text-sm leading-relaxed whitespace-pre-wrap" style={{ color: alpha.ink60 }}>
          {inq.message}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <TicketActions status={inq.status} onTransition={(target) => onStatusChange(inq.id, target)} />

        {!isClosed && (
          <button
            onClick={() => onDelete(inq.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs transition-all ml-auto"
            style={{ color: alpha.red60 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#B5736A' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = alpha.red60 }}
          >
            <Trash2 size={12} /> Удалить
          </button>
        )}
      </div>

      {/* Notes + History */}
      <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${alpha.ink05}` }}>
        <NotesSection inquiryId={inq.id} />
        <StatusHistory inquiryId={inq.id} />
      </div>
    </div>
  )
}

/* ── Single ticket row ────────────────────────────────────────── */
function TicketRow({ inq, isExpanded, onToggle, onStatusChange, onDelete }) {
  const status = OBZOR_STATUSES[inq.status] || OBZOR_STATUSES.new
  const StatusIcon = status.icon

  const isNew = inq.status === 'new'
  const rowStyle = {
    backgroundColor: isNew ? 'rgba(176, 141, 87, 0.05)' : 'rgba(255, 255, 255, 0.7)',
    border: `1px solid ${isNew ? alpha.gold15 : alpha.gold12}`,
    borderRadius: '2px',
  }

  return (
    <div className="transition-all duration-300" style={rowStyle}>
      <button onClick={() => onToggle(inq.id)} className="w-full p-4 flex items-center gap-4 text-left">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-body text-sm font-medium truncate" style={{ color: colors.ink }}>
              {inq.name}
            </span>
            {inq.product_title && (
              <span
                className="font-body text-[10px] px-2 py-0.5 truncate max-w-[200px]"
                style={{ backgroundColor: alpha.gold10, color: alpha.gold60, borderRadius: '1px' }}
              >
                {inq.product_title}
              </span>
            )}
          </div>
          <p className="font-body text-xs truncate mt-1" style={{ color: alpha.ink30 }}>
            {inq.message}
          </p>
        </div>

        <span className="font-body text-[10px] flex-shrink-0" style={{ color: alpha.ink20 }}>
          {formatDate(inq.created_at)}
        </span>

        <span
          className="font-body text-[10px] tracking-wider uppercase px-2 py-0.5 flex-shrink-0 flex items-center gap-1"
          style={{ backgroundColor: status.bg, color: status.color, borderRadius: '1px' }}
        >
          <StatusIcon size={10} />
          {status.label}
        </span>
      </button>

      {isExpanded && (
        <TicketDetail inq={inq} onStatusChange={onStatusChange} onDelete={onDelete} />
      )}
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────── */
export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await getInquiries()
    setInquiries(data || [])
    setLoading(false)
  }

  /* Filter with legacy normalization */
  const filtered = filter === 'all'
    ? inquiries
    : inquiries.filter((i) => normalizeStatus(i.status) === filter)

  /* Count active (not solved/closed) */
  const activeCount = inquiries.filter(i => !['solved', 'closed'].includes(normalizeStatus(i.status))).length
  const newCount = inquiries.filter(i => i.status === 'new').length

  /* Status change with transition validation */
  const handleStatusChange = async (id, newStatus) => {
    const { error } = await updateTicketStatus(id, newStatus)
    if (error) {
      toast.error(error.message || 'Ошибка')
      return
    }
    setInquiries((prev) => prev.map((i) =>
      i.id === id ? { ...i, status: newStatus, updated_at: new Date().toISOString() } : i
    ))
    const label = OBZOR_STATUSES[newStatus]?.label || newStatus
    toast.success(`→ ${label}`)
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить тикет?')) return
    const { error } = await deleteInquiry(id)
    if (error) { toast.error('Ошибка'); return }
    setInquiries((prev) => prev.filter((i) => i.id !== id))
    setExpandedId(null)
    toast.success('Удалено')
  }

  /* Auto-open new tickets when expanded */
  const toggleExpand = async (id) => {
    const inquiry = inquiries.find((i) => i.id === id)
    if (inquiry?.status === 'new') {
      await handleStatusChange(id, 'open')
    }
    setExpandedId(expandedId === id ? null : id)
  }

  /* Tab counts */
  const countByStatus = (statusId) => {
    if (statusId === 'all') return inquiries.length
    return inquiries.filter(i => normalizeStatus(i.status) === statusId).length
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl italic" style={{ color: colors.ink }}>
            Obzor
            {activeCount > 0 && (
              <span
                className="ml-3 px-2.5 py-0.5 font-body text-xs"
                style={{ backgroundColor: alpha.gold20, color: colors.gold, borderRadius: '2px' }}
              >
                {activeCount} активных
              </span>
            )}
          </h1>
          <p className="font-body text-xs mt-1" style={{ color: alpha.ink30 }}>
            Система управления запросами
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div
        className="flex flex-wrap gap-1 mb-6 p-1"
        style={{ backgroundColor: alpha.ink03, borderRadius: '2px' }}
      >
        {FILTER_TABS.map((tab) => {
          const count = countByStatus(tab.id)
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className="px-3 py-2 font-body text-xs transition-all"
              style={{
                backgroundColor: filter === tab.id ? alpha.gold15 : 'transparent',
                color: filter === tab.id ? colors.gold : alpha.ink30,
                borderRadius: '2px',
              }}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1 font-body text-[9px]" style={{ opacity: 0.6 }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Ticket list */}
      {loading ? (
        <TicketsSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {filtered.map((inq) => (
            <TicketRow
              key={inq.id}
              inq={inq}
              isExpanded={expandedId === inq.id}
              onToggle={toggleExpand}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
