import { useRef } from 'react'
import { GripVertical } from 'lucide-react'

const GOLD = '#B08D57'
const INK = '#2C2420'
const MUTED = 'rgba(44, 36, 32, 0.5)'
const fmtCur = (n) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n || 0)

export default function KanbanBoard({ stages, deals, onDrop, onCardClick }) {
  const dragId = useRef(null)
  const dragOverCol = useRef(null)

  const handleDragStart = (e, dealId) => {
    dragId.current = dealId
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', dealId)
    e.currentTarget.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1'
    dragId.current = null
    // remove all highlights
    document.querySelectorAll('[data-drop-zone]').forEach((z) => {
      z.style.backgroundColor = ''
    })
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const zone = e.currentTarget
    if (dragOverCol.current !== zone) {
      document.querySelectorAll('[data-drop-zone]').forEach((z) => {
        z.style.backgroundColor = ''
      })
      zone.style.backgroundColor = 'rgba(176,141,87,0.06)'
      dragOverCol.current = zone
    }
  }

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.style.backgroundColor = ''
    }
  }

  const handleDropEvent = (e, stageKey) => {
    e.preventDefault()
    e.currentTarget.style.backgroundColor = ''
    const dealId = e.dataTransfer.getData('text/plain') || dragId.current
    if (dealId && stageKey) onDrop(dealId, stageKey)
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 300 }}>
      {stages.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage.key)
        const stageValue = stageDeals.reduce((s, d) => s + (parseFloat(d.value) || 0), 0)
        return (
          <div key={stage.key} className="flex-shrink-0" style={{ width: 260 }}>
            {/* Column Header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="font-body text-xs tracking-wider uppercase font-medium" style={{ color: INK }}>
                  {stage.label}
                </span>
                <span
                  className="font-body text-[10px] px-1.5 py-0.5 rounded-sm"
                  style={{ backgroundColor: 'rgba(44,36,32,0.06)', color: MUTED }}
                >
                  {stageDeals.length}
                </span>
              </div>
              <span className="font-body text-[10px]" style={{ color: MUTED }}>{fmtCur(stageValue)}</span>
            </div>

            {/* Drop Zone */}
            <div
              data-drop-zone={stage.key}
              className="space-y-2 min-h-[200px] p-2 rounded transition-colors"
              style={{ backgroundColor: 'rgba(44,36,32,0.02)', border: '1px dashed rgba(176,141,87,0.15)', borderRadius: '2px' }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDropEvent(e, stage.key)}
            >
              {stageDeals.length === 0 ? (
                <p className="text-center font-body text-[10px] py-8" style={{ color: 'rgba(44,36,32,0.15)' }}>
                  Сюда перетащить
                </p>
              ) : (
                stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onCardClick(deal)}
                    className="p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: '1px solid rgba(176,141,87,0.12)',
                      borderRadius: '2px',
                      borderLeft: `3px solid ${stage.color}`,
                    }}
                  >
                    <div className="flex items-start gap-1.5">
                      <GripVertical size={12} className="mt-0.5 flex-shrink-0" style={{ color: 'rgba(44,36,32,0.15)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-xs font-medium truncate" style={{ color: INK }}>
                          {deal.company}
                        </p>
                        <p className="font-body text-[10px] truncate" style={{ color: MUTED }}>
                          {deal.dealName || 'Без названия'}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="font-body text-[10px] font-medium" style={{ color: stage.color }}>
                            {fmtCur(deal.value)}
                          </span>
                          {deal.decision_makers?.length > 0 && (
                            <span className="font-body text-[10px]" style={{ color: MUTED }}>
                              {deal.decision_makers.length} контакт.
                            </span>
                          )}
                        </div>
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
  )
}
