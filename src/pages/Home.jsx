import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Store,
  Star,
  Crown,
  Gem,
  Coffee,
} from 'lucide-react'
import { getProducts, getCategoryCounts } from '../lib/api'
import { PUBLIC_VISIBLE_STATUSES } from '../data/productStatuses'
import { categoryGroups, categories, formatEra } from '../data/demoProducts'
import ProductCard from '../components/public/ProductCard'
import VintageQuiz from '../components/public/VintageQuiz'
import { useCurrency } from '../lib/CurrencyContext'

const POPULAR_THRESHOLD = 100

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const HERO_SLIDES = [
  { id: 'branding', bg: '/images/bg-bronze.jpg', type: 'branding' },
  { id: 'promoted', bg: '/images/bg-silk.jpg', type: 'promoted' },
  { id: 'arrivals', bg: '/images/bg-wave.jpg', type: 'arrivals' },
]

const COLLECTIONS = [
  {
    id: 'ceramics',
    title: 'Фарфор и посуда',
    subtitle: 'Коллекция',
    description:
      'Мейсенский фарфор, богемское стекло, венский сервиз — каждый предмет хранит аромат торжественных ужинов прошлых столетий.',
    category: 'ceramics',
    gradient: 'linear-gradient(135deg, #1A1410 0%, #2C2218 50%, #1A1410 100%)',
    accent: '#C9A96E',
    icon: Coffee,
    images: ['/images/col-ceramics-1.jpg', '/images/col-ceramics-2.jpg'],
  },
  {
    id: 'jewelry',
    title: 'Винтажные украшения',
    subtitle: 'Коллекция',
    description:
      'Арт-деко броши, викторианские камеи, серебряные кулоны ручной работы — украшения с душой и историей.',
    category: 'jewelry',
    gradient: 'linear-gradient(135deg, #1A1014 0%, #2C1820 50%, #1A1014 100%)',
    accent: '#D4A574',
    icon: Gem,
    images: ['/images/col-jewelry-1.jpg', '/images/col-jewelry-2.jpg'],
  },
  {
    id: 'clothing',
    title: 'Винтажная мода',
    subtitle: 'Коллекция',
    description:
      'Шёлковые платья 50-х, кожаные куртки 70-х, дизайнерские находки прошлых десятилетий.',
    category: 'clothing',
    gradient: 'linear-gradient(135deg, #10140C 0%, #1C2218 50%, #10140C 100%)',
    accent: '#8B9E7A',
    icon: Crown,
    images: ['/images/col-fashion-1.jpg', '/images/col-fashion-2.jpg'],
  },
]

const SELLER_STEPS = [
  { num: '01', text: 'Зарегистрируйтесь и создайте профиль магазина' },
  { num: '02', text: 'Добавьте товары с фотографиями и описанием' },
  { num: '03', text: 'Получайте запросы от покупателей напрямую' },
]

/* Reviews are loaded dynamically from localStorage (managed via Admin → Отзывы) */
function readFeaturedReviews() {
  try {
    const raw = localStorage.getItem('vm_reviews')
    const all = raw ? JSON.parse(raw) : []
    return all
      .filter((r) => r.featured)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map((r) => ({
        id: r.id,
        name: r.name,
        rating: r.rating,
        quote: r.comment,
        instagram: r.instagram || '',
        whatsapp: r.whatsapp || '',
        telegram: r.telegram || '',
        productId: r.type === 'product' ? r.productId : '',
      }))
  } catch { return [] }
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function TestimonialCard({ testimonial }) {
  return (
    <div
      className="p-6 transition-all duration-500"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        border: '1px solid rgba(176, 141, 87, 0.1)',
        borderRadius: '2px',
      }}
    >
      <div className="flex items-center gap-1 mb-3">
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={14} fill={s <= testimonial.rating ? '#B08D57' : 'none'} stroke={s <= testimonial.rating ? '#B08D57' : 'rgba(44,36,32,0.2)'} />
        ))}
      </div>
      <p className="font-body text-sm leading-relaxed mb-4" style={{ color: 'rgba(44, 36, 32, 0.65)' }}>
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-sm font-medium" style={{ color: '#2C2420' }}>{testimonial.name}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {testimonial.instagram && (
              <a
                href={`https://instagram.com/${testimonial.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs transition-colors"
                style={{ color: '#B08D57' }}
              >
                @{testimonial.instagram}
              </a>
            )}
            {testimonial.telegram && (
              <a
                href={`https://t.me/${testimonial.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs transition-colors"
                style={{ color: '#0088cc' }}
              >
                TG
              </a>
            )}
            {testimonial.whatsapp && (
              <a
                href={`https://wa.me/${testimonial.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs transition-colors"
                style={{ color: '#25D366' }}
              >
                WA
              </a>
            )}
          </div>
        </div>
        {testimonial.productId && (
          <Link
            to={`/product/${testimonial.productId}`}
            className="font-body text-[10px] tracking-wider uppercase px-2 py-1 transition-all duration-300"
            style={{ color: 'rgba(44, 36, 32, 0.35)', border: '1px solid rgba(44, 36, 32, 0.1)', borderRadius: '2px' }}
          >
            Товар →
          </Link>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Vintage frame decorator                                            */
/* ------------------------------------------------------------------ */

function VintageFrame({ children }) {
  return (
    <div className="relative">
      <div className="absolute -inset-3 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-6 h-6" style={{ borderTop: '2px solid rgba(176, 141, 87, 0.2)', borderLeft: '2px solid rgba(176, 141, 87, 0.2)' }} />
        <div className="absolute top-0 right-0 w-6 h-6" style={{ borderTop: '2px solid rgba(176, 141, 87, 0.2)', borderRight: '2px solid rgba(176, 141, 87, 0.2)' }} />
        <div className="absolute bottom-0 left-0 w-6 h-6" style={{ borderBottom: '2px solid rgba(176, 141, 87, 0.2)', borderLeft: '2px solid rgba(176, 141, 87, 0.2)' }} />
        <div className="absolute bottom-0 right-0 w-6 h-6" style={{ borderBottom: '2px solid rgba(176, 141, 87, 0.2)', borderRight: '2px solid rgba(176, 141, 87, 0.2)' }} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Editor's Pick                                                      */
/* ------------------------------------------------------------------ */

function EditorsPickCard({ product }) {
  const { formatPrice } = useCurrency()
  if (!product) return null
  const category = categories.find(c => c.id === product.category)
  const imageUrl = product.image_url || product.images?.[0]?.url

  return (
    <VintageFrame>
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden"
        style={{ borderRadius: '2px', border: '1px solid rgba(176, 141, 87, 0.15)' }}
      >
        <Link
          to={`/product/${product.id}`}
          className="group relative aspect-[3/4] lg:aspect-auto overflow-hidden"
          style={{ backgroundColor: '#E0D4C0', minHeight: '360px' }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display text-4xl italic opacity-15" style={{ color: '#B08D57' }}>G</span>
            </div>
          )}
          <div className="absolute inset-4 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8" style={{ borderTop: '1px solid rgba(176, 141, 87, 0.3)', borderLeft: '1px solid rgba(176, 141, 87, 0.3)' }} />
            <div className="absolute bottom-0 right-0 w-8 h-8" style={{ borderBottom: '1px solid rgba(176, 141, 87, 0.3)', borderRight: '1px solid rgba(176, 141, 87, 0.3)' }} />
          </div>
        </Link>

        <div className="p-8 lg:p-12 flex flex-col justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
          <span className="font-body text-[10px] tracking-[0.5em] uppercase" style={{ color: 'rgba(176, 141, 87, 0.6)' }}>
            Выбор редакции
          </span>
          <h3 className="font-display text-3xl lg:text-4xl italic mt-3 leading-tight" style={{ color: '#0C0A08' }}>
            {product.title}
          </h3>

          {formatEra(product.era_start, product.era_end) && (
            <p className="font-body text-sm mt-2" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>
              {formatEra(product.era_start, product.era_end)}
            </p>
          )}

          <div className="w-10 h-px my-6" style={{ backgroundColor: 'rgba(176, 141, 87, 0.3)' }} />

          {product.description && (
            <p className="font-body text-sm leading-relaxed" style={{ color: 'rgba(44, 36, 32, 0.5)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {product.description}
            </p>
          )}

          {product.details && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.details.material && (
                <span className="font-body text-[10px] tracking-wider uppercase px-2.5 py-1" style={{ backgroundColor: 'rgba(176, 141, 87, 0.08)', color: '#B08D57', borderRadius: '1px' }}>
                  {product.details.material}
                </span>
              )}
              {product.details.hallmark && (
                <span className="font-body text-[10px] tracking-wider uppercase px-2.5 py-1" style={{ backgroundColor: 'rgba(176, 141, 87, 0.08)', color: '#B08D57', borderRadius: '1px' }}>
                  {product.details.hallmark}
                </span>
              )}
              {product.details.manufacturer && (
                <span className="font-body text-[10px] tracking-wider uppercase px-2.5 py-1" style={{ backgroundColor: 'rgba(176, 141, 87, 0.08)', color: '#B08D57', borderRadius: '1px' }}>
                  {product.details.manufacturer}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-6 mt-8">
            {product.price > 0 && (
              <span className="font-display text-2xl" style={{ color: '#B08D57' }}>
                {formatPrice(product.price)}
              </span>
            )}
            <Link
              to={`/product/${product.id}`}
              className="btn-primary text-sm py-2.5 px-6 group"
            >
              Подробнее
              <ArrowRight size={14} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </VintageFrame>
  )
}

/* ------------------------------------------------------------------ */
/*  Category row (horizontal scroll)                                   */
/* ------------------------------------------------------------------ */

function CategoryRow({ title, subtitle, products: rowProducts, link, bestsellerIds, popularIds }) {
  if (rowProducts.length === 0) return null

  return (
    <div className="mb-14">
      <div className="flex items-end justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-px" style={{ backgroundColor: '#B08D57' }} />
          <div>
            <span className="font-body text-[10px] tracking-[0.4em] uppercase" style={{ color: 'rgba(176, 141, 87, 0.5)' }}>
              {subtitle}
            </span>
            <h3 className="font-display text-2xl italic" style={{ color: '#0C0A08' }}>
              {title}
            </h3>
          </div>
        </div>
        <Link to={link} className="hidden md:inline-flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase transition-all group" style={{ color: '#B08D57' }}>
          Смотреть все <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="overflow-x-auto pb-4 -mx-2 px-2" style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex gap-5" style={{ width: 'max-content' }}>
          {rowProducts.map((product, i) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{ width: '260px', flexShrink: 0, scrollSnapAlign: 'start', animationDelay: `${i * 60}ms` }}
            >
              <ProductCard
                product={product}
                isBestseller={bestsellerIds?.has(product.id)}
                isPopular={popularIds?.has(product.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-4 md:hidden">
        <Link to={link} className="font-body text-xs tracking-[0.15em] uppercase" style={{ color: '#B08D57' }}>
          Смотреть все <ArrowRight size={12} className="inline ml-1" />
        </Link>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Product slider with arrows                                         */
/* ------------------------------------------------------------------ */

function ProductSlider({ products, bestsellerIds, popularIds }) {
  const [scrollRef, setScrollRef] = useState(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (!scrollRef) return
    setCanScrollLeft(scrollRef.scrollLeft > 10)
    setCanScrollRight(scrollRef.scrollLeft < scrollRef.scrollWidth - scrollRef.clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
  }, [scrollRef])

  const scroll = (dir) => {
    if (!scrollRef) return
    const amount = 280
    scrollRef.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
    setTimeout(checkScroll, 350)
  }

  return (
    <div className="relative group/slider">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover/slider:opacity-100"
          style={{
            backgroundColor: 'rgba(247, 242, 235, 0.95)',
            boxShadow: '0 2px 12px rgba(44, 36, 32, 0.15)',
            border: '1px solid rgba(176, 141, 87, 0.2)',
          }}
        >
          <ChevronLeft size={18} style={{ color: '#B08D57' }} />
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover/slider:opacity-100"
          style={{
            backgroundColor: 'rgba(247, 242, 235, 0.95)',
            boxShadow: '0 2px 12px rgba(44, 36, 32, 0.15)',
            border: '1px solid rgba(176, 141, 87, 0.2)',
          }}
        >
          <ChevronRight size={18} style={{ color: '#B08D57' }} />
        </button>
      )}

      <div
        ref={setScrollRef}
        onScroll={checkScroll}
        className="overflow-x-auto pb-4 -mx-2 px-2"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex gap-5" style={{ width: 'max-content' }}>
          {products.map((product, i) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{ width: '260px', flexShrink: 0, scrollSnapAlign: 'start', animationDelay: `${i * 60}ms` }}
            >
              <ProductCard
                product={product}
                isBestseller={bestsellerIds?.has(product.id)}
                isPopular={popularIds?.has(product.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()

  const [products, setProducts] = useState([])
  const [categoryCounts, setCategoryCounts] = useState({})
  const [productsLoading, setProductsLoading] = useState(true)
  const [jewelryProducts, setJewelryProducts] = useState([])
  const [ceramicsProducts, setCeramicsProducts] = useState([])

  const [activeSlide, setActiveSlide] = useState(0)
  const [slidePaused, setSlidePaused] = useState(false)
  const [activeCollection, setActiveCollection] = useState(0)

  // Dynamic reviews from Admin → Отзывы
  const featuredReviews = useMemo(() => readFeaturedReviews(), [])

  /* ---------- Data loading ---------- */

  useEffect(() => {
    ;(async () => {
      try {
        const [prodResult, countResult, jwResult, crResult] = await Promise.all([
          getProducts({ limit: 16 }),
          getCategoryCounts(),
          getProducts({ category: 'jewelry', limit: 8 }),
          getProducts({ category: 'ceramics', limit: 8 }),
        ])
        setProducts(
          (prodResult.data || []).filter((p) => PUBLIC_VISIBLE_STATUSES.includes(p.status)),
        )
        setCategoryCounts(countResult.data || {})
        setJewelryProducts((jwResult.data || []).filter((p) => PUBLIC_VISIBLE_STATUSES.includes(p.status)))
        setCeramicsProducts((crResult.data || []).filter((p) => PUBLIC_VISIBLE_STATUSES.includes(p.status)))
      } catch (e) {
        console.error('Home load error:', e)
      }
      setProductsLoading(false)
    })()
  }, [])

  /* ---------- Auto-rotate timers ---------- */

  useEffect(() => {
    if (slidePaused) return
    const id = setInterval(
      () => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length),
      6000,
    )
    return () => clearInterval(id)
  }, [slidePaused])

  useEffect(() => {
    const id = setInterval(
      () => setActiveCollection((prev) => (prev + 1) % COLLECTIONS.length),
      5000,
    )
    return () => clearInterval(id)
  }, [])

  /* ---------- Helpers ---------- */

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const hasAnyCounts = Object.keys(categoryCounts).length > 0

  const prevSlide = () =>
    setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  const nextSlide = () =>
    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)

  const promotedProducts = useMemo(
    () => products.filter((p) => p.is_promoted),
    [products],
  )
  const newestProducts = useMemo(
    () => [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4),
    [products],
  )

  const { bestsellerIds, popularIds } = useMemo(() => {
    const sorted = [...products].sort((a, b) => (b.views || 0) - (a.views || 0))
    const bIds = new Set(sorted.slice(0, 3).map((p) => p.id))
    const pIds = new Set(
      products
        .filter((p) => (p.views || 0) > POPULAR_THRESHOLD && !bIds.has(p.id))
        .map((p) => p.id),
    )
    return { bestsellerIds: bIds, popularIds: pIds }
  }, [products])

  const editorsPick = useMemo(() => {
    const promoted = products.filter(p => p.is_promoted)
    if (promoted.length > 0) {
      return promoted.sort((a, b) => (b.views || 0) - (a.views || 0))[0]
    }
    return [...products].sort((a, b) => (b.views || 0) - (a.views || 0))[0] || null
  }, [products])

  const gridProducts = useMemo(() => {
    const catIds = new Set([
      ...jewelryProducts.map(p => p.id),
      ...ceramicsProducts.map(p => p.id),
    ])
    return products.filter(p =>
      p.id !== editorsPick?.id && !catIds.has(p.id)
    )
  }, [products, editorsPick, jewelryProducts, ceramicsProducts])

  /* ---------- Render ---------- */

  return (
    <div className="page-enter">
      {/* ═══════════════ VINTAGE QUIZ ═══════════════ */}
      <VintageQuiz />

      {/* ═══════════════ HERO SLIDER ═══════════════ */}
      <section
        className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden"
        onMouseEnter={() => setSlidePaused(true)}
        onMouseLeave={() => setSlidePaused(false)}
      >
        {/* Backgrounds */}
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms]"
            style={{
              backgroundImage: `url(${slide.bg})`,
              opacity: activeSlide === i ? 1 : 0,
            }}
          />
        ))}

        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(12,10,8,0.45) 0%, rgba(12,10,8,0.65) 50%, rgba(12,10,8,0.92) 100%)',
          }}
        />

        {/* Vintage decorative frame */}
        <div className="absolute inset-8 md:inset-16 pointer-events-none z-[5]" style={{ border: '1px solid rgba(176, 141, 87, 0.06)', borderRadius: '2px' }}>
          <div className="absolute -top-px -left-px w-8 h-8" style={{ borderTop: '2px solid rgba(176, 141, 87, 0.15)', borderLeft: '2px solid rgba(176, 141, 87, 0.15)' }} />
          <div className="absolute -top-px -right-px w-8 h-8" style={{ borderTop: '2px solid rgba(176, 141, 87, 0.15)', borderRight: '2px solid rgba(176, 141, 87, 0.15)' }} />
          <div className="absolute -bottom-px -left-px w-8 h-8" style={{ borderBottom: '2px solid rgba(176, 141, 87, 0.15)', borderLeft: '2px solid rgba(176, 141, 87, 0.15)' }} />
          <div className="absolute -bottom-px -right-px w-8 h-8" style={{ borderBottom: '2px solid rgba(176, 141, 87, 0.15)', borderRight: '2px solid rgba(176, 141, 87, 0.15)' }} />
        </div>

        {/* Slide content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6" key={activeSlide}>
          {HERO_SLIDES[activeSlide].type === 'branding' && (
            <div className="text-center max-w-4xl mx-auto slide-content-enter">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-16 h-px" style={{ backgroundColor: 'rgba(176, 141, 87, 0.4)' }} />
                <span className="font-body text-[10px] tracking-[0.5em] uppercase" style={{ color: 'rgba(176, 141, 87, 0.6)' }}>
                  Вена &middot; Est. 2025
                </span>
                <div className="w-16 h-px" style={{ backgroundColor: 'rgba(176, 141, 87, 0.4)' }} />
              </div>
              <h1>
                <span className="block font-display text-6xl md:text-8xl lg:text-9xl tracking-[0.15em] uppercase" style={{ color: '#F0E6D6' }}>
                  Galerie
                </span>
                <span className="block font-display text-3xl md:text-5xl italic tracking-[0.1em] -mt-2 md:-mt-4" style={{ color: '#B08D57' }}>
                  du Temps
                </span>
              </h1>
              <p className="font-display text-lg md:text-xl italic mt-8 leading-relaxed max-w-xl mx-auto" style={{ color: 'rgba(240, 230, 214, 0.45)' }}>
                Винтаж, антиквариат и уникальные находки.<br />Маркетплейс для ценителей прекрасного.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                <Link to="/catalog" className="btn-primary group">
                  Каталог
                  <ArrowRight size={16} className="ml-3 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <button onClick={() => scrollTo('quiz')} className="btn-secondary group">
                  <Sparkles size={14} className="mr-2" /> Подобрать стиль
                </button>
              </div>
            </div>
          )}

          {HERO_SLIDES[activeSlide].type === 'promoted' && (
            <div className="text-center slide-content-enter">
              <span className="font-body text-[10px] tracking-[0.5em] uppercase" style={{ color: 'rgba(176, 141, 87, 0.5)' }}>
                Рекомендуем
              </span>
              <h2 className="font-display text-4xl md:text-5xl italic mt-3 mb-10" style={{ color: '#F0E6D6' }}>
                Избранные товары
              </h2>
              {promotedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {promotedProducts.slice(0, 3).map((p) => (
                    <Link key={p.id} to={`/product/${p.id}`} className="group text-left">
                      <div className="aspect-square overflow-hidden" style={{ borderRadius: '2px', border: '1px solid rgba(176, 141, 87, 0.15)' }}>
                        <img src={p.image_url || p.images?.[0]?.url} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                      </div>
                      <p className="font-display text-sm italic mt-3 truncate" style={{ color: '#F0E6D6' }}>{p.title}</p>
                      <p className="font-body text-xs mt-1" style={{ color: '#B08D57' }}>{formatPrice(p.price)}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="font-display text-lg italic" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>Скоро появятся</p>
              )}
              <Link to="/catalog" className="btn-primary mt-10 inline-flex items-center group">
                Весь каталог <ArrowRight size={14} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          )}

          {HERO_SLIDES[activeSlide].type === 'arrivals' && (
            <div className="text-center slide-content-enter">
              <span className="font-body text-[10px] tracking-[0.5em] uppercase" style={{ color: 'rgba(176, 141, 87, 0.5)' }}>
                Свежие поступления
              </span>
              <h2 className="font-display text-4xl md:text-5xl italic mt-3 mb-10" style={{ color: '#F0E6D6' }}>
                Новые поступления
              </h2>
              {newestProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {newestProducts.map((p) => (
                    <Link key={p.id} to={`/product/${p.id}`} className="group text-left">
                      <div className="aspect-[4/5] overflow-hidden" style={{ borderRadius: '2px', border: '1px solid rgba(176, 141, 87, 0.15)' }}>
                        <img src={p.image_url || p.images?.[0]?.url} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                      </div>
                      <p className="font-display text-sm italic mt-3 truncate" style={{ color: '#F0E6D6' }}>{p.title}</p>
                      <p className="font-body text-xs mt-1" style={{ color: '#B08D57' }}>{formatPrice(p.price)}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="font-display text-lg italic" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>Скоро появятся</p>
              )}
              <Link to="/catalog" className="btn-primary mt-10 inline-flex items-center group">
                Смотреть все <ArrowRight size={14} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>

        {/* Arrow navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{ backgroundColor: 'rgba(12, 10, 8, 0.4)', border: '1px solid rgba(176, 141, 87, 0.2)', borderRadius: '2px', color: 'rgba(176, 141, 87, 0.6)' }}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{ backgroundColor: 'rgba(12, 10, 8, 0.4)', border: '1px solid rgba(176, 141, 87, 0.2)', borderRadius: '2px', color: 'rgba(176, 141, 87, 0.6)' }}
        >
          <ChevronRight size={20} />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => setActiveSlide(i)}
              className="transition-all duration-500"
              style={{
                width: activeSlide === i ? '28px' : '6px',
                height: '2px',
                backgroundColor: activeSlide === i ? '#B08D57' : 'rgba(176, 141, 87, 0.3)',
                borderRadius: '1px',
              }}
            />
          ))}
        </div>

        {/* Scroll-down arrow */}
        <button
          onClick={() => scrollTo('products')}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-float z-20"
          style={{ color: 'rgba(176, 141, 87, 0.4)' }}
        >
          <ChevronDown size={24} />
        </button>
      </section>

      {/* ═══════════════ EDITOR'S PICK ═══════════════ */}
      <section id="products" className="pt-24 pb-12 relative overflow-hidden" style={{ backgroundColor: '#F7F2EB' }}>
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #B08D57 0.5px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {productsLoading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0" style={{ borderRadius: '2px', border: '1px solid rgba(44, 36, 32, 0.06)' }}>
                <div className="aspect-[3/4] lg:aspect-auto" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)', minHeight: '360px' }} />
                <div className="p-12 space-y-4" style={{ backgroundColor: 'rgba(44, 36, 32, 0.03)' }}>
                  <div className="h-3 w-24 rounded" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
                  <div className="h-8 w-3/4 rounded" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
                  <div className="h-4 w-1/2 rounded" style={{ backgroundColor: 'rgba(44, 36, 32, 0.04)' }} />
                </div>
              </div>
            </div>
          ) : (
            <EditorsPickCard product={editorsPick} />
          )}
        </div>
      </section>

      {/* ═══════════════ CATEGORY ROWS ═══════════════ */}
      <section className="py-12 relative overflow-hidden" style={{ backgroundColor: '#F7F2EB' }}>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {productsLoading ? (
            <div className="grid grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5]" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)', borderRadius: '2px' }} />
                  <div className="pt-4 space-y-2">
                    <div className="h-4 w-3/4 rounded" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
                    <div className="h-3 w-1/4 rounded" style={{ backgroundColor: 'rgba(44, 36, 32, 0.04)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <CategoryRow
                title="Ювелирная коллекция"
                subtitle="Украшения"
                products={jewelryProducts}
                link="/catalog/jewelry"
                bestsellerIds={bestsellerIds}
                popularIds={popularIds}
              />
              <CategoryRow
                title="Фарфор и посуда"
                subtitle="Керамика"
                products={ceramicsProducts}
                link="/catalog/ceramics"
                bestsellerIds={bestsellerIds}
                popularIds={popularIds}
              />
            </>
          )}
        </div>
      </section>

      {/* ═══════════════ STAGGERED GRID ═══════════════ */}
      {!productsLoading && gridProducts.length > 0 && (
        <section className="pb-24 relative overflow-hidden" style={{ backgroundColor: '#F7F2EB' }}>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="font-body text-[10px] tracking-[0.5em] uppercase" style={{ color: 'rgba(176, 141, 87, 0.6)' }}>
                  Каталог
                </span>
                <h2 className="font-display text-4xl md:text-5xl italic mt-3" style={{ color: '#0C0A08' }}>
                  Ещё находки
                </h2>
              </div>
              <Link
                to="/catalog"
                className="hidden md:inline-flex items-center gap-2 font-body text-sm tracking-[0.1em] uppercase transition-all duration-300 group"
                style={{ color: '#B08D57' }}
              >
                Все товары
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Single-row slider */}
            {gridProducts.length > 0 && (
              <ProductSlider
                products={gridProducts}
                bestsellerIds={bestsellerIds}
                popularIds={popularIds}
              />
            )}

            <div className="text-center mt-12 md:hidden">
              <Link to="/catalog" className="btn-secondary">
                Все товары <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ CURATED COLLECTIONS ═══════════════ */}
      <section id="collections" className="py-24" style={{ backgroundColor: '#0C0A08' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span
              className="font-body text-[10px] tracking-[0.5em] uppercase"
              style={{ color: 'rgba(176, 141, 87, 0.4)' }}
            >
              Курированные
            </span>
            <h2
              className="font-display text-4xl md:text-5xl italic mt-4"
              style={{ color: '#F0E6D6' }}
            >
              Коллекции
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {COLLECTIONS.map((col, i) => {
              const Icon = col.icon
              const isActive = activeCollection === i
              return (
                <Link
                  key={col.id}
                  to={`/catalog/${col.category}`}
                  className="group relative overflow-hidden transition-all duration-700"
                  style={{
                    background: col.gradient,
                    border: `1px solid ${isActive ? col.accent + '40' : 'rgba(176, 141, 87, 0.08)'}`,
                    borderRadius: '2px',
                    minHeight: '380px',
                  }}
                  onMouseEnter={() => setActiveCollection(i)}
                >
                  <div
                    className="absolute top-0 right-0 w-1/2 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                      background: `radial-gradient(ellipse at 80% 30%, ${col.accent}15, transparent 70%)`,
                    }}
                  />

                  <div className="relative z-10 p-8 flex flex-col h-full">
                    <div
                      className="w-12 h-12 rounded flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110"
                      style={{
                        backgroundColor: `${col.accent}15`,
                        border: `1px solid ${col.accent}25`,
                      }}
                    >
                      <Icon size={20} style={{ color: col.accent }} />
                    </div>

                    <span
                      className="font-body text-[9px] tracking-[0.4em] uppercase mb-2"
                      style={{ color: `${col.accent}80` }}
                    >
                      {col.subtitle}
                    </span>

                    <h3 className="font-display text-2xl italic mb-4" style={{ color: '#F0E6D6' }}>
                      {col.title}
                    </h3>

                    <div
                      className="w-10 h-px mb-4 transition-all duration-500 group-hover:w-16"
                      style={{ backgroundColor: `${col.accent}40` }}
                    />

                    <p
                      className="font-body text-sm leading-relaxed flex-1"
                      style={{ color: 'rgba(240, 230, 214, 0.3)' }}
                    >
                      {col.description}
                    </p>

                    <div
                      className="flex items-center gap-2 mt-6 font-body text-xs tracking-[0.1em] uppercase transition-all duration-300 group-hover:gap-3"
                      style={{ color: col.accent }}
                    >
                      Смотреть
                      <ArrowRight
                        size={12}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ CATEGORIES ═══════════════ */}
      <section className="py-24 relative" style={{ backgroundColor: '#0C0A08' }}>
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-48 h-48 opacity-[0.05] pointer-events-none" style={{ background: 'radial-gradient(circle at top left, #B08D57, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-48 h-48 opacity-[0.05] pointer-events-none" style={{ background: 'radial-gradient(circle at bottom right, #B08D57, transparent 70%)' }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span
              className="font-body text-[10px] tracking-[0.5em] uppercase"
              style={{ color: 'rgba(176, 141, 87, 0.4)' }}
            >
              Направления
            </span>
            <h2
              className="font-display text-4xl md:text-5xl italic mt-4"
              style={{ color: '#F0E6D6' }}
            >
              Категории
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories
              .filter((c) => !hasAnyCounts || categoryCounts[c.id] > 0)
              .slice(0, 10)
              .map((cat, i) => (
                <Link
                  key={cat.id}
                  to={`/catalog/${cat.id}`}
                  className="group p-6 text-center transition-all duration-500 animate-slide-up"
                  style={{
                    border: '1px solid rgba(176, 141, 87, 0.08)',
                    borderRadius: '2px',
                    animationDelay: `${i * 60}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.3)'
                    e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.03)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.08)'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <h3 className="font-display text-sm italic" style={{ color: '#F0E6D6' }}>
                    {cat.name}
                  </h3>
                  {hasAnyCounts && categoryCounts[cat.id] > 0 && (
                    <span
                      className="font-body text-[10px] mt-1 block"
                      style={{ color: 'rgba(176, 141, 87, 0.4)' }}
                    >
                      {categoryCounts[cat.id]} товаров
                    </span>
                  )}
                </Link>
              ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/catalog" className="btn-secondary">
              Все категории <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <div className="gdt-divider" />

      {/* ═══════════════ BECOME A SELLER ═══════════════ */}
      {/* Hidden until full functionality is implemented */}
      {false && <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#F7F2EB' }}>
        <div
          className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #B08D57, transparent)',
            transform: 'translate(-30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, #B08D57, transparent)',
            transform: 'translate(30%, 30%)',
          }}
        />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <span
                className="font-body text-[10px] tracking-[0.5em] uppercase"
                style={{ color: 'rgba(176, 141, 87, 0.6)' }}
              >
                Для продавцов
              </span>
              <h2
                className="font-display text-4xl md:text-5xl italic mt-4 leading-tight"
                style={{ color: '#0C0A08' }}
              >
                Откройте свой
                <br />
                <span style={{ color: '#B08D57' }}>магазин</span>
              </h2>
              <div className="w-12 h-px mt-6 mb-6" style={{ backgroundColor: '#B08D57' }} />
              <p
                className="font-body text-base leading-relaxed"
                style={{ color: 'rgba(44, 36, 32, 0.5)' }}
              >
                Присоединяйтесь к сообществу ценителей винтажа. Создайте свой магазин за
                пару минут и начните продавать уникальные вещи покупателям по всему миру.
              </p>

              <div className="mt-10 space-y-5">
                {SELLER_STEPS.map((step) => (
                  <div key={step.num} className="flex items-start gap-4">
                    <span
                      className="font-display text-xl italic flex-shrink-0"
                      style={{ color: '#B08D57' }}
                    >
                      {step.num}
                    </span>
                    <p
                      className="font-body text-sm pt-1"
                      style={{ color: 'rgba(44, 36, 32, 0.5)' }}
                    >
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-10">
                <Link to="/seller/register" className="btn-primary group">
                  <Store size={14} className="mr-2" /> Создать магазин
                  <ArrowRight
                    size={14}
                    className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>

            {/* Visual (fake shop preview) */}
            <div className="relative">
              <div
                className="p-8 relative"
                style={{
                  backgroundColor: 'rgba(12, 10, 8, 0.03)',
                  border: '1px solid rgba(176, 141, 87, 0.12)',
                  borderRadius: '2px',
                }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-14 h-14 rounded flex items-center justify-center font-display text-xl"
                    style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)', color: '#B08D57' }}
                  >
                    V
                  </div>
                  <div>
                    <p className="font-display text-lg italic" style={{ color: '#0C0A08' }}>
                      Vintage Corner
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} fill="#B08D57" style={{ color: '#B08D57' }} />
                      ))}
                      <span
                        className="font-body text-[10px] ml-1"
                        style={{ color: 'rgba(44, 36, 32, 0.3)' }}
                      >
                        4.7
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="aspect-square"
                      style={{ backgroundColor: 'rgba(176, 141, 87, 0.06)', borderRadius: '2px' }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: 'rgba(176, 141, 87, 0.08)' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="font-body text-xs" style={{ color: 'rgba(44, 36, 32, 0.25)' }}>
                    12 товаров
                  </span>
                  <span className="font-body text-xs" style={{ color: 'rgba(176, 141, 87, 0.4)' }}>
                    Нашмаркт, Вена
                  </span>
                </div>
              </div>

              <div
                className="absolute -bottom-3 -right-3 w-full h-full -z-10"
                style={{ border: '1px solid rgba(176, 141, 87, 0.08)', borderRadius: '2px' }}
              />
            </div>
          </div>
        </div>
      </section>}

      {/* Testimonials (dynamic from Admin → Отзывы) */}
      {featuredReviews.length > 0 && (
      <section className="py-20 px-6" style={{ backgroundColor: '#F7F2EB' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-body text-[11px] tracking-[0.3em] uppercase mb-3" style={{ color: '#B08D57' }}>
              Отзывы клиентов
            </p>
            <h2 className="font-display text-3xl md:text-4xl" style={{ color: '#0C0A08' }}>
              Что говорят наши покупатели
            </h2>
            <div className="w-16 h-px mx-auto mt-4" style={{ backgroundColor: '#B08D57' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredReviews.slice(0, 3).map(t => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
          {featuredReviews.length > 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-4xl mx-auto">
            {featuredReviews.slice(3).map(t => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
          )}
        </div>
      </section>
      )}

      {/* ═══════════════ BRAND STORY ═══════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#1A1410' }}>
        <div
          className="absolute top-0 right-0 w-1/2 h-full opacity-10"
          style={{
            background:
              'radial-gradient(ellipse at 70% 50%, rgba(176, 141, 87, 0.3), transparent 70%)',
          }}
        />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="w-12 h-px mx-auto mb-10" style={{ backgroundColor: 'rgba(176, 141, 87, 0.3)' }} />
          <blockquote
            className="font-display text-2xl md:text-4xl italic leading-relaxed"
            style={{ color: 'rgba(240, 230, 214, 0.7)' }}
          >
            &laquo;Время не уничтожает красоту &mdash;
            <br className="hidden md:block" />
            оно придаёт ей глубину&raquo;
          </blockquote>
          <div className="w-12 h-px mx-auto mt-10 mb-6" style={{ backgroundColor: 'rgba(176, 141, 87, 0.3)' }} />
          <p
            className="font-body text-xs tracking-[0.3em] uppercase"
            style={{ color: 'rgba(176, 141, 87, 0.4)' }}
          >
            Galerie du Temps &middot; Вена
          </p>
        </div>
      </section>
    </div>
  )
}
