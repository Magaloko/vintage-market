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
  Shield,
  Gem,
  Sparkles,
  Truck,
  Package,
  Instagram,
  Hash,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { getProduct, getCategoryAvgPrice, getProductsByIds } from '../lib/api'
import { categories, conditions, categoryFields, specialAttributes, formatEra, subcategories, shippingOptions } from '../data/demoProducts'
import ImageGallery from '../components/public/ImageGallery'
import FavoriteButton from '../components/public/FavoriteButton'
import CompareButton from '../components/public/CompareButton'
import PriceInsight from '../components/public/PriceInsight'
import PriceHistoryChart from '../components/public/PriceHistoryChart'
import SimilarProducts from '../components/public/SimilarProducts'
import ProductCard from '../components/public/ProductCard'
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
    const eraDisplay = formatEra(product.era_start, product.era_end)
    if (eraDisplay) specs.push({ icon: Clock, label: 'Эпоха', value: eraDisplay })
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
/*  Special attributes badges                                          */
/* ------------------------------------------------------------------ */

function SpecialAttributesSection({ product }) {
  if (!product.special_attributes || product.special_attributes.length === 0) return null

  const attrs = product.special_attributes
    .map(id => specialAttributes.find(a => a.id === id))
    .filter(Boolean)

  if (attrs.length === 0) return null

  return (
    <div
      className="p-5"
      style={{
        backgroundColor: 'rgba(176, 141, 87, 0.03)',
        border: '1px solid rgba(176, 141, 87, 0.1)',
        borderRadius: '2px',
      }}
    >
      <p
        className="font-body text-[9px] tracking-[0.3em] uppercase mb-3"
        style={{ color: 'rgba(176, 141, 87, 0.5)' }}
      >
        Особые характеристики
      </p>
      <div className="flex flex-wrap gap-2">
        {attrs.map((attr) => (
          <div
            key={attr.id}
            className="inline-flex items-center gap-2 px-3 py-2"
            style={{
              backgroundColor: `${attr.color}10`,
              border: `1px solid ${attr.color}25`,
              borderRadius: '2px',
            }}
          >
            <span style={{ fontSize: '14px', color: attr.color }}>{attr.icon}</span>
            <span className="font-body text-sm font-medium" style={{ color: attr.color }}>
              {attr.label}
            </span>
          </div>
        ))}
      </div>
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
  const [linkedProducts, setLinkedProducts] = useState([])

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
        const [avg, linked] = await Promise.allSettled([
          getCategoryAvgPrice(data.category),
          data.linked_product_ids?.length > 0 ? getProductsByIds(data.linked_product_ids) : Promise.resolve({ data: [] }),
        ])

        if (!mounted) return
        if (avg.status === 'fulfilled') setAvgPrice(avg.value)
        if (linked.status === 'fulfilled') setLinkedProducts(linked.value?.data || [])
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
    formatEra(product.era_start, product.era_end) && { icon: Clock, label: 'Эпоха', value: formatEra(product.era_start, product.era_end) },
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

          {product.subcategory && (() => {
            const subcatList = subcategories[product.category] || []
            const subcat = subcatList.find(s => s.id === product.subcategory)
            if (!subcat) return null
            return (
              <>
                <span>/</span>
                <span className="transition-colors" style={{ color: 'rgba(44, 36, 32, 0.45)' }}>
                  {subcat.name}
                </span>
              </>
            )
          })()}
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
            {/* Brand banner */}
            {product.brand && (
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5"
                style={{
                  backgroundColor: 'rgba(12, 10, 8, 0.04)',
                  borderLeft: '3px solid #B08D57',
                  borderRadius: '0 2px 2px 0',
                }}
              >
                <span className="font-body text-[9px] tracking-[0.2em] uppercase" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>
                  Коллекция
                </span>
                <span className="font-display text-sm italic" style={{ color: '#B08D57' }}>
                  {product.brand}
                </span>
              </div>
            )}

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

            {/* Quantity */}
            {product.quantity > 1 && (
              <div className="flex items-center gap-2">
                <Package size={14} style={{ color: '#B08D57' }} />
                <span className="font-body text-sm" style={{ color: 'rgba(44, 36, 32, 0.6)' }}>
                  В наличии: <strong style={{ color: '#2C2420' }}>{product.quantity} шт.</strong>
                </span>
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

            {/* Special attributes */}
            <SpecialAttributesSection product={product} />

            {/* Hashtags */}
            {product.hashtags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.hashtags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/catalog?search=%23${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 font-body text-xs rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: 'rgba(176, 141, 87, 0.08)',
                      color: '#B08D57',
                      border: '1px solid rgba(176, 141, 87, 0.2)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.15)'
                      e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(176, 141, 87, 0.08)'
                      e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.2)'
                    }}
                  >
                    <Hash size={10} />
                    {tag}
                  </Link>
                ))}
              </div>
            )}

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

            {/* Shipping info */}
            {product.shipping?.length > 0 && (
              <div
                className="p-4"
                style={{
                  backgroundColor: 'rgba(44, 36, 32, 0.03)',
                  border: '1px solid rgba(176, 141, 87, 0.1)',
                  borderRadius: '2px',
                }}
              >
                <p className="font-body text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>
                  Доставка
                </p>
                <div className="space-y-2">
                  {product.shipping.map((s) => {
                    const opt = shippingOptions.find(o => o.id === s.id)
                    if (!opt) return null
                    return (
                      <div key={s.id} className="flex items-center gap-2">
                        <Truck size={12} style={{ color: '#B08D57' }} />
                        <span className="font-body text-sm" style={{ color: '#2C2420' }}>{opt.name}</span>
                        {s.price && (
                          <span className="font-body text-xs" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>— {s.price}</span>
                        )}
                        {s.note && (
                          <span className="font-body text-xs italic" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>({s.note})</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Product-specific contact buttons */}
            {(product.contact_whatsapp || product.contact_telegram || product.contact_instagram) && (
              <div className="space-y-2">
                <p className="font-body text-[9px] tracking-[0.3em] uppercase" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>
                  Контакт продавца
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.contact_whatsapp && (
                    <a
                      href={`https://wa.me/${product.contact_whatsapp.replace(/[^\d+]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 font-body text-xs tracking-wide rounded transition-all duration-300"
                      style={{ backgroundColor: '#25D366', color: '#fff' }}
                    >
                      <MessageCircle size={14} />
                      WhatsApp
                    </a>
                  )}
                  {product.contact_telegram && (
                    <a
                      href={product.contact_telegram.startsWith('http') ? product.contact_telegram : `https://t.me/${product.contact_telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 font-body text-xs tracking-wide rounded transition-all duration-300"
                      style={{ backgroundColor: '#26A3EE', color: '#fff' }}
                    >
                      <SendIcon size={14} />
                      Telegram
                    </a>
                  )}
                  {product.contact_instagram && (
                    <a
                      href={`https://instagram.com/${product.contact_instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 font-body text-xs tracking-wide rounded transition-all duration-300"
                      style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff' }}
                    >
                      <Instagram size={14} />
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* QR Code */}
            <div className="flex items-center gap-3">
              <QRCodeSVG
                value={window.location.href}
                size={64}
                level="M"
                fgColor="#2C2420"
                bgColor="#F7F2EB"
              />
              <p className="font-body text-[10px]" style={{ color: 'rgba(44, 36, 32, 0.3)' }}>
                Отсканируйте для быстрого доступа
              </p>
            </div>

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

        {/* Linked products */}
        {linkedProducts.length > 0 && (
          <section className="mt-16 pt-12" style={{ borderTop: '1px solid rgba(44, 36, 32, 0.1)' }}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px" style={{ backgroundColor: '#B08D57' }} />
              <h2 className="font-display text-2xl" style={{ color: '#0C0A08' }}>
                Рекомендуемые товары
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {linkedProducts.map((p, i) => (
                <div key={p.id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar products */}
        {!isShop && <SimilarProducts currentProduct={product} />}

        {/* Reviews */}
        {!isShop && <ProductReviews productId={product.id} />}
      </div>
    </div>
  )
}
