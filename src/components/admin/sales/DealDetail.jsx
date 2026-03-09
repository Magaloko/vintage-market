import { X, Edit, FileText, HelpCircle, Presentation } from 'lucide-react'

const GOLD = '#B08D57'
const INK = '#2C2420'
const MUTED = 'rgba(44, 36, 32, 0.5)'
const FAINT = 'rgba(44, 36, 32, 0.15)'
const panelStyle = { backgroundColor: '#FFFFFF', border: '1px solid rgba(176,141,87,0.12)', borderRadius: '2px' }
const fmtCur = (n) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n || 0)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU') : '—'

export default function DealDetail({ deal, stages, onClose, onEdit, onStageChange, onScript, onFAQ, onPresentation }) {
  const stage = stages.find((s) => s.key === deal.stage) || stages[0]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-lg my-8 p-6" style={panelStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-xl italic" style={{ color: INK }}>{deal.company}</h2>
            <p className="font-body text-sm" style={{ color: MUTED }}>{deal.dealName}</p>
          </div>
          <button onClick={onClose}><X size={18} style={{ color: FAINT }} /></button>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span
            className="inline-flex items-center px-2 py-0.5 font-body text-[10px] tracking-wider uppercase rounded-sm"
            style={{ backgroundColor: `${stage.color}15`, color: stage.color }}
          >
            {stage.label}
          </span>
          <span className="font-body text-sm" style={{ color: INK }}>{fmtCur(deal.value)}</span>
          {deal.timeline && <span className="font-body text-xs" style={{ color: MUTED }}>{fmtDate(deal.timeline)}</span>}
        </div>

        {/* Notes */}
        {deal.notes && (
          <div className="p-3 mb-4" style={{ backgroundColor: 'rgba(176,141,87,0.05)', borderRadius: '2px' }}>
            <p className="font-body text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>Заметки</p>
            <p className="font-body text-sm" style={{ color: INK }}>{deal.notes}</p>
          </div>
        )}

        {/* Contacts */}
        {deal.decision_makers?.length > 0 && (
          <div className="p-3 mb-4" style={{ backgroundColor: 'rgba(176,141,87,0.05)', borderRadius: '2px' }}>
            <p className="font-body text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>Контакты</p>
            <ul className="list-disc list-inside">
              {deal.decision_makers.map((dm, i) => (
                <li key={i} className="font-body text-sm" style={{ color: INK }}>{dm}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Stage Move */}
        <div className="mb-4">
          <p className="font-body text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(44,36,32,0.4)' }}>Перенести на этап</p>
          <div className="flex gap-1.5 flex-wrap">
            {stages.map((s) => (
              <button
                key={s.key}
                onClick={() => { if (s.key !== deal.stage) onStageChange(deal, s.key) }}
                className="px-2.5 py-1 font-body text-[10px] tracking-wider uppercase transition-all"
                style={{
                  backgroundColor: deal.stage === s.key ? `${s.color}20` : 'rgba(44,36,32,0.04)',
                  color: deal.stage === s.key ? s.color : MUTED,
                  border: deal.stage === s.key ? `1px solid ${s.color}40` : '1px solid transparent',
                  borderRadius: '2px',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions — Sub-Modules */}
        <div className="mb-4">
          <p className="font-body text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(44,36,32,0.4)' }}>Инструменты</p>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => onScript(deal)} className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs" style={{ backgroundColor: 'rgba(176,141,87,0.08)', color: GOLD, borderRadius: '2px' }}>
              <FileText size={12} /> Скрипт
            </button>
            <button onClick={() => onFAQ(deal)} className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs" style={{ backgroundColor: 'rgba(176,141,87,0.08)', color: GOLD, borderRadius: '2px' }}>
              <HelpCircle size={12} /> FAQ
            </button>
            <button onClick={() => onPresentation(deal)} className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs" style={{ backgroundColor: 'rgba(176,141,87,0.08)', color: GOLD, borderRadius: '2px' }}>
              <Presentation size={12} /> Презентация
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <button onClick={() => onEdit(deal)} className="flex items-center gap-2 px-4 py-2.5 font-body text-xs tracking-wider uppercase" style={{ border: `1px solid ${GOLD}`, color: GOLD, borderRadius: '2px' }}>
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
