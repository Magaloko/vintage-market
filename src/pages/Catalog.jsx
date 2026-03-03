import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import ProductCard from '../components/public/ProductCard'
import { getProducts } from '../lib/api'
import { categories, conditions, sortOptions, eras } from '../data/demoProducts'

const PRICE_RANGES = [
  { id: 'all', label: 'Все цены', min: 0, max: Infinity },
  { id: '0-50', label: 'До 50\u20ac', min: 0, max: 50 },
  { id: '50-150', label: '50\u2013150\u20ac', min: 50, max: 150 },
  { id: '150-300', label: '150\u2013300\u20ac', min: 150, max: 300 },
  { id: '300-500', label: '300\u2013500\u20ac', min: 300, max: 500 },
  { id: '500+', label: 'От 500\u20ac', min: 500, max: Infinity },
]

export default function Catalog() {
  const { category: paramCategory } = useParams()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(paramCategory || '')
  const [activeCondition, setActiveCondition] = useState('')
  const [activeEra, setActiveEra] = useState('')
  const [activePriceRange, setActivePriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)

  useEffect(() => {
    setActiveCategory(paramCategory || '')
  }, [paramCategory])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data } = await getProducts({
          category: activeCategory || undefined,
          search: searchQuery || undefined,
        })
        setAllProducts(data || [])
      } catch (e) {
        console.error('Catalog load error:', e)
        setAllProducts([])
      }
      setLoading(false)
    }
    load()
  }, [activeCategory, searchQuery])

  useEffect(() => {
    let filtered = [...allProducts]

    if (activeCondition) {
      filtered = filtered.filter(p => p.condition === activeCondition)
    }
    if (activeEra) {
      filtered = filtered.filter(p => p.era && p.era.toLowerCase().includes(activeEra.replace(/s$/,"").replace(/0s-/,"-")))
    }
    const priceRange = PRICE_RANGES.find(r => r.id === activePriceRange)
    if (priceRange && priceRange.id !== 'all') {
      filtered = filtered.filter(p => {
        const price = p.price || 0
        return price >= priceRange.min && price <= priceRange.max
      })
    }

    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price_desc':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
        break
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        break
    }

    setProducts(filtered)
  }, [allProducts, activeCondition, activeEra, activePriceRange, sortBy])

  const currentCategory = categories.find(c => c.id === activeCategory)
  const activeFilterCount = [activeCondition, activeEra, activePriceRange !== 'all'].filter(Boolean).length
  const currentSort = sortOptions.find(s => s.id === sortBy)

  const clearAllFilters = () => {
    setActiveCondition("")
    setActiveEra(""); setActivePriceRange('all')
    setSortBy('newest')
  }

  return (
    <div className="page-enter">
      {/* Page Header — Deep Navy */}
      <div className="py-16" style={{ backgroundColor: '#0E1A2B' }}>
        <div className="max-w-7xl mx-auto px-6">
          <span className="font-sans text-xs tracking-[0.3em] uppercase"
            style={{ color: 'rgba(184, 154, 90, 0.5)' }}>
            {searchQuery ? 'Результаты поиска' : 'Коллекция'}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-3"
            style={{ color: '#F2EDE3' }}>
            {searchQuery ? `\u00ab${searchQuery}\u00bb` : currentCategory ? currentCategory.name : 'Каталог'}
          </h1>
          {!searchQuery && (
            <p className="font-body mt-4 max-w-lg" style={{ color: 'rgba(242, 237, 227, 0.4)' }}>
              {currentCategory ? `Все товары в категории \u00ab${currentCategory.name}\u00bb` : 'Все уникальные вещи в одном месте'}
            </p>
          )}
        </div>
        <div className="section-gold-line mt-16" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary text-xs py-2 px-4 relative">
              <SlidersHorizontal size={14} className="mr-2" />
              Фильтры
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#B89A5A', color: '#0E1A2B' }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Category Pills */}
          <div className={`flex-wrap gap-2 ${showFilters ? 'flex' : 'hidden md:flex'} flex-1`}>
            <Link to="/catalog" onClick={() => setActiveCategory('')}
              className="px-4 py-2 font-sans text-xs tracking-wider rounded-full transition-all"
              style={{
                backgroundColor: !activeCategory ? '#0E1A2B' : 'transparent',
                color: !activeCategory ? '#F2EDE3' : 'rgba(91, 58, 41, 0.5)',
                border: `1px solid ${!activeCategory ? '#0E1A2B' : 'rgba(91, 58, 41, 0.2)'}`,
              }}>
              Все
            </Link>
            {categories.map(cat => (
              <Link key={cat.id} to={`/catalog/${cat.id}`} onClick={() => setActiveCategory(cat.id)}
                className="px-4 py-2 font-sans text-xs tracking-wider rounded-full transition-all"
                style={{
                  backgroundColor: activeCategory === cat.id ? '#0E1A2B' : 'transparent',
                  color: activeCategory === cat.id ? '#F2EDE3' : 'rgba(91, 58, 41, 0.5)',
                  border: `1px solid ${activeCategory === cat.id ? '#0E1A2B' : 'rgba(91, 58, 41, 0.2)'}`,
                }}>
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative ml-auto">
            <button onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-4 py-2 font-sans text-xs rounded-full transition-all"
              style={{ border: '1px solid rgba(91, 58, 41, 0.2)', color: 'rgba(91, 58, 41, 0.5)' }}>
              {currentSort?.name || 'Сортировка'}
              <ChevronDown size={14} className={`transition-transform ${showSort ? 'rotate-180' : ''}`} />
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 top-full mt-2 shadow-vintage-lg z-20 min-w-[200px] py-2"
                  style={{ backgroundColor: '#F2EDE3', border: '1px solid rgba(91, 58, 41, 0.15)', borderRadius: '6px' }}>
                  {sortOptions.map(opt => (
                    <button key={opt.id}
                      onClick={() => { setSortBy(opt.id); setShowSort(false) }}
                      className="w-full text-left px-4 py-2 font-sans text-sm transition-colors"
                      style={{
                        backgroundColor: sortBy === opt.id ? 'rgba(91, 58, 41, 0.06)' : 'transparent',
                        color: sortBy === opt.id ? '#0E1A2B' : 'rgba(91, 58, 41, 0.5)',
                        fontWeight: sortBy === opt.id ? '500' : '400',
                      }}>
                      {opt.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Extended Filters */}
        <div className={`flex-wrap gap-3 mb-6 ${showFilters ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex flex-wrap gap-1.5">
            {PRICE_RANGES.map(range => (
              <button key={range.id}
                onClick={() => setActivePriceRange(activePriceRange === range.id ? 'all' : range.id)}
                className="px-3 py-1.5 font-sans text-xs rounded-full transition-all"
                style={{
                  backgroundColor: activePriceRange === range.id && range.id !== 'all' ? 'rgba(184, 154, 90, 0.15)' : 'transparent',
                  color: activePriceRange === range.id && range.id !== 'all' ? '#0E1A2B' : 'rgba(91, 58, 41, 0.35)',
                  border: `1px solid ${activePriceRange === range.id && range.id !== 'all' ? 'rgba(184, 154, 90, 0.4)' : 'rgba(91, 58, 41, 0.1)'}`,
                }}>
                {range.label}
              </button>
            ))}
          </div>

          <div className="hidden md:block w-px h-8" style={{ backgroundColor: 'rgba(91, 58, 41, 0.1)' }} />

          <div className="flex flex-wrap gap-1.5">
            {conditions.map(cond => (
              <button key={cond.id}
                onClick={() => setActiveCondition(activeCondition === cond.id ? '' : cond.id)}
                className="px-3 py-1.5 font-sans text-xs rounded-full transition-all"
                style={{
                  backgroundColor: activeCondition === cond.id ? 'rgba(90, 107, 60, 0.1)' : 'transparent',
                  color: activeCondition === cond.id ? '#5A6B3C' : 'rgba(91, 58, 41, 0.35)',
                  border: `1px solid ${activeCondition === cond.id ? 'rgba(90, 107, 60, 0.3)' : 'rgba(91, 58, 41, 0.1)'}`,
                }}>
                {cond.name}
              </button>
            ))}
          </div>

          <div className="hidden md:block w-px h-8" style={{ backgroundColor: 'rgba(91, 58, 41, 0.1)' }} />

          <div className="flex flex-wrap gap-1.5">
            {eras.map(era => (
              <button key={era.id}
                onClick={() => setActiveEra(activeEra === era.id ? '' : era.id)}
                className="px-3 py-1.5 font-sans text-xs rounded-full transition-all"
                style={{
                  backgroundColor: activeEra === era.id ? 'rgba(194, 100, 44, 0.1)' : 'transparent',
                  color: activeEra === era.id ? '#C2642C' : 'rgba(91, 58, 41, 0.35)',
                  border: `1px solid ${activeEra === era.id ? 'rgba(194, 100, 44, 0.3)' : 'rgba(91, 58, 41, 0.1)'}`,
                }}>
                {era.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Bar */}
        {(activeCategory || activeCondition || activeEra || activePriceRange !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 mb-6 text-sm">
            <span className="font-sans" style={{ color: 'rgba(91, 58, 41, 0.35)' }}>Фильтры:</span>
            {searchQuery && (
              <Link to="/catalog" className="flex items-center gap-1 px-3 py-1 rounded-full font-sans text-xs"
                style={{ backgroundColor: 'rgba(91, 58, 41, 0.06)' }}>
                {searchQuery} <X size={12} />
              </Link>
            )}
            {activePriceRange !== 'all' && (
              <button onClick={() => setActivePriceRange('all')} className="flex items-center gap-1 px-3 py-1 rounded-full font-sans text-xs"
                style={{ backgroundColor: 'rgba(184, 154, 90, 0.1)', color: '#0E1A2B' }}>
                {PRICE_RANGES.find(r => r.id === activePriceRange)?.label} <X size={12} />
              </button>
            )}
            {activeCondition && (
              <button onClick={() => setActiveCondition('')} className="flex items-center gap-1 px-3 py-1 rounded-full font-sans text-xs"
                style={{ backgroundColor: 'rgba(90, 107, 60, 0.1)', color: '#5A6B3C' }}>
                {conditions.find(c => c.id === activeCondition)?.name} <X size={12} />
              </button>
            )}
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="font-sans text-xs ml-2 transition-colors"
                style={{ color: 'rgba(91, 58, 41, 0.3)' }}>
                Сбросить все
              </button>
            )}
            <span className="font-sans ml-auto" style={{ color: 'rgba(91, 58, 41, 0.35)' }}>
              {products.length} {products.length === 1 ? 'товар' : 'товаров'}
            </span>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square" style={{ backgroundColor: 'rgba(91, 58, 41, 0.06)', borderRadius: '6px' }} />
                <div className="p-5 space-y-3">
                  <div className="h-5 rounded w-3/4" style={{ backgroundColor: 'rgba(91, 58, 41, 0.06)' }} />
                  <div className="h-4 rounded w-1/4" style={{ backgroundColor: 'rgba(91, 58, 41, 0.06)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-2xl mb-4" style={{ color: 'rgba(91, 58, 41, 0.25)' }}>Ничего не найдено</p>
            <p className="font-body mb-8" style={{ color: 'rgba(91, 58, 41, 0.35)' }}>Попробуйте изменить параметры</p>
            <button onClick={clearAllFilters} className="btn-secondary">Сбросить фильтры</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <ProductCard product={product} showCompare />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
