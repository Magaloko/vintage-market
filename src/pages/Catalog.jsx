import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Filter, X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import ProductCard from '../components/public/ProductCard'
import { getProducts } from '../lib/api'
import { categories, conditions, sortOptions, eras } from '../data/demoProducts'

const PRICE_RANGES = [
  { id: 'all', label: '\u0412\u0441\u0435 \u0446\u0435\u043d\u044b', min: 0, max: Infinity },
  { id: '0-50', label: '\u0414\u043e 50\u20ac', min: 0, max: 50 },
  { id: '50-150', label: '50\u2013150\u20ac', min: 50, max: 150 },
  { id: '150-300', label: '150\u2013300\u20ac', min: 150, max: 300 },
  { id: '300-500', label: '300\u2013500\u20ac', min: 300, max: 500 },
  { id: '500+', label: '\u041e\u0442 500\u20ac', min: 500, max: Infinity },
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

  // Load products
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

  // Apply filters + sort client-side
  useEffect(() => {
    let filtered = [...allProducts]

    // Condition filter
    if (activeCondition) {
      filtered = filtered.filter(p => p.condition === activeCondition)
    }

    // Era filter
    if (activeEra) {
      filtered = filtered.filter(p => p.era && p.era.toLowerCase().includes(activeEra.replace(/s$/,"").replace(/0s-/,"-")))
    }

    // Price filter
    const priceRange = PRICE_RANGES.find(r => r.id === activePriceRange)
    if (priceRange && priceRange.id !== 'all') {
      filtered = filtered.filter(p => {
        const price = p.price || 0
        return price >= priceRange.min && price <= priceRange.max
      })
    }

    // Sort
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
      {/* Page Header */}
      <div className="bg-vintage-dark text-vintage-cream py-16">
        <div className="max-w-7xl mx-auto px-6">
          <span className="font-sans text-xs tracking-[0.3em] uppercase text-vintage-cream/40">
            {searchQuery ? '\u0420\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u044b \u043f\u043e\u0438\u0441\u043a\u0430' : '\u041a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u044f'}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-3">
            {searchQuery ? `\u00ab${searchQuery}\u00bb` : currentCategory ? currentCategory.name : '\u041a\u0430\u0442\u0430\u043b\u043e\u0433'}
          </h1>
          {!searchQuery && (
            <p className="font-body text-vintage-cream/50 mt-4 max-w-lg">
              {currentCategory ? `\u0412\u0441\u0435 \u0442\u043e\u0432\u0430\u0440\u044b \u0432 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438 \u00ab${currentCategory.name}\u00bb` : '\u0412\u0441\u0435 \u0443\u043d\u0438\u043a\u0430\u043b\u044c\u043d\u044b\u0435 \u0432\u0435\u0449\u0438 \u0432 \u043e\u0434\u043d\u043e\u043c \u043c\u0435\u0441\u0442\u0435'}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top Bar: Categories + Sort + Filter Toggle */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Filter + Sort buttons (mobile) */}
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => setShowFilters(!showFilters)}
              className="vintage-btn-outline text-xs py-2 px-4 relative">
              <SlidersHorizontal size={14} className="mr-2" />
              {'\u0424\u0438\u043b\u044c\u0442\u0440\u044b'}
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-vintage-gold text-vintage-dark text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Category Pills */}
          <div className={`flex-wrap gap-2 ${showFilters ? 'flex' : 'hidden md:flex'} flex-1`}>
            <Link to="/catalog" onClick={() => setActiveCategory('')}
              className={`px-4 py-2 font-sans text-xs tracking-wider rounded-full border transition-all ${
                !activeCategory ? 'bg-vintage-dark text-vintage-cream border-vintage-dark' : 'border-vintage-sand text-vintage-brown/60 hover:border-vintage-brown'
              }`}>
              {'\u0412\u0441\u0435'}
            </Link>
            {categories.map(cat => (
              <Link key={cat.id} to={`/catalog/${cat.id}`} onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 font-sans text-xs tracking-wider rounded-full border transition-all ${
                  activeCategory === cat.id ? 'bg-vintage-dark text-vintage-cream border-vintage-dark' : 'border-vintage-sand text-vintage-brown/60 hover:border-vintage-brown'
                }`}>
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative ml-auto">
            <button onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-4 py-2 font-sans text-xs border border-vintage-sand rounded-full text-vintage-brown/60 hover:border-vintage-brown transition-all">
              {currentSort?.name || '\u0421\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u043a\u0430'}
              <ChevronDown size={14} className={`transition-transform ${showSort ? 'rotate-180' : ''}`} />
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 top-full mt-2 bg-white border border-vintage-sand/50 rounded-xl shadow-lg z-20 min-w-[200px] py-2">
                  {sortOptions.map(opt => (
                    <button key={opt.id}
                      onClick={() => { setSortBy(opt.id); setShowSort(false) }}
                      className={`w-full text-left px-4 py-2 font-sans text-sm transition-colors ${
                        sortBy === opt.id ? 'bg-vintage-beige/50 text-vintage-dark font-medium' : 'text-vintage-brown/60 hover:bg-vintage-beige/30'
                      }`}>
                      {opt.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Extended Filters Row */}
        <div className={`flex-wrap gap-3 mb-6 ${showFilters ? 'flex' : 'hidden md:flex'}`}>
          {/* Price Range */}
          <div className="flex flex-wrap gap-1.5">
            {PRICE_RANGES.map(range => (
              <button key={range.id}
                onClick={() => setActivePriceRange(activePriceRange === range.id ? 'all' : range.id)}
                className={`px-3 py-1.5 font-sans text-xs rounded-full border transition-all ${
                  activePriceRange === range.id && range.id !== 'all'
                    ? 'bg-vintage-gold/20 text-vintage-dark border-vintage-gold'
                    : 'border-vintage-sand/30 text-vintage-brown/40 hover:border-vintage-sand'
                }`}>
                {range.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-vintage-sand/30" />

          {/* Condition Filter */}
          <div className="flex flex-wrap gap-1.5">
            {conditions.map(cond => (
              <button key={cond.id}
                onClick={() => setActiveCondition(activeCondition === cond.id ? '' : cond.id)}
                className={`px-3 py-1.5 font-sans text-xs rounded-full border transition-all ${
                  activeCondition === cond.id
                    ? 'bg-vintage-green/10 text-vintage-green border-vintage-green/40'
                    : 'border-vintage-sand/30 text-vintage-brown/40 hover:border-vintage-sand'
                }`}>
                {cond.name}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-vintage-sand/30" />

          {/* Era Filter */}
          <div className="flex flex-wrap gap-1.5">
            {eras.map(era => (
              <button key={era.id}
                onClick={() => setActiveEra(activeEra === era.id ? '' : era.id)}
                className={`px-3 py-1.5 font-sans text-xs rounded-full border transition-all ${
                  activeEra === era.id
                    ? 'bg-vintage-rust/10 text-vintage-rust border-vintage-rust/40'
                    : 'border-vintage-sand/30 text-vintage-brown/40 hover:border-vintage-sand'
                }`}>
                {era.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Bar */}
        {(activeCategory || activeCondition || activeEra || activePriceRange !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 mb-6 text-sm">
            <span className="font-sans text-vintage-brown/40">{'\u0424\u0438\u043b\u044c\u0442\u0440\u044b'}:</span>
            {searchQuery && (
              <Link to="/catalog" className="flex items-center gap-1 px-3 py-1 bg-vintage-beige/50 rounded-full font-sans text-xs">
                {searchQuery} <X size={12} />
              </Link>
            )}
            {activePriceRange !== 'all' && (
              <button onClick={() => setActivePriceRange('all')} className="flex items-center gap-1 px-3 py-1 bg-vintage-gold/10 rounded-full font-sans text-xs text-vintage-dark">
                {PRICE_RANGES.find(r => r.id === activePriceRange)?.label} <X size={12} />
              </button>
            )}
            {activeCondition && (
              <button onClick={() => setActiveCondition('')} className="flex items-center gap-1 px-3 py-1 bg-vintage-green/10 rounded-full font-sans text-xs text-vintage-green">
                {conditions.find(c => c.id === activeCondition)?.name} <X size={12} />
              </button>
            )}
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="font-sans text-xs text-vintage-brown/30 hover:text-vintage-brown ml-2">
                {'\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u0432\u0441\u0435'}
              </button>
            )}
            <span className="font-sans text-vintage-brown/40 ml-auto">
              {products.length} {products.length === 1 ? '\u0442\u043e\u0432\u0430\u0440' : '\u0442\u043e\u0432\u0430\u0440\u043e\u0432'}
            </span>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-vintage-beige/30 rounded" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-vintage-beige/30 rounded w-3/4" />
                  <div className="h-4 bg-vintage-beige/30 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-vintage-brown/30 mb-4">{'\u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e'}</p>
            <p className="font-body text-vintage-brown/40 mb-8">{'\u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u044b'}</p>
            <button onClick={clearAllFilters} className="vintage-btn-outline">{'\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u0444\u0438\u043b\u044c\u0442\u0440\u044b'}</button>
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
