import { useState, useMemo } from 'react'
import {
  TrendingUp, Plus, Settings, LayoutGrid, List, Trash2, Edit, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useLocalStorage from '../../lib/useLocalStorage'
import KanbanBoard from '../../components/admin/sales/KanbanBoard'
import DealModal from '../../components/admin/sales/DealModal'
import DealDetail from '../../components/admin/sales/DealDetail'
import ScriptGenerator from '../../components/admin/sales/ScriptGenerator'
import FAQBuilder from '../../components/admin/sales/FAQBuilder'
import PresentationGen from '../../components/admin/sales/PresentationGen'

/* ── Constants ─────────────────────────────────────────────── */

const GOLD = '#B08D57'
const INK = '#2C2420'
const MUTED = 'rgba(44, 36, 32, 0.5)'
const FAINT = 'rgba(44, 36, 32, 0.15)'
const panelStyle = { backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid rgba(176,141,87,0.12)', borderRadius: '2px' }

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
const fmtCur = (n) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n || 0)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU') : '—'

const STAGE_COLORS = [
  '#6b7280', '#3b82f6', '#f59e0b', '#ec4899',
  '#8b5cf6', '#06b6d4', '#10b981', '#059669',
  '#ef4444', '#f97316', '#84cc16', '#a855f7',
]

const PIPELINE_TEMPLATES = {
  sales: {
    label: 'Sales Pipeline', icon: '📈',
    stages: [
      { key: 'Prospecting', label: 'Проспектирование', color: '#6b7280' },
      { key: 'Discovery', label: 'Выявление', color: '#3b82f6' },
      { key: 'Proposal', label: 'Предложение', color: '#f59e0b' },
      { key: 'Negotiation', label: 'Переговоры', color: '#ec4899' },
      { key: 'Closed', label: 'Закрыто', color: '#10b981' },
    ],
  },
  content: {
    label: 'Content Pipeline', icon: '✍️',
    stages: [
      { key: 'ContentDump', label: 'Сбор контента', color: '#8b5cf6' },
      { key: 'InProgress', label: 'В работе', color: '#3b82f6' },
      { key: 'Review', label: 'Ревью', color: '#f59e0b' },
      { key: 'Approval', label: 'Утверждение', color: '#ec4899' },
      { key: 'Published', label: 'Опубликовано', color: '#10b981' },
    ],
  },
  project: {
    label: 'Проект', icon: '🗂️',
    stages: [
      { key: 'Backlog', label: 'Бэклог', color: '#6b7280' },
      { key: 'ToDo', label: 'К выполнению', color: '#3b82f6' },
      { key: 'InProgress', label: 'В работе', color: '#f59e0b' },
      { key: 'Review', label: 'Ревью', color: '#ec4899' },
      { key: 'Done', label: 'Готово', color: '#10b981' },
    ],
  },
  recruiting: {
    label: 'Рекрутинг', icon: '👥',
    stages: [
      { key: 'Applied', label: 'Подано', color: '#6b7280' },
      { key: 'Screening', label: 'Скрининг', color: '#3b82f6' },
      { key: 'Interview', label: 'Собеседование', color: '#f59e0b' },
      { key: 'Offer', label: 'Оффер', color: '#059669' },
      { key: 'Hired', label: 'Принят', color: '#10b981' },
      { key: 'Rejected', label: 'Отклонён', color: '#ef4444' },
    ],
  },
  custom: {
    label: 'Свой шаблон', icon: '⚙️',
    stages: [
      { key: 'Step1', label: 'Шаг 1', color: '#6b7280' },
      { key: 'Step2', label: 'Шаг 2', color: '#3b82f6' },
      { key: 'Step3', label: 'Шаг 3', color: '#10b981' },
    ],
  },
}

const DEFAULT_BOARD = {
  id: uid(),
  name: 'Sales Pipeline',
  template: 'sales',
  stages: JSON.parse(JSON.stringify(PIPELINE_TEMPLATES.sales.stages)),
  createdAt: new Date().toISOString(),
}

/* ── Stage Manager Modal ──────────────────────────────────── */

function StageManager({ board, onSave, onClose }) {
  const [stages, setStages] = useState(JSON.parse(JSON.stringify(board.stages)))

  const updateStage = (idx, field, value) => {
    setStages((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)))
  }
  const removeStage = (idx) => {
    if (stages.length <= 1) return
    setStages((prev) => prev.filter((_, i) => i !== idx))
  }
  const addStage = () => {
    setStages((prev) => [...prev, { key: `Stage${Date.now()}`, label: 'Новый этап', color: STAGE_COLORS[prev.length % STAGE_COLORS.length] }])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md my-8 p-6" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(176,141,87,0.12)', borderRadius: '2px' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl italic" style={{ color: INK }}>Управление этапами</h2>
            <p className="font-body text-xs" style={{ color: MUTED }}>{board.name}</p>
          </div>
          <button onClick={onClose}><X size={18} style={{ color: FAINT }} /></button>
        </div>

        <div className="space-y-2 mb-4">
          {stages.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <input
                value={s.label}
                onChange={(e) => updateStage(idx, 'label', e.target.value)}
                className="gdt-input flex-1 text-sm"
              />
              <select value={s.color} onChange={(e) => updateStage(idx, 'color', e.target.value)} className="gdt-input w-20 text-xs">
                {STAGE_COLORS.map((c) => <option key={c} value={c} style={{ backgroundColor: c, color: '#fff' }}>{c}</option>)}
              </select>
              <button onClick={() => removeStage(idx)} disabled={stages.length <= 1} className="p-1" title="Удалить">
                <Trash2 size={12} style={{ color: stages.length <= 1 ? FAINT : '#B5736A' }} />
              </button>
            </div>
          ))}
        </div>

        <button onClick={addStage} className="w-full py-2 mb-4 font-body text-xs tracking-wider uppercase text-center" style={{ border: `1px dashed ${GOLD}`, color: GOLD, borderRadius: '2px' }}>
          + Добавить этап
        </button>

        <div className="p-2.5 mb-4 font-body text-[10px]" style={{ backgroundColor: 'rgba(245,158,11,0.08)', color: '#b45309', borderRadius: '2px' }}>
          ⚠️ Удалённые этапы перенесут карточки на первый этап.
        </div>

        <div className="flex gap-3">
          <button onClick={() => onSave(stages)} className="flex-1 py-2.5 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>
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

/* ── New Board Modal ──────────────────────────────────────── */

function NewBoardModal({ onSave, onClose }) {
  const [name, setName] = useState('')
  const [template, setTemplate] = useState('sales')

  const handleCreate = () => {
    if (!name.trim()) return toast.error('Введите название')
    const board = {
      id: uid(),
      name: name.trim(),
      template,
      stages: JSON.parse(JSON.stringify(PIPELINE_TEMPLATES[template].stages)),
      createdAt: new Date().toISOString(),
    }
    onSave(board)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md p-6" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(176,141,87,0.12)', borderRadius: '2px' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl italic" style={{ color: INK }}>Новый борд</h2>
          <button onClick={onClose}><X size={18} style={{ color: FAINT }} /></button>
        </div>

        <div className="mb-4">
          <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44,36,32,0.4)' }}>Название *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Content Marketing Q2" className="gdt-input" autoFocus />
        </div>

        <div className="mb-4">
          <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-2" style={{ color: 'rgba(44,36,32,0.4)' }}>Шаблон</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(PIPELINE_TEMPLATES).map(([key, tpl]) => (
              <button
                key={key}
                onClick={() => setTemplate(key)}
                className="p-3 text-center transition-all"
                style={{
                  backgroundColor: template === key ? 'rgba(176,141,87,0.1)' : 'rgba(44,36,32,0.03)',
                  border: template === key ? `1px solid ${GOLD}` : '1px solid transparent',
                  borderRadius: '2px',
                }}
              >
                <div className="text-xl mb-1">{tpl.icon}</div>
                <div className="font-body text-[10px] font-medium" style={{ color: template === key ? GOLD : MUTED }}>{tpl.label}</div>
                <div className="font-body text-[10px]" style={{ color: FAINT }}>{tpl.stages.length} этапов</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleCreate} className="flex-1 py-2.5 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>
            Создать
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

export default function AdminSales() {
  const [boards, setBoards] = useLocalStorage('sales_boards', [DEFAULT_BOARD])
  const [deals, setDeals] = useLocalStorage('sales_deals', [])

  const [activeBoardId, setActiveBoardId] = useState(boards[0]?.id || null)
  const [viewMode, setViewMode] = useState('kanban') // kanban | list
  const [modal, setModal] = useState(null) // null | 'newDeal' | 'newBoard' | 'stages' | deal obj
  const [detailDeal, setDetailDeal] = useState(null) // deal detail view
  const [subModule, setSubModule] = useState(null) // { type: 'script'|'faq'|'presentation', deal }

  const board = useMemo(() => boards.find((b) => b.id === activeBoardId) || boards[0], [boards, activeBoardId])
  const boardDeals = useMemo(() => deals.filter((d) => d.boardId === board?.id), [deals, board])

  const stages = board?.stages || []
  const lastStageKey = stages[stages.length - 1]?.key
  const activeDeals = boardDeals.filter((d) => d.stage !== lastStageKey)
  const closedDeals = boardDeals.filter((d) => d.stage === lastStageKey)
  const pipelineValue = activeDeals.reduce((s, d) => s + (parseFloat(d.value) || 0), 0)
  const closedValue = closedDeals.reduce((s, d) => s + (parseFloat(d.value) || 0), 0)

  /* ── Handlers ── */

  const handleDrop = (dealId, newStage) => {
    setDeals((prev) => prev.map((d) => {
      if (d.id !== dealId) return d
      if (d.stage === newStage) return d
      const stageLabel = stages.find((s) => s.key === newStage)?.label || newStage
      toast.success(`→ ${stageLabel}`)
      return { ...d, stage: newStage, updatedAt: new Date().toISOString() }
    }))
  }

  const handleSaveDeal = (deal) => {
    setDeals((prev) => {
      const exists = prev.find((d) => d.id === deal.id)
      return exists ? prev.map((d) => (d.id === deal.id ? deal : d)) : [deal, ...prev]
    })
    setModal(null)
    setDetailDeal(null)
    toast.success('Карточка сохранена')
  }

  const handleDeleteDeal = (deal) => {
    if (!window.confirm(`Удалить ${deal.dealName}?`)) return
    setDeals((prev) => prev.filter((d) => d.id !== deal.id))
    setModal(null)
    setDetailDeal(null)
    toast.success('Удалена')
  }

  const handleStageChange = (deal, newStage) => {
    setDeals((prev) => prev.map((d) => (d.id === deal.id ? { ...d, stage: newStage, updatedAt: new Date().toISOString() } : d)))
    const label = stages.find((s) => s.key === newStage)?.label || newStage
    toast.success(`→ ${label}`)
    setDetailDeal(null)
  }

  const handleSaveBoard = (newBoard) => {
    setBoards((prev) => [...prev, newBoard])
    setActiveBoardId(newBoard.id)
    setModal(null)
    toast.success(`Борд "${newBoard.name}" создан!`)
  }

  const handleSaveStages = (newStages) => {
    // Move orphaned deals to first stage
    const validKeys = new Set(newStages.map((s) => s.key))
    const fallbackKey = newStages[0]?.key
    setDeals((prev) => prev.map((d) => {
      if (d.boardId !== board.id) return d
      if (validKeys.has(d.stage)) return d
      return { ...d, stage: fallbackKey, updatedAt: new Date().toISOString() }
    }))
    setBoards((prev) => prev.map((b) => (b.id === board.id ? { ...b, stages: newStages } : b)))
    setModal(null)
    toast.success('Этапы сохранены!')
  }

  const handleDeleteBoard = () => {
    if (boards.length <= 1) return toast.error('Нельзя удалить последний борд')
    if (!window.confirm(`Удалить борд "${board.name}" и все карточки?`)) return
    setDeals((prev) => prev.filter((d) => d.boardId !== board.id))
    setBoards((prev) => {
      const filtered = prev.filter((b) => b.id !== board.id)
      setActiveBoardId(filtered[0]?.id || null)
      return filtered
    })
    toast.success('Борд удалён')
  }

  if (!board) return null

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)' }}>
          <TrendingUp size={20} style={{ color: GOLD }} />
        </div>
        <div>
          <h1 className="font-display text-2xl italic" style={{ color: INK }}>Продажи</h1>
          <p className="font-body text-sm mt-0.5" style={{ color: MUTED }}>
            {boards.length} борд{boards.length !== 1 ? 'ов' : ''} · {deals.length} карточек
          </p>
        </div>
      </div>

      {/* Board Tabs */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
        {boards.map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveBoardId(b.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs tracking-wider uppercase whitespace-nowrap transition-all"
            style={{
              backgroundColor: b.id === board.id ? 'rgba(176,141,87,0.12)' : 'transparent',
              color: b.id === board.id ? GOLD : MUTED,
              borderRadius: '2px',
            }}
          >
            {PIPELINE_TEMPLATES[b.template]?.icon || '📋'} {b.name}
          </button>
        ))}
        <button
          onClick={() => setModal('newBoard')}
          className="px-2 py-1.5 font-body text-xs"
          style={{ color: GOLD }}
          title="Новый борд"
        >
          ＋
        </button>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-1.5">
          <button
            onClick={() => setViewMode('kanban')}
            className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs"
            style={{
              backgroundColor: viewMode === 'kanban' ? 'rgba(176,141,87,0.12)' : 'transparent',
              color: viewMode === 'kanban' ? GOLD : MUTED,
              borderRadius: '2px',
            }}
          >
            <LayoutGrid size={12} /> Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs"
            style={{
              backgroundColor: viewMode === 'list' ? 'rgba(176,141,87,0.12)' : 'transparent',
              color: viewMode === 'list' ? GOLD : MUTED,
              borderRadius: '2px',
            }}
          >
            <List size={12} /> Список ({boardDeals.length})
          </button>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setModal('stages')} className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs" style={{ border: '1px solid rgba(176,141,87,0.2)', color: MUTED, borderRadius: '2px' }}>
            <Settings size={12} /> Этапы
          </button>
          <button onClick={handleDeleteBoard} className="flex items-center gap-1.5 px-3 py-1.5 font-body text-xs" style={{ color: 'rgba(180,60,60,0.5)', borderRadius: '2px' }} title="Удалить борд">
            <Trash2 size={12} />
          </button>
          <button onClick={() => setModal('newDeal')} className="flex items-center gap-2 px-4 py-2 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>
            <Plus size={14} /> Карточка
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Активные', value: activeDeals.length, color: '#059669' },
          { label: 'Pipeline', value: fmtCur(pipelineValue), color: '#3b82f6' },
          { label: 'Этапы', value: stages.length, color: '#10b981' },
          { label: 'Закрыто', value: fmtCur(closedValue), color: '#f59e0b' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="font-body text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(44,36,32,0.4)' }}>{s.label}</p>
            <p className="font-display text-xl italic mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <>
          <KanbanBoard
            stages={stages}
            deals={boardDeals}
            onDrop={handleDrop}
            onCardClick={(deal) => setDetailDeal(deal)}
          />
          <p className="text-center font-body text-[10px] mt-2" style={{ color: FAINT }}>
            Перетаскивайте карточки между этапами
          </p>
        </>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div style={panelStyle} className="overflow-hidden">
          {boardDeals.length === 0 ? (
            <div className="p-10 text-center">
              <TrendingUp size={32} className="mx-auto mb-3" style={{ color: FAINT }} />
              <p className="font-body text-sm" style={{ color: FAINT }}>Нет карточек</p>
              <button onClick={() => setModal('newDeal')} className="mt-3 px-4 py-2 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>
                <Plus size={12} className="inline mr-1" /> Первая карточка
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(176,141,87,0.1)' }}>
                    {['Компания', 'Название', 'Сумма', 'Этап', 'Дата'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-body text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(44,36,32,0.4)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {boardDeals.map((d) => {
                    const stage = stages.find((s) => s.key === d.stage)
                    return (
                      <tr
                        key={d.id}
                        onClick={() => setDetailDeal(d)}
                        className="hover:bg-[rgba(176,141,87,0.03)] cursor-pointer"
                        style={{ borderBottom: '1px solid rgba(44,36,32,0.05)' }}
                      >
                        <td className="px-4 py-2.5 font-body text-sm font-medium" style={{ color: INK }}>{d.company}</td>
                        <td className="px-4 py-2.5 font-body text-sm" style={{ color: MUTED }}>{d.dealName}</td>
                        <td className="px-4 py-2.5 font-body text-sm font-medium" style={{ color: INK }}>{fmtCur(d.value)}</td>
                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center px-2 py-0.5 font-body text-[10px] rounded-sm" style={{ backgroundColor: `${stage?.color || '#ccc'}15`, color: stage?.color || '#666' }}>
                            {stage?.label || d.stage}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-body text-xs" style={{ color: MUTED }}>{fmtDate(d.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {modal === 'newDeal' && (
        <DealModal
          stages={stages}
          boardId={board.id}
          onSave={handleSaveDeal}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'newBoard' && (
        <NewBoardModal
          onSave={handleSaveBoard}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'stages' && (
        <StageManager
          board={board}
          onSave={handleSaveStages}
          onClose={() => setModal(null)}
        />
      )}
      {modal && typeof modal === 'object' && modal.id && (
        <DealModal
          deal={modal}
          stages={stages}
          boardId={board.id}
          onSave={handleSaveDeal}
          onDelete={handleDeleteDeal}
          onClose={() => setModal(null)}
        />
      )}

      {/* Deal Detail */}
      {detailDeal && !subModule && (
        <DealDetail
          deal={detailDeal}
          stages={stages}
          onClose={() => setDetailDeal(null)}
          onEdit={(d) => { setDetailDeal(null); setModal(d) }}
          onStageChange={handleStageChange}
          onScript={(d) => { setDetailDeal(null); setSubModule({ type: 'script', deal: d }) }}
          onFAQ={(d) => { setDetailDeal(null); setSubModule({ type: 'faq', deal: d }) }}
          onPresentation={(d) => { setDetailDeal(null); setSubModule({ type: 'presentation', deal: d }) }}
        />
      )}

      {/* Sub-Modules */}
      {subModule?.type === 'script' && (
        <ScriptGenerator deal={subModule.deal} onClose={() => setSubModule(null)} />
      )}
      {subModule?.type === 'faq' && (
        <FAQBuilder deal={subModule.deal} onClose={() => setSubModule(null)} />
      )}
      {subModule?.type === 'presentation' && (
        <PresentationGen deal={subModule.deal} onClose={() => setSubModule(null)} />
      )}
    </div>
  )
}
