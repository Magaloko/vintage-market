import { useState, useMemo } from 'react'
import {
  UserSearch, Plus, Trash2, Edit, X, ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useLocalStorage from '../../lib/useLocalStorage'

const GOLD = '#B08D57'
const INK = '#2C2420'
const MUTED = 'rgba(44, 36, 32, 0.5)'
const FAINT = 'rgba(44, 36, 32, 0.15)'
const panelStyle = { backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid rgba(176,141,87,0.12)', borderRadius: '2px' }

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU') : '—'

const STATUSES = [
  { key: 'Applied', label: 'Подано', color: '#6b7280' },
  { key: 'Screening', label: 'Скрининг', color: '#3b82f6' },
  { key: 'Interview', label: 'Собеседование', color: '#eab308' },
  { key: 'Offer', label: 'Оффер', color: '#22c55e' },
  { key: 'Rejected', label: 'Отклонено', color: '#ef4444' },
]

/* ── Job Modal ────────────────────────────────────────────── */

function JobModal({ job, onSave, onClose }) {
  const isEdit = !!job
  const [form, setForm] = useState({
    id: job?.id || uid(),
    company: job?.company || '',
    position: job?.position || '',
    url: job?.url || '',
    salary: job?.salary || '',
    status: job?.status || 'Applied',
    notes: job?.notes || '',
    contact: job?.contact || '',
    appliedDate: job?.appliedDate || new Date().toISOString().slice(0, 10),
    createdAt: job?.createdAt || new Date().toISOString(),
  })

  const handleSave = () => {
    if (!form.company.trim()) return toast.error('Введите компанию')
    if (!form.position.trim()) return toast.error('Введите позицию')
    onSave({ ...form, updatedAt: new Date().toISOString() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md my-8 p-6" style={{ ...panelStyle, backgroundColor: '#FFF' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl italic" style={{ color: INK }}>{isEdit ? 'Редактировать' : 'Новая заявка'}</h2>
          <button onClick={onClose}><X size={18} style={{ color: FAINT }} /></button>
        </div>

        <div className="space-y-3">
          {[
            { key: 'company', label: 'Компания *', ph: 'Google, Apple...' },
            { key: 'position', label: 'Позиция *', ph: 'Sales Manager' },
            { key: 'url', label: 'Ссылка', ph: 'https://...' },
            { key: 'salary', label: 'Зарплата', ph: '€50,000' },
            { key: 'contact', label: 'Контакт', ph: 'HR: name@company.com' },
          ].map((f) => (
            <div key={f.key}>
              <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>{f.label}</label>
              <input value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.ph} className="gdt-input text-sm" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>Статус</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="gdt-input text-sm">
                {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>Дата подачи</label>
              <input type="date" value={form.appliedDate} onChange={(e) => setForm({ ...form, appliedDate: e.target.value })} className="gdt-input text-sm" />
            </div>
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>Заметки</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="gdt-input resize-none text-sm" />
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

/* ── Main Component ────────────────────────────────────────── */

export default function AdminJobs() {
  const [jobs, setJobs] = useLocalStorage('jobs', [])
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(null)
  const [viewMode, setViewMode] = useState('kanban')

  const filtered = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)

  const handleSave = (job) => {
    setJobs((prev) => {
      const exists = prev.find((j) => j.id === job.id)
      return exists ? prev.map((j) => (j.id === job.id ? job : j)) : [job, ...prev]
    })
    setModal(null)
    toast.success('Сохранено')
  }

  const handleDelete = (job) => {
    if (!window.confirm(`Удалить ${job.position} @ ${job.company}?`)) return
    setJobs((prev) => prev.filter((j) => j.id !== job.id))
    toast.success('Удалено')
  }

  const handleDrop = (jobId, newStatus) => {
    setJobs((prev) => prev.map((j) => {
      if (j.id !== jobId || j.status === newStatus) return j
      toast.success(`→ ${STATUSES.find((s) => s.key === newStatus)?.label}`)
      return { ...j, status: newStatus, updatedAt: new Date().toISOString() }
    }))
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)' }}>
          <UserSearch size={20} style={{ color: GOLD }} />
        </div>
        <div>
          <h1 className="font-display text-2xl italic" style={{ color: INK }}>Вакансии</h1>
          <p className="font-body text-sm mt-0.5" style={{ color: MUTED }}>
            {jobs.length} заявок · Recruiting Pipeline
          </p>
        </div>
      </div>

      {/* Filter + Actions */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-1.5 overflow-x-auto">
          {[{ key: 'all', label: 'Все' }, ...STATUSES].map((s) => {
            const count = s.key === 'all' ? jobs.length : jobs.filter((j) => j.status === s.key).length
            return (
              <button
                key={s.key}
                onClick={() => setFilter(s.key)}
                className="px-3 py-1.5 font-body text-xs tracking-wider uppercase whitespace-nowrap"
                style={{
                  backgroundColor: filter === s.key ? 'rgba(176,141,87,0.12)' : 'transparent',
                  color: filter === s.key ? GOLD : MUTED,
                  borderRadius: '2px',
                }}
              >
                {s.label} ({count})
              </button>
            )
          })}
        </div>
        <button onClick={() => setModal('new')} className="flex items-center gap-2 px-4 py-2 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>
          <Plus size={14} /> Добавить
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {STATUSES.map((s) => {
          const count = jobs.filter((j) => j.status === s.key).length
          return (
            <div key={s.key} className="stat-card text-center">
              <p className="font-body text-[10px] uppercase" style={{ color: s.color }}>{s.label}</p>
              <p className="font-display text-lg italic mt-0.5" style={{ color: s.color }}>{count}</p>
            </div>
          )
        })}
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUSES.map((status) => {
          const stageJobs = jobs.filter((j) => j.status === status.key)
          return (
            <div key={status.key} className="flex-shrink-0" style={{ width: 240 }}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                <span className="font-body text-xs tracking-wider uppercase font-medium" style={{ color: INK }}>{status.label}</span>
                <span className="font-body text-[10px] px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: 'rgba(44,36,32,0.06)', color: MUTED }}>{stageJobs.length}</span>
              </div>
              <div
                className="space-y-2 min-h-[180px] p-2 rounded"
                style={{ backgroundColor: 'rgba(44,36,32,0.02)', border: '1px dashed rgba(176,141,87,0.15)', borderRadius: '2px' }}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = 'rgba(176,141,87,0.06)' }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.style.backgroundColor = 'rgba(44,36,32,0.02)' }}
                onDrop={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = 'rgba(44,36,32,0.02)'; const id = e.dataTransfer.getData('text/plain'); if (id) handleDrop(id, status.key) }}
              >
                {stageJobs.length === 0 ? (
                  <p className="text-center font-body text-[10px] py-6" style={{ color: FAINT }}>Пусто</p>
                ) : (
                  stageJobs.map((job) => (
                    <div
                      key={job.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', job.id)}
                      className="p-3 cursor-grab active:cursor-grabbing hover:shadow-sm"
                      style={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(176,141,87,0.12)', borderRadius: '2px', borderLeft: `3px solid ${status.color}` }}
                    >
                      <p className="font-body text-xs font-medium truncate" style={{ color: INK }}>{job.company}</p>
                      <p className="font-body text-[10px] truncate" style={{ color: MUTED }}>{job.position}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="font-body text-[10px]" style={{ color: MUTED }}>{fmtDate(job.appliedDate)}</span>
                        <div className="flex gap-1">
                          <button onClick={() => setModal(job)} className="p-0.5"><Edit size={10} style={{ color: GOLD }} /></button>
                          <button onClick={() => handleDelete(job)} className="p-0.5"><Trash2 size={10} style={{ color: 'rgba(180,60,60,0.5)' }} /></button>
                          {job.url && <a href={job.url} target="_blank" rel="noopener noreferrer" className="p-0.5"><ExternalLink size={10} style={{ color: MUTED }} /></a>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {modal && (
        <JobModal
          job={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
