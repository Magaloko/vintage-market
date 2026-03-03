import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, ShoppingBag, Tag, Clock, Award, Ruler, MapPin, Home, Phone, Globe, Mail } from 'lucide-react'
import { getProduct, getCategoryAvgPrice } from '../lib/api'
import { categories, conditions, categoryFields } from '../data/demoProducts'
import ImageGallery from '../components/public/ImageGallery'
import FavoriteButton from '../components/public/FavoriteButton'
import CompareButton from '../components/public/CompareButton'
import PriceInsight from '../components/public/PriceInsight'
import SimilarProducts from '../components/public/SimilarProducts'

// Icons for detail field types
const fieldIcons = {
  rooms: Home, area_m2: Ruler, floor: Home, address: MapPin,
  phone: Phone, email: Mail, website: Globe,
  default: Tag,
}

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [avgPrice, setAvgPrice] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data, error } = await getProduct(id)
        if (error || !data) {
          navigate('/catalog', { replace: true })
          return
        }
        setProduct(data)

        try {
          const avg = await getCategoryAvgPrice(data.category)
          setAvgPrice(avg)
        } catch (e) { /* optional */ }
      } catch (e) {
        navigate('/catalog', { replace: true })
      }
      setLoading(false)
    }
    load()
    window.scrollTo(0, 0)
  }, [id, navigate])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square" style={{ backgroundColor: 'rgba(91, 58, 41, 0.06)', borderRadius: '6px' }} />
          <div className="space-y-6">
            <div className="h-8 rounded w-3/4" style={{ backgroundColor: 'rgba(91, 58, 41, 0.06)' }} />
            <div className="h-6 rounded w-1/4" style={{ backgroundColor: 'rgba(91, 58, 41, 0.06)' }} />
            <div className="h-24 rounded" style={{ backgroundColor: 'rgba(91, 58, 41, 0.06)' }} />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  // Fix: pass correct format {url, alt_text} to ImageGallery
  const images = product.images?.length > 0
    ? product.images.map(img => ({ url: img.url, alt_text: img.alt_text || product.title }))
    : product.image_url
      ? [{ url: product.image_url, alt_text: product.title }]
      : []

  const category = categories.find(c => c.id === product.category)
  const condition = conditions.find(c => c.id === product.condition)
  const isRealEstate = category?.group === 'realestate'
  const isShop = category?.group === 'shops'
  const showPrice = product.price > 0

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: product.title, url }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(url) } catch {}
    }
  }

  // Base details
  const baseDetails = [
    category && { icon: Tag, label: 'Категория', value: category.name },
    condition && { icon: Award, label: 'Состояние', value: condition.name },
    product.era && { icon: Clock, label: 'Эпоха', value: product.era },
    product.brand && { icon: ShoppingBag, label: 'Бренд', value: product.brand },
  ].filter(Boolean)

  // Category-specific details from product.details
  const catFields = categoryFields[product.category] || []
  const customDetails = catFields
    .filter(f => product.details?.[f.key] != null && product.details[f.key] !== '')
    .map(f => {
      let value = product.details[f.key]
      if (f.unit) value = `${value} ${f.unit}`
      const IconComp = fieldIcons[f.key] || fieldIcons.default
      return { icon: IconComp, label: f.label, value: String(value) }
    })

  const allDetails = [...baseDetails, ...customDetails]

  return (
    <div className="page-enter">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-2 font-sans text-xs"
          style={{ color: 'rgba(91, 58, 41, 0.35)' }}>
          <Link to="/catalog" className="flex items-center gap-1 transition-colors"
            onMouseEnter={e => e.currentTarget.style.color = '#5B3A29'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(91, 58, 41, 0.35)'}>
            <ArrowLeft size={14} />
            Каталог
          </Link>
          {category && (
            <>
              <span>/</span>
              <Link to={`/catalog/${category.id}`} className="transition-colors"
                onMouseEnter={e => e.currentTarget.style.color = '#5B3A29'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(91, 58, 41, 0.35)'}>
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="truncate max-w-[200px]" style={{ color: 'rgba(91, 58, 41, 0.55)' }}>{product.title}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <ImageGallery images={images} title={product.title} />

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title + Actions */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-display text-3xl md:text-4xl leading-tight"
                style={{ color: '#0E1A2B' }}>
                {product.title}
              </h1>
              <div className="flex items-center gap-2 shrink-0 mt-1">
                <FavoriteButton product={product} size="md" />
                <CompareButton product={product} size="md" />
                <button onClick={handleShare}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgba(91, 58, 41, 0.06)', color: 'rgba(91, 58, 41, 0.35)' }}>
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Price + Insight */}
            {showPrice && (
              <div className="flex items-center gap-4">
                <span className={`font-sans text-3xl font-bold ${product.status === 'sold' ? 'line-through' : ''}`}
                  style={{ color: product.status === 'sold' ? 'rgba(91, 58, 41, 0.3)' : '#0E1A2B' }}>
                  {isRealEstate && product.details?.rent_or_buy === 'Аренда'
                    ? `${product.price}\u20ac / мес.`
                    : `${product.price}\u20ac`
                  }
                </span>
                {product.status === 'sold' && (
                  <span className="font-sans text-sm tracking-widest uppercase" style={{ color: '#C2642C' }}>Продано</span>
                )}
              </div>
            )}

            {/* Price insight (only for vintage items) */}
            {avgPrice && product.status !== 'sold' && !isRealEstate && !isShop && (
              <PriceInsight price={product.price} avgPrice={avgPrice} />
            )}

            {/* Divider */}
            <div className="w-12 h-px" style={{ backgroundColor: '#B89A5A' }} />

            {/* Description */}
            <p className="font-body text-lg leading-relaxed" style={{ color: 'rgba(91, 58, 41, 0.6)' }}>
              {product.description}
            </p>

            {/* Details Grid */}
            {allDetails.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {allDetails.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 p-3"
                    style={{ backgroundColor: 'rgba(91, 58, 41, 0.04)', borderRadius: '6px' }}>
                    <Icon size={18} className="shrink-0" style={{ color: 'rgba(91, 58, 41, 0.25)' }} />
                    <div className="min-w-0">
                      <p className="font-sans text-[10px] uppercase tracking-wider" style={{ color: 'rgba(91, 58, 41, 0.35)' }}>{label}</p>
                      <p className="font-body truncate" style={{ color: '#1C1C1A' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Shop specialization (textarea field) */}
            {isShop && product.details?.specialization && (
              <div className="p-4" style={{ backgroundColor: 'rgba(91, 58, 41, 0.04)', borderRadius: '6px' }}>
                <p className="font-sans text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(91, 58, 41, 0.35)' }}>Специализация</p>
                <p className="font-body" style={{ color: 'rgba(91, 58, 41, 0.6)' }}>{product.details.specialization}</p>
              </div>
            )}

            {/* CTA */}
            {product.status !== 'sold' && (
              <Link to="/contact" className="btn-primary w-full text-center justify-center">
                {isShop ? 'Связаться с магазином' : isRealEstate ? 'Запросить просмотр' : 'Связаться для покупки'}
              </Link>
            )}
          </div>
        </div>

        {/* Similar Products (not for shops) */}
        {!isShop && <SimilarProducts currentProduct={product} />}
      </div>
    </div>
  )
}
