import { useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

const GOLD = '#B08D57'
const INK = '#2C2420'
const MUTED = 'rgba(44, 36, 32, 0.5)'
const FAINT = 'rgba(44, 36, 32, 0.15)'
const panelStyle = { backgroundColor: '#FFFFFF', border: '1px solid rgba(176,141,87,0.12)', borderRadius: '2px' }
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
const today = () => new Date().toISOString().slice(0, 10)

export default function DealModal({ deal, stages, boardId, onSave, onDelete, onClose }) {
  const isEdit = !!deal
  const [form, setForm] = useState({
    id: deal?.id || uid(),
    boardId: deal?.boardId || boardId,
    company: deal?.company || '',
    dealName: deal?.dealName || '',
    value: deal?.value || 0,
    stage: deal?.stage || stages[0]?.key || '',
    timeline: deal?.timeline || today(),
    decision_makers: deal?.decision_makers || [],
    notes: deal?.notes || '',
    createdAt: deal?.createdAt || new Date().toISOString(),
  })
  const [dmText, setDmText] = useState((deal?.decision_makers || []).join('; '))

  const handleSave = () => {
    if (!form.company.trim()) return toast.error('Введите компанию')
    if (!form.dealName.trim()) return toast.error('Введите название')
    const decisionMakers = dmText.split(';').map((m) => m.trim()).filter(Boolean)
    onSave({
      ...form,
      value: parseFloat(form.value) || 0,
      decision_makers: decisionMakers,
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-lg my-8 p-6" style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl italic" style={{ color: INK }}>
            {isEdit ? 'Редактировать карточку' : 'Новая карточка'}
          </h2>
          <button onClick={onClose}><X size={18} style={{ color: FAINT }} /></button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44,36,32,0.4)' }}>Компания *</label>
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="TechCorp GmbH" className="gdt-input" />
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44,36,32,0.4)' }}>Название *</label>
            <input value={form.dealName} onChange={(e) => setForm({ ...form, dealName: e.target.value })} placeholder="Q3 Контент-план" className="gdt-input" />
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44,36,32,0.4)' }}>Сумма (EUR)</label>
            <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} min="0" step="100" className="gdt-input" />
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44,36,32,0.4)' }}>Этап</label>
            <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="gdt-input">
              {stages.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44,36,32,0.4)' }}>Дедлайн</label>
            <input type="date" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className="gdt-input" />
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44,36,32,0.4)' }}>Контакты</label>
            <input value={dmText} onChange={(e) => setDmText(e.target.value)} placeholder="Имя; Должность" className="gdt-input" />
          </div>
        </div>

        <div className="mb-4">
          <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44,36,32,0.4)' }}>Заметки</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="gdt-input resize-none" placeholder="Контекст, детали..." />
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} className="flex-1 py-2.5 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>
            Сохранить
          </button>
          {isEdit && onDelete && (
            <button onClick={() => onDelete(deal)} className="px-4 py-2.5 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: 'rgba(180,60,60,0.08)', color: '#B5736A', borderRadius: '2px' }}>
              Удалить
            </button>
          )}
          <button onClick={onClose} className="px-6 py-2.5 font-body text-xs tracking-wider uppercase" style={{ border: '1px solid rgba(44,36,32,0.15)', color: MUTED, borderRadius: '2px' }}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  )
}
