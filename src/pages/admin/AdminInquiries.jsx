import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Trash2, CheckCircle, Clock, ExternalLink, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { getInquiries, updateInquiryStatus, deleteInquiry } from '../../lib/api'

/* ── Theme tokens ────────────────────────────────────────────── */
const colors = {
  cream: '#F0E6D6',
  gold:  '#B08D57',
}

const alpha = {
  cream03: 'rgba(240, 230, 214, 0.03)',
  cream05: 'rgba(240, 230, 214, 0.05)',
  cream06: 'rgba(240, 230, 214, 0.06)',
  cream10: 'rgba(240, 230, 214, 0.1)',
  cream20: 'rgba(240, 230, 214, 0.2)',
  cream30: 'rgba(240, 230, 214, 0.3)',
  gold10:  'rgba(176, 141, 87, 0.1)',
  gold15:  'rgba(176, 141, 87, 0.15)',
  gold20:  'rgba(176, 141, 87, 0.2)',
  gold60:  'rgba(176, 141, 87, 0.6)',
  red60:   'rgba(181, 115, 106, 0.6)',
}

const STATUS_CONFIG = {
  new:     { label: 'Новая',     color: '#B08D57',                    bg: alpha.gold15 },
  read:    { label: 'Прочитано', color: 'rgba(240, 230, 214, 0.4)',   bg: alpha.cream05 },
  replied: { label: 'Ответили',  color: '#7A8B6F',                    bg: 'rgba(122, 139, 111, 0.15)' },
  closed:  { label: 'Закрыто',   color: alpha.cream20,                bg: alpha.cream03 },
}

const FILTER_TABS = [
  { id: 'all',     label: 'Все' },
  { id: 'new',     label: 'Новые' },
  { id: 'read',    label: 'Прочитанные' },
  { id: 'replied', label: 'С ответом' },
]

/* ── Date formatter ──────────────────────────────────────────── */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/* ── Skeleton loader ─────────────────────────────────────────── */
function InquiriesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="animate-pulse p-4"
          style={{ backgroundColor: alpha.cream03, borderRadius: '2px' }}
        >
          <div className="h-4 w-1/3 rounded" style={{ backgroundColor: alpha.cream06 }} />
          <div className="h-3 w-2/3 rounded mt-3" style={{ backgroundColor: 'rgba(240, 230, 214, 0.04)' }} />
        </div>
      ))}
    </div>
  )
}

/* ── Empty state ─────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="text-center py-16">
      <MessageSquare size={40} className="mx-auto mb-4" style={{ color: alpha.cream10 }} />
      <p className="font-display text-lg italic" style={{ color: alpha.cream20 }}>
        Нет запросов
      </p>
    </div>
  )
}

/* ── Hoverable link ──────────────────────────────────────────── */
function HoverLink({ href, to, children }) {
  const style = { color: alpha.gold60 }
  const handlers = {
    onMouseEnter: (e) => { e.currentTarget.style.color = colors.gold },
    onMouseLeave: (e) => { e.currentTarget.style.color = alpha.gold60 },
  }

  const className = "flex items-center gap-2 font-body text-xs transition-colors"

  if (to) {
    return (
      <Link to={to} target="_blank" className={className} style={style}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} className={className} style={style} {...handlers}>
      {children}
    </a>
  )
}

/* ── Expanded inquiry details ────────────────────────────────── */
function InquiryDetails({ inq, onStatusChange, onDelete }) {
  return (
    <div className="px-4 pb-4 pt-2" style={{ borderTop: `1px solid ${alpha.cream05}` }}>
      {/* Contact info */}
      <div className="flex flex-wrap gap-4 mb-4">
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
            <ExternalLink size={12} /> Товар
          </HoverLink>
        )}
      </div>

      {/* Full message */}
      <div className="p-3 mb-4" style={{ backgroundColor: alpha.cream03, borderRadius: '2px' }}>
        <p
          className="font-body text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: 'rgba(240, 230, 214, 0.6)' }}
        >
          {inq.message}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {inq.status !== 'replied' && (
          <button
            onClick={() => onStatusChange(inq.id, 'replied')}
            className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs transition-all"
            style={{ backgroundColor: 'rgba(122, 139, 111, 0.15)', color: '#7A8B6F', borderRadius: '2px' }}
          >
            <CheckCircle size={12} /> Ответили
          </button>
        )}

        {inq.status !== 'closed' && (
          <button
            onClick={() => onStatusChange(inq.id, 'closed')}
            className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs transition-all"
            style={{ backgroundColor: alpha.cream05, color: alpha.cream30, borderRadius: '2px' }}
          >
            <Clock size={12} /> Закрыть
          </button>
        )}

        <button
          onClick={() => onDelete(inq.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs transition-all ml-auto"
          style={{ color: alpha.red60 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#B5736A' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = alpha.red60 }}
        >
          <Trash2 size={12} /> Удалить
        </button>
      </div>
    </div>
  )
}

/* ── Single inquiry row ──────────────────────────────────────── */
function InquiryRow({ inq, isExpanded, onToggle, onStatusChange, onDelete }) {
  const status = STATUS_CONFIG[inq.status] || STATUS_CONFIG.new

  const rowStyle = {
    backgroundColor: inq.status === 'new' ? 'rgba(176, 141, 87, 0.05)' : 'rgba(240, 230, 214, 0.02)',
    border: `1px solid ${inq.status === 'new' ? alpha.gold15 : alpha.cream05}`,
    borderRadius: '2px',
  }

  return (
    <div className="transition-all duration-300" style={rowStyle}>
      {/* Summary row */}
      <button onClick={() => onToggle(inq.id)} className="w-full p-4 flex items-center gap-4 text-left">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-body text-sm font-medium truncate" style={{ color: colors.cream }}>
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
          <p className="font-body text-xs truncate mt-1" style={{ color: alpha.cream30 }}>
            {inq.message}
          </p>
        </div>

        <span className="font-body text-[10px] flex-shrink-0" style={{ color: alpha.cream20 }}>
          {formatDate(inq.created_at)}
        </span>

        <span
          className="font-body text-[10px] tracking-wider uppercase px-2 py-0.5 flex-shrink-0"
          style={{ backgroundColor: status.bg, color: status.color, borderRadius: '1px' }}
        >
          {status.label}
        </span>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <InquiryDetails inq={inq} onStatusChange={onStatusChange} onDelete={onDelete} />
      )}
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────── */
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

  const filtered = filter === 'all'
    ? inquiries
    : inquiries.filter((i) => i.status === filter)

  const newCount = inquiries.filter((i) => i.status === 'new').length

  const handleStatusChange = async (id, status) => {
    const { error } = await updateInquiryStatus(id, status)
    if (error) {
      toast.error('Ошибка')
      return
    }
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
    toast.success('Статус обновлён')
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить запрос?')) return
    const { error } = await deleteInquiry(id)
    if (error) {
      toast.error('Ошибка')
      return
    }
    setInquiries((prev) => prev.filter((i) => i.id !== id))
    toast.success('Удалено')
  }

  const toggleExpand = async (id) => {
    const inquiry = inquiries.find((i) => i.id === id)
    if (inquiry?.status === 'new') {
      await handleStatusChange(id, 'read')
    }
    setExpandedId(expandedId === id ? null : id)
  }

  /* Build tab labels with counts */
  const tabLabels = FILTER_TABS.map((tab) => {
    if (tab.id === 'all') return { ...tab, label: `Все (${inquiries.length})` }
    if (tab.id === 'new') return { ...tab, label: `Новые (${newCount})` }
    return tab
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl italic" style={{ color: colors.cream }}>
            Запросы
            {newCount > 0 && (
              <span
                className="ml-3 px-2.5 py-0.5 font-body text-xs"
                style={{ backgroundColor: alpha.gold20, color: colors.gold, borderRadius: '2px' }}
              >
                {newCount} новых
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-1 mb-6 p-1"
        style={{ backgroundColor: alpha.cream03, borderRadius: '2px' }}
      >
        {tabLabels.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className="px-4 py-2 font-body text-xs transition-all"
            style={{
              backgroundColor: filter === tab.id ? alpha.gold15 : 'transparent',
              color: filter === tab.id ? colors.gold : alpha.cream30,
              borderRadius: '2px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inquiry list */}
      {loading ? (
        <InquiriesSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {filtered.map((inq) => (
            <InquiryRow
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
