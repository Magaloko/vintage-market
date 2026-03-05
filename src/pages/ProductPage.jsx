import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Share2,
  ShoppingBag,
  Tag,
  Clock,
  Award,
  Ruler,
  MapPin,
  Home,
  Phone,
  Globe,
  Mail,
  MessageCircle,
  Send as SendIcon,
  Store,
  Shield,
  Gem,
  Sparkles,
} from 'lucide-react'
import { getProduct, getCategoryAvgPrice, getShop } from '../lib/api'
import { categories, conditions, categoryFields } from '../data/demoProducts'
import ImageGallery from '../components/public/ImageGallery'
import FavoriteButton from '../components/public/FavoriteButton'
import CompareButton from '../components/public/CompareButton'
import PriceInsight from '../components/public/PriceInsight'
import PriceHistoryChart from '../components/public/PriceHistoryChart'
import SimilarProducts from '../components/public/SimilarProducts'
import ProductReviews from '../components/public/ProductReviews'
import { siteConfig } from '../lib/siteConfig'
import { useCurrency } from '../lib/CurrencyContext'

/* ------------------------------------------------------------------ */
/*  Field icon mapping                                                 */
/* ------------------------------------------------------------------ */

const FIELD_ICONS = {
  rooms: Home,
  area_m2: Ruler,
  floor: Home,
  address: MapPin,
  phone: Phone,
  email: Mail,
  website: Globe,
  default: Tag,
}

/* ------------------------------------------------------------------ */
/*  Specs highlight strip                                              */
/* ------------------------------------------------------------------ */

function SpecsStrip({ product }) {
  const specs = []

  if (product.category === 'jewelry') {
    if (product.details?.material) {
      const val = product.details.hallmark
        ? `${product.details.material} ${product.details.hallmark}`
        : product.details.material
      specs.push({ icon: Gem, label: 'Материал', value: val })
    }
    if (product.details?.stones) specs.push({ icon: Sparkles, label: 'Камни', value: product.details.stones })
    if (product.details?.weight_grams) specs.push({ icon: Tag, label: 'Вес', value: `${product.details.weight_grams} г` })
    if (product.details?.jewelry_type) specs.push({ icon: Award, label: 'Тип', value: product.details.jewelry_type })
  } else if (product.category === 'ceramics') {
    if (product.details?.manufacturer) specs.push({ icon: Award, label: 'Производитель', value: product.details.manufacturer })
    if (product.details?.material) specs.push({ icon: Tag, label: 'Материал', value: product.details.material })
    if (product.details?.ceramic_type) specs.push({ icon: ShoppingBag, label: 'Тип', value: product.details.ceramic_type })
    if (product.details?.set_pieces) specs.push({ icon: Ruler, label: 'Комплект', value: `${product.details.set_pieces} пр.` })
  } else {
    if (product.condition) {
      const cond = conditions.find(c => c.id === product.condition)
      if (cond) specs.push({ icon: Award, label: 'Состояние', value: cond.name })
    }
    if (product.era) specs.push({ icon: Clock, label: 'Эпоха', value: product.era })
    if (product.brand) specs.push({ icon: ShoppingBag, label: 'Бренд', value: product.brand })
  }

  if (specs.length === 0) return null

  return (
    <div
      className="flex flex-wrap items-center gap-0"
      style={{
        backgroundColor: 'rgba(176, 141, 87, 0.04)',
        border: '1px solid rgba(176, 141, 87, 0.1)',
        borderRadius: '2px',
        padding: '12px 16px',
      }}
    >
      {specs.map(({ icon: Icon, label, value }, i) => (
        <div key={label} className="flex items-center">
          {i > 0 && (
            <div className="w-px h-5 mx-3" style={{ backgroundColor: 'rgba(176, 141, 87, 0.2)' }} />
          )}
          <Icon size={14} className="mr-2 shrink-0" style={{ color: '#B08D57' }} />
          <div>
            <p className="font-body text-[9px] tracking-wider uppercase" style={{ color: 'rgba(44, 36, 32, 0.3)' }}>{label}</p>
            <p className="font-body text-sm" style={{ color: '#2C2420' }}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Condition meter                                                    */
/* ------------------------------------------------------------------ */

const CONDITION_LEVELS = [
  { id: 'vintage_character', level: 1, color: '#B5736A', label: 'Винтажный характер', desc: 'Следы времени добавляют шарм' },
  { id: 'good', level: 2, color: '#C9956B', label: 'Хорошее', desc: 'Лёгкие следы использования' },
  { id: 'excellent', level: 3, color: '#B08D57', label: 'Отличное', desc: 'Минимальные следы, почти идеал' },
  { id: 'new', level: 4, color: '#7A8B6F', label: 'Новое', desc: 'Без следов использования' },
]

const SEGMENT_COLORS = ['#B5736A', '#C9956B', '#B08D57', '#7A8B6F']

function ConditionMeter({ conditionId }) {
  const condInfo = CONDITION_LEVELS.find(c => c.id === conditionId)
  if (!condInfo) return null

  return (
    <div className="p-3" style={{ backgroundColor: 'rgba(44, 36, 32, 0.04)', borderRadius: '2px' }}>
      <div className="flex items-center gap-3 mb-2">
        <Award size={14} style={{ color: condInfo.color }} />
        <span className="font-body text-sm font-medium" style={{ color: condInfo.color }}>{condInfo.label}</span>
      </div>
      <div className="flex items-center gap-1 mb-1.5">
        {SEGMENT_COLORS.map((color, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-sm"
            style={{
              backgroundColor: i < condInfo.level ? color : 'rgba(44, 36, 32, 0.08)',
            }}
          />
        ))}
      </div>
      <p className="font-body text-[10px]" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>{condInfo.desc}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Authenticity / Provenance section                                  */
/* ------------------------------------------------------------------ */

function AuthenticitySection({ product }) {
  if (product.category === 'jewelry') {
    const hasData = product.details?.hallmark || product.details?.material || product.details?.weight_grams
    if (!hasData) return null

    return (
      <div className="p-5" style={{
        backgroundColor: 'rgba(176, 141, 87, 0.04)',
        border: '1px solid rgba(176, 141, 87, 0.1)',
        borderLeft: '4px solid #B08D57',
        borderRadius: '2px',
      }}>
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} style={{ color: '#B08D57' }} />
          <span className="font-display text-lg italic" style={{ color: '#0C0A08' }}>Подлинность</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {product.details.hallmark && (
            <div className="px-3 py-1.5" style={{ backgroundColor: 'rgba(176, 141, 87, 0.08)', borderRadius: '2px' }}>
              <span className="font-body text-[9px] tracking-wider uppercase block" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>Проба</span>
              <span className="font-body text-sm font-medium" style={{ color: '#B08D57' }}>{product.details.hallmark}</span>
            </div>
          )}
          {product.details.material && (
            <div className="px-3 py-1.5" style={{ backgroundColor: 'rgba(176, 141, 87, 0.08)', borderRadius: '2px' }}>
              <span className="font-body text-[9px] tracking-wider uppercase block" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>Материал</span>
              <span className="font-body text-sm font-medium" style={{ color: '#2C2420' }}>{product.details.material}</span>
            </div>
          )}
          {product.details.weight_grams && (
            <div className="px-3 py-1.5" style={{ backgroundColor: 'rgba(176, 141, 87, 0.08)', borderRadius: '2px' }}>
              <span className="font-body text-[9px] tracking-wider uppercase block" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>Вес</span>
              <span className="font-body text-sm font-medium" style={{ color: '#2C2420' }}>{product.details.weight_grams} г</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (product.category === 'ceramics') {
    const hasData = product.details?.manufacturer || product.details?.material
    if (!hasData) return null

    return (
      <div className="p-5" style={{
        backgroundColor: 'rgba(176, 141, 87, 0.04)',
        border: '1px solid rgba(176, 141, 87, 0.1)',
        borderLeft: '4px solid #B08D57',
        borderRadius: '2px',
      }}>
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} style={{ color: '#B08D57' }} />
          <span className="font-display text-lg italic" style={{ color: '#0C0A08' }}>Происхождение</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {product.details.manufacturer && (
            <div className="px-3 py-1.5" style={{ backgroundColor: 'rgba(176, 141, 87, 0.08)', borderRadius: '2px' }}>
              <span className="font-body text-[9px] tracking-wider uppercase block" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>Мануфактура</span>
              <span className="font-body text-sm font-medium" style={{ color: '#B08D57' }}>{product.details.manufacturer}</span>
            </div>
          )}
          {product.details.material && (
            <div className="px-3 py-1.5" style={{ backgroundColor: 'rgba(176, 141, 87, 0.08)', borderRadius: '2px' }}>
              <span className="font-body text-[9px] tracking-wider uppercase block" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>Материал</span>
              <span className="font-body text-sm font-medium" style={{ color: '#2C2420' }}>{product.details.material}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [avgPrice, setAvgPrice] = useState(null)
  const [shopData, setShopData] = useState(null)

  /* ---------- Load product + secondary data ---------- */

  useEffect(() => {
    let mounted = true

    ;(async () => {
      if (mounted) setLoading(true)

      try {
        const { data, error } = await getProduct(id)
        if (!mounted) return

        if (error || !data) {
          navigate('/catalog', { replace: true })
          return
        }

        setProduct(data)

        // Load secondary data in parallel (both optional)
        const [avg, shopRes] = await Promise.allSettled([
          getCategoryAvgPrice(data.category),
          data.shop_id ? getShop(data.shop_id) : Promise.resolve(null),
        ])

        if (!mounted) return
        if (avg.status === 'fulfilled') setAvgPrice(avg.value)
        if (shopRes.status === 'fulfilled' && shopRes.value?.data)
          setShopData(shopRes.value.data)
      } catch {
        if (mounted) navigate('/catalog', { replace: true })
      }

      if (mounted) setLoading(false)
    })()

    window.scrollTo(0, 0)
    return () => {
      mounted = false
    }
  }, [id, navigate])

  /* ---------- Loading skeleton ---------- */

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div
            className="aspect-square"
            style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)', borderRadius: '2px' }}
          />
          <div className="space-y-6">
            <div
              className="h-8 rounded w-3/4"
              style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }}
            />
            <div
              className="h-6 rounded w-1/4"
              style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }}
            />
            <div
              className="h-24 rounded"
              style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  /* ---------- Derived data ---------- */

  const images =
    product.images?.length > 0
      ? product.images.map((img) => ({
          url: img.url,
          alt_text: img.alt_text || product.title,
        }))
      : product.image_url
        ? [{ url: product.image_url, alt_text: product.title }]
        : []

  const category = categories.find((c) => c.id === product.category)
  const condition = conditions.find((c) => c.id === product.condition)
  const isRealEstate = category?.group === 'realestate'
  const isShop = category?.group === 'shops'
  const showPrice = product.price > 0

  // Base detail rows
  const baseDetails = [
    category && { icon: Tag, label: 'Категория', value: category.name },
    condition && { icon: Award, label: 'Состояние', value: condition.name },
    product.era && { icon: Clock, label: 'Эпоха', value: product.era },
    product.brand && { icon: ShoppingBag, label: 'Бренд', value: product.brand },
  ].filter(Boolean)

  // Category-specific detail rows from product.details
  const catFields = categoryFields[product.category] || []
  const customDetails = catFields
    .filter((f) => product.details?.[f.key] != null && product.details[f.key] !== '')
    .map((f) => {
      let value = product.details[f.key]
      if (f.unit) value = `${value} ${f.unit}`
      const IconComp = FIELD_ICONS[f.key] || FIELD_ICONS.default
      return { icon: IconComp, label: f.label, value: String(value) }
    })

  const allDetails = [...baseDetails, ...customDetails]

  /* ---------- Handlers ---------- */

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, url })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url)
      } catch {}
    }
  }

  /* ---------- Render ---------- */

  return (
    <div className="page-enter">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div
          className="flex items-center gap-2 font-sans text-xs"
          style={{ color: 'rgba(44, 36, 32, 0.35)' }}
        >
          <Link
            to="/catalog"
            className="flex items-center gap-1 transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.color = '#2C2420')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(44, 36, 32, 0.35)')}
          >
            <ArrowLeft size={14} />
            Каталог
          </Link>

          {category && (
            <>
              <span>/</span>
              <Link
                to={`/catalog/${category.id}`}
                className="transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.color = '#2C2420')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'rgba(44, 36, 32, 0.35)')
                }
              >
                {category.name}
              </Link>
            </>
          )}

          <span>/</span>
          <span
            className="truncate max-w-[200px]"
            style={{ color: 'rgba(44, 36, 32, 0.55)' }}
          >
            {product.title}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <ImageGallery images={images} title={product.title} />

          {/* Product info */}
          <div className="space-y-6">
            {/* Title + actions */}
            <div className="flex items-start justify-between gap-4">
              <h1
                className="font-display text-3xl md:text-4xl leading-tight"
                style={{ color: '#0C0A08' }}
              >
                {product.title}
              </h1>
              <div className="flex items-center gap-2 shrink-0 mt-1">
                <FavoriteButton product={product} size="md" />
                <CompareButton product={product} size="md" />
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: 'rgba(44, 36, 32, 0.06)',
                    color: 'rgba(44, 36, 32, 0.35)',
                  }}
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Shop badge */}
            {shopData && (
              <Link
                to={`/shop/${shopData.slug}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(176, 141, 87, 0.06)',
                  border: '1px solid rgba(176, 141, 87, 0.12)',
                  borderRadius: '2px',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.3)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.12)')
                }
              >
                <Store size={13} style={{ color: '#B08D57' }} />
                <span className="font-body text-xs" style={{ color: '#B08D57' }}>
                  {shopData.name}
                </span>
              </Link>
            )}

            {/* Price */}
            {showPrice && (
              <div className="flex items-center gap-4">
                <span
                  className={`font-sans text-3xl font-bold ${product.status === 'sold' ? 'line-through' : ''}`}
                  style={{
                    color: product.status === 'sold' ? 'rgba(44, 36, 32, 0.3)' : '#0C0A08',
                  }}
                >
                  {isRealEstate && product.details?.rent_or_buy === 'Аренда'
                    ? `${formatPrice(product.price)} / мес.`
                    : formatPrice(product.price)}
                </span>
                {product.status === 'sold' && (
                  <span
                    className="font-sans text-sm tracking-widest uppercase"
                    style={{ color: '#B08D57' }}
                  >
                    Продано
                  </span>
                )}
              </div>
            )}

            {/* Price insight */}
            {avgPrice && product.status !== 'sold' && !isRealEstate && !isShop && (
              <PriceInsight price={product.price} avgPrice={avgPrice} />
            )}

            {/* Price history chart */}
            {!isShop && <PriceHistoryChart productId={product.id} />}

            {/* Specs highlight strip */}
            <SpecsStrip product={product} />

            {/* Divider */}
            <div className="w-12 h-px" style={{ backgroundColor: '#B08D57' }} />

            {/* Description */}
            <p
              className="font-body text-lg leading-relaxed"
              style={{ color: 'rgba(44, 36, 32, 0.6)' }}
            >
              {product.description}
            </p>

            {/* Condition meter */}
            {product.condition && <ConditionMeter conditionId={product.condition} />}

            {/* Details grid */}
            {allDetails.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {allDetails.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 p-3"
                    style={{
                      backgroundColor: 'rgba(44, 36, 32, 0.04)',
                      borderRadius: '2px',
                    }}
                  >
                    <Icon
                      size={18}
                      className="shrink-0"
                      style={{ color: 'rgba(44, 36, 32, 0.25)' }}
                    />
                    <div className="min-w-0">
                      <p
                        className="font-sans text-[10px] uppercase tracking-wider"
                        style={{ color: 'rgba(44, 36, 32, 0.35)' }}
                      >
                        {label}
                      </p>
                      <p className="font-body truncate" style={{ color: '#2C2420' }}>
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Shop specialization */}
            {isShop && product.details?.specialization && (
              <div
                className="p-4"
                style={{ backgroundColor: 'rgba(44, 36, 32, 0.04)', borderRadius: '2px' }}
              >
                <p
                  className="font-sans text-[10px] uppercase tracking-wider mb-2"
                  style={{ color: 'rgba(44, 36, 32, 0.35)' }}
                >
                  Специализация
                </p>
                <p className="font-body" style={{ color: 'rgba(44, 36, 32, 0.6)' }}>
                  {product.details.specialization}
                </p>
              </div>
            )}

            {/* Authenticity / Provenance */}
            <AuthenticitySection product={product} />

            {/* Contact CTAs */}
            {product.status !== 'sold' && (
              <div className="space-y-3">
                {/* WhatsApp */}
                {siteConfig.whatsapp && (
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.messageTemplates.whatsapp(product, formatPrice))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-3.5 font-body text-sm tracking-[0.1em] uppercase transition-all duration-300"
                    style={{ backgroundColor: '#25D366', color: '#fff', borderRadius: '2px' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.boxShadow =
                        '0 4px 20px rgba(37, 211, 102, 0.3)')
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </a>
                )}

                <div className="flex gap-3">
                  {/* Telegram */}
                  {siteConfig.telegram && (
                    <a
                      href={`https://t.me/${siteConfig.telegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 font-body text-sm tracking-[0.1em] uppercase transition-all duration-300"
                      style={{
                        backgroundColor: 'rgba(38, 163, 238, 0.1)',
                        color: '#26A3EE',
                        border: '1px solid rgba(38, 163, 238, 0.2)',
                        borderRadius: '2px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#26A3EE'
                        e.currentTarget.style.color = '#fff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(38, 163, 238, 0.1)'
                        e.currentTarget.style.color = '#26A3EE'
                      }}
                    >
                      <SendIcon size={14} />
                      Telegram
                    </a>
                  )}

                  {/* Contact form */}
                  <Link
                    to={`/contact?product=${product.id}&title=${encodeURIComponent(product.title)}`}
                    className="flex-1 btn-secondary justify-center"
                  >
                    <Mail size={14} className="mr-2" />
                    {isShop ? 'Написать' : isRealEstate ? 'Запрос' : 'Форма'}
                  </Link>
                </div>

                {/* Phone */}
                {siteConfig.phone && (
                  <a
                    href={`tel:${siteConfig.phoneClean}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 font-body text-xs transition-colors"
                    style={{ color: 'rgba(44, 36, 32, 0.35)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#0C0A08')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = 'rgba(44, 36, 32, 0.35)')
                    }
                  >
                    <Phone size={12} />
                    {siteConfig.phone}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Similar products */}
        {!isShop && <SimilarProducts currentProduct={product} />}

        {/* Reviews */}
        {!isShop && <ProductReviews productId={product.id} />}
      </div>
    </div>
  )
}
