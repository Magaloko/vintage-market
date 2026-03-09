import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, Crown, Gem, Coffee, Music, Palette, Heart,
  Globe, Armchair, Shirt, Watch, BookOpen, ArrowRight,
  RotateCcw, ChevronRight, X,
} from 'lucide-react'
import { getProducts } from '../../lib/api'
import { categories } from '../../data/demoProducts'
import ProductCard from './ProductCard'

/* ================================================================== */
/*  QUIZ DATA                                                          */
/* ================================================================== */

const QUIZ_QUESTIONS = [
  {
    id: 'lifestyle',
    question: 'Что вас привлекает больше всего?',
    subtitle: 'Ваш стиль жизни',
    options: [
      { id: 'elegant',   label: 'Изысканные вечера',        icon: Crown,    cats: ['jewelry', 'accessories', 'costume_jewelry'], era: 'art-deco' },
      { id: 'cozy',      label: 'Уютный дом',               icon: Coffee,   cats: ['furniture', 'ceramics', 'cutlery'],         era: 'mid-century' },
      { id: 'travel',    label: 'Путешествия и свобода',     icon: Globe,    cats: ['accessories', 'clothing', 'vinyl'],         era: 'retro' },
      { id: 'creative',  label: 'Творчество и вдохновение',  icon: Palette,  cats: ['art', 'books', 'collectibles'],             era: 'modern' },
    ],
  },
  {
    id: 'era',
    question: 'Какая эпоха вам ближе?',
    subtitle: 'Машина времени',
    options: [
      { id: 'art-deco',    label: '1920–1940 Арт-деко',      icon: Gem,      cats: ['jewelry', 'art', 'ceramics'],                era: 'art-deco' },
      { id: 'mid-century', label: '1950–1960 Мид-сенчури',    icon: Armchair, cats: ['furniture', 'ceramics', 'cutlery'],         era: 'mid-century' },
      { id: 'retro',       label: '1970–1980 Ретро',          icon: Music,    cats: ['vinyl', 'clothing', 'accessories'],         era: 'retro' },
      { id: 'modern',      label: '1990+ Модерн-винтаж',      icon: Sparkles, cats: ['electronics', 'collectibles', 'clothing'], era: 'modern' },
    ],
  },
  {
    id: 'material',
    question: 'Какая текстура вам ближе?',
    subtitle: 'Чувство прекрасного',
    options: [
      { id: 'metal',   label: 'Золото и металлы',   icon: Gem,       cats: ['jewelry', 'costume_jewelry', 'accessories'], era: 'art-deco' },
      { id: 'glass',   label: 'Фарфор и стекло',    icon: Coffee,    cats: ['ceramics', 'cutlery', 'collectibles'],       era: 'mid-century' },
      { id: 'fabric',  label: 'Кожа и ткань',        icon: Shirt,     cats: ['clothing', 'accessories'],                   era: 'retro' },
      { id: 'wood',    label: 'Дерево и ремесло',    icon: Armchair,  cats: ['furniture', 'art', 'books'],                 era: 'mid-century' },
    ],
  },
  {
    id: 'purpose',
    question: 'Что вы ищете?',
    subtitle: 'Ваша цель',
    options: [
      { id: 'home',     label: 'Для дома',            icon: Armchair, cats: ['furniture', 'ceramics', 'cutlery'],           era: null },
      { id: 'personal', label: 'Для себя',            icon: Heart,    cats: ['clothing', 'jewelry', 'accessories'],         era: null },
      { id: 'collect',  label: 'Коллекционирование',  icon: BookOpen, cats: ['collectibles', 'art', 'books', 'vinyl'],     era: null },
      { id: 'gift',     label: 'Подарок',             icon: Sparkles, cats: ['jewelry', 'ceramics', 'accessories'],         era: null },
    ],
  },
  {
    id: 'budget',
    question: 'Ваш комфортный бюджет?',
    subtitle: 'Инвестиция в стиль',
    options: [
      { id: 'low',     label: 'До 100€',    icon: null, cats: [], era: null },
      { id: 'mid',     label: '100–300€',    icon: null, cats: [], era: null },
      { id: 'high',    label: '300–700€',    icon: null, cats: [], era: null },
      { id: 'premium', label: '700€+',       icon: null, cats: [], era: null },
    ],
  },
]

/* ================================================================== */
/*  PERSONALITY TYPES                                                   */
/* ================================================================== */

export const PERSONALITY_TYPES = {
  gatsby_aesthete: {
    key: 'gatsby_aesthete',
    name: 'Гэтсби Эстет',
    symbol: '✦',
    categories: ['jewelry', 'accessories', 'costume_jewelry'],
    era: 'art-deco',
    description: 'Вас привлекает блеск арт-деко, золотые линии и изящество ушедшей эпохи. Вы цените редкость и историю каждого украшения.',
    color: '#C9A96E',
  },
  scandi_minimalist: {
    key: 'scandi_minimalist',
    name: 'Скандинавский Минималист',
    symbol: '◈',
    categories: ['furniture', 'ceramics', 'cutlery'],
    era: 'mid-century',
    description: 'Чистые линии, натуральные материалы и функциональная красота — ваша философия. Каждая вещь в доме имеет смысл.',
    color: '#7A8B6E',
  },
  boho_traveler: {
    key: 'boho_traveler',
    name: 'Бохо Путешественник',
    symbol: '⚘',
    categories: ['accessories', 'clothing', 'vinyl'],
    era: 'retro',
    description: 'Вы свободный дух, собирающий вещи со всего мира. Винтажная кожаная сумка и виниловые пластинки — ваши спутники.',
    color: '#B07A4A',
  },
  art_collector: {
    key: 'art_collector',
    name: 'Арт-Коллекционер',
    symbol: '⚜',
    categories: ['art', 'books', 'collectibles'],
    era: 'modern',
    description: 'Вы ищете не вещи — вы ищете историю. Редкие книги, художественные принты и коллекционные предметы — ваша страсть.',
    color: '#8B6E9E',
  },
  classicist: {
    key: 'classicist',
    name: 'Классик',
    symbol: '❖',
    categories: ['ceramics', 'cutlery', 'furniture'],
    era: 'mid-century',
    description: 'Мейсенский фарфор и серебряные столовые приборы — для вас это не роскошь, а стиль жизни. Вы храните традиции.',
    color: '#4A6E8B',
  },
  rock_rebel: {
    key: 'rock_rebel',
    name: 'Рок-н-Ролл Бунтарь',
    symbol: '★',
    categories: ['vinyl', 'clothing', 'electronics'],
    era: 'retro',
    description: 'Кожаная куртка, виниловый проигрыватель и дух свободы 70-х. Вы живёте громко и ярко.',
    color: '#9E4A4A',
  },
  vintage_romantic: {
    key: 'vintage_romantic',
    name: 'Винтажный Романтик',
    symbol: '✿',
    categories: ['jewelry', 'clothing', 'accessories'],
    era: 'art-deco',
    description: 'Вы верите, что у каждой вещи есть душа. Старинные броши, шёлковые платья и ноты прошлых десятилетий — ваш мир.',
    color: '#B07A8B',
  },
  eclectic: {
    key: 'eclectic',
    name: 'Эклектик',
    symbol: '◉',
    categories: ['furniture', 'art', 'vinyl', 'ceramics'],
    era: null,
    description: 'Вы не признаёте границ. Арт-деко ваза рядом с модерн-арт постером и мид-сенчури креслом — ваша гармония.',
    color: '#6E8B4A',
  },
}

/* ================================================================== */
/*  SCORING                                                            */
/* ================================================================== */

function calculatePersonality(answers) {
  const scores = {}
  Object.keys(PERSONALITY_TYPES).forEach((k) => (scores[k] = 0))

  answers.forEach((answer) => {
    if (!answer) return
    const answerCats = answer.cats || []
    const answerEra = answer.era

    Object.entries(PERSONALITY_TYPES).forEach(([key, ptype]) => {
      // +3 for era match
      if (answerEra && ptype.era === answerEra) scores[key] += 3
      // +2 per category overlap
      answerCats.forEach((cat) => {
        if (ptype.categories.includes(cat)) scores[key] += 2
      })
    })
  })

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  // Tie → eclectic
  if (sorted.length >= 2 && sorted[0][1] === sorted[1][1]) return PERSONALITY_TYPES.eclectic
  return PERSONALITY_TYPES[sorted[0][0]]
}

/* ================================================================== */
/*  LOCAL STORAGE                                                       */
/* ================================================================== */

const LS_KEY = 'gdt_quiz_result'
const LS_SKIP = 'gdt_quiz_skipped'
const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function loadSavedResult() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.timestamp > EXPIRY_MS) {
      localStorage.removeItem(LS_KEY)
      return null
    }
    return PERSONALITY_TYPES[parsed.personalityKey] || null
  } catch {
    return null
  }
}

function saveResult(personalityKey, answers) {
  localStorage.setItem(
    LS_KEY,
    JSON.stringify({ personalityKey, answers: answers.map((a) => a.id), timestamp: Date.now() }),
  )
  localStorage.removeItem(LS_SKIP)
}

function markSkipped() {
  localStorage.setItem(LS_SKIP, 'true')
}

function wasSkipped() {
  return localStorage.getItem(LS_SKIP) === 'true'
}

function clearSaved() {
  localStorage.removeItem(LS_KEY)
  localStorage.removeItem(LS_SKIP)
}

/* ================================================================== */
/*  COMPONENT                                                           */
/* ================================================================== */

export default function VintageQuiz({ onComplete }) {
  const [phase, setPhase] = useState('loading') // loading | intro | question | result | hidden
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const [personality, setPersonality] = useState(null)
  const [animDir, setAnimDir] = useState('enter') // enter | exit
  const [recProducts, setRecProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const questionRef = useRef(null)

  // Init: check localStorage
  useEffect(() => {
    const saved = loadSavedResult()
    if (saved) {
      setPersonality(saved)
      setPhase('hidden')
    } else if (wasSkipped()) {
      setPhase('hidden')
    } else {
      setPhase('intro')
    }
  }, [])

  // Load recommended products when personality is set
  useEffect(() => {
    if (!personality) return
    setProductsLoading(true)

    const primaryCat = personality.categories[0]
    const secondaryCat = personality.categories[1]

    Promise.all([
      getProducts({ category: primaryCat, limit: 6 }),
      secondaryCat ? getProducts({ category: secondaryCat, limit: 4 }) : Promise.resolve({ data: [] }),
    ])
      .then(([r1, r2]) => {
        const all = [...(r1.data || []), ...(r2.data || [])]
          .filter((p) => p.status !== 'sold')
          .slice(0, 8)
        setRecProducts(all)
      })
      .catch(() => setRecProducts([]))
      .finally(() => setProductsLoading(false))
  }, [personality])

  const handleAnswer = useCallback(
    (option) => {
      const newAnswers = [...answers, option]
      setAnswers(newAnswers)

      if (step < QUIZ_QUESTIONS.length - 1) {
        setAnimDir('exit')
        setTimeout(() => {
          setStep(step + 1)
          setAnimDir('enter')
        }, 280)
      } else {
        // Calculate result
        const result = calculatePersonality(newAnswers)
        setPersonality(result)
        saveResult(result.key, newAnswers)
        setPhase('result')
        onComplete?.()
      }
    },
    [answers, step, onComplete],
  )

  const startQuiz = useCallback(() => {
    clearSaved()
    setStep(0)
    setAnswers([])
    setPersonality(null)
    setRecProducts([])
    setPhase('question')
    setAnimDir('enter')
  }, [])

  const handleSkip = useCallback(() => {
    markSkipped()
    setPhase('hidden')
    onComplete?.()
  }, [onComplete])

  const restartQuiz = useCallback(() => {
    clearSaved()
    startQuiz()
  }, [startQuiz])

  /* ---------- RENDER ---------- */

  if (phase === 'loading') return null

  // Mini banner for returning visitors
  if (phase === 'hidden') {
    return (
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: '#0C0A08' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {personality ? (
              <>
                <span
                  className="text-xl flex-shrink-0"
                  style={{ color: personality.color }}
                >
                  {personality.symbol}
                </span>
                <span className="font-body text-sm truncate" style={{ color: 'rgba(240, 230, 214, 0.7)' }}>
                  <span style={{ color: '#F0E6D6' }}>{personality.name}</span>
                  <span className="hidden sm:inline"> — ваш винтажный характер</span>
                </span>
              </>
            ) : (
              <span className="font-body text-sm" style={{ color: 'rgba(240, 230, 214, 0.5)' }}>
                Узнайте свой винтажный характер
              </span>
            )}
          </div>
          <button
            onClick={restartQuiz}
            className="flex-shrink-0 flex items-center gap-1.5 font-body text-xs tracking-wider uppercase transition-colors"
            style={{ color: '#B08D57' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A96E')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#B08D57')}
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Пройти тест</span>
            <span className="sm:hidden">Тест</span>
          </button>
        </div>
      </div>
    )
  }

  // Full-screen intro
  if (phase === 'intro') {
    return (
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: '#0C0A08' }}
      >
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, #B08D57 0.5px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #B08D57, transparent 70%)' }}
        />

        <div className="relative z-10 text-center px-6 max-w-lg mx-auto slide-content-enter">
          {/* Decorative mark */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{
              border: '1px solid rgba(176, 141, 87, 0.25)',
              background: 'rgba(176, 141, 87, 0.06)',
            }}
          >
            <Sparkles size={30} style={{ color: '#B08D57' }} />
          </div>

          <p
            className="font-body text-[10px] tracking-[0.5em] uppercase mb-6"
            style={{ color: 'rgba(176, 141, 87, 0.5)' }}
          >
            Персональный тест
          </p>

          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl italic leading-tight"
            style={{ color: '#F0E6D6' }}
          >
            Какой у вас
            <br />
            <span style={{ color: '#B08D57' }}>винтажный характер</span>?
          </h1>

          <p
            className="font-body text-sm sm:text-base mt-6 max-w-sm mx-auto leading-relaxed"
            style={{ color: 'rgba(240, 230, 214, 0.4)' }}
          >
            5 вопросов — 1 минута — ваш уникальный профиль
            <br />и подборка товаров специально для вас
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <button onClick={startQuiz} className="btn-primary group">
              Начать тест
              <ChevronRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={handleSkip}
              className="font-body text-xs tracking-wider uppercase transition-colors"
              style={{ color: 'rgba(240, 230, 214, 0.3)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(240, 230, 214, 0.6)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(240, 230, 214, 0.3)')}
            >
              Пропустить
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Questions
  if (phase === 'question') {
    const q = QUIZ_QUESTIONS[step]
    return (
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: '#0C0A08' }}
      >
        {/* Pattern bg */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, #B08D57 0.5px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-16">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-12">
            {QUIZ_QUESTIONS.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 rounded-full relative overflow-hidden">
                <div
                  className="absolute inset-0 transition-all duration-500"
                  style={{
                    backgroundColor:
                      i < step ? '#B08D57' : i === step ? '#B08D57' : 'rgba(176, 141, 87, 0.15)',
                    transform: i === step ? 'scaleX(1)' : i < step ? 'scaleX(1)' : 'scaleX(1)',
                    opacity: i === step ? 1 : i < step ? 0.6 : 0.3,
                  }}
                />
                {i === step && (
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full quiz-step-active"
                    style={{ backgroundColor: '#B08D57' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Question content */}
          <div
            ref={questionRef}
            key={step}
            className={animDir === 'enter' ? 'quiz-enter' : 'quiz-exit'}
          >
            <p
              className="font-body text-[10px] tracking-[0.4em] uppercase mb-2"
              style={{ color: 'rgba(176, 141, 87, 0.4)' }}
            >
              {q.subtitle} · {step + 1}/{QUIZ_QUESTIONS.length}
            </p>

            <h2
              className="font-display text-3xl sm:text-4xl italic mb-10"
              style={{ color: '#F0E6D6' }}
            >
              {q.question}
            </h2>

            {/* Options grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt) => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(opt)}
                    className="group relative p-6 text-left transition-all duration-300 overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(240, 230, 214, 0.04)',
                      border: '1px solid rgba(176, 141, 87, 0.12)',
                      borderRadius: '2px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.5)'
                      e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.12)'
                      e.currentTarget.style.backgroundColor = 'rgba(240, 230, 214, 0.04)'
                    }}
                  >
                    {Icon && (
                      <div className="mb-3">
                        <Icon
                          size={22}
                          className="transition-colors duration-300"
                          style={{ color: 'rgba(176, 141, 87, 0.5)' }}
                        />
                      </div>
                    )}
                    <span
                      className="font-display text-lg italic block leading-snug"
                      style={{ color: '#F0E6D6' }}
                    >
                      {opt.label}
                    </span>
                    {/* Hover arrow */}
                    <ArrowRight
                      size={14}
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-all duration-300 group-hover:translate-x-0 -translate-x-2"
                      style={{ color: '#B08D57' }}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Skip link */}
          <div className="text-center mt-8">
            <button
              onClick={handleSkip}
              className="font-body text-xs tracking-wider uppercase transition-colors"
              style={{ color: 'rgba(240, 230, 214, 0.2)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(240, 230, 214, 0.5)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(240, 230, 214, 0.2)')}
            >
              Пропустить тест
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Result
  if (phase === 'result' && personality) {
    return (
      <section
        className="relative min-h-screen overflow-hidden"
        style={{ backgroundColor: '#0C0A08' }}
      >
        {/* Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, #B08D57 0.5px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Glow in personality color */}
        <div
          className="absolute top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: `radial-gradient(circle, ${personality.color}, transparent 70%)` }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 sm:py-28">
          {/* Result card */}
          <div className="text-center quiz-result-enter">
            <p
              className="font-body text-[10px] tracking-[0.5em] uppercase mb-6"
              style={{ color: 'rgba(176, 141, 87, 0.4)' }}
            >
              Ваш винтажный характер
            </p>

            <div
              className="text-5xl sm:text-6xl mb-4"
              style={{ color: personality.color }}
            >
              {personality.symbol}
            </div>

            <h2
              className="font-display text-4xl sm:text-5xl md:text-6xl italic"
              style={{ color: '#F0E6D6' }}
            >
              {personality.name}
            </h2>

            <p
              className="font-body text-sm sm:text-base mt-5 max-w-lg mx-auto leading-relaxed"
              style={{ color: 'rgba(240, 230, 214, 0.5)' }}
            >
              {personality.description}
            </p>

            {/* Category badges */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {personality.categories.map((catId) => {
                const cat = categories.find((c) => c.id === catId)
                if (!cat) return null
                return (
                  <Link
                    key={catId}
                    to={`/catalog/${catId}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 font-body text-xs tracking-wider uppercase transition-all duration-300"
                    style={{
                      color: '#B08D57',
                      border: '1px solid rgba(176, 141, 87, 0.2)',
                      borderRadius: '2px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#B08D57'
                      e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.2)'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {cat.name}
                    <ChevronRight size={10} />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recommended products */}
          {(recProducts.length > 0 || productsLoading) && (
            <div className="mt-16">
              <p
                className="font-body text-[10px] tracking-[0.4em] uppercase text-center mb-8"
                style={{ color: 'rgba(176, 141, 87, 0.3)' }}
              >
                Рекомендуем для вас
              </p>

              {productsLoading ? (
                <div className="flex justify-center py-12">
                  <div
                    className="w-6 h-6 rounded-full border-2 animate-spin"
                    style={{
                      borderColor: 'rgba(176, 141, 87, 0.2)',
                      borderTopColor: '#B08D57',
                    }}
                  />
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto quiz-products pb-4 -mx-6 px-6 snap-x snap-mandatory">
                  {recProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex-shrink-0 snap-start"
                      style={{ width: 'clamp(220px, 40vw, 280px)' }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <Link to="/catalog" className="btn-primary group">
              В каталог
              <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
            <button onClick={restartQuiz} className="btn-secondary group">
              <RotateCcw size={14} className="mr-2" />
              Пройти заново
            </button>
            <button
              onClick={() => {
                setPhase('hidden')
                onComplete?.()
              }}
              className="font-body text-xs tracking-wider uppercase transition-colors"
              style={{ color: 'rgba(240, 230, 214, 0.3)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(240, 230, 214, 0.6)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(240, 230, 214, 0.3)')}
            >
              Продолжить на сайт
            </button>
          </div>
        </div>
      </section>
    )
  }

  return null
}
