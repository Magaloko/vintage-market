import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  CalendarDays, Plus, Trash2, Edit, X, MessageSquare, Check, HelpCircle, XCircle,
  List, ChevronLeft, ChevronRight, LayoutGrid,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useLocalStorage from '../../lib/useLocalStorage'

const GOLD = '#B08D57'
const INK = '#2C2420'
const MUTED = 'rgba(44, 36, 32, 0.5)'
const FAINT = 'rgba(44, 36, 32, 0.15)'
const panelStyle = { backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid rgba(176,141,87,0.12)', borderRadius: '2px' }

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : '\u2014'
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''

const CATEGORIES = [
  { key: 'exhibition', label: '\u0412\u044b\u0441\u0442\u0430\u0432\u043a\u0430', emoji: '\ud83c\udfdb\ufe0f', color: '#B08D57', group: 'business' },
  { key: 'fair', label: '\u042f\u0440\u043c\u0430\u0440\u043a\u0430', emoji: '\ud83c\udfaa', color: '#C17F3E', group: 'business' },
  { key: 'conference', label: '\u041a\u043e\u043d\u0444\u0435\u0440\u0435\u043d\u0446\u0438\u044f', emoji: '\ud83c\udf99\ufe0f', color: '#7A5C8B', group: 'business' },
  { key: 'workshop', label: '\u0412\u043e\u0440\u043a\u0448\u043e\u043f', emoji: '\ud83d\udee0\ufe0f', color: '#5A7A8B', group: 'business' },
  { key: 'meeting', label: '\u0412\u0441\u0442\u0440\u0435\u0447\u0430', emoji: '\ud83d\udc65', color: '#3b82f6', group: 'general' },
  { key: 'party', label: '\u0412\u0435\u0447\u0435\u0440\u0438\u043d\u043a\u0430', emoji: '\ud83c\udf89', color: '#8b5cf6', group: 'general' },
  { key: 'family', label: '\u0421\u0435\u043c\u044c\u044f', emoji: '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66', color: '#ec4899', group: 'general' },
  { key: 'hobby', label: '\u0425\u043e\u0431\u0431\u0438', emoji: '\ud83c\udfae', color: '#06b6d4', group: 'general' },
  { key: 'sport', label: '\u0421\u043f\u043e\u0440\u0442', emoji: '\u26bd', color: '#f59e0b', group: 'general' },
  { key: 'delivery', label: '\u0414\u043e\u0441\u0442\u0430\u0432\u043a\u0430', emoji: '\ud83d\udce6', color: '#5A6B3C', group: 'logistics' },
]

const CATEGORY_GROUPS = [
  { key: 'business', label: '\u0411\u0438\u0437\u043d\u0435\u0441', emoji: '\ud83d\udcbc' },
  { key: 'general', label: '\u041e\u0431\u0449\u0435\u0435', emoji: '\ud83d\udcc5' },
  { key: 'logistics', label: '\u041b\u043e\u0433\u0438\u0441\u0442\u0438\u043a\u0430', emoji: '\ud83d\ude9a' },
]

const RSVP = [
  { key: 'yes', label: '\u0414\u0430', icon: Check, color: '#7A8B6F' },
  { key: 'maybe', label: '\u0412\u043e\u0437\u043c\u043e\u0436\u043d\u043e', icon: HelpCircle, color: '#f59e0b' },
  { key: 'no', label: '\u041d\u0435\u0442', icon: XCircle, color: '#B5736A' },
]

const MONTH_NAMES = [
  '\u042f\u043d\u0432\u0430\u0440\u044c', '\u0424\u0435\u0432\u0440\u0430\u043b\u044c', '\u041c\u0430\u0440\u0442', '\u0410\u043f\u0440\u0435\u043b\u044c', '\u041c\u0430\u0439', '\u0418\u044e\u043d\u044c',
  '\u0418\u044e\u043b\u044c', '\u0410\u0432\u0433\u0443\u0441\u0442', '\u0421\u0435\u043d\u0442\u044f\u0431\u0440\u044c', '\u041e\u043a\u0442\u044f\u0431\u0440\u044c', '\u041d\u043e\u044f\u0431\u0440\u044c', '\u0414\u0435\u043a\u0430\u0431\u0440\u044c',
]
const WEEKDAYS = ['\u041f\u043d', '\u0412\u0442', '\u0421\u0440', '\u0427\u0442', '\u041f\u0442', '\u0421\u0431', '\u0412\u0441']

/* ── Cross-module events ──────────────────────────────────── */

function getCrossModuleEvents() {
  const cross = []
  // Sales deals (from AdminSales localStorage)
  try {
    const deals = JSON.parse(localStorage.getItem('vm_sales_deals') || '[]')
    deals.forEach((d) => {
      if (d.closeDate) {
        cross.push({
          id: `deal_${d.id}`, title: `\ud83d\udcb0 ${d.title || d.company}`, datetime: d.closeDate,
          category: '_deal', source: 'sales', color: '#C17F3E', emoji: '\ud83d\udcb0', readonly: true,
        })
      }
    })
  } catch {}
  // Jobs interviews (from AdminJobs localStorage)
  try {
    const jobs = JSON.parse(localStorage.getItem('vm_jobs') || '[]')
    jobs.forEach((j) => {
      if (j.interviewDate) {
        cross.push({
          id: `job_${j.id}`, title: `\ud83d\udcbc ${j.position || j.company}`, datetime: j.interviewDate,
          category: '_job', source: 'jobs', color: '#5A7A8B', emoji: '\ud83d\udcbc', readonly: true,
        })
      }
    })
  } catch {}
  // Invoices due dates (from AdminAccounting)
  try {
    const invoices = JSON.parse(localStorage.getItem('vm_invoices') || '[]')
    invoices.forEach((inv) => {
      if (inv.dueDate && (inv.status === '\u041e\u0442\u043a\u0440\u044b\u0442\u0430' || inv.status === '\u041f\u0440\u043e\u0441\u0440\u043e\u0447\u0435\u043d\u0430')) {
        cross.push({
          id: `inv_${inv.id}`, title: `\ud83d\udcc4 ${inv.number || 'Rechnung'}: ${inv.client || ''}`, datetime: inv.dueDate,
          category: '_invoice', source: 'accounting', color: '#B5736A', emoji: '\ud83d\udcc4', readonly: true,
        })
      }
    })
  } catch {}
  // Product deliveries (from Supabase products cache or demo)
  try {
    const prods = JSON.parse(localStorage.getItem('vm_product_deliveries') || '[]')
    prods.forEach((p) => {
      if (p.expectedDate) {
        cross.push({
          id: `prod_${p.id}`, title: `\ud83d\udce6 ${p.name}`, datetime: p.expectedDate,
          category: '_delivery', source: 'products', color: '#5A6B3C', emoji: '\ud83d\udce6', readonly: true,
        })
      }
    })
  } catch {}
  return cross
}

/* ── Calendar helpers ─────────────────────────────────────── */

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startWeekday = (firstDay.getDay() + 6) % 7 // Mon=0
  const days = []
  // Prev month padding
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: d, inMonth: false })
  }
  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), inMonth: true })
  }
  // Next month padding
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), inMonth: false })
    }
  }
  return days
}

function isSameDay(d1, d2) {
  if (!d1 || !d2 || isNaN(d1.getTime()) || isNaN(d2.getTime())) return false
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

function isToday(d) {
  return isSameDay(d, new Date())
}

/* ── Calendar View ────────────────────────────────────────── */

function CalendarView({ events, crossEvents, onEventClick, onDayClick }) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState(null)

  const days = useMemo(() => getCalendarDays(year, month), [year, month])

  const allEvents = useMemo(() => [...events, ...crossEvents], [events, crossEvents])

  const eventsForDay = (date) => allEvents.filter((e) => isSameDay(new Date(e.datetime), date))

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1)
    setSelectedDay(null)
  }
  const goToday = () => {
    setYear(new Date().getFullYear())
    setMonth(new Date().getMonth())
    setSelectedDay(null)
  }

  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : []

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded" style={{ border: '1px solid rgba(44,36,32,0.1)' }}>
            <ChevronLeft size={14} style={{ color: MUTED }} />
          </button>
          <h3 className="font-display text-lg italic min-w-[180px] text-center" style={{ color: INK }}>
            {MONTH_NAMES[month]} {year}
          </h3>
          <button onClick={nextMonth} className="p-1.5 rounded" style={{ border: '1px solid rgba(44,36,32,0.1)' }}>
            <ChevronRight size={14} style={{ color: MUTED }} />
          </button>
          <button onClick={goToday} className="ml-2 px-3 py-1 font-body text-[10px] tracking-wider uppercase" style={{ border: `1px solid ${GOLD}`, color: GOLD, borderRadius: '2px' }}>
            \u0421\u0435\u0433\u043e\u0434\u043d\u044f
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center py-1.5 font-body text-[10px] tracking-[0.15em] uppercase" style={{ color: MUTED }}>
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7" style={{ border: '1px solid rgba(176,141,87,0.08)' }}>
        {days.map(({ date, inMonth }, i) => {
          const dayEvents = eventsForDay(date)
          const today = isToday(date)
          const selected = selectedDay && isSameDay(date, selectedDay)
          return (
            <div
              key={i}
              onClick={() => { setSelectedDay(date); if (dayEvents.length === 0) onDayClick?.(date) }}
              className="min-h-[80px] p-1.5 cursor-pointer transition-colors"
              style={{
                backgroundColor: selected ? 'rgba(176,141,87,0.08)' : today ? 'rgba(176,141,87,0.03)' : 'transparent',
                borderRight: '1px solid rgba(176,141,87,0.06)',
                borderBottom: '1px solid rgba(176,141,87,0.06)',
                opacity: inMonth ? 1 : 0.35,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="font-body text-xs w-6 h-6 flex items-center justify-center rounded-full"
                  style={{
                    backgroundColor: today ? GOLD : 'transparent',
                    color: today ? '#fff' : selected ? GOLD : INK,
                    fontWeight: today ? 600 : 400,
                  }}
                >
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="font-body text-[8px] px-1 rounded-full" style={{ backgroundColor: 'rgba(176,141,87,0.15)', color: GOLD }}>
                    {dayEvents.length}
                  </span>
                )}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => {
                  const cat = CATEGORIES.find((c) => c.key === ev.category)
                  const evColor = ev.color || cat?.color || GOLD
                  return (
                    <div
                      key={ev.id}
                      onClick={(e) => { e.stopPropagation(); if (!ev.readonly) onEventClick(ev) }}
                      className="flex items-center gap-0.5 px-1 py-0.5 rounded-sm text-[9px] font-body truncate"
                      style={{
                        backgroundColor: `${evColor}15`,
                        color: evColor,
                        borderLeft: `2px solid ${evColor}`,
                        cursor: ev.readonly ? 'default' : 'pointer',
                      }}
                      title={ev.title}
                    >
                      <span>{ev.emoji || cat?.emoji}</span>
                      <span className="truncate">{ev.title.replace(/^[\ud83c-\ud83e][\udc00-\udfff]\ufe0f?\s*/, '')}</span>
                    </div>
                  )
                })}
                {dayEvents.length > 3 && (
                  <span className="font-body text-[8px] pl-1" style={{ color: MUTED }}>+{dayEvents.length - 3}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Day Detail */}
      {selectedDay && selectedEvents.length > 0 && (
        <div className="mt-4 p-4" style={panelStyle}>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: MUTED }}>
            {selectedDay.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })} \u2014 {selectedEvents.length} \u0441\u043e\u0431\u044b\u0442\u0438\u0439
          </p>
          <div className="space-y-2">
            {selectedEvents.map((ev) => {
              const cat = CATEGORIES.find((c) => c.key === ev.category)
              const evColor = ev.color || cat?.color || GOLD
              const sourceLabels = { sales: '\ud83d\udcb0 \u0421\u0434\u0435\u043b\u043a\u0430', jobs: '\ud83d\udcbc \u0412\u0430\u043a\u0430\u043d\u0441\u0438\u044f', products: '\ud83d\udce6 \u0414\u043e\u0441\u0442\u0430\u0432\u043a\u0430' }
              return (
                <div
                  key={ev.id}
                  onClick={() => !ev.readonly && onEventClick(ev)}
                  className="flex items-center gap-3 p-2.5 rounded-sm transition-colors"
                  style={{
                    backgroundColor: `${evColor}08`,
                    borderLeft: `3px solid ${evColor}`,
                    cursor: ev.readonly ? 'default' : 'pointer',
                  }}
                >
                  <span className="text-lg">{ev.emoji || cat?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm truncate" style={{ color: INK }}>{ev.title.replace(/^[\ud83c-\ud83e][\udc00-\udfff]\ufe0f?\s*/, '')}</p>
                    <p className="font-body text-[10px]" style={{ color: MUTED }}>
                      {fmtTime(ev.datetime)}
                      {ev.location && ` \u00b7 ${ev.location}`}
                      {ev.source && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: `${evColor}12`, color: evColor }}>
                          {sourceLabels[ev.source] || ev.source}
                        </span>
                      )}
                    </p>
                  </div>
                  {ev.members?.length > 0 && (
                    <span className="font-body text-[10px]" style={{ color: MUTED }}>{ev.members.length} \u0443\u0447.</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Event Modal ──────────────────────────────────────────── */

function EventModal({ event, onSave, onClose, initialDate }) {
  const isEdit = !!event
  const defaultDatetime = initialDate
    ? new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate(), 10, 0).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16)

  const [form, setForm] = useState({
    id: event?.id || uid(),
    title: event?.title || '',
    category: event?.category || 'exhibition',
    datetime: event?.datetime || defaultDatetime,
    endDatetime: event?.endDatetime || '',
    location: event?.location || '',
    description: event?.description || '',
    members: event?.members || [],
    budget: event?.budget || '',
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
    if (!form.title.trim()) return toast.error('\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435')
    onSave({ ...form, updatedAt: new Date().toISOString() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md my-8 p-6" style={{ ...panelStyle, backgroundColor: '#FFF' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl italic" style={{ color: INK }}>{isEdit ? '\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c' : '\u041d\u043e\u0432\u043e\u0435 \u0441\u043e\u0431\u044b\u0442\u0438\u0435'}</h2>
          <button onClick={onClose}><X size={18} style={{ color: FAINT }} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Vintage Market \u0432\u044b\u0441\u0442\u0430\u0432\u043a\u0430..." className="gdt-input" />
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="gdt-input">
              {CATEGORY_GROUPS.map((g) => (
                <optgroup key={g.key} label={`${g.emoji} ${g.label}`}>
                  {CATEGORIES.filter((c) => c.group === g.key).map((c) => (
                    <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>\u041d\u0430\u0447\u0430\u043b\u043e</label>
              <input type="datetime-local" value={form.datetime} onChange={(e) => setForm({ ...form, datetime: e.target.value })} className="gdt-input text-sm" />
            </div>
            <div>
              <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>\u041a\u043e\u043d\u0435\u0446 <span style={{ color: FAINT }}>(\u043e\u043f\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u043e)</span></label>
              <input type="datetime-local" value={form.endDatetime} onChange={(e) => setForm({ ...form, endDatetime: e.target.value })} className="gdt-input text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>\u041c\u0435\u0441\u0442\u043e</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="\u0410\u0434\u0440\u0435\u0441, \u0412\u044b\u0441\u0442\u0430\u0432\u043a\u0430 \u0446\u0435\u043d\u0442\u0440..." className="gdt-input" />
            </div>
            <div>
              <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>\u0411\u044e\u0434\u0436\u0435\u0442</label>
              <input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="1000\u20ac" className="gdt-input" />
            </div>
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="gdt-input resize-none" />
          </div>

          {/* Members */}
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>\u0423\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u0438</label>
            <div className="flex gap-2 mb-2">
              <input
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                placeholder="\u0418\u043c\u044f \u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u0430"
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
            \u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c
          </button>
          <button onClick={onClose} className="px-6 py-2.5 font-body text-xs tracking-wider uppercase" style={{ border: '1px solid rgba(44,36,32,0.15)', color: MUTED, borderRadius: '2px' }}>
            \u041e\u0442\u043c\u0435\u043d\u0430
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
              {fmtDate(event.datetime)} {fmtTime(event.datetime)}
              {event.endDatetime && ` \u2014 ${fmtDate(event.endDatetime)} ${fmtTime(event.endDatetime)}`}
              {' \u00b7 '}{event.location || '\u041c\u0435\u0441\u0442\u043e \u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d\u043e'}
            </p>
            {event.budget && (
              <p className="font-body text-xs mt-0.5" style={{ color: GOLD }}>\u0411\u044e\u0434\u0436\u0435\u0442: {event.budget}</p>
            )}
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
            <p className="font-body text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(44,36,32,0.4)' }}>RSVP ({event.members.length} \u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u043e\u0432)</p>
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
            <MessageSquare size={10} className="inline mr-1" /> \u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 ({comments.length})
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
              placeholder="\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439..."
              className="gdt-input flex-1 text-sm"
            />
            <button onClick={addComment} className="px-3 py-1.5 font-body text-xs" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>\u2191</button>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => onEdit(event)} className="flex items-center gap-2 px-4 py-2.5 font-body text-xs tracking-wider uppercase" style={{ border: `1px solid ${GOLD}`, color: GOLD, borderRadius: '2px' }}>
            <Edit size={12} /> \u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c
          </button>
          <button onClick={onClose} className="px-6 py-2.5 font-body text-xs tracking-wider uppercase" style={{ border: '1px solid rgba(44,36,32,0.15)', color: MUTED, borderRadius: '2px' }}>
            \u0417\u0430\u043a\u0440\u044b\u0442\u044c
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
  const [view, setView] = useState('calendar') // 'list' | 'calendar'
  const [newEventDate, setNewEventDate] = useState(null)
  const [showCrossModule, setShowCrossModule] = useLocalStorage('events_cross_module', true)
  const [crossRefresh, setCrossRefresh] = useState(0)

  // Refresh cross-module events when tab gains focus (handles updates from other admin modules)
  useEffect(() => {
    const onFocus = () => setCrossRefresh((c) => c + 1)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const crossEvents = useMemo(() => showCrossModule ? getCrossModuleEvents() : [], [showCrossModule, events, crossRefresh])

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
  const businessCount = events.filter((e) => CATEGORIES.find((c) => c.key === e.category)?.group === 'business').length

  const handleSave = (ev) => {
    setEvents((prev) => {
      const exists = prev.find((e) => e.id === ev.id)
      return exists ? prev.map((e) => (e.id === ev.id ? ev : e)) : [ev, ...prev]
    })
    setModal(null)
    setNewEventDate(null)
    toast.success('\u0421\u043e\u0431\u044b\u0442\u0438\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e')
  }

  const handleDelete = (ev) => {
    if (!window.confirm(`\u0423\u0434\u0430\u043b\u0438\u0442\u044c "${ev.title}"?`)) return
    setEvents((prev) => prev.filter((e) => e.id !== ev.id))
    toast.success('\u0423\u0434\u0430\u043b\u0435\u043d\u043e')
  }

  const handleRsvp = (eventId, memberId, status) => {
    setEvents((prev) => prev.map((e) => {
      if (e.id !== eventId) return e
      return { ...e, members: e.members.map((m) => (m.id === memberId ? { ...m, status } : m)) }
    }))
    setDetailEvent((prev) => {
      if (!prev || prev.id !== eventId) return prev
      return { ...prev, members: prev.members.map((m) => (m.id === memberId ? { ...m, status } : m)) }
    })
  }

  const handleComment = (comment) => {
    if (detailEvent) saveComment(detailEvent.id, comment)
  }

  const handleDayClick = (date) => {
    setNewEventDate(date)
    setModal('new')
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)' }}>
            <CalendarDays size={20} style={{ color: GOLD }} />
          </div>
          <div>
            <h1 className="font-display text-2xl italic" style={{ color: INK }}>\u0421\u043e\u0431\u044b\u0442\u0438\u044f</h1>
            <p className="font-body text-sm mt-0.5" style={{ color: MUTED }}>
              {events.length} \u0441\u043e\u0431\u044b\u0442\u0438\u0439 \u00b7 {upcoming} \u043f\u0440\u0435\u0434\u0441\u0442\u043e\u044f\u0449\u0438\u0445 \u00b7 {businessCount} \u0431\u0438\u0437\u043d\u0435\u0441
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex" style={{ border: '1px solid rgba(176,141,87,0.15)', borderRadius: '2px' }}>
            <button
              onClick={() => setView('calendar')}
              className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs"
              style={{ backgroundColor: view === 'calendar' ? 'rgba(176,141,87,0.12)' : 'transparent', color: view === 'calendar' ? GOLD : MUTED }}
            >
              <LayoutGrid size={12} /> \u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c
            </button>
            <button
              onClick={() => setView('list')}
              className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs"
              style={{ backgroundColor: view === 'list' ? 'rgba(176,141,87,0.12)' : 'transparent', color: view === 'list' ? GOLD : MUTED }}
            >
              <List size={12} /> \u0421\u043f\u0438\u0441\u043e\u043a
            </button>
          </div>
          <button onClick={() => setModal('new')} className="flex items-center gap-2 px-4 py-2 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>
            <Plus size={14} /> \u0421\u043e\u0431\u044b\u0442\u0438\u0435
          </button>
        </div>
      </div>

      {/* Cross-module toggle + Category Filter */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-1.5 overflow-x-auto">
          {[{ key: 'all', emoji: '\ud83d\udccb', label: '\u0412\u0441\u0435' }, ...CATEGORIES].map((c) => (
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
        <label className="flex items-center gap-1.5 cursor-pointer font-body text-[10px]" style={{ color: MUTED }}>
          <input type="checkbox" checked={showCrossModule} onChange={(e) => setShowCrossModule(e.target.checked)} className="accent-[#B08D57]" />
          \u041c\u043e\u0434\u0443\u043b\u0438
        </label>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-6">
        {CATEGORIES.map((c) => {
          const count = events.filter((e) => e.category === c.key).length
          return (
            <div key={c.key} className="stat-card text-center" style={{ padding: '8px 4px' }}>
              <span className="text-sm">{c.emoji}</span>
              <p className="font-body text-[8px] uppercase mt-0.5 truncate" style={{ color: c.color }}>{c.label}</p>
              <p className="font-display text-sm italic" style={{ color: c.color }}>{count}</p>
            </div>
          )
        })}
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <CalendarView
          events={filtered}
          crossEvents={crossEvents}
          onEventClick={(ev) => setDetailEvent(ev)}
          onDayClick={handleDayClick}
        />
      )}

      {/* List View */}
      {view === 'list' && (
        <>
          {filtered.length === 0 ? (
            <div style={panelStyle} className="p-10 text-center">
              <CalendarDays size={32} className="mx-auto mb-3" style={{ color: FAINT }} />
              <p className="font-body text-sm" style={{ color: FAINT }}>\u041d\u0435\u0442 \u0441\u043e\u0431\u044b\u0442\u0438\u0439</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...filtered].sort((a, b) => new Date(a.datetime) - new Date(b.datetime)).map((ev) => {
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
                      {ev.endDatetime && ` \u2014 ${fmtDate(ev.endDatetime)}`}
                    </p>
                    {ev.location && <p className="font-body text-[10px] mt-0.5" style={{ color: FAINT }}>{ev.location}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      {ev.members.length > 0 && (
                        <>
                          <span className="font-body text-[10px]" style={{ color: MUTED }}>{ev.members.length} \u0443\u0447\u0430\u0441\u0442\u043d\u0438\u043a\u043e\u0432</span>
                          <span className="font-body text-[10px]" style={{ color: '#7A8B6F' }}>
                            \u2713{ev.members.filter((m) => m.status === 'yes').length}
                          </span>
                        </>
                      )}
                      {ev.budget && (
                        <span className="font-body text-[10px] ml-auto" style={{ color: GOLD }}>{ev.budget}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Cross-module events list (below calendar/list) */}
      {showCrossModule && crossEvents.length > 0 && view === 'list' && (
        <div className="mt-6">
          <p className="font-body text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: MUTED }}>
            \ud83d\udd17 \u0421\u043e\u0431\u044b\u0442\u0438\u044f \u0438\u0437 \u0434\u0440\u0443\u0433\u0438\u0445 \u043c\u043e\u0434\u0443\u043b\u0435\u0439 ({crossEvents.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {crossEvents.sort((a, b) => new Date(a.datetime) - new Date(b.datetime)).map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 p-3" style={{ ...panelStyle, borderLeft: `3px solid ${ev.color}` }}>
                <span className="text-lg">{ev.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm truncate" style={{ color: INK }}>{ev.title.replace(/^[\ud83c-\ud83e][\udc00-\udfff]\ufe0f?\s*/, '')}</p>
                  <p className="font-body text-[10px]" style={{ color: MUTED }}>{fmtDate(ev.datetime)} {fmtTime(ev.datetime)}</p>
                </div>
                <span className="font-body text-[8px] tracking-wider uppercase px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: `${ev.color}12`, color: ev.color }}>
                  {ev.source}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <EventModal
          event={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => { setModal(null); setNewEventDate(null) }}
          initialDate={newEventDate}
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
