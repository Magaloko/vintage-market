import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import ProductCard from '../components/public/ProductCard'
import { getProducts, getCategoryCounts } from '../lib/api'
import { categories, conditions, sortOptions, eras, categoryGroups } from '../data/demoProducts'

const PRICE_RANGES = [
  { id: 'all', label: 'Все цены', min: 0, max: Infinity },
  { id: '0-50', label: 'До 50\u20ac', min: 0, max: 50 },
  { id: '50-150', label: '50\u2013150\u20ac', min: 50, max: 150 },
  { id: '150-300', label: '150\u2013300\u20ac', min: 150, max: 300 },
  { id: '300-500', label: '300\u2013500\u20ac', min: 300, max: 500 },
  { id: '500+', label: 'От 500\u20ac', min: 500, max: Infinity },
]

const ITEMS_PER_PAGE = 12

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
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [categoryCounts, setCategoryCounts] = useState({})

  useEffect(() => {
    getCategoryCounts().then(r => setCategoryCounts(r.data || {}))
  }, [])

  useEffect(() => {
    setActiveCategory(paramCategory || '')
    setVisibleCount(ITEMS_PER_PAGE)
  }, [paramCategory])

  // AbortController ref — cancels stale requests on rapid filter changes
  const abortRef = useRef(null)

  useEffect(() => {
    // Cancel any previous in-flight request
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    const { signal } = abortRef.current

    async function load() {
      setLoading(true)
      try {
        const { data } = await getProducts({
          category: activeCategory || undefined,
          search: searchQuery || undefined,
        })
        if (!signal.aborted) setAllProducts(data || [])
      } catch (e) {
        if (!signal.aborted) {
          console.error('Catalog load error:', e)
          setAllProducts([])
        }
      }
      if (!signal.aborted) setLoading(false)
    }
    load()

    return () => { if (abortRef.current) abortRef.current.abort() }
  }, [activeCategory, searchQuery])

  useEffect(() => {
    let filtered = [...allProducts]

    if (activeCondition) {
      filtered = filtered.filter(p => p.condition === activeCondition)
    }
    if (activeEra) {
      // Match era by extracting the decade number (e.g. "1970s" → "197", "1960s" → "196")
      const eraDecade = activeEra.replace(/s$/, '')
      filtered = filtered.filter(p => p.era && p.era.toLowerCase().includes(eraDecade.toLowerCase()))
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
    setVisibleCount(ITEMS_PER_PAGE)
  }, [allProducts, activeCondition, activeEra, activePriceRange, sortBy])

  const currentCategory = categories.find(c => c.id === activeCategory)
  const activeFilterCount = [activeCondition, activeEra, activePriceRange !== 'all'].filter(Boolean).length
  const currentSort = sortOptions.find(s => s.id === sortBy)

  const clearAllFilters = () => {
    setActiveCondition('')
    setActiveEra('')
    setActivePriceRange('all')
    setSortBy('newest')
    setVisibleCount(ITEMS_PER_PAGE) // Bug fix: reset pagination on filter clear
  }

  return (
    <div className="page-enter">
      {/* Page Header */}
      <div className="pt-28 pb-16" style={{ backgroundColor: '#0C0A08' }}>
        <div className="max-w-7xl mx-auto px-6">
          <span className="font-body text-[10px] tracking-[0.5em] uppercase"
            style={{ color: 'rgba(176, 141, 87, 0.4)' }}>
            {searchQuery ? 'Результаты поиска' : 'Коллекция'}
          </span>
          <h1 className="font-display text-4xl md:text-6xl italic mt-4"
            style={{ color: '#F0E6D6' }}>
            {searchQuery ? `\u00ab${searchQuery}\u00bb` : currentCategory ? currentCategory.name : 'Каталог'}
          </h1>
          {!searchQuery && (
            <p className="font-display text-lg italic mt-4 max-w-lg" style={{ color: 'rgba(240, 230, 214, 0.25)' }}>
              {currentCategory ? `Все товары в категории \u00ab${currentCategory.name}\u00bb` : 'Все уникальные вещи в одном месте'}
            </p>
          )}
        </div>
        <div className="gdt-divider mt-16" />
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
                  style={{ backgroundColor: '#B08D57', color: '#0C0A08' }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Category Pills */}
          <div className={`flex-wrap gap-2 ${showFilters ? 'flex' : 'hidden md:flex'} flex-1`}>
            <Link to="/catalog" onClick={() => setActiveCategory('')}
              className="px-4 py-2 font-body text-xs tracking-wider rounded-full transition-all"
              style={{
                backgroundColor: !activeCategory ? '#0C0A08' : 'transparent',
                color: !activeCategory ? '#F0E6D6' : 'rgba(44, 36, 32, 0.5)',
                border: `1px solid ${!activeCategory ? '#0C0A08' : 'rgba(44, 36, 32, 0.2)'}`,
              }}>
              Все
            </Link>
            {categoryGroups.map(group => {
              const hasAnyCounts = Object.keys(categoryCounts).length > 0
              const groupCats = hasAnyCounts
                ? categories.filter(c => c.group === group.id && categoryCounts[c.id] > 0)
                : categories.filter(c => c.group === group.id)
              if (groupCats.length === 0) return null
              return groupCats.map(cat => (
                <Link key={cat.id} to={`/catalog/${cat.id}`} onClick={() => setActiveCategory(cat.id)}
                  className="px-3 py-2 font-body text-xs tracking-wider rounded-full transition-all"
                  style={{
                    backgroundColor: activeCategory === cat.id ? '#0C0A08' : 'transparent',
                    color: activeCategory === cat.id ? '#F0E6D6' : 'rgba(44, 36, 32, 0.5)',
                    border: `1px solid ${activeCategory === cat.id ? '#0C0A08' : 'rgba(44, 36, 32, 0.2)'}`,
                  }}>
                  {cat.icon} {cat.name}
                </Link>
              ))
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="relative ml-auto">
            <button onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-4 py-2 font-body text-xs rounded-full transition-all"
              style={{ border: '1px solid rgba(44, 36, 32, 0.2)', color: 'rgba(44, 36, 32, 0.5)' }}>
              {currentSort?.name || 'Сортировка'}
              <ChevronDown size={14} className={`transition-transform ${showSort ? 'rotate-180' : ''}`} />
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 top-full mt-2 shadow-vintage-lg z-20 min-w-[200px] py-2"
                  style={{ backgroundColor: '#F0E6D6', border: '1px solid rgba(44, 36, 32, 0.15)', borderRadius: '2px' }}>
                  {sortOptions.map(opt => (
                    <button key={opt.id}
                      onClick={() => { setSortBy(opt.id); setShowSort(false) }}
                      className="w-full text-left px-4 py-2 font-body text-sm transition-colors"
                      style={{
                        backgroundColor: sortBy === opt.id ? 'rgba(44, 36, 32, 0.06)' : 'transparent',
                        color: sortBy === opt.id ? '#0C0A08' : 'rgba(44, 36, 32, 0.5)',
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
                className="px-3 py-1.5 font-body text-xs rounded-full transition-all"
                style={{
                  backgroundColor: activePriceRange === range.id && range.id !== 'all' ? 'rgba(176, 141, 87, 0.15)' : 'transparent',
                  color: activePriceRange === range.id && range.id !== 'all' ? '#0C0A08' : 'rgba(44, 36, 32, 0.35)',
                  border: `1px solid ${activePriceRange === range.id && range.id !== 'all' ? 'rgba(176, 141, 87, 0.4)' : 'rgba(44, 36, 32, 0.1)'}`,
                }}>
                {range.label}
              </button>
            ))}
          </div>

          <div className="hidden md:block w-px h-8" style={{ backgroundColor: 'rgba(44, 36, 32, 0.1)' }} />

          <div className="flex flex-wrap gap-1.5">
            {conditions.map(cond => (
              <button key={cond.id}
                onClick={() => setActiveCondition(activeCondition === cond.id ? '' : cond.id)}
                className="px-3 py-1.5 font-body text-xs rounded-full transition-all"
                style={{
                  backgroundColor: activeCondition === cond.id ? 'rgba(176, 141, 87, 0.1)' : 'transparent',
                  color: activeCondition === cond.id ? '#B08D57' : 'rgba(44, 36, 32, 0.35)',
                  border: `1px solid ${activeCondition === cond.id ? 'rgba(176, 141, 87, 0.3)' : 'rgba(44, 36, 32, 0.1)'}`,
                }}>
                {cond.name}
              </button>
            ))}
          </div>

          <div className="hidden md:block w-px h-8" style={{ backgroundColor: 'rgba(44, 36, 32, 0.1)' }} />

          <div className="flex flex-wrap gap-1.5">
            {eras.map(era => (
              <button key={era.id}
                onClick={() => setActiveEra(activeEra === era.id ? '' : era.id)}
                className="px-3 py-1.5 font-body text-xs rounded-full transition-all"
                style={{
                  backgroundColor: activeEra === era.id ? 'rgba(176, 141, 87, 0.1)' : 'transparent',
                  color: activeEra === era.id ? '#B08D57' : 'rgba(44, 36, 32, 0.35)',
                  border: `1px solid ${activeEra === era.id ? 'rgba(176, 141, 87, 0.3)' : 'rgba(44, 36, 32, 0.1)'}`,
                }}>
                {era.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Bar */}
        {(activeCategory || activeCondition || activeEra || activePriceRange !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 mb-6 text-sm">
            <span className="font-body" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>Фильтры:</span>
            {searchQuery && (
              <Link to="/catalog" className="flex items-center gap-1 px-3 py-1 rounded-full font-body text-xs"
                style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }}>
                {searchQuery} <X size={12} />
              </Link>
            )}
            {activePriceRange !== 'all' && (
              <button onClick={() => setActivePriceRange('all')} className="flex items-center gap-1 px-3 py-1 rounded-full font-body text-xs"
                style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)', color: '#0C0A08' }}>
                {PRICE_RANGES.find(r => r.id === activePriceRange)?.label} <X size={12} />
              </button>
            )}
            {activeCondition && (
              <button onClick={() => setActiveCondition('')} className="flex items-center gap-1 px-3 py-1 rounded-full font-body text-xs"
                style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)', color: '#B08D57' }}>
                {conditions.find(c => c.id === activeCondition)?.name} <X size={12} />
              </button>
            )}
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="font-body text-xs ml-2 transition-colors"
                style={{ color: 'rgba(44, 36, 32, 0.3)' }}>
                Сбросить все
              </button>
            )}
            <span className="font-body ml-auto" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>
              {products.length} {products.length === 1 ? 'товар' : 'товаров'}
            </span>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)', borderRadius: '2px' }} />
                <div className="p-5 space-y-3">
                  <div className="h-5 rounded w-3/4" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
                  <div className="h-4 rounded w-1/4" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-2xl mb-4" style={{ color: 'rgba(44, 36, 32, 0.25)' }}>Ничего не найдено</p>
            <p className="font-body mb-8" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>Попробуйте изменить параметры</p>
            <button onClick={clearAllFilters} className="btn-secondary">Сбросить фильтры</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.slice(0, visibleCount).map((product, i) => (
                <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${(i % ITEMS_PER_PAGE) * 50}ms` }}>
                  <ProductCard product={product} showCompare />
                </div>
              ))}
            </div>

            {/* Load More */}
            {visibleCount < products.length && (
              <div className="text-center mt-16">
                <button
                  onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                  className="btn-secondary group"
                >
                  Показать ещё
                  <span className="ml-2 font-body text-xs" style={{ opacity: 0.5 }}>
                    ({Math.min(ITEMS_PER_PAGE, products.length - visibleCount)} из {products.length - visibleCount})
                  </span>
                </button>
                <p className="font-body text-xs mt-3" style={{ color: 'rgba(44, 36, 32, 0.25)' }}>
                  Показано {Math.min(visibleCount, products.length)} из {products.length}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
