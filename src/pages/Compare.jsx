import { Link } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import { useCompare } from '../lib/CompareContext'
import { categories, conditions, categoryFields } from '../data/demoProducts'

export default function Compare() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare()

  if (compareItems.length < 2) {
    return (
      <div className="page-enter">
        <div className="py-16" style={{ backgroundColor: '#0E1A2B' }}>
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="font-display text-4xl font-bold" style={{ color: '#F2EDE3' }}>Сравнение</h1>
          </div>
          <div className="section-gold-line mt-16" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <p className="font-display text-2xl mb-4" style={{ color: 'rgba(91, 58, 41, 0.25)' }}>
            Выберите минимум 2 товара
          </p>
          <p className="font-body mb-8" style={{ color: 'rgba(91, 58, 41, 0.35)' }}>
            Нажмите иконку <span className="inline-block align-middle mx-1 px-1.5 py-0.5 rounded text-sm"
            style={{ backgroundColor: 'rgba(90, 107, 60, 0.1)', color: '#5A6B3C' }}>&lt;=&gt;</span> на карточке товара
          </p>
          <Link to="/catalog" className="btn-primary">Перейти в каталог</Link>
        </div>
      </div>
    )
  }

  const getCat = (id) => categories.find(c => c.id === id)?.name || id || '\u2014'
  const getCond = (id) => conditions.find(c => c.id === id)?.name || id || '\u2014'
  const prices = compareItems.map(p => p.price || 0)
  const minPrice = Math.min(...prices)

  const rows = [
    { label: 'Цена', key: 'price', format: (v) => v ? `${v}\u20ac` : '\u2014', highlight: 'min' },
    { label: 'Категория', key: 'category', format: getCat },
    { label: 'Состояние', key: 'condition', format: getCond },
    { label: 'Эпоха', key: 'era', format: (v) => v || '\u2014' },
    { label: 'Бренд', key: 'brand', format: (v) => v || '\u2014' },
    { label: 'Просмотры', key: 'views', format: (v) => v || 0 },
    { label: 'Статус', key: 'status', format: (v) => v === 'sold' ? 'Продано' : 'В наличии' },
  ]

  // Add dynamic fields from category-specific details
  const allDetailKeys = new Set()
  compareItems.forEach(item => {
    const fields = categoryFields[item.category] || []
    fields.forEach(f => {
      if (compareItems.some(i => i.details?.[f.key])) {
        allDetailKeys.add(JSON.stringify({ key: f.key, label: f.label, unit: f.unit || '' }))
      }
    })
  })
  const detailRows = [...allDetailKeys].map(json => {
    const { key, label, unit } = JSON.parse(json)
    return {
      label,
      key: `detail_${key}`,
      format: (_, item) => {
        const val = item?.details?.[key]
        if (val == null || val === '') return '\u2014'
        return unit ? `${val} ${unit}` : String(val)
      },
      isDetail: true,
      detailKey: key,
    }
  })

  return (
    <div className="page-enter">
      <div className="py-16" style={{ backgroundColor: '#0E1A2B' }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold" style={{ color: '#F2EDE3' }}>Сравнение товаров</h1>
            <p className="font-body mt-2" style={{ color: 'rgba(242, 237, 227, 0.4)' }}>{compareItems.length} товара для сравнения</p>
          </div>
          <button onClick={clearCompare} className="font-sans text-xs transition-colors"
            style={{ color: 'rgba(242, 237, 227, 0.3)' }}>
            Очистить все
          </button>
        </div>
        <div className="section-gold-line mt-16" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="w-40" />
                {compareItems.map(item => (
                  <th key={item.id} className="p-4 text-center align-top">
                    <div className="relative group">
                      <button
                        onClick={() => removeFromCompare(item.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        style={{ backgroundColor: '#C2642C', color: '#F2EDE3' }}
                      >
                        <X size={12} />
                      </button>
                      <Link to={`/product/${item.id}`}>
                        <img src={item.image_url || item.images?.[0]?.url} alt={item.title}
                          className="w-full aspect-square object-cover mb-3 hover:scale-[1.02] transition-transform"
                          style={{ borderRadius: '6px' }} />
                      </Link>
                      <Link to={`/product/${item.id}`} className="font-display text-lg transition-colors"
                        style={{ color: '#0E1A2B' }}>
                        {item.title}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={row.key} style={{ backgroundColor: ri % 2 === 0 ? 'rgba(91, 58, 41, 0.03)' : 'transparent' }}>
                  <td className="px-4 py-3 font-sans text-xs tracking-wider uppercase font-medium"
                    style={{ color: 'rgba(91, 58, 41, 0.4)' }}>
                    {row.label}
                  </td>
                  {compareItems.map(item => {
                    const val = item[row.key]
                    const formatted = row.format(val)
                    const isBest = row.highlight === 'min' && val === minPrice && val > 0
                    return (
                      <td key={item.id} className={`px-4 py-3 text-center font-body text-lg ${isBest ? 'font-semibold' : ''}`}
                        style={{ color: isBest ? '#5A6B3C' : '#1C1C1A' }}>
                        {formatted}
                        {isBest && <span className="block font-sans text-xs mt-0.5" style={{ color: '#5A6B3C' }}>Лучшая цена</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {/* Category-specific detail rows */}
              {detailRows.map((row, ri) => (
                <tr key={row.key} style={{ backgroundColor: (rows.length + ri) % 2 === 0 ? 'rgba(91, 58, 41, 0.03)' : 'transparent' }}>
                  <td className="px-4 py-3 font-sans text-xs tracking-wider uppercase font-medium"
                    style={{ color: 'rgba(184, 154, 90, 0.5)' }}>
                    {row.label}
                  </td>
                  {compareItems.map(item => (
                    <td key={item.id} className="px-4 py-3 text-center font-body text-lg"
                      style={{ color: '#1C1C1A' }}>
                      {row.format(null, item)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Description row */}
              <tr style={{ backgroundColor: 'rgba(91, 58, 41, 0.03)' }}>
                <td className="px-4 py-3 font-sans text-xs tracking-wider uppercase font-medium align-top"
                  style={{ color: 'rgba(91, 58, 41, 0.4)' }}>
                  Описание
                </td>
                {compareItems.map(item => (
                  <td key={item.id} className="px-4 py-3 font-body text-sm leading-relaxed"
                    style={{ color: 'rgba(91, 58, 41, 0.6)' }}>
                    {item.description?.slice(0, 150)}{item.description?.length > 150 ? '...' : ''}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-12 text-center">
          <Link to="/catalog" className="btn-secondary">
            <ArrowLeft size={16} className="mr-2" />
            Назад в каталог
          </Link>
        </div>
      </div>
    </div>
  )
}
