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
import { categoryGroups, categories } from '../data/demoProducts'
import ProductCard from '../components/public/ProductCard'

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

const QUIZ_STEPS = [
  {
    question: 'Какая эпоха вас вдохновляет?',
    options: [
      { label: '1920-1940', tag: 'art-deco', icon: '✨', desc: 'Арт-деко, гламур, геометрия' },
      { label: '1950-1960', tag: 'mid-century', icon: '🪑', desc: 'Модернизм, элегантность, простота' },
      { label: '1970-1980', tag: 'retro', icon: '🎵', desc: 'Бохо, диско, свобода' },
      { label: '1990+', tag: 'modern-vintage', icon: '📷', desc: 'Минимализм, ностальгия, Y2K' },
    ],
  },
  {
    question: 'Что вы ищете?',
    options: [
      { label: 'Для дома', tag: 'home', icon: '🏡', desc: 'Мебель, декор, посуда' },
      { label: 'Для себя', tag: 'personal', icon: '👗', desc: 'Одежда, украшения, аксессуары' },
      { label: 'Коллекционирование', tag: 'collect', icon: '🏺', desc: 'Редкости, искусство, книги' },
      { label: 'Подарок', tag: 'gift', icon: '🎁', desc: 'Уникальные вещи для близких' },
    ],
  },
  {
    question: 'Ваш бюджет?',
    options: [
      { label: 'До 50€', tag: 'budget-low', icon: '💰' },
      { label: '50-200€', tag: 'budget-mid', icon: '💎' },
      { label: '200-500€', tag: 'budget-high', icon: '👑' },
      { label: '500€+', tag: 'budget-premium', icon: '🌟' },
    ],
  },
]

const QUIZ_RESULTS = {
  'art-deco+home': { title: 'Арт-деко интерьер', categories: ['furniture', 'ceramics', 'art'], desc: 'Геометрические формы, золото, чёрный мрамор' },
  'art-deco+personal': { title: 'Гэтсби стиль', categories: ['jewelry', 'accessories', 'clothing'], desc: 'Блеск, перья, длинные жемчужные нити' },
  'mid-century+home': { title: 'Скандинавский модерн', categories: ['furniture', 'ceramics'], desc: 'Чистые линии, натуральные материалы' },
  'mid-century+personal': { title: 'Классическая элегантность', categories: ['clothing', 'accessories'], desc: 'Шанель, Диор, вневременная мода' },
  'retro+home': { title: 'Бохо-шик', categories: ['furniture', 'art', 'ceramics'], desc: 'Текстуры, паттерны, тёплые тона' },
  'retro+personal': { title: 'Свободный стиль 70-х', categories: ['clothing', 'vinyl', 'accessories'], desc: 'Замша, бахрома, рок-н-ролл' },
  default: { title: 'Винтажный микс', categories: ['clothing', 'jewelry', 'furniture', 'ceramics'], desc: 'Лучшее из каждой эпохи' },
}

const SELLER_STEPS = [
  { num: '01', text: 'Зарегистрируйтесь и создайте профиль магазина' },
  { num: '02', text: 'Добавьте товары с фотографиями и описанием' },
  { num: '03', text: 'Получайте запросы от покупателей напрямую' },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [categoryCounts, setCategoryCounts] = useState({})
  const [productsLoading, setProductsLoading] = useState(true)

  const [activeSlide, setActiveSlide] = useState(0)
  const [slidePaused, setSlidePaused] = useState(false)
  const [activeCollection, setActiveCollection] = useState(0)

  // Quiz: -1 = not started, 0..2 = question index, 3 = results
  const [quizStep, setQuizStep] = useState(-1)
  const [quizAnswers, setQuizAnswers] = useState([])
  const [quizResult, setQuizResult] = useState(null)

  /* ---------- Data loading ---------- */

  useEffect(() => {
    ;(async () => {
      try {
        const [prodResult, countResult] = await Promise.all([
          getProducts({}),
          getCategoryCounts(),
        ])
        setProducts(
          (prodResult.data || []).filter((p) => p.status !== 'sold').slice(0, 8),
        )
        setCategoryCounts(countResult.data || {})
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
    if (quizStep >= 0) return
    const id = setInterval(
      () => setActiveCollection((prev) => (prev + 1) % COLLECTIONS.length),
      5000,
    )
    return () => clearInterval(id)
  }, [quizStep])

  /* ---------- Helpers ---------- */

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const handleQuizAnswer = (option) => {
    const answers = [...quizAnswers, option.tag]
    setQuizAnswers(answers)

    if (quizStep < QUIZ_STEPS.length - 1) {
      setQuizStep(quizStep + 1)
    } else {
      const key = `${answers[0] || 'default'}+${answers[1] || 'home'}`
      setQuizResult(QUIZ_RESULTS[key] || QUIZ_RESULTS.default)
      setQuizStep(QUIZ_STEPS.length)
    }
  }

  const resetQuiz = () => {
    setQuizStep(-1)
    setQuizAnswers([])
    setQuizResult(null)
  }

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

  /* ---------- Render ---------- */

  return (
    <div className="page-enter">
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
                <Link to="/seller/register" className="btn-light group">
                  <Store size={14} className="mr-2" /> Открыть магазин
                </Link>
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
                      <p className="font-body text-xs mt-1" style={{ color: '#B08D57' }}>{p.price}&euro;</p>
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
                      <p className="font-body text-xs mt-1" style={{ color: '#B08D57' }}>{p.price}&euro;</p>
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

      {/* ═══════════════ FEATURED PRODUCTS ═══════════════ */}
      <section id="products" className="py-24 relative overflow-hidden" style={{ backgroundColor: '#F7F2EB' }}>
        {/* Vintage dot overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #B08D57 0.5px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span
                className="font-body text-[10px] tracking-[0.5em] uppercase"
                style={{ color: 'rgba(176, 141, 87, 0.6)' }}
              >
                Каталог
              </span>
              <h2
                className="font-display text-4xl md:text-5xl italic mt-3"
                style={{ color: '#0C0A08' }}
              >
                Новые поступления
              </h2>
            </div>
            <Link
              to="/catalog"
              className="hidden md:inline-flex items-center gap-2 font-body text-sm tracking-[0.1em] uppercase transition-all duration-300 group"
              style={{ color: '#B08D57' }}
            >
              Все товары
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div
                    className="aspect-[4/5]"
                    style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)', borderRadius: '2px' }}
                  />
                  <div className="p-4 space-y-2">
                    <div
                      className="h-4 w-3/4 rounded"
                      style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }}
                    />
                    <div
                      className="h-3 w-1/4 rounded"
                      style={{ backgroundColor: 'rgba(44, 36, 32, 0.04)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <ProductCard
                    product={product}
                    isBestseller={bestsellerIds.has(product.id)}
                    isPopular={popularIds.has(product.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-display text-xl italic" style={{ color: 'rgba(12, 10, 8, 0.25)' }}>
                Коллекция скоро появится
              </p>
            </div>
          )}

          <div className="text-center mt-12 md:hidden">
            <Link to="/catalog" className="btn-secondary">
              Все товары <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

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

      <div className="gdt-divider" />

      {/* ═══════════════ STYLE QUIZ ═══════════════ */}
      <section id="quiz" className="py-24 relative overflow-hidden" style={{ backgroundColor: '#F7F2EB' }}>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, #2C2420 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <span
              className="font-body text-[10px] tracking-[0.5em] uppercase"
              style={{ color: 'rgba(176, 141, 87, 0.6)' }}
            >
              Интерактив
            </span>
            <h2
              className="font-display text-4xl md:text-5xl italic mt-4"
              style={{ color: '#0C0A08' }}
            >
              Найдите свой стиль
            </h2>
            <p className="font-display text-lg italic mt-3" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>
              Пройдите короткий квиз и получите персональные рекомендации
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Start screen */}
            {quizStep === -1 && (
              <div
                className="text-center p-12"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(176, 141, 87, 0.15)',
                  borderRadius: '2px',
                }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{
                    backgroundColor: 'rgba(176, 141, 87, 0.08)',
                    border: '1px solid rgba(176, 141, 87, 0.15)',
                  }}
                >
                  <Sparkles size={28} style={{ color: '#B08D57' }} />
                </div>
                <h3 className="font-display text-2xl italic mb-3" style={{ color: '#0C0A08' }}>
                  3 вопроса — 30 секунд
                </h3>
                <p className="font-body text-sm mb-8" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
                  Мы подберём коллекцию специально для вас
                </p>
                <button onClick={() => setQuizStep(0)} className="btn-primary">
                  <Sparkles size={14} className="mr-2" /> Начать квиз
                </button>
              </div>
            )}

            {/* Question */}
            {quizStep >= 0 && quizStep < QUIZ_STEPS.length && (
              <div
                className="p-8 md:p-12"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(176, 141, 87, 0.15)',
                  borderRadius: '2px',
                }}
              >
                {/* Progress bar */}
                <div className="flex items-center gap-2 mb-8">
                  {QUIZ_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all duration-500"
                      style={{
                        backgroundColor:
                          i <= quizStep ? '#B08D57' : 'rgba(176, 141, 87, 0.15)',
                      }}
                    />
                  ))}
                </div>

                <p
                  className="font-body text-[10px] tracking-[0.3em] uppercase mb-3"
                  style={{ color: 'rgba(176, 141, 87, 0.5)' }}
                >
                  Вопрос {quizStep + 1} из {QUIZ_STEPS.length}
                </p>

                <h3 className="font-display text-2xl italic mb-8" style={{ color: '#0C0A08' }}>
                  {QUIZ_STEPS[quizStep].question}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUIZ_STEPS[quizStep].options.map((opt) => (
                    <button
                      key={opt.tag}
                      onClick={() => handleQuizAnswer(opt)}
                      className="group p-5 text-left transition-all duration-300"
                      style={{
                        backgroundColor: 'rgba(240, 230, 214, 0.3)',
                        border: '1px solid rgba(176, 141, 87, 0.1)',
                        borderRadius: '2px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.4)'
                        e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.08)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.1)'
                        e.currentTarget.style.backgroundColor = 'rgba(240, 230, 214, 0.3)'
                      }}
                    >
                      <span className="text-2xl block mb-2">{opt.icon}</span>
                      <span className="font-display text-lg italic block" style={{ color: '#0C0A08' }}>
                        {opt.label}
                      </span>
                      {opt.desc && (
                        <span
                          className="font-body text-xs block mt-1"
                          style={{ color: 'rgba(44, 36, 32, 0.35)' }}
                        >
                          {opt.desc}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {quizResult && quizStep >= QUIZ_STEPS.length && (
              <div
                className="p-8 md:p-12"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(176, 141, 87, 0.15)',
                  borderRadius: '2px',
                }}
              >
                <div className="text-center mb-8">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{
                      backgroundColor: 'rgba(176, 141, 87, 0.1)',
                      border: '1px solid rgba(176, 141, 87, 0.2)',
                    }}
                  >
                    <Star size={24} style={{ color: '#B08D57' }} />
                  </div>
                  <p
                    className="font-body text-[10px] tracking-[0.3em] uppercase mb-2"
                    style={{ color: 'rgba(176, 141, 87, 0.5)' }}
                  >
                    Ваш стиль
                  </p>
                  <h3 className="font-display text-3xl italic" style={{ color: '#0C0A08' }}>
                    {quizResult.title}
                  </h3>
                  <p className="font-body text-sm mt-2" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
                    {quizResult.desc}
                  </p>
                </div>

                <p
                  className="font-body text-[10px] tracking-[0.2em] uppercase mb-4 text-center"
                  style={{ color: 'rgba(44, 36, 32, 0.3)' }}
                >
                  Рекомендованные категории
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {quizResult.categories.map((catId) => {
                    const cat = categories.find((c) => c.id === catId)
                    if (!cat) return null
                    return (
                      <Link
                        key={catId}
                        to={`/catalog/${catId}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 transition-all duration-300"
                        style={{
                          backgroundColor: 'rgba(176, 141, 87, 0.08)',
                          border: '1px solid rgba(176, 141, 87, 0.15)',
                          borderRadius: '2px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#B08D57'
                          e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.15)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.15)'
                          e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.08)'
                        }}
                      >
                        <span>{cat.icon}</span>
                        <span className="font-body text-sm" style={{ color: '#0C0A08' }}>
                          {cat.name}
                        </span>
                      </Link>
                    )
                  })}
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Link to="/catalog" className="btn-primary text-sm py-2.5 px-6">
                    В каталог <ArrowRight size={12} className="ml-2" />
                  </Link>
                  <button onClick={resetQuiz} className="btn-secondary text-sm py-2.5 px-6">
                    Пройти заново
                  </button>
                </div>
              </div>
            )}
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
                  <span className="text-3xl block mb-3">{cat.icon}</span>
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
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#F7F2EB' }}>
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
                <Link to="/shops" className="btn-secondary">
                  Все магазины
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
                  {['🏺', '💎', '👗'].map((emoji, i) => (
                    <div
                      key={i}
                      className="aspect-square"
                      style={{ backgroundColor: 'rgba(176, 141, 87, 0.06)', borderRadius: '2px' }}
                    >
                      <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">
                        {emoji}
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
      </section>

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
