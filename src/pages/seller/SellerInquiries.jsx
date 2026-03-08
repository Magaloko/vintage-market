import { useState, useEffect } from 'react'
import { MessageSquare, CheckCircle, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../lib/AuthContext'
import { getShopInquiries, updateTicketStatus } from '../../lib/api'

// -- Constants ----------------------------------------------------------------

const GOLD = '#B08D57'
const TEXT = '#F0E6D6'
const TEXT_MUTED = 'rgba(240, 230, 214, 0.3)'
const TEXT_GHOST = 'rgba(240, 230, 214, 0.2)'
const TEXT_FAINT = 'rgba(240, 230, 214, 0.1)'
const GREEN = '#7A8B6F'

const STATUS_MAP = {
  new:      { label: 'Новый',       color: GOLD,    bg: 'rgba(176, 141, 87, 0.15)' },
  open:     { label: 'В работе',    color: GREEN,   bg: 'rgba(122, 139, 111, 0.15)' },
  pending:  { label: 'Ожидание',    color: '#C17F3E', bg: 'rgba(193, 127, 62, 0.12)' },
  on_hold:  { label: 'Удержание',   color: 'rgba(240, 230, 214, 0.3)', bg: 'rgba(240, 230, 214, 0.05)' },
  solved:   { label: 'Решено',      color: '#4A7A5C', bg: 'rgba(74, 122, 92, 0.12)' },
  closed:   { label: 'Закрыто',     color: 'rgba(240, 230, 214, 0.2)', bg: 'rgba(240, 230, 214, 0.03)' },
  // Legacy
  read:     { label: 'В работе',    color: GREEN,   bg: 'rgba(122, 139, 111, 0.15)' },
  replied:  { label: 'Решено',      color: '#4A7A5C', bg: 'rgba(74, 122, 92, 0.12)' },
}

// -- Helpers ------------------------------------------------------------------

function Spinner() {
  return (
    <div className="text-center py-16">
      <div
        className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"
        style={{ color: GOLD }}
      />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <MessageSquare size={40} className="mx-auto mb-4" style={{ color: TEXT_FAINT }} />
      <p className="font-display text-lg italic" style={{ color: TEXT_GHOST }}>
        Нет запросов
      </p>
    </div>
  )
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function InquiryRow({ inquiry, isExpanded, onToggle, onMarkReplied }) {
  const status = STATUS_MAP[inquiry.status] || STATUS_MAP.new

  return (
    <div
      style={{
        backgroundColor: inquiry.status === 'new' ? 'rgba(176, 141, 87, 0.05)' : 'rgba(240, 230, 214, 0.02)',
        border: '1px solid rgba(240, 230, 214, 0.05)',
        borderRadius: '2px',
      }}
    >
      {/* Header Row */}
      <button onClick={onToggle} className="w-full p-4 flex items-center gap-4 text-left">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: status.color }}
        />
        <div className="flex-1 min-w-0">
          <span className="font-body text-sm font-medium" style={{ color: TEXT }}>
            {inquiry.name}
          </span>
          {inquiry.product_title && (
            <span
              className="font-body text-[10px] ml-2 px-2 py-0.5"
              style={{
                backgroundColor: 'rgba(176, 141, 87, 0.1)',
                color: 'rgba(176, 141, 87, 0.6)',
                borderRadius: '1px',
              }}
            >
              {inquiry.product_title}
            </span>
          )}
          <p className="font-body text-xs truncate mt-1" style={{ color: TEXT_MUTED }}>
            {inquiry.message}
          </p>
        </div>
        <span className="font-body text-[10px] flex-shrink-0" style={{ color: TEXT_GHOST }}>
          {formatDate(inquiry.created_at)}
        </span>
      </button>

      {/* Expanded Detail */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid rgba(240, 230, 214, 0.05)' }}>
          <div className="flex gap-4 mb-3">
            <a
              href={`mailto:${inquiry.email}`}
              className="flex items-center gap-1 font-body text-xs"
              style={{ color: 'rgba(176, 141, 87, 0.6)' }}
            >
              <Mail size={12} />
              {inquiry.email}
            </a>
            {inquiry.phone && (
              <a
                href={`tel:${inquiry.phone}`}
                className="flex items-center gap-1 font-body text-xs"
                style={{ color: 'rgba(176, 141, 87, 0.6)' }}
              >
                <Phone size={12} />
                {inquiry.phone}
              </a>
            )}
          </div>

          <div
            className="p-3 mb-3"
            style={{ backgroundColor: 'rgba(240, 230, 214, 0.03)', borderRadius: '2px' }}
          >
            <p className="font-body text-sm whitespace-pre-wrap" style={{ color: 'rgba(240, 230, 214, 0.6)' }}>
              {inquiry.message}
            </p>
          </div>

          {!['solved', 'closed', 'replied'].includes(inquiry.status) && (
            <button
              onClick={onMarkReplied}
              className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs"
              style={{ backgroundColor: 'rgba(122, 139, 111, 0.15)', color: GREEN, borderRadius: '2px' }}
            >
              <CheckCircle size={12} /> Ответили
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// -- Component ----------------------------------------------------------------

export default function SellerInquiries() {
  const { shopId } = useAuth()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (!shopId) return
    getShopInquiries(shopId).then(({ data }) => {
      setInquiries(data || [])
      setLoading(false)
    })
  }, [shopId])

  const toggleExpand = async (id) => {
    const inquiry = inquiries.find((i) => i.id === id)
    if (inquiry?.status === 'new') {
      await updateTicketStatus(id, 'open')
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'open' } : i)))
    }
    setExpandedId(expandedId === id ? null : id)
  }

  const markReplied = async (id) => {
    await updateTicketStatus(id, 'solved')
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'solved' } : i)))
    toast.success('Отмечено')
  }

  if (loading) return <Spinner />

  const newCount = inquiries.filter((i) => i.status === 'new').length

  return (
    <div>
      {/* Header */}
      <h1 className="font-display text-2xl italic mb-8" style={{ color: TEXT }}>
        Запросы
        {newCount > 0 && (
          <span
            className="ml-3 px-2 py-0.5 font-body text-xs"
            style={{ backgroundColor: 'rgba(176, 141, 87, 0.2)', color: GOLD, borderRadius: '2px' }}
          >
            {newCount} новых
          </span>
        )}
      </h1>

      {/* Inquiry List */}
      {inquiries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {inquiries.map((inquiry) => (
            <InquiryRow
              key={inquiry.id}
              inquiry={inquiry}
              isExpanded={expandedId === inquiry.id}
              onToggle={() => toggleExpand(inquiry.id)}
              onMarkReplied={() => markReplied(inquiry.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
