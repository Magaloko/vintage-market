import { Link } from 'react-router-dom'
import { X, GitCompareArrows } from 'lucide-react'
import { useCompare } from '../../lib/contexts/CompareContext'

const COLORS = {
  bg: 'rgba(14, 26, 43, 0.95)',
  border: 'rgba(176, 141, 87, 0.3)',
  gold: '#B08D57',
  dark: '#0C0A08',
  cream: 'rgba(240, 230, 214, 0.8)',
  creamDim: 'rgba(240, 230, 214, 0.4)',
  itemBg: 'rgba(255,255,255,0.1)',
}

function getItemImage(item) {
  return item.image_url || item.images?.[0]?.url
}

export default function CompareBar() {
  const { compareItems, removeFromCompare, clearCompare, compareCount } = useCompare()

  if (compareCount === 0) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md shadow-2xl"
      style={{ backgroundColor: COLORS.bg, borderTop: `1px solid ${COLORS.border}` }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
        <GitCompareArrows size={20} style={{ color: COLORS.gold }} className="shrink-0" />

        <div className="flex items-center gap-3 flex-1 overflow-x-auto">
          {compareItems.map((item) => (
            <CompareItem
              key={item.id}
              item={item}
              onRemove={() => removeFromCompare(item.id)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="font-sans text-xs px-3 py-2"
            style={{ color: COLORS.creamDim }}
          >
            Очистить
          </button>
          {compareCount >= 2 && (
            <Link
              to="/compare"
              className="font-sans text-xs font-medium px-4 py-2 rounded-full transition-colors"
              style={{ backgroundColor: COLORS.gold, color: COLORS.dark }}
            >
              Сравнить ({compareCount})
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function CompareItem({ item, onRemove }) {
  return (
    <div
      className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 shrink-0"
      style={{ backgroundColor: COLORS.itemBg }}
    >
      <img
        src={getItemImage(item)}
        alt=""
        className="w-7 h-7 rounded-full object-cover"
      />
      <span
        className="font-sans text-xs max-w-[100px] truncate"
        style={{ color: COLORS.cream }}
      >
        {item.title}
      </span>
      <button
        onClick={onRemove}
        style={{ color: COLORS.creamDim }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#F0E6D6' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.creamDim }}
      >
        <X size={12} />
      </button>
    </div>
  )
}
