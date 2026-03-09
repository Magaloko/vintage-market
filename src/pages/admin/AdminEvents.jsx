import { useState, useMemo } from 'react'
import {
  CalendarDays, Plus, Trash2, Edit, X, MessageSquare, Check, HelpCircle, XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useLocalStorage from '../../lib/useLocalStorage'

const GOLD = '#B08D57'
const INK = '#2C2420'
const MUTED = 'rgba(44, 36, 32, 0.5)'
const FAINT = 'rgba(44, 36, 32, 0.15)'
const panelStyle = { backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid rgba(176,141,87,0.12)', borderRadius: '2px' }

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''

const CATEGORIES = [
  { key: 'party', label: 'Вечеринка', emoji: '🎉', color: '#8b5cf6' },
  { key: 'meeting', label: 'Встреча', emoji: '👥', color: '#3b82f6' },
  { key: 'family', label: 'Семья', emoji: '👨‍👩‍👧‍👦', color: '#ec4899' },
  { key: 'hobby', label: 'Хобби', emoji: '🎮', color: '#06b6d4' },
  { key: 'sport', label: 'Спорт', emoji: '⚽', color: '#f59e0b' },
]

const RSVP = [
  { key: 'yes', label: 'Да', icon: Check, color: '#7A8B6F' },
  { key: 'maybe', label: 'Возможно', icon: HelpCircle, color: '#f59e0b' },
  { key: 'no', label: 'Нет', icon: XCircle, color: '#B5736A' },
]

/* ── Event Modal ──────────────────────────────────────────── */

function EventModal({ event, onSave, onClose }) {
  const isEdit = !!event
  const [form, setForm] = useState({
    id: event?.id || uid(),
    title: event?.title || '',
    category: event?.category || 'meeting',
    datetime: event?.datetime || new Date().toISOString().slice(0, 16),
    location: event?.location || '',
    description: event?.description || '',
    members: event?.members || [],
    createdAt: event?.createdAt || new Date().toISOString(),
  })
  const [memberName, setMemberName] = useState('')

  const addMember = () => {
    if (!memberName.trim()) return
    setForm((f) => ({
      ...f,
      members: [...f.members, { id: uid(), name: memberName.trim(), status: 'pending' }],
    }))
    setMemberName('')
  }

  const removeMember = (id) => setForm((f) => ({ ...f, members: f.members.filter((m) => m.id !== id) }))

  const handleSave = () => {
    if (!form.title.trim()) return toast.error('Введите название')
    onSave({ ...form, updatedAt: new Date().toISOString() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md my-8 p-6" style={{ ...panelStyle, backgroundColor: '#FFF' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl italic" style={{ color: INK }}>{isEdit ? 'Редактировать' : 'Новое событие'}</h2>
          <button onClick={onClose}><X size={18} style={{ color: FAINT }} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>Название *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="День рождения, Meeting..." className="gdt-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>Категория</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="gdt-input">
                {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>Дата и время</label>
              <input type="datetime-local" value={form.datetime} onChange={(e) => setForm({ ...form, datetime: e.target.value })} className="gdt-input text-sm" />
            </div>
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>Место</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Адрес, Zoom-Link..." className="gdt-input" />
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>Описание</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="gdt-input resize-none" />
          </div>

          {/* Members */}
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>Участники</label>
            <div className="flex gap-2 mb-2">
              <input
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                placeholder="Имя участника"
                className="gdt-input flex-1 text-sm"
              />
              <button onClick={addMember} className="px-3 py-1 font-body text-xs" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>+</button>
            </div>
            {form.members.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.members.map((m) => (
                  <span key={m.id} className="inline-flex items-center gap-1 px-2 py-0.5 font-body text-[10px] rounded-sm" style={{ backgroundColor: 'rgba(176,141,87,0.08)', color: MUTED }}>
                    {m.name}
                    <button onClick={() => removeMember(m.id)}><X size={8} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} className="flex-1 py-2.5 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>
            Сохранить
          </button>
          <button onClick={onClose} className="px-6 py-2.5 font-body text-xs tracking-wider uppercase" style={{ border: '1px solid rgba(44,36,32,0.15)', color: MUTED, borderRadius: '2px' }}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Event Detail ─────────────────────────────────────────── */

function EventDetail({ event, onClose, onEdit, onRsvp, comments, onComment }) {
  const [commentText, setCommentText] = useState('')
  const cat = CATEGORIES.find((c) => c.key === event.category)

  const addComment = () => {
    if (!commentText.trim()) return
    onComment({ id: uid(), text: commentText.trim(), author: 'Admin', createdAt: new Date().toISOString() })
    setCommentText('')
  }

  const rsvpCounts = RSVP.map((r) => ({
    ...r,
    count: event.members.filter((m) => m.status === r.key).length,
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md my-8 p-6" style={{ ...panelStyle, backgroundColor: '#FFF' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{cat?.emoji}</span>
              <h2 className="font-display text-xl italic" style={{ color: INK }}>{event.title}</h2>
            </div>
            <p className="font-body text-xs" style={{ color: MUTED }}>
              {fmtDate(event.datetime)} {fmtTime(event.datetime)} · {event.location || 'Место не указано'}
            </p>
          </div>
          <button onClick={onClose}><X size={18} style={{ color: FAINT }} /></button>
        </div>

        {event.description && (
          <p className="font-body text-sm mb-4 p-3" style={{ backgroundColor: 'rgba(176,141,87,0.05)', color: INK, borderRadius: '2px' }}>
            {event.description}
          </p>
        )}

        {/* RSVP */}
        {event.members.length > 0 && (
          <div className="mb-4">
            <p className="font-body text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(44,36,32,0.4)' }}>RSVP ({event.members.length} участников)</p>
            <div className="flex gap-2 mb-2">
              {rsvpCounts.map((r) => (
                <span key={r.key} className="flex items-center gap-1 px-2 py-0.5 font-body text-[10px] rounded-sm" style={{ backgroundColor: `${r.color}15`, color: r.color }}>
                  <r.icon size={10} /> {r.label}: {r.count}
                </span>
              ))}
            </div>
            <div className="space-y-1">
              {event.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid rgba(44,36,32,0.05)' }}>
                  <span className="font-body text-sm" style={{ color: INK }}>{m.name}</span>
                  <div className="flex gap-1">
                    {RSVP.map((r) => (
                      <button
                        key={r.key}
                        onClick={() => onRsvp(event.id, m.id, r.key)}
                        className="p-1 rounded transition-colors"
                        style={{
                          backgroundColor: m.status === r.key ? `${r.color}20` : 'transparent',
                          color: m.status === r.key ? r.color : FAINT,
                        }}
                        title={r.label}
                      >
                        <r.icon size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="mb-4">
          <p className="font-body text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(44,36,32,0.4)' }}>
            <MessageSquare size={10} className="inline mr-1" /> Комментарии ({comments.length})
          </p>
          {comments.length > 0 && (
            <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
              {comments.map((c) => (
                <div key={c.id} className="p-2" style={{ backgroundColor: 'rgba(44,36,32,0.02)', borderRadius: '2px' }}>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[10px] font-medium" style={{ color: INK }}>{c.author}</span>
                    <span className="font-body text-[10px]" style={{ color: FAINT }}>{fmtDate(c.createdAt)}</span>
                  </div>
                  <p className="font-body text-xs mt-0.5" style={{ color: MUTED }}>{c.text}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addComment()}
              placeholder="Комментарий..."
              className="gdt-input flex-1 text-sm"
            />
            <button onClick={addComment} className="px-3 py-1.5 font-body text-xs" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>↑</button>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => onEdit(event)} className="flex items-center gap-2 px-4 py-2.5 font-body text-xs tracking-wider uppercase" style={{ border: `1px solid ${GOLD}`, color: GOLD, borderRadius: '2px' }}>
            <Edit size={12} /> Редактировать
          </button>
          <button onClick={onClose} className="px-6 py-2.5 font-body text-xs tracking-wider uppercase" style={{ border: '1px solid rgba(44,36,32,0.15)', color: MUTED, borderRadius: '2px' }}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Component ────────────────────────────────────────── */

export default function AdminEvents() {
  const [events, setEvents] = useLocalStorage('events', [])
  const [modal, setModal] = useState(null) // null | 'new' | event obj
  const [detailEvent, setDetailEvent] = useState(null)
  const [catFilter, setCatFilter] = useState('all')

  // Comments stored per event in localStorage
  const getComments = (eventId) => {
    try { return JSON.parse(localStorage.getItem(`vm_event_${eventId}_comments`) || '[]') } catch { return [] }
  }
  const saveComment = (eventId, comment) => {
    const comments = [...getComments(eventId), comment]
    localStorage.setItem(`vm_event_${eventId}_comments`, JSON.stringify(comments))
  }

  const filtered = catFilter === 'all' ? events : events.filter((e) => e.category === catFilter)
  const now = new Date()
  const upcoming = events.filter((e) => new Date(e.datetime) > now).length

  const handleSave = (ev) => {
    setEvents((prev) => {
      const exists = prev.find((e) => e.id === ev.id)
      return exists ? prev.map((e) => (e.id === ev.id ? ev : e)) : [ev, ...prev]
    })
    setModal(null)
    toast.success('Событие сохранено')
  }

  const handleDelete = (ev) => {
    if (!window.confirm(`Удалить "${ev.title}"?`)) return
    setEvents((prev) => prev.filter((e) => e.id !== ev.id))
    toast.success('Удалено')
  }

  const handleRsvp = (eventId, memberId, status) => {
    setEvents((prev) => prev.map((e) => {
      if (e.id !== eventId) return e
      return { ...e, members: e.members.map((m) => (m.id === memberId ? { ...m, status } : m)) }
    }))
    // Update detail view
    setDetailEvent((prev) => {
      if (!prev || prev.id !== eventId) return prev
      return { ...prev, members: prev.members.map((m) => (m.id === memberId ? { ...m, status } : m)) }
    })
  }

  const handleComment = (comment) => {
    if (detailEvent) saveComment(detailEvent.id, comment)
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)' }}>
          <CalendarDays size={20} style={{ color: GOLD }} />
        </div>
        <div>
          <h1 className="font-display text-2xl italic" style={{ color: INK }}>События</h1>
          <p className="font-body text-sm mt-0.5" style={{ color: MUTED }}>
            {events.length} событий · {upcoming} предстоящих
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-1.5 overflow-x-auto">
          {[{ key: 'all', emoji: '📋', label: 'Все' }, ...CATEGORIES].map((c) => (
            <button
              key={c.key}
              onClick={() => setCatFilter(c.key)}
              className="flex items-center gap-1 px-3 py-1.5 font-body text-xs whitespace-nowrap"
              style={{
                backgroundColor: catFilter === c.key ? 'rgba(176,141,87,0.12)' : 'transparent',
                color: catFilter === c.key ? GOLD : MUTED,
                borderRadius: '2px',
              }}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
        <button onClick={() => setModal('new')} className="flex items-center gap-2 px-4 py-2 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>
          <Plus size={14} /> Событие
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {CATEGORIES.map((c) => {
          const count = events.filter((e) => e.category === c.key).length
          return (
            <div key={c.key} className="stat-card text-center">
              <span className="text-lg">{c.emoji}</span>
              <p className="font-body text-[10px] uppercase mt-0.5" style={{ color: c.color }}>{c.label}</p>
              <p className="font-display text-lg italic" style={{ color: c.color }}>{count}</p>
            </div>
          )
        })}
      </div>

      {/* Event Cards */}
      {filtered.length === 0 ? (
        <div style={panelStyle} className="p-10 text-center">
          <CalendarDays size={32} className="mx-auto mb-3" style={{ color: FAINT }} />
          <p className="font-body text-sm" style={{ color: FAINT }}>Нет событий</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.sort((a, b) => new Date(a.datetime) - new Date(b.datetime)).map((ev) => {
            const cat = CATEGORIES.find((c) => c.key === ev.category)
            const isPast = new Date(ev.datetime) < now
            return (
              <div
                key={ev.id}
                onClick={() => setDetailEvent(ev)}
                className="p-4 cursor-pointer hover:shadow-sm transition-shadow"
                style={{ ...panelStyle, opacity: isPast ? 0.6 : 1, borderLeft: `3px solid ${cat?.color || GOLD}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat?.emoji}</span>
                    <h3 className="font-body text-sm font-medium" style={{ color: INK }}>{ev.title}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setModal(ev) }} className="p-1"><Edit size={11} style={{ color: GOLD }} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(ev) }} className="p-1"><Trash2 size={11} style={{ color: 'rgba(180,60,60,0.5)' }} /></button>
                  </div>
                </div>
                <p className="font-body text-xs" style={{ color: MUTED }}>
                  {fmtDate(ev.datetime)} {fmtTime(ev.datetime)}
                </p>
                {ev.location && <p className="font-body text-[10px] mt-0.5" style={{ color: FAINT }}>{ev.location}</p>}
                {ev.members.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-body text-[10px]" style={{ color: MUTED }}>{ev.members.length} участников</span>
                    <span className="font-body text-[10px]" style={{ color: '#7A8B6F' }}>
                      ✓{ev.members.filter((m) => m.status === 'yes').length}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <EventModal
          event={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Detail */}
      {detailEvent && (
        <EventDetail
          event={detailEvent}
          comments={getComments(detailEvent.id)}
          onClose={() => setDetailEvent(null)}
          onEdit={(ev) => { setDetailEvent(null); setModal(ev) }}
          onRsvp={handleRsvp}
          onComment={handleComment}
        />
      )}
    </div>
  )
}
