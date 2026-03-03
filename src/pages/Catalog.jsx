import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Filter, X } from 'lucide-react'
import ProductCard from '../components/public/ProductCard'
import { getProducts } from '../lib/api'
import { categories, conditions } from '../data/demoProducts'

export default function Catalog() {
  const { category: paramCategory } = useParams()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(paramCategory || '')
  const [activeCondition, setActiveCondition] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setActiveCategory(paramCategory || '')
  }, [paramCategory])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await getProducts({
        category: activeCategory || undefined,
        search: searchQuery || undefined,
      })
      let filtered = data || []
      if (activeCondition) {
        filtered = filtered.filter(p => p.condition === activeCondition)
      }
      setProducts(filtered)
      setLoading(false)
    }
    load()
  }, [activeCategory, activeCondition, searchQuery])

  const currentCategory = categories.find(c => c.id === activeCategory)

  return (
    <div className="page-enter">
      {/* Page Header */}
      <div className="bg-vintage-dark text-vintage-cream py-16">
        <div className="max-w-7xl mx-auto px-6">
          <span className="font-sans text-xs tracking-[0.3em] uppercase text-vintage-cream/40">
            {searchQuery ? 'Результаты поиска' : 'Коллекция'}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-3">
            {searchQuery
              ? `«${searchQuery}»`
              : currentCategory
                ? currentCategory.name
                : 'Каталог'
            }
          </h1>
          {!searchQuery && (
            <p className="font-body text-vintage-cream/50 mt-4 max-w-lg">
              {currentCategory
                ? `Все товары в категории «${currentCategory.name}»`
                : 'Все уникальные вещи в одном месте'
              }
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden vintage-btn-outline text-xs py-2 px-4"
          >
            <Filter size={14} className="mr-2" />
            Фильтры
          </button>

          {/* Category Pills */}
          <div className={`flex-wrap gap-2 ${showFilters ? 'flex' : 'hidden md:flex'}`}>
            <Link
              to="/catalog"
              onClick={() => setActiveCategory('')}
              className={`px-4 py-2 font-sans text-xs tracking-wider rounded-full border transition-all ${
                !activeCategory
                  ? 'bg-vintage-dark text-vintage-cream border-vintage-dark'
                  : 'border-vintage-sand text-vintage-brown/60 hover:border-vintage-brown'
              }`}
            >
              Все
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/catalog/${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 font-sans text-xs tracking-wider rounded-full border transition-all ${
                  activeCategory === cat.id
                    ? 'bg-vintage-dark text-vintage-cream border-vintage-dark'
                    : 'border-vintage-sand text-vintage-brown/60 hover:border-vintage-brown'
                }`}
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>

          {/* Condition Filter */}
          <div className={`flex-wrap gap-2 ml-auto ${showFilters ? 'flex' : 'hidden md:flex'}`}>
            {conditions.map(cond => (
              <button
                key={cond.id}
                onClick={() => setActiveCondition(activeCondition === cond.id ? '' : cond.id)}
                className={`px-3 py-1.5 font-sans text-xs rounded-full border transition-all ${
                  activeCondition === cond.id
                    ? 'bg-vintage-green text-vintage-cream border-vintage-green'
                    : 'border-vintage-sand/50 text-vintage-brown/40 hover:border-vintage-sand'
                }`}
              >
                {cond.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(activeCategory || activeCondition || searchQuery) && (
          <div className="flex items-center gap-2 mb-6 text-sm">
            <span className="font-sans text-vintage-brown/40">Фильтры:</span>
            {searchQuery && (
              <Link to="/catalog" className="flex items-center gap-1 px-3 py-1 bg-vintage-beige/50 rounded-full font-sans text-xs">
                {searchQuery} <X size={12} />
              </Link>
            )}
            <span className="font-sans text-vintage-brown/40 ml-auto">
              {products.length} {products.length === 1 ? 'товар' : 'товаров'}
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
            <p className="font-display text-2xl text-vintage-brown/30 mb-4">Ничего не найдено</p>
            <p className="font-body text-vintage-brown/40 mb-8">Попробуйте изменить параметры поиска</p>
            <Link to="/catalog" className="vintage-btn-outline">Сбросить фильтры</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
