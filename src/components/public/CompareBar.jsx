import { Link } from 'react-router-dom'
import { X, GitCompareArrows } from 'lucide-react'
import { useCompare } from '../../lib/CompareContext'

export default function CompareBar() {
  const { compareItems, removeFromCompare, clearCompare, compareCount } = useCompare()

  if (compareCount === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md shadow-2xl"
      style={{ backgroundColor: 'rgba(14, 26, 43, 0.95)', borderTop: '1px solid rgba(184, 154, 90, 0.3)' }}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
        <GitCompareArrows size={20} style={{ color: '#B89A5A' }} className="shrink-0" />
        <div className="flex items-center gap-3 flex-1 overflow-x-auto">
          {compareItems.map(item => (
            <div key={item.id} className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <img src={item.image_url || item.images?.[0]?.url} alt="" className="w-7 h-7 rounded-full object-cover" />
              <span className="font-sans text-xs max-w-[100px] truncate" style={{ color: 'rgba(242, 237, 227, 0.8)' }}>{item.title}</span>
              <button onClick={() => removeFromCompare(item.id)} style={{ color: 'rgba(242, 237, 227, 0.4)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#F2EDE3'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(242, 237, 227, 0.4)'}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={clearCompare} className="font-sans text-xs px-3 py-2"
            style={{ color: 'rgba(242, 237, 227, 0.4)' }}>
            Очистить
          </button>
          {compareCount >= 2 && (
            <Link to="/compare" className="font-sans text-xs font-medium px-4 py-2 rounded-full transition-colors"
              style={{ backgroundColor: '#B89A5A', color: '#0E1A2B' }}>
              Сравнить ({compareCount})
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
