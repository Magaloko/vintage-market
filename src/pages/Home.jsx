import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductCard from '../components/public/ProductCard'
import { getProducts } from '../lib/api'
import { categories } from '../data/demoProducts'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await getProducts({ status: 'active', limit: 6 })
        setFeatured(data || [])
      } catch (e) {
        console.error('Home load error:', e)
        setFeatured([])
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="page-enter">
      {/* Hero — Deep Navy background */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden"
        style={{ backgroundColor: '#0E1A2B' }}>
        {/* Subtle diamond pattern overlay */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23B89A5A' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Antique watermark */}
        <div className="absolute inset-0 watermark-overlay" />

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-px" style={{ backgroundColor: '#B89A5A' }} />
              <span className="font-sans text-xs tracking-[0.4em] uppercase"
                style={{ color: 'rgba(184, 154, 90, 0.6)' }}>
                Винтажный Маркетплейс
              </span>
            </div>

            {/* Large serif heading */}
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] mb-8"
              style={{ color: '#F2EDE3' }}>
              Вещи
              <br />
              <span className="italic font-normal" style={{ color: 'rgba(184, 154, 90, 0.8)' }}>с историей</span>
            </h1>

            <p className="font-body text-lg md:text-xl max-w-lg mb-12 leading-relaxed"
              style={{ color: 'rgba(242, 237, 227, 0.5)' }}>
              Коллекция уникальных винтажных предметов — от одежды и аксессуаров
              до мебели и произведений искусства. Каждая вещь несёт свою эпоху.
            </p>

            <div className="flex flex-wrap gap-4">
              {/* Muted orange CTA button */}
              <Link to="/catalog" className="btn-primary">
                Смотреть каталог
                <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link to="/about"
                className="inline-flex items-center justify-center px-8 py-3 font-sans font-medium text-sm tracking-widest uppercase transition-all duration-300"
                style={{
                  backgroundColor: 'transparent',
                  color: 'rgba(242, 237, 227, 0.6)',
                  border: '1px solid rgba(242, 237, 227, 0.2)',
                  borderRadius: '6px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#F2EDE3'
                  e.currentTarget.style.color = '#0E1A2B'
                  e.currentTarget.style.borderColor = '#F2EDE3'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'rgba(242, 237, 227, 0.6)'
                  e.currentTarget.style.borderColor = 'rgba(242, 237, 227, 0.2)'
                }}
              >
                О нас
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="font-sans text-xs tracking-[0.3em] uppercase"
            style={{ color: 'rgba(91, 58, 41, 0.4)' }}>
            Наши разделы
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-3"
            style={{ color: '#0E1A2B' }}>
            Категории
          </h2>
          {/* Decorative thin divider */}
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
              <span className="font-sans text-sm tracking-wider transition-colors"
                style={{ color: 'rgba(91, 58, 41, 0.6)' }}>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ backgroundColor: 'rgba(247, 243, 236, 0.5)', borderTop: '1px solid rgba(91, 58, 41, 0.08)', borderBottom: '1px solid rgba(91, 58, 41, 0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="font-sans text-xs tracking-[0.3em] uppercase"
                style={{ color: 'rgba(91, 58, 41, 0.4)' }}>
                Избранное
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mt-3"
                style={{ color: '#0E1A2B' }}>
                Новые поступления
              </h2>
            </div>
            <Link
              to="/catalog"
              className="hidden md:flex items-center gap-2 font-sans text-sm tracking-wider transition-colors"
              style={{ color: 'rgba(91, 58, 41, 0.5)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0E1A2B'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(91, 58, 41, 0.5)'}
            >
              Весь каталог
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square" style={{ backgroundColor: 'rgba(91, 58, 41, 0.06)', borderRadius: '6px' }} />
                  <div className="p-5 space-y-3">
                    <div className="h-5 rounded w-3/4" style={{ backgroundColor: 'rgba(91, 58, 41, 0.06)' }} />
                    <div className="h-4 rounded w-1/4" style={{ backgroundColor: 'rgba(91, 58, 41, 0.06)' }} />
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
            <Link to="/catalog" className="btn-secondary">
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
              <h3 className="font-display text-lg font-semibold mb-2" style={{ color: '#0E1A2B' }}>{item.title}</h3>
              <div className="vintage-divider mb-4 !w-8" />
              <p className="font-body text-sm max-w-xs leading-relaxed" style={{ color: 'rgba(91, 58, 41, 0.5)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
