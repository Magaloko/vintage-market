import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import ProductCard from '../components/public/ProductCard'
import { getProducts } from '../lib/api'
import { categories } from '../data/demoProducts'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await getProducts({ status: 'active', limit: 6 })
      setFeatured(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-vintage-dark via-vintage-brown to-vintage-green" />
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23F5F0E8' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-px bg-vintage-gold" />
              <span className="font-sans text-xs tracking-[0.4em] uppercase text-vintage-cream/60">
                Винтажный Маркетплейс
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-vintage-cream leading-[0.9] mb-8">
              Вещи
              <br />
              <span className="italic font-normal text-vintage-gold/80">с историей</span>
            </h1>

            <p className="font-body text-lg md:text-xl text-vintage-cream/60 max-w-lg mb-12 leading-relaxed">
              Коллекция уникальных винтажных предметов — от одежды и аксессуаров
              до мебели и произведений искусства. Каждая вещь несёт свою эпоху.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/catalog" className="vintage-btn bg-vintage-cream text-vintage-dark border-vintage-cream hover:bg-transparent hover:text-vintage-cream">
                Смотреть каталог
                <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link to="/about" className="vintage-btn border-vintage-cream/30 text-vintage-cream/70 bg-transparent hover:bg-vintage-cream hover:text-vintage-dark">
                О нас
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="font-sans text-xs tracking-[0.3em] uppercase text-vintage-brown/50">
            Наши разделы
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-vintage-dark mt-3">
            Категории
          </h2>
          <div className="vintage-divider mt-6" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/catalog/${cat.id}`}
              className="vintage-card flex flex-col items-center gap-3 p-6 text-center group"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="font-sans text-sm tracking-wider text-vintage-brown/70 group-hover:text-vintage-dark transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white/50 border-y border-vintage-sand/20">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="font-sans text-xs tracking-[0.3em] uppercase text-vintage-brown/50">
                Избранное
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-vintage-dark mt-3">
                Новые поступления
              </h2>
            </div>
            <Link
              to="/catalog"
              className="hidden md:flex items-center gap-2 font-sans text-sm tracking-wider text-vintage-brown/60 hover:text-vintage-dark transition-colors"
            >
              Весь каталог
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-vintage-beige/50 rounded" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-vintage-beige/50 rounded w-3/4" />
                    <div className="h-4 bg-vintage-beige/50 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product, i) => (
                <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          <div className="md:hidden mt-8 text-center">
            <Link to="/catalog" className="vintage-btn-outline">
              Весь каталог
              <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { icon: '🔍', title: 'Проверенное качество', desc: 'Каждый предмет проходит тщательную проверку подлинности и состояния' },
            { icon: '📦', title: 'Бережная доставка', desc: 'Профессиональная упаковка и надёжная транспортировка по всему миру' },
            { icon: '💎', title: 'Уникальные находки', desc: 'Эксклюзивные вещи, которые невозможно найти в обычных магазинах' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-4xl mb-4">{item.icon}</span>
              <h3 className="font-display text-lg font-semibold text-vintage-dark mb-2">{item.title}</h3>
              <p className="font-body text-sm text-vintage-brown/60 max-w-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
