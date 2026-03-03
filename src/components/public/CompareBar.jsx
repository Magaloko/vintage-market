import { Link } from 'react-router-dom'
import { X, GitCompareArrows } from 'lucide-react'
import { useCompare } from '../../lib/CompareContext'

export default function CompareBar() {
  const { compareItems, removeFromCompare, clearCompare, compareCount } = useCompare()

  if (compareCount === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-vintage-dark/95 backdrop-blur-md border-t border-vintage-gold/30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
        <GitCompareArrows size={20} className="text-vintage-gold shrink-0" />
        <div className="flex items-center gap-3 flex-1 overflow-x-auto">
          {compareItems.map(item => (
            <div key={item.id} className="flex items-center gap-2 bg-white/10 rounded-full pl-1 pr-3 py-1 shrink-0">
              <img src={item.image_url} alt="" className="w-7 h-7 rounded-full object-cover" />
              <span className="font-sans text-xs text-vintage-cream/80 max-w-[100px] truncate">{item.title}</span>
              <button onClick={() => removeFromCompare(item.id)} className="text-vintage-cream/40 hover:text-vintage-cream">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={clearCompare} className="font-sans text-xs text-vintage-cream/40 hover:text-vintage-cream px-3 py-2">
            {'\u041e\u0447\u0438\u0441\u0442\u0438\u0442\u044c'}
          </button>
          {compareCount >= 2 && (
            <Link to="/compare" className="font-sans text-xs bg-vintage-gold text-vintage-dark font-medium px-4 py-2 rounded-full hover:bg-vintage-gold/90 transition-colors">
              {'\u0421\u0440\u0430\u0432\u043d\u0438\u0442\u044c'} ({compareCount})
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
