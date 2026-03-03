import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { getProducts, getCategoryCounts } from '../lib/api'
import { categoryGroups, categories } from '../data/demoProducts'
import ProductCard from '../components/public/ProductCard'

// Background images — user places these in /public/images/
const heroBGs = [
  '/images/bg-bronze.jpg',   // Bronze metallic flow
  '/images/bg-silk.jpg',     // Pearl silk texture
  '/images/bg-wave.jpg',     // White sculptural waves
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [categoryCounts, setCategoryCounts] = useState({})
  const [activeBG, setActiveBG] = useState(0)
  const heroRef = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        const [prodResult, countResult] = await Promise.all([
          getProducts({}),
          getCategoryCounts(),
        ])
        setProducts((prodResult.data || []).filter(p => p.status === 'active').slice(0, 8))
        setCategoryCounts(countResult.data || {})
      } catch (e) { console.error(e) }
    }
    load()
  }, [])

  // Cycle hero backgrounds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBG(prev => (prev + 1) % heroBGs.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const scrollToContent = () => {
    const el = document.getElementById('collection')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="page-enter">
      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* BG Images with crossfade */}
        {heroBGs.map((bg, i) => (
          <div
            key={bg}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms]"
            style={{
              backgroundImage: `url(${bg})`,
              opacity: activeBG === i ? 1 : 0,
            }}
          />
        ))}

        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(12,10,8,0.5) 0%, rgba(12,10,8,0.7) 50%, rgba(12,10,8,0.9) 100%)' }} />

        {/* Content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="w-16 h-px" style={{ backgroundColor: 'rgba(176, 141, 87, 0.4)' }} />
            <span className="font-body text-[10px] tracking-[0.5em] uppercase" style={{ color: 'rgba(176, 141, 87, 0.6)' }}>
              Вена &middot; Est. 2025
            </span>
            <div className="w-16 h-px" style={{ backgroundColor: 'rgba(176, 141, 87, 0.4)' }} />
          </div>

          {/* Main Title */}
          <h1 className="animate-slide-up" style={{ animationDelay: '400ms' }}>
            <span className="block font-display text-6xl md:text-8xl lg:text-9xl tracking-[0.15em] uppercase"
              style={{ color: '#F0E6D6' }}>
              Galerie
            </span>
            <span className="block font-display text-3xl md:text-5xl italic tracking-[0.1em] -mt-2 md:-mt-4"
              style={{ color: '#B08D57' }}>
              du Temps
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-display text-lg md:text-xl italic mt-8 leading-relaxed animate-slide-up max-w-xl mx-auto"
            style={{ color: 'rgba(240, 230, 214, 0.45)', animationDelay: '600ms' }}>
            Каждая вещь — это путешествие сквозь время.
            Винтаж, антиквариат и уникальные находки.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-6 mt-12 animate-slide-up" style={{ animationDelay: '800ms' }}>
            <Link to="/catalog" className="btn-primary group">
              Коллекция
              <ArrowRight size={16} className="ml-3 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link to="/about" className="btn-secondary">
              О галерее
            </Link>
          </div>

          {/* BG indicator dots */}
          <div className="flex items-center justify-center gap-2 mt-16 animate-fade-in" style={{ animationDelay: '1000ms' }}>
            {heroBGs.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveBG(i)}
                className="transition-all duration-500"
                style={{
                  width: activeBG === i ? '24px' : '6px',
                  height: '2px',
                  backgroundColor: activeBG === i ? '#B08D57' : 'rgba(176, 141, 87, 0.3)',
                  borderRadius: '1px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <button onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float"
          style={{ color: 'rgba(176, 141, 87, 0.4)' }}>
          <ChevronDown size={24} />
        </button>
      </section>

      {/* ═══ CATEGORY GROUPS ═══ */}
      <section className="py-24" style={{ backgroundColor: '#0C0A08' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-body text-[10px] tracking-[0.5em] uppercase" style={{ color: 'rgba(176, 141, 87, 0.4)' }}>
              Направления
            </span>
            <h2 className="font-display text-4xl md:text-5xl italic mt-4" style={{ color: '#F0E6D6' }}>
              Что мы предлагаем
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryGroups
              .filter(group => categories.filter(c => c.group === group.id).some(c => categoryCounts[c.id] > 0))
              .map((group, i) => {
              const groupCats = categories.filter(c => c.group === group.id && categoryCounts[c.id] > 0)
              return (
                <Link
                  key={group.id}
                  to={`/catalog/${groupCats[0]?.id || ''}`}
                  className="group p-8 text-center transition-all duration-500 animate-slide-up"
                  style={{
                    border: '1px solid rgba(176, 141, 87, 0.1)',
                    borderRadius: '2px',
                    animationDelay: `${i * 120}ms`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.3)'
                    e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.03)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.1)'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <span className="text-4xl block mb-4">{group.icon}</span>
                  <h3 className="font-display text-xl italic mb-3" style={{ color: '#F0E6D6' }}>
                    {group.name}
                  </h3>
                  <div className="w-8 h-px mx-auto mb-3" style={{ backgroundColor: 'rgba(176, 141, 87, 0.3)' }} />
                  <p className="font-body text-xs leading-relaxed" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>
                    {groupCats.map(c => c.name).join(' · ')}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ GOLD DIVIDER ═══ */}
      <div className="gdt-divider" />

      {/* ═══ FEATURED PRODUCTS ═══ */}
      <section id="collection" className="py-24" style={{ backgroundColor: '#F7F2EB' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="font-body text-[10px] tracking-[0.5em] uppercase" style={{ color: 'rgba(176, 141, 87, 0.6)' }}>
                Избранное
              </span>
              <h2 className="font-display text-4xl md:text-5xl italic mt-3" style={{ color: '#0C0A08' }}>
                Новые поступления
              </h2>
            </div>
            <Link to="/catalog" className="hidden md:inline-flex items-center gap-2 font-body text-sm tracking-[0.1em] uppercase transition-all duration-300 group"
              style={{ color: '#B08D57' }}>
              Вся коллекция
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-display text-xl italic" style={{ color: 'rgba(12, 10, 8, 0.25)' }}>
                Загрузка коллекции...
              </p>
            </div>
          )}

          <div className="text-center mt-12 md:hidden">
            <Link to="/catalog" className="btn-secondary">
              Вся коллекция <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ BRAND STORY ═══ */}
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#1A1410' }}>
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10"
          style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(176, 141, 87, 0.3), transparent 70%)' }} />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="w-12 h-px mx-auto mb-10" style={{ backgroundColor: 'rgba(176, 141, 87, 0.3)' }} />

          <blockquote className="font-display text-2xl md:text-4xl italic leading-relaxed"
            style={{ color: 'rgba(240, 230, 214, 0.7)' }}>
            &laquo;Время не уничтожает красоту &mdash;
            <br className="hidden md:block" />
            оно придаёт ей глубину&raquo;
          </blockquote>

          <div className="w-12 h-px mx-auto mt-10 mb-6" style={{ backgroundColor: 'rgba(176, 141, 87, 0.3)' }} />

          <p className="font-body text-xs tracking-[0.3em] uppercase" style={{ color: 'rgba(176, 141, 87, 0.4)' }}>
            Galerie du Temps &middot; Вена
          </p>
        </div>
      </section>
    </div>
  )
}
