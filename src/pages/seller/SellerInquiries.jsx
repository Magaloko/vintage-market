import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, CheckCircle, Clock, Mail, Phone, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../lib/AuthContext'
import { getShopInquiries, updateInquiryStatus } from '../../lib/api'

const statusMap = {
  new: { label: 'Новая', color: '#B08D57', bg: 'rgba(176, 141, 87, 0.15)' },
  read: { label: 'Прочитано', color: 'rgba(240, 230, 214, 0.4)', bg: 'rgba(240, 230, 214, 0.05)' },
  replied: { label: 'Ответили', color: '#7A8B6F', bg: 'rgba(122, 139, 111, 0.15)' },
}

export default function SellerInquiries() {
  const { shopId } = useAuth()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (!shopId) return
    getShopInquiries(shopId).then(({ data }) => { setInquiries(data || []); setLoading(false) })
  }, [shopId])

  const toggleExpand = async (id) => {
    const inq = inquiries.find(i => i.id === id)
    if (inq?.status === 'new') {
      await updateInquiryStatus(id, 'read')
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'read' } : i))
    }
    setExpandedId(expandedId === id ? null : id)
  }

  const markReplied = async (id) => {
    await updateInquiryStatus(id, 'replied')
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'replied' } : i))
    toast.success('Отмечено')
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  if (loading) return <div className="text-center py-16"><div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" style={{ color: '#B08D57' }} /></div>

  return (
    <div>
      <h1 className="font-display text-2xl italic mb-8" style={{ color: '#F0E6D6' }}>
        Запросы
        {inquiries.filter(i => i.status === 'new').length > 0 && (
          <span className="ml-3 px-2 py-0.5 font-body text-xs" style={{ backgroundColor: 'rgba(176, 141, 87, 0.2)', color: '#B08D57', borderRadius: '2px' }}>
            {inquiries.filter(i => i.status === 'new').length} новых
          </span>
        )}
      </h1>

      {inquiries.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare size={40} className="mx-auto mb-4" style={{ color: 'rgba(240, 230, 214, 0.1)' }} />
          <p className="font-display text-lg italic" style={{ color: 'rgba(240, 230, 214, 0.2)' }}>Нет запросов</p>
        </div>
      ) : (
        <div className="space-y-2">
          {inquiries.map(inq => {
            const st = statusMap[inq.status] || statusMap.new
            return (
              <div key={inq.id} style={{ backgroundColor: inq.status === 'new' ? 'rgba(176, 141, 87, 0.05)' : 'rgba(240, 230, 214, 0.02)', border: '1px solid rgba(240, 230, 214, 0.05)', borderRadius: '2px' }}>
                <button onClick={() => toggleExpand(inq.id)} className="w-full p-4 flex items-center gap-4 text-left">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: st.color }} />
                  <div className="flex-1 min-w-0">
                    <span className="font-body text-sm font-medium" style={{ color: '#F0E6D6' }}>{inq.name}</span>
                    {inq.product_title && <span className="font-body text-[10px] ml-2 px-2 py-0.5" style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)', color: 'rgba(176, 141, 87, 0.6)', borderRadius: '1px' }}>{inq.product_title}</span>}
                    <p className="font-body text-xs truncate mt-1" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>{inq.message}</p>
                  </div>
                  <span className="font-body text-[10px] flex-shrink-0" style={{ color: 'rgba(240, 230, 214, 0.2)' }}>{formatDate(inq.created_at)}</span>
                </button>
                {expandedId === inq.id && (
                  <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid rgba(240, 230, 214, 0.05)' }}>
                    <div className="flex gap-4 mb-3">
                      <a href={`mailto:${inq.email}`} className="flex items-center gap-1 font-body text-xs" style={{ color: 'rgba(176, 141, 87, 0.6)' }}><Mail size={12} />{inq.email}</a>
                      {inq.phone && <a href={`tel:${inq.phone}`} className="flex items-center gap-1 font-body text-xs" style={{ color: 'rgba(176, 141, 87, 0.6)' }}><Phone size={12} />{inq.phone}</a>}
                    </div>
                    <div className="p-3 mb-3" style={{ backgroundColor: 'rgba(240, 230, 214, 0.03)', borderRadius: '2px' }}>
                      <p className="font-body text-sm whitespace-pre-wrap" style={{ color: 'rgba(240, 230, 214, 0.6)' }}>{inq.message}</p>
                    </div>
                    {inq.status !== 'replied' && (
                      <button onClick={() => markReplied(inq.id)} className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs"
                        style={{ backgroundColor: 'rgba(122, 139, 111, 0.15)', color: '#7A8B6F', borderRadius: '2px' }}>
                        <CheckCircle size={12} /> Ответили
                      </button>
                    )}
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
