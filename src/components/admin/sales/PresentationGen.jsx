import { X, Download, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import useLocalStorage from '../../../lib/useLocalStorage'

const GOLD = '#B08D57'
const INK = '#2C2420'
const MUTED = 'rgba(44, 36, 32, 0.5)'
const FAINT = 'rgba(44, 36, 32, 0.15)'
const panelStyle = { backgroundColor: '#FFFFFF', border: '1px solid rgba(176,141,87,0.12)', borderRadius: '2px' }
const fmtCur = (n) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n || 0)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU') : '—'

function generateSlides(deal) {
  return [
    {
      type: 'cover',
      title: 'Обзор сделки',
      data: { company: deal.company, dealName: deal.dealName, date: new Date().toLocaleDateString('ru-RU') },
    },
    {
      type: 'metrics',
      title: 'Ключевые показатели',
      data: { value: deal.value, stage: deal.stage, timeline: deal.timeline, decisionMakers: deal.decision_makers || [] },
    },
    {
      type: 'progress',
      title: 'Прогресс сделки',
      data: { stage: deal.stage, notes: deal.notes },
    },
    {
      type: 'action',
      title: 'Следующие шаги',
      data: {
        actions: [
          'Назначить follow-up встречу',
          'Отправить предложение/контракт',
          'Подготовить план внедрения',
          'Подтвердить таймлайн',
        ],
      },
    },
  ]
}

function generateHTML(deal, slides) {
  const slideHTML = slides.map((slide) => {
    switch (slide.type) {
      case 'cover':
        return `<div style="text-align:center;padding:60px 40px;background:linear-gradient(135deg,#B08D57,#8a6d3e);color:white;page-break-after:always"><h1 style="font-size:3rem;margin:0 0 20px">${slide.data.company}</h1><h2 style="font-size:1.8rem;margin:0 0 40px;opacity:0.9">${slide.data.dealName}</h2><p style="font-size:1.1rem;opacity:0.8">${slide.data.date}</p></div>`
      case 'metrics':
        return `<div style="padding:40px;page-break-after:always"><h2 style="color:#B08D57;border-bottom:3px solid #B08D57;padding-bottom:10px;margin-bottom:30px">${slide.title}</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:30px"><div style="border:1px solid #ddd;border-radius:8px;padding:20px;text-align:center"><div style="color:#999;font-size:0.9rem;margin-bottom:8px">Сумма сделки</div><div style="font-size:1.8rem;font-weight:bold;color:#B08D57">${fmtCur(slide.data.value)}</div></div><div style="border:1px solid #ddd;border-radius:8px;padding:20px;text-align:center"><div style="color:#999;font-size:0.9rem;margin-bottom:8px">Этап</div><div style="font-size:1.8rem;font-weight:bold;color:#B08D57">${slide.data.stage}</div></div><div style="border:1px solid #ddd;border-radius:8px;padding:20px;text-align:center"><div style="color:#999;font-size:0.9rem;margin-bottom:8px">Дедлайн</div><div style="font-size:1.5rem;font-weight:bold;color:#B08D57">${fmtDate(slide.data.timeline)}</div></div></div>${slide.data.decisionMakers.length > 0 ? `<div style="margin-top:30px"><h3>Контакты</h3><ul style="margin:0;padding-left:20px">${slide.data.decisionMakers.map((dm) => `<li style="margin-bottom:8px">${dm}</li>`).join('')}</ul></div>` : ''}</div>`
      case 'progress':
        return `<div style="padding:40px;page-break-after:always"><h2 style="color:#B08D57;border-bottom:3px solid #B08D57;padding-bottom:10px;margin-bottom:30px">${slide.title}</h2><div style="background:rgba(176,141,87,0.08);border-left:4px solid #B08D57;padding:20px;margin-bottom:20px"><div style="font-size:1.5rem;font-weight:bold;color:#B08D57">${slide.data.stage}</div></div>${slide.data.notes ? `<div style="background:#f9fafb;padding:20px;border-radius:6px"><h3>Заметки</h3><p>${slide.data.notes}</p></div>` : ''}</div>`
      case 'action':
        return `<div style="padding:40px;page-break-after:always"><h2 style="color:#B08D57;border-bottom:3px solid #B08D57;padding-bottom:10px;margin-bottom:30px">${slide.title}</h2><ul style="margin:0;padding-left:40px;font-size:1.1rem;line-height:2">${slide.data.actions.map((a) => `<li style="margin-bottom:12px">${a}</li>`).join('')}</ul></div>`
      default:
        return ''
    }
  }).join('')

  return `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>${deal.company} - Презентация</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif;line-height:1.6;color:#2C2420;background:white}@media print{body{background:white}.slide{page-break-after:always}}</style></head><body>${slideHTML}</body></html>`
}

export default function PresentationGen({ deal, onClose }) {
  const [presentations, setPresentations] = useLocalStorage('sales_presentations', [])

  const slides = generateSlides(deal)

  const handleExport = () => {
    const html = generateHTML(deal, slides)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${deal.company}-Presentation.html`
    link.click()
    URL.revokeObjectURL(link.href)

    // Save to localStorage
    setPresentations((prev) => [
      ...prev,
      { id: Date.now().toString(36), dealId: deal.id, company: deal.company, slides, createdAt: new Date().toISOString() },
    ])
    toast.success('Презентация экспортирована!')
  }

  const handlePrint = () => {
    const html = generateHTML(deal, slides)
    const w = window.open('', '_blank', 'width=900,height=700')
    if (!w) return toast.error('Попап заблокирован')
    w.document.write(html)
    w.document.close()
    setTimeout(() => w.print(), 300)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-2xl my-8 p-6" style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl italic" style={{ color: INK }}>Презентация — {deal.company}</h2>
            <p className="font-body text-xs" style={{ color: MUTED }}>{slides.length} слайдов</p>
          </div>
          <button onClick={onClose}><X size={18} style={{ color: FAINT }} /></button>
        </div>

        {/* Slide Previews */}
        <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
          {slides.map((slide, idx) => (
            <div key={idx} className="p-4" style={{ border: '1px solid rgba(176,141,87,0.12)', borderRadius: '2px' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-body text-[10px] px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: 'rgba(176,141,87,0.1)', color: GOLD }}>
                  {idx + 1}
                </span>
                <span className="font-body text-xs font-medium" style={{ color: INK }}>{slide.title}</span>
              </div>
              {slide.type === 'cover' && (
                <div className="p-4 text-center" style={{ background: 'linear-gradient(135deg, rgba(176,141,87,0.15), rgba(176,141,87,0.05))', borderRadius: '2px' }}>
                  <p className="font-display text-lg italic" style={{ color: INK }}>{slide.data.company}</p>
                  <p className="font-body text-sm" style={{ color: MUTED }}>{slide.data.dealName}</p>
                  <p className="font-body text-[10px] mt-1" style={{ color: MUTED }}>{slide.data.date}</p>
                </div>
              )}
              {slide.type === 'metrics' && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Сумма', value: fmtCur(slide.data.value) },
                    { label: 'Этап', value: slide.data.stage },
                    { label: 'Дедлайн', value: fmtDate(slide.data.timeline) },
                  ].map((m) => (
                    <div key={m.label} className="p-2 text-center" style={{ backgroundColor: 'rgba(176,141,87,0.05)', borderRadius: '2px' }}>
                      <p className="font-body text-[10px]" style={{ color: MUTED }}>{m.label}</p>
                      <p className="font-body text-sm font-medium" style={{ color: GOLD }}>{m.value}</p>
                    </div>
                  ))}
                </div>
              )}
              {slide.type === 'progress' && (
                <div className="p-2" style={{ borderLeft: `3px solid ${GOLD}`, backgroundColor: 'rgba(176,141,87,0.04)' }}>
                  <p className="font-body text-sm font-medium" style={{ color: GOLD }}>{slide.data.stage}</p>
                  {slide.data.notes && <p className="font-body text-xs mt-1" style={{ color: MUTED }}>{slide.data.notes}</p>}
                </div>
              )}
              {slide.type === 'action' && (
                <ul className="space-y-1">
                  {slide.data.actions.map((a, i) => (
                    <li key={i} className="font-body text-xs flex items-center gap-2" style={{ color: INK }}>
                      <span style={{ color: GOLD }}>✓</span> {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>
            <Download size={12} /> HTML экспорт
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 font-body text-xs tracking-wider uppercase" style={{ border: `1px solid ${GOLD}`, color: GOLD, borderRadius: '2px' }}>
            <Printer size={12} /> Печать
          </button>
          <button onClick={onClose} className="px-6 py-2.5 font-body text-xs tracking-wider uppercase" style={{ border: '1px solid rgba(44,36,32,0.15)', color: MUTED, borderRadius: '2px' }}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
