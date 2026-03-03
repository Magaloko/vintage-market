import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Trash2, CheckCircle, Clock, Eye, ExternalLink, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { getInquiries, updateInquiryStatus, deleteInquiry } from '../../lib/api'

const statusLabels = {
  new: { label: 'Новая', color: '#B08D57', bg: 'rgba(176, 141, 87, 0.15)' },
  read: { label: 'Прочитано', color: 'rgba(240, 230, 214, 0.4)', bg: 'rgba(240, 230, 214, 0.05)' },
  replied: { label: 'Ответили', color: '#7A8B6F', bg: 'rgba(122, 139, 111, 0.15)' },
  closed: { label: 'Закрыто', color: 'rgba(240, 230, 214, 0.2)', bg: 'rgba(240, 230, 214, 0.03)' },
}

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
    : inquiries.filter(i => i.status === filter)

  const handleStatusChange = async (id, status) => {
    const { error } = await updateInquiryStatus(id, status)
    if (error) { toast.error('Ошибка'); return }
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i))
    toast.success('Статус обновлён')
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить запрос?')) return
    const { error } = await deleteInquiry(id)
    if (error) { toast.error('Ошибка'); return }
    setInquiries(prev => prev.filter(i => i.id !== id))
    toast.success('Удалено')
  }

  const toggleExpand = async (id) => {
    const inquiry = inquiries.find(i => i.id === id)
    if (inquiry?.status === 'new') {
      await handleStatusChange(id, 'read')
    }
    setExpandedId(expandedId === id ? null : id)
  }

  const newCount = inquiries.filter(i => i.status === 'new').length

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl italic" style={{ color: '#F0E6D6' }}>
            Запросы
            {newCount > 0 && (
              <span className="ml-3 px-2.5 py-0.5 font-body text-xs" style={{ backgroundColor: 'rgba(176, 141, 87, 0.2)', color: '#B08D57', borderRadius: '2px' }}>
                {newCount} новых
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 p-1" style={{ backgroundColor: 'rgba(240, 230, 214, 0.03)', borderRadius: '2px' }}>
        {[
          { id: 'all', label: `Все (${inquiries.length})` },
          { id: 'new', label: `Новые (${inquiries.filter(i => i.status === 'new').length})` },
          { id: 'read', label: 'Прочитанные' },
          { id: 'replied', label: 'С ответом' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setFilter(tab.id)}
            className="px-4 py-2 font-body text-xs transition-all"
            style={{
              backgroundColor: filter === tab.id ? 'rgba(176, 141, 87, 0.15)' : 'transparent',
              color: filter === tab.id ? '#B08D57' : 'rgba(240, 230, 214, 0.3)',
              borderRadius: '2px',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inquiry List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse p-4" style={{ backgroundColor: 'rgba(240, 230, 214, 0.03)', borderRadius: '2px' }}>
              <div className="h-4 w-1/3 rounded" style={{ backgroundColor: 'rgba(240, 230, 214, 0.06)' }} />
              <div className="h-3 w-2/3 rounded mt-3" style={{ backgroundColor: 'rgba(240, 230, 214, 0.04)' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare size={40} className="mx-auto mb-4" style={{ color: 'rgba(240, 230, 214, 0.1)' }} />
          <p className="font-display text-lg italic" style={{ color: 'rgba(240, 230, 214, 0.2)' }}>
            Нет запросов
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(inq => {
            const status = statusLabels[inq.status] || statusLabels.new
            const isExpanded = expandedId === inq.id

            return (
              <div key={inq.id} className="transition-all duration-300"
                style={{
                  backgroundColor: inq.status === 'new' ? 'rgba(176, 141, 87, 0.05)' : 'rgba(240, 230, 214, 0.02)',
                  border: `1px solid ${inq.status === 'new' ? 'rgba(176, 141, 87, 0.15)' : 'rgba(240, 230, 214, 0.05)'}`,
                  borderRadius: '2px',
                }}>
                {/* Summary Row */}
                <button onClick={() => toggleExpand(inq.id)}
                  className="w-full p-4 flex items-center gap-4 text-left">
                  {/* Status dot */}
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: status.color }} />

                  {/* Name + preview */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-body text-sm font-medium truncate" style={{ color: '#F0E6D6' }}>
                        {inq.name}
                      </span>
                      {inq.product_title && (
                        <span className="font-body text-[10px] px-2 py-0.5 truncate max-w-[200px]"
                          style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)', color: 'rgba(176, 141, 87, 0.6)', borderRadius: '1px' }}>
                          {inq.product_title}
                        </span>
                      )}
                    </div>
                    <p className="font-body text-xs truncate mt-1" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>
                      {inq.message}
                    </p>
                  </div>

                  {/* Date */}
                  <span className="font-body text-[10px] flex-shrink-0" style={{ color: 'rgba(240, 230, 214, 0.2)' }}>
                    {formatDate(inq.created_at)}
                  </span>

                  {/* Status badge */}
                  <span className="font-body text-[10px] tracking-wider uppercase px-2 py-0.5 flex-shrink-0"
                    style={{ backgroundColor: status.bg, color: status.color, borderRadius: '1px' }}>
                    {status.label}
                  </span>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid rgba(240, 230, 214, 0.05)' }}>
                    {/* Contact Details */}
                    <div className="flex flex-wrap gap-4 mb-4">
                      <a href={`mailto:${inq.email}`}
                        className="flex items-center gap-2 font-body text-xs transition-colors"
                        style={{ color: 'rgba(176, 141, 87, 0.6)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#B08D57'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(176, 141, 87, 0.6)'}>
                        <Mail size={12} /> {inq.email}
                      </a>
                      {inq.phone && (
                        <a href={`tel:${inq.phone}`}
                          className="flex items-center gap-2 font-body text-xs transition-colors"
                          style={{ color: 'rgba(176, 141, 87, 0.6)' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#B08D57'}
                          onMouseLeave={e => e.currentTarget.style.color = 'rgba(176, 141, 87, 0.6)'}>
                          <Phone size={12} /> {inq.phone}
                        </a>
                      )}
                      {inq.product_id && (
                        <Link to={`/product/${inq.product_id}`} target="_blank"
                          className="flex items-center gap-2 font-body text-xs transition-colors"
                          style={{ color: 'rgba(176, 141, 87, 0.6)' }}>
                          <ExternalLink size={12} /> Товар
                        </Link>
                      )}
                    </div>

                    {/* Full Message */}
                    <div className="p-3 mb-4" style={{ backgroundColor: 'rgba(240, 230, 214, 0.03)', borderRadius: '2px' }}>
                      <p className="font-body text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(240, 230, 214, 0.6)' }}>
                        {inq.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {inq.status !== 'replied' && (
                        <button onClick={() => handleStatusChange(inq.id, 'replied')}
                          className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs transition-all"
                          style={{ backgroundColor: 'rgba(122, 139, 111, 0.15)', color: '#7A8B6F', borderRadius: '2px' }}>
                          <CheckCircle size={12} /> Ответили
                        </button>
                      )}
                      {inq.status !== 'closed' && (
                        <button onClick={() => handleStatusChange(inq.id, 'closed')}
                          className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs transition-all"
                          style={{ backgroundColor: 'rgba(240, 230, 214, 0.05)', color: 'rgba(240, 230, 214, 0.3)', borderRadius: '2px' }}>
                          <Clock size={12} /> Закрыть
                        </button>
                      )}
                      <button onClick={() => handleDelete(inq.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs transition-all ml-auto"
                        style={{ color: 'rgba(181, 115, 106, 0.6)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#B5736A'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(181, 115, 106, 0.6)'}>
                        <Trash2 size={12} /> Удалить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
