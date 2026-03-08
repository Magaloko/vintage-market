import { useState } from 'react'
import { Layers, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { categories, categoryGroups } from '../../data/demoProducts'
import { getActiveCategories, setActiveCategories } from '../../lib/categorySettings'

export default function AdminCategories() {
  const [activeIds, setActiveIds] = useState(() => getActiveCategories())

  const isActive = (id) => activeIds.includes(id)

  const toggle = (id) => {
    const next = isActive(id)
      ? activeIds.filter((x) => x !== id)
      : [...activeIds, id]
    setActiveIds(next)
    setActiveCategories(next)
  }

  const enableAll = () => {
    const all = categories.map((c) => c.id)
    setActiveIds(all)
    setActiveCategories(all)
    toast.success('Все категории включены')
  }

  const disableAll = () => {
    setActiveIds([])
    setActiveCategories([])
    toast.success('Все категории отключены')
  }

  const activeCount = activeIds.length
  const totalCount = categories.length

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-lg"
            style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)' }}
          >
            <Layers size={20} style={{ color: '#B08D57' }} />
          </div>
          <div>
            <h1 className="font-display text-2xl italic" style={{ color: '#2C2420' }}>Категории</h1>
            <p className="font-body text-sm mt-0.5" style={{ color: 'rgba(44, 36, 32, 0.5)' }}>
              {activeCount} из {totalCount} активных
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={enableAll}
            className="px-4 py-2 font-body text-xs rounded transition-all duration-300"
            style={{
              border: '1px solid rgba(176, 141, 87, 0.25)',
              color: '#B08D57',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Включить все
          </button>
          <button
            onClick={disableAll}
            className="px-4 py-2 font-body text-xs rounded transition-all duration-300"
            style={{
              border: '1px solid rgba(44, 36, 32, 0.1)',
              color: 'rgba(44, 36, 32, 0.5)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(44, 36, 32, 0.03)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Отключить все
          </button>
        </div>
      </div>

      {/* Category groups */}
      <div className="space-y-6">
        {categoryGroups.map((group) => {
          const groupCats = categories.filter((c) => c.group === group.id)
          const activeInGroup = groupCats.filter((c) => isActive(c.id)).length

          return (
            <div
              key={group.id}
              className="rounded-lg p-5"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(176, 141, 87, 0.1)',
              }}
            >
              {/* Group header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base italic" style={{ color: '#2C2420' }}>
                    {group.name}
                  </h2>
                </div>
                <span
                  className="font-body text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: activeInGroup > 0 ? 'rgba(176, 141, 87, 0.12)' : 'rgba(44, 36, 32, 0.05)',
                    color: activeInGroup > 0 ? '#B08D57' : 'rgba(44, 36, 32, 0.3)',
                  }}
                >
                  {activeInGroup} / {groupCats.length}
                </span>
              </div>

              {/* Category toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {groupCats.map((cat) => {
                  const active = isActive(cat.id)
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggle(cat.id)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-left group"
                      style={{
                        backgroundColor: active
                          ? 'rgba(176, 141, 87, 0.08)'
                          : 'rgba(247, 242, 235, 0.6)',
                        border: `1px solid ${active ? 'rgba(176, 141, 87, 0.25)' : 'rgba(176, 141, 87, 0.08)'}`,
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.15)'
                          e.currentTarget.style.backgroundColor = 'rgba(247, 242, 235, 0.9)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.08)'
                          e.currentTarget.style.backgroundColor = 'rgba(247, 242, 235, 0.6)'
                        }
                      }}
                    >
                      {/* Toggle indicator */}
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all duration-300"
                        style={{
                          backgroundColor: active ? '#B08D57' : 'transparent',
                          border: `1.5px solid ${active ? '#B08D57' : 'rgba(44, 36, 32, 0.15)'}`,
                        }}
                      >
                        {active && <Check size={12} className="text-white" />}
                      </div>

                      <span
                        className="font-body text-sm transition-colors duration-300"
                        style={{
                          color: active ? '#2C2420' : 'rgba(44, 36, 32, 0.45)',
                        }}
                      >
                        {cat.name}
                      </span>

                      {/* Status label */}
                      <span
                        className="ml-auto font-body text-[10px] uppercase tracking-wider"
                        style={{ color: active ? '#B08D57' : 'rgba(44, 36, 32, 0.2)' }}
                      >
                        {active ? 'Вкл' : 'Выкл'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Hint */}
      <p
        className="mt-6 font-body text-xs text-center"
        style={{ color: 'rgba(44, 36, 32, 0.35)' }}
      >
        Активные категории отображаются при добавлении товара и в каталоге
      </p>
    </div>
  )
}
