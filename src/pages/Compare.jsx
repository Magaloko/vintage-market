import { Link } from 'react-router-dom'
import { ArrowLeft, X, Check, Minus } from 'lucide-react'
import { useCompare } from '../lib/CompareContext'
import { categories, conditions } from '../data/demoProducts'
import PriceInsight from '../components/public/PriceInsight'

export default function Compare() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare()

  if (compareItems.length < 2) {
    return (
      <div className="page-enter">
        <div className="bg-vintage-dark text-vintage-cream py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="font-display text-4xl font-bold">{'\u0421\u0440\u0430\u0432\u043d\u0435\u043d\u0438\u0435'}</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <p className="font-display text-2xl text-vintage-brown/30 mb-4">
            {'\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043c\u0438\u043d\u0438\u043c\u0443\u043c 2 \u0442\u043e\u0432\u0430\u0440\u0430'}
          </p>
          <p className="font-body text-vintage-brown/40 mb-8">
            {'\u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u0438\u043a\u043e\u043d\u043a\u0443'} <span className="inline-block align-middle mx-1 px-1.5 py-0.5 bg-vintage-green/10 text-vintage-green rounded text-sm">&lt;=&gt;</span> {'\u043d\u0430 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0435 \u0442\u043e\u0432\u0430\u0440\u0430'}
          </p>
          <Link to="/catalog" className="vintage-btn">{'\u041f\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 \u043a\u0430\u0442\u0430\u043b\u043e\u0433'}</Link>
        </div>
      </div>
    )
  }

  const getCat = (id) => categories.find(c => c.id === id)?.name || id || '\u2014'
  const getCond = (id) => conditions.find(c => c.id === id)?.name || id || '\u2014'
  const prices = compareItems.map(p => p.price || 0)
  const minPrice = Math.min(...prices)

  const rows = [
    { label: '\u0426\u0435\u043d\u0430', key: 'price', format: (v) => v ? `${v}\u20ac` : '\u2014', highlight: 'min' },
    { label: '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f', key: 'category', format: getCat },
    { label: '\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435', key: 'condition', format: getCond },
    { label: '\u042d\u043f\u043e\u0445\u0430', key: 'era', format: (v) => v || '\u2014' },
    { label: '\u0411\u0440\u0435\u043d\u0434', key: 'brand', format: (v) => v || '\u2014' },
    { label: '\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u044b', key: 'views', format: (v) => v || 0 },
    { label: '\u0421\u0442\u0430\u0442\u0443\u0441', key: 'status', format: (v) => v === 'sold' ? '\u041f\u0440\u043e\u0434\u0430\u043d\u043e' : '\u0412 \u043d\u0430\u043b\u0438\u0447\u0438\u0438' },
  ]

  return (
    <div className="page-enter">
      <div className="bg-vintage-dark text-vintage-cream py-16">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold">{'\u0421\u0440\u0430\u0432\u043d\u0435\u043d\u0438\u0435 \u0442\u043e\u0432\u0430\u0440\u043e\u0432'}</h1>
            <p className="font-body text-vintage-cream/50 mt-2">{compareItems.length} {'\u0442\u043e\u0432\u0430\u0440\u0430 \u0434\u043b\u044f \u0441\u0440\u0430\u0432\u043d\u0435\u043d\u0438\u044f'}</p>
          </div>
          <button onClick={clearCompare} className="font-sans text-xs text-vintage-cream/40 hover:text-vintage-cream">
            {'\u041e\u0447\u0438\u0441\u0442\u0438\u0442\u044c \u0432\u0441\u0435'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            {/* Product images + titles */}
            <thead>
              <tr>
                <th className="w-40" />
                {compareItems.map(item => (
                  <th key={item.id} className="p-4 text-center align-top">
                    <div className="relative group">
                      <button
                        onClick={() => removeFromCompare(item.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X size={12} />
                      </button>
                      <Link to={`/product/${item.id}`}>
                        <img src={item.image_url || item.images?.[0]?.url} alt={item.title}
                          className="w-full aspect-square object-cover rounded-lg mb-3 hover:scale-[1.02] transition-transform" />
                      </Link>
                      <Link to={`/product/${item.id}`} className="font-display text-lg text-vintage-dark hover:text-vintage-brown transition-colors">
                        {item.title}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={row.key} className={ri % 2 === 0 ? 'bg-vintage-beige/20' : ''}>
                  <td className="px-4 py-3 font-sans text-xs tracking-wider uppercase text-vintage-brown/50 font-medium">
                    {row.label}
                  </td>
                  {compareItems.map(item => {
                    const val = item[row.key]
                    const formatted = row.format(val)
                    const isBest = row.highlight === 'min' && val === minPrice && val > 0
                    return (
                      <td key={item.id} className={`px-4 py-3 text-center font-body text-lg ${isBest ? 'text-green-700 font-semibold' : 'text-vintage-ink'}`}>
                        {formatted}
                        {isBest && <span className="block font-sans text-xs text-green-600 mt-0.5">{'\u041b\u0443\u0447\u0448\u0430\u044f \u0446\u0435\u043d\u0430'}</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {/* Description row */}
              <tr className="bg-vintage-beige/20">
                <td className="px-4 py-3 font-sans text-xs tracking-wider uppercase text-vintage-brown/50 font-medium align-top">
                  {'\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435'}
                </td>
                {compareItems.map(item => (
                  <td key={item.id} className="px-4 py-3 font-body text-sm text-vintage-brown/70 leading-relaxed">
                    {item.description?.slice(0, 150)}{item.description?.length > 150 ? '...' : ''}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-12 text-center">
          <Link to="/catalog" className="vintage-btn-outline">
            <ArrowLeft size={16} className="mr-2" />
            {'\u041d\u0430\u0437\u0430\u0434 \u0432 \u043a\u0430\u0442\u0430\u043b\u043e\u0433'}
          </Link>
        </div>
      </div>
    </div>
  )
}
