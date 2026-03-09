import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
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
  Truck,
  Instagram,
  Hash,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { getProduct, getCategoryAvgPrice, getProductsByIds } from '../lib/api'
import { categories, conditions, categoryFields, specialAttributes, formatEra, subcategories, shippingOptions } from '../data/demoProducts'
import ImageGallery from '../components/public/ImageGallery'
import FavoriteButton from '../components/public/FavoriteButton'
import CompareButton from '../components/public/CompareButton'
import PriceInsight from '../components/public/PriceInsight'
import { trackEvent } from '../lib/analytics'
import PriceHistoryChart from '../components/public/PriceHistoryChart'
import SimilarProducts from '../components/public/SimilarProducts'
import ProductCard from '../components/public/ProductCard'
import ProductReviews from '../components/public/ProductReviews'
import InlineDescriptionEditor from '../components/public/InlineDescriptionEditor'
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
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Award size={14} style={{ color: condInfo.color }} />
        <span className="font-body text-sm font-medium" style={{ color: condInfo.color }}>{condInfo.label}</span>
      </div>
      <div className="flex items-center gap-1 mb-1.5">
        {SEGMENT_COLORS.map((color, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-sm"
            style={{ backgroundColor: i < condInfo.level ? color : 'rgba(44, 36, 32, 0.08)' }}
          />
        ))}
      </div>
      <p className="font-body text-[10px]" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>{condInfo.desc}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Expandable section                                                 */
/* ------------------------------------------------------------------ */

function ExpandableSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{ borderBottom: '1px solid rgba(44, 36, 32, 0.08)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3.5 text-left"
      >
        <h3 className="font-display text-base md:text-lg" style={{ color: '#2C2420' }}>
          {title}
        </h3>
        {open
          ? <ChevronUp size={18} style={{ color: 'rgba(44, 36, 32, 0.3)' }} />
          : <ChevronDown size={18} style={{ color: 'rgba(44, 36, 32, 0.3)' }} />
        }
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Crypto address row with copy                                       */
/* ------------------------------------------------------------------ */

function CryptoAddress({ label, address, color }) {
  const [copied, setCopied] = useState(false)
  const short = `${address.slice(0, 8)}...${address.slice(-6)}`

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-sm"
      style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}
    >
      <div
        className="w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        <span className="font-display text-[9px] font-bold text-white">
          {label.includes('BTC') ? '₿' : label.includes('ETH') ? 'Ξ' : '$'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-medium" style={{ color: '#2C2420' }}>{label}</p>
        <p className="font-body text-[10px] truncate" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>{short}</p>
      </div>
      <button
        onClick={handleCopy}
        className="font-body text-[10px] px-2 py-1 rounded-sm transition-all"
        style={{
          backgroundColor: copied ? 'rgba(122, 139, 111, 0.1)' : 'rgba(44, 36, 32, 0.06)',
          color: copied ? '#7A8B6F' : 'rgba(44, 36, 32, 0.5)',
        }}
      >
        {copied ? 'Скопировано' : 'Копировать'}
      </button>
    </div>
  )
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
  const [qrModalOpen, setQrModalOpen] = useState(false)

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
        trackEvent('product_view', { product_id: data.id, category: data.category })

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
    return () => { mounted = false }
  }, [id, navigate])

  /* ---------- Loading skeleton ---------- */

  if (loading) {
    return (
      <div className="pt-24 md:pt-28 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="h-5 rounded w-1/4 mb-4" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
          <div className="h-9 rounded w-2/3 mx-auto mb-6" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
        </div>
        <div className="max-w-[100vw] aspect-[2.5/1] mb-6" style={{ backgroundColor: 'rgba(44, 36, 32, 0.04)' }} />
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-6 rounded w-1/3" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
            <div className="h-20 rounded" style={{ backgroundColor: 'rgba(44, 36, 32, 0.04)' }} />
          </div>
          <div className="h-72 rounded" style={{ backgroundColor: 'rgba(44, 36, 32, 0.04)' }} />
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
  const isSold = product.status === 'sold'

  // Resolve contact: product-level → siteConfig fallback
  const resolvedWhatsapp = (product.contact_whatsapp || siteConfig.whatsapp || '').replace(/[^\d+]/g, '')
  const resolvedTelegram = (product.contact_telegram || siteConfig.telegram || '').replace(/@/g, '')

  const baseDetails = [
    category && { icon: Tag, label: 'Категория', value: category.name },
    condition && { icon: Award, label: 'Состояние', value: condition.name },
    formatEra(product.era_start, product.era_end) && { icon: Clock, label: 'Эпоха', value: formatEra(product.era_start, product.era_end) },
    product.brand && { icon: ShoppingBag, label: 'Бренд', value: product.brand },
  ].filter(Boolean)

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

  const specialAttrs = (product.special_attributes || [])
    .map(aid => specialAttributes.find(a => a.id === aid))
    .filter(Boolean)

  /* ---------- Handlers ---------- */

  const handleShare = async () => {
    const url = window.location.href
    trackEvent('share_click', { product_id: product?.id, channel: navigator.share ? 'native' : 'clipboard', category: product?.category })
    if (navigator.share) {
      try { await navigator.share({ title: product.title, url }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(url) } catch {}
    }
  }

  const displayPrice = isRealEstate && product.details?.rent_or_buy === 'Аренда'
    ? `${formatPrice(product.price)} / мес.`
    : formatPrice(product.price)

  /* ---------- Render ---------- */

  return (
    <div className="page-enter" style={{ backgroundColor: '#fff', minHeight: '100vh' }}>

      {/* ======== BREADCRUMBS — below fixed header ======== */}
      <div className="pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-1">
          <nav
            className="flex items-center gap-1.5 font-sans text-[11px] md:text-xs flex-wrap"
            style={{ color: 'rgba(44, 36, 32, 0.35)' }}
          >
            <Link to="/catalog" className="transition-colors hover:text-[#2C2420]">Каталог</Link>
            {category && (
              <>
                <span style={{ color: 'rgba(44, 36, 32, 0.2)' }}>/</span>
                <Link to={`/catalog/${category.id}`} className="transition-colors hover:text-[#2C2420]">{category.name}</Link>
              </>
            )}
            {product.subcategory && (() => {
              const subcatList = subcategories[product.category] || []
              const subcat = subcatList.find(s => s.id === product.subcategory)
              if (!subcat) return null
              return (
                <>
                  <span style={{ color: 'rgba(44, 36, 32, 0.2)' }}>/</span>
                  <span style={{ color: 'rgba(44, 36, 32, 0.4)' }}>{subcat.name}</span>
                </>
              )
            })()}
          </nav>
        </div>
      </div>

      {/* ======== TITLE — centered, clearly visible ======== */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <h1
          className="font-display text-xl md:text-2xl lg:text-3xl text-center leading-tight"
          style={{ color: '#0C0A08' }}
        >
          {product.title}
        </h1>
        {product.brand && (
          <p className="text-center mt-0.5 font-body text-xs md:text-sm" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
            {product.brand}
          </p>
        )}
      </div>

      {/* ======== GALLERY — full width, edge-to-edge ======== */}
      <div className="w-full">
        <div className="max-w-[1400px] mx-auto">
          <ImageGallery images={images} title={product.title} />
        </div>
      </div>

      {/* ======== MOBILE: Price + CTA strip (visible before scroll on mobile) ======== */}
      <div className="lg:hidden">
        <div
          className="mx-4 mt-4 p-4 space-y-3"
          style={{ backgroundColor: '#FAFAF8', border: '1px solid rgba(44, 36, 32, 0.08)' }}
        >
          {/* Price — large and prominent */}
          {showPrice && (
            <div className="flex items-center justify-between">
              <p className={`font-display text-3xl md:text-4xl ${isSold ? 'line-through' : ''}`} style={{ color: isSold ? 'rgba(44, 36, 32, 0.2)' : '#0C0A08', fontWeight: 500 }}>
                {displayPrice}
              </p>
              <div className="flex items-center gap-1.5">
                <FavoriteButton product={product} size="sm" />
                <CompareButton product={product} size="sm" />
                <button
                  onClick={handleShare}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)', color: 'rgba(44, 36, 32, 0.4)' }}
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>
          )}
          {isSold && (
            <span className="font-body text-xs tracking-[0.2em] uppercase" style={{ color: '#B08D57' }}>Продано</span>
          )}

          {/* Availability */}
          {product.quantity > 0 && !isSold && (
            <div className="flex items-center gap-1.5">
              <Check size={13} style={{ color: '#7A8B6F' }} />
              <span className="font-body text-xs" style={{ color: '#7A8B6F' }}>
                В наличии{product.quantity > 1 ? ` — ${product.quantity} шт.` : ''}
              </span>
            </div>
          )}

          {/* Mobile CTAs — big and prominent */}
          {!isSold && (
            <div className="space-y-2">
              {resolvedWhatsapp && (
                <a
                  href={`https://wa.me/${resolvedWhatsapp}?text=${encodeURIComponent(siteConfig.messageTemplates.whatsapp(product, formatPrice))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 font-body text-sm font-medium tracking-wide uppercase rounded-sm transition-all"
                  style={{ backgroundColor: '#25D366', color: '#fff' }}
                >
                  <MessageCircle size={16} />
                  Написать в WhatsApp
                </a>
              )}
              <div className="flex gap-2">
                {resolvedTelegram && (
                  <a
                    href={`https://t.me/${resolvedTelegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 font-body text-sm tracking-wide rounded-sm"
                    style={{ backgroundColor: '#26A3EE', color: '#fff' }}
                  >
                    <SendIcon size={14} />
                    Telegram
                  </a>
                )}
                <Link
                  to={`/contact?product=${product.id}&title=${encodeURIComponent(product.title)}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 font-body text-sm tracking-wide rounded-sm"
                  style={{ backgroundColor: 'rgba(44, 36, 32, 0.08)', color: '#2C2420' }}
                >
                  <Mail size={14} />
                  {isShop ? 'Написать' : isRealEstate ? 'Запрос' : 'Написать'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======== TWO-COLUMN LAYOUT: Info (left) + Price card (right) ======== */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">

          {/* ============ LEFT COLUMN — Product Info ============ */}
          <div className="lg:col-span-2">

            {/* Description */}
            <ExpandableSection title="Описание" defaultOpen={true}>
              <InlineDescriptionEditor
                productId={product.id}
                description={product.description}
                onUpdate={(newDesc) => setProduct((prev) => ({ ...prev, description: newDesc }))}
              />
            </ExpandableSection>

            {/* Details */}
            {allDetails.length > 0 && (
              <ExpandableSection title="Характеристики" defaultOpen={true}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                  {allDetails.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid rgba(44, 36, 32, 0.05)' }}>
                      <span className="font-body text-sm" style={{ color: 'rgba(44, 36, 32, 0.5)' }}>{label}</span>
                      <span className="font-body text-sm font-medium" style={{ color: '#2C2420' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            )}

            {/* Condition */}
            {product.condition && (
              <ExpandableSection title="Состояние">
                <ConditionMeter conditionId={product.condition} />
              </ExpandableSection>
            )}

            {/* Special attributes */}
            {specialAttrs.length > 0 && (
              <ExpandableSection title="Особенности">
                <div className="flex flex-wrap gap-2">
                  {specialAttrs.map((attr) => (
                    <div
                      key={attr.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm"
                      style={{ backgroundColor: `${attr.color}10`, border: `1px solid ${attr.color}20` }}
                    >
                      <span style={{ fontSize: '13px', color: attr.color }}>{attr.icon}</span>
                      <span className="font-body text-sm" style={{ color: attr.color }}>{attr.label}</span>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            )}

            {/* Authenticity — jewelry */}
            {(product.category === 'jewelry' && (product.details?.hallmark || product.details?.material || product.details?.weight_grams)) && (
              <ExpandableSection title="Подлинность">
                <div className="flex flex-wrap gap-6">
                  {product.details.hallmark && (
                    <div>
                      <p className="font-body text-[10px] tracking-wider uppercase mb-0.5" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>Проба</p>
                      <p className="font-body text-sm font-medium" style={{ color: '#B08D57' }}>{product.details.hallmark}</p>
                    </div>
                  )}
                  {product.details.material && (
                    <div>
                      <p className="font-body text-[10px] tracking-wider uppercase mb-0.5" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>Материал</p>
                      <p className="font-body text-sm font-medium" style={{ color: '#2C2420' }}>{product.details.material}</p>
                    </div>
                  )}
                  {product.details.weight_grams && (
                    <div>
                      <p className="font-body text-[10px] tracking-wider uppercase mb-0.5" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>Вес</p>
                      <p className="font-body text-sm font-medium" style={{ color: '#2C2420' }}>{product.details.weight_grams} г</p>
                    </div>
                  )}
                </div>
              </ExpandableSection>
            )}

            {/* Provenance — ceramics */}
            {(product.category === 'ceramics' && (product.details?.manufacturer || product.details?.material)) && (
              <ExpandableSection title="Происхождение">
                <div className="flex flex-wrap gap-6">
                  {product.details.manufacturer && (
                    <div>
                      <p className="font-body text-[10px] tracking-wider uppercase mb-0.5" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>Мануфактура</p>
                      <p className="font-body text-sm font-medium" style={{ color: '#B08D57' }}>{product.details.manufacturer}</p>
                    </div>
                  )}
                  {product.details.material && (
                    <div>
                      <p className="font-body text-[10px] tracking-wider uppercase mb-0.5" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>Материал</p>
                      <p className="font-body text-sm font-medium" style={{ color: '#2C2420' }}>{product.details.material}</p>
                    </div>
                  )}
                </div>
              </ExpandableSection>
            )}

            {/* Shipping */}
            {product.shipping?.length > 0 && (
              <ExpandableSection title="Доставка">
                <div className="space-y-2">
                  {product.shipping.map((s) => {
                    const opt = shippingOptions.find(o => o.id === s.id)
                    if (!opt) return null
                    return (
                      <div key={s.id} className="flex items-center gap-2">
                        <Truck size={14} style={{ color: 'rgba(44, 36, 32, 0.3)' }} />
                        <span className="font-body text-sm" style={{ color: '#2C2420' }}>{opt.name}</span>
                        {s.price && <span className="font-body text-xs" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>— {s.price}</span>}
                      </div>
                    )
                  })}
                </div>
              </ExpandableSection>
            )}

            {/* Hashtags */}
            {product.hashtags?.length > 0 && (
              <div className="py-3" style={{ borderBottom: '1px solid rgba(44, 36, 32, 0.08)' }}>
                <div className="flex flex-wrap gap-1.5">
                  {product.hashtags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/catalog?search=%23${encodeURIComponent(tag)}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 font-body text-[11px] rounded-full transition-colors"
                      style={{ backgroundColor: 'rgba(44, 36, 32, 0.04)', color: 'rgba(44, 36, 32, 0.45)' }}
                    >
                      <Hash size={9} />{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ============ RIGHT COLUMN — Sticky Price Card (desktop only) ============ */}
          <div className="hidden lg:block lg:col-span-1">
            <div
              className="sticky top-24 space-y-4"
              style={{
                backgroundColor: '#FAFAF8',
                border: '1px solid rgba(44, 36, 32, 0.1)',
                padding: '20px',
              }}
            >
              {/* Price — BIG and prominent */}
              {showPrice && (
                <div>
                  <p
                    className={`font-display ${isSold ? 'line-through' : ''}`}
                    style={{
                      color: isSold ? 'rgba(44, 36, 32, 0.2)' : '#0C0A08',
                      fontSize: '2.25rem',
                      fontWeight: 500,
                      lineHeight: 1.2,
                    }}
                  >
                    {displayPrice}
                  </p>
                  {isSold && (
                    <span className="font-body text-xs tracking-[0.2em] uppercase mt-1 inline-block" style={{ color: '#B08D57' }}>
                      Продано
                    </span>
                  )}
                </div>
              )}

              {/* Actions row */}
              <div className="flex items-center gap-2">
                <FavoriteButton product={product} size="md" />
                <CompareButton product={product} size="md" />
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)', color: 'rgba(44, 36, 32, 0.35)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(44, 36, 32, 0.12)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(44, 36, 32, 0.06)' }}
                >
                  <Share2 size={16} />
                </button>
              </div>

              <div className="h-px" style={{ backgroundColor: 'rgba(44, 36, 32, 0.08)' }} />

              {/* Availability */}
              {product.quantity > 0 && !isSold && (
                <div className="flex items-center gap-2">
                  <Check size={14} style={{ color: '#7A8B6F' }} />
                  <span className="font-body text-sm" style={{ color: '#7A8B6F' }}>
                    В наличии{product.quantity > 1 ? ` — ${product.quantity} шт.` : ''}
                  </span>
                </div>
              )}

              {/* Shipping summary */}
              {product.shipping?.length > 0 && (
                <div className="flex items-center gap-2">
                  <Truck size={14} style={{ color: 'rgba(44, 36, 32, 0.3)' }} />
                  <span className="font-body text-sm" style={{ color: 'rgba(44, 36, 32, 0.5)' }}>
                    {shippingOptions.find(o => o.id === product.shipping[0]?.id)?.name || 'Доставка доступна'}
                  </span>
                </div>
              )}

              <div className="h-px" style={{ backgroundColor: 'rgba(44, 36, 32, 0.08)' }} />

              {/* CTA buttons — PROMINENT */}
              {!isSold && (
                <div className="space-y-2.5">
                  {resolvedWhatsapp && (
                    <a
                      href={`https://wa.me/${resolvedWhatsapp}?text=${encodeURIComponent(siteConfig.messageTemplates.whatsapp(product, formatPrice))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-4 font-body text-sm font-medium tracking-[0.1em] uppercase transition-all duration-200 rounded-sm"
                      style={{ backgroundColor: '#25D366', color: '#fff' }}
                      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(37, 211, 102, 0.3)')}
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                    >
                      <MessageCircle size={16} />
                      Написать в WhatsApp
                    </a>
                  )}

                  <div className="flex gap-2">
                    {resolvedTelegram && (
                      <a
                        href={`https://t.me/${resolvedTelegram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3 font-body text-sm rounded-sm transition-all"
                        style={{ backgroundColor: '#26A3EE', color: '#fff' }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        <SendIcon size={14} />
                        Telegram
                      </a>
                    )}
                    <Link
                      to={`/contact?product=${product.id}&title=${encodeURIComponent(product.title)}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 font-body text-sm rounded-sm transition-all"
                      style={{ backgroundColor: '#2C2420', color: '#F7F2EB' }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      <Mail size={14} />
                      {isShop ? 'Написать' : isRealEstate ? 'Запрос' : 'Написать'}
                    </Link>
                  </div>

                  {siteConfig.phone && (
                    <a
                      href={`tel:${siteConfig.phoneClean}`}
                      className="flex items-center justify-center gap-2 w-full py-2 font-body text-xs transition-colors"
                      style={{ color: 'rgba(44, 36, 32, 0.4)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#0C0A08')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(44, 36, 32, 0.4)')}
                    >
                      <Phone size={12} />
                      {siteConfig.phone}
                    </a>
                  )}
                </div>
              )}

              {/* Seller contacts */}
              {(product.contact_whatsapp || product.contact_telegram || product.contact_instagram) && (
                <>
                  <div className="h-px" style={{ backgroundColor: 'rgba(44, 36, 32, 0.08)' }} />
                  <div>
                    <p className="font-body text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(44, 36, 32, 0.3)' }}>
                      Контакт продавца
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.contact_whatsapp && (
                        <a href={`https://wa.me/${product.contact_whatsapp.replace(/[^\d+]/g, '')}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 font-body text-xs rounded transition-opacity hover:opacity-80"
                          style={{ backgroundColor: '#25D366', color: '#fff' }}>
                          <MessageCircle size={11} /> WhatsApp
                        </a>
                      )}
                      {product.contact_telegram && (
                        <a href={product.contact_telegram.startsWith('http') ? product.contact_telegram : `https://t.me/${product.contact_telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 font-body text-xs rounded transition-opacity hover:opacity-80"
                          style={{ backgroundColor: '#26A3EE', color: '#fff' }}>
                          <SendIcon size={11} /> Telegram
                        </a>
                      )}
                      {product.contact_instagram && (
                        <a href={`https://instagram.com/${product.contact_instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 font-body text-xs rounded transition-opacity hover:opacity-80"
                          style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff' }}>
                          <Instagram size={11} /> Instagram
                        </a>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Payment methods */}
              {(siteConfig.kaspiLink || Object.values(siteConfig.crypto || {}).some(Boolean)) && (
                <>
                  <div className="h-px" style={{ backgroundColor: 'rgba(44, 36, 32, 0.08)' }} />
                  <div>
                    <p className="font-body text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(44, 36, 32, 0.3)' }}>
                      Способы оплаты
                    </p>
                    <div className="space-y-2">
                      {siteConfig.kaspiLink && (
                        <a
                          href={siteConfig.kaspiLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-sm transition-all duration-200"
                          style={{ backgroundColor: 'rgba(240, 68, 56, 0.06)', border: '1px solid rgba(240, 68, 56, 0.15)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(240, 68, 56, 0.12)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(240, 68, 56, 0.06)' }}
                        >
                          <div className="w-7 h-7 rounded-sm flex items-center justify-center" style={{ backgroundColor: '#F04438' }}>
                            <span className="font-display text-[10px] font-bold text-white">K</span>
                          </div>
                          <div>
                            <p className="font-body text-sm font-medium" style={{ color: '#2C2420' }}>Kaspi.kz</p>
                            <p className="font-body text-[10px]" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>Перевод через Kaspi</p>
                          </div>
                        </a>
                      )}
                      {siteConfig.crypto?.btc && (
                        <CryptoAddress label="Bitcoin (BTC)" address={siteConfig.crypto.btc} color="#F7931A" />
                      )}
                      {siteConfig.crypto?.eth && (
                        <CryptoAddress label="Ethereum (ETH)" address={siteConfig.crypto.eth} color="#627EEA" />
                      )}
                      {siteConfig.crypto?.usdt_trc20 && (
                        <CryptoAddress label="USDT (TRC-20)" address={siteConfig.crypto.usdt_trc20} color="#26A17B" />
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* QR */}
              <div className="h-px" style={{ backgroundColor: 'rgba(44, 36, 32, 0.08)' }} />
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="flex-shrink-0 transition-transform duration-200 hover:scale-110 cursor-zoom-in"
                  title="Нажмите для увеличения"
                >
                  <QRCodeSVG value={window.location.href} size={80} level="M" fgColor="#2C2420" bgColor="#FAFAF8" />
                </button>
                <div>
                  <p className="font-body text-xs" style={{ color: 'rgba(44, 36, 32, 0.5)' }}>
                    QR-код товара
                  </p>
                  <p className="font-body text-[10px]" style={{ color: 'rgba(44, 36, 32, 0.3)' }}>
                    Нажмите для увеличения
                  </p>
                </div>
              </div>

              {/* QR Modal */}
              {qrModalOpen && (
                <div
                  className="fixed inset-0 z-[9999] flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(12, 10, 8, 0.8)' }}
                  onClick={() => setQrModalOpen(false)}
                >
                  <div
                    className="p-8 rounded-sm animate-slide-up"
                    style={{ backgroundColor: '#FAFAF8' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <QRCodeSVG value={window.location.href} size={280} level="H" fgColor="#2C2420" bgColor="#FAFAF8" />
                    <p className="text-center font-body text-xs mt-4" style={{ color: 'rgba(44, 36, 32, 0.5)' }}>
                      Отсканируйте для быстрого доступа
                    </p>
                  </div>
                </div>
              )}

              {/* Price insight & chart — below QR */}
              {avgPrice && !isSold && !isRealEstate && !isShop && (
                <>
                  <div className="h-px" style={{ backgroundColor: 'rgba(44, 36, 32, 0.08)' }} />
                  <PriceInsight price={product.price} avgPrice={avgPrice} />
                </>
              )}
              {!isShop && <PriceHistoryChart productId={product.id} />}
            </div>
          </div>
        </div>
      </div>

      {/* ======== Linked products ======== */}
      {linkedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-10">
          <div className="pt-8" style={{ borderTop: '1px solid rgba(44, 36, 32, 0.08)' }}>
            <h2 className="font-display text-xl md:text-2xl mb-6" style={{ color: '#0C0A08' }}>
              Рекомендуемые товары
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {linkedProducts.map((p, i) => (
                <div key={p.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======== Similar products ======== */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {!isShop && <SimilarProducts currentProduct={product} />}
      </div>

      {/* ======== Reviews ======== */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-10">
        {!isShop && <ProductReviews productId={product.id} />}
      </div>
    </div>
  )
}
