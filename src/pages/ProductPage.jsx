import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, ShoppingBag, Tag, Clock, Award, Ruler, MapPin, Home, Phone, Globe, Mail, MessageCircle, Send as SendIcon, Store } from 'lucide-react'
import { getProduct, getCategoryAvgPrice, getShop } from '../lib/api'
import { categories, conditions, categoryFields } from '../data/demoProducts'
import ImageGallery from '../components/public/ImageGallery'
import FavoriteButton from '../components/public/FavoriteButton'
import CompareButton from '../components/public/CompareButton'
import PriceInsight from '../components/public/PriceInsight'
import SimilarProducts from '../components/public/SimilarProducts'

import { siteConfig } from '../lib/siteConfig'

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
  const [shopData, setShopData] = useState(null)

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

        if (data.shop_id) {
          try {
            const { data: shop } = await getShop(data.shop_id)
            setShopData(shop)
          } catch (e) { /* optional */ }
        }
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
          <div className="aspect-square" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)', borderRadius: '2px' }} />
          <div className="space-y-6">
            <div className="h-8 rounded w-3/4" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
            <div className="h-6 rounded w-1/4" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
            <div className="h-24 rounded" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
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
          style={{ color: 'rgba(44, 36, 32, 0.35)' }}>
          <Link to="/catalog" className="flex items-center gap-1 transition-colors"
            onMouseEnter={e => e.currentTarget.style.color = '#2C2420'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(44, 36, 32, 0.35)'}>
            <ArrowLeft size={14} />
            Каталог
          </Link>
          {category && (
            <>
              <span>/</span>
              <Link to={`/catalog/${category.id}`} className="transition-colors"
                onMouseEnter={e => e.currentTarget.style.color = '#2C2420'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(44, 36, 32, 0.35)'}>
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="truncate max-w-[200px]" style={{ color: 'rgba(44, 36, 32, 0.55)' }}>{product.title}</span>
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
                style={{ color: '#0C0A08' }}>
                {product.title}
              </h1>
              <div className="flex items-center gap-2 shrink-0 mt-1">
                <FavoriteButton product={product} size="md" />
                <CompareButton product={product} size="md" />
                <button onClick={handleShare}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)', color: 'rgba(44, 36, 32, 0.35)' }}>
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Shop Badge */}
            {shopData && (
              <Link to={`/shop/${shopData.slug}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 transition-all duration-300"
                style={{ backgroundColor: 'rgba(176, 141, 87, 0.06)', border: '1px solid rgba(176, 141, 87, 0.12)', borderRadius: '2px' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.12)' }}>
                <Store size={13} style={{ color: '#B08D57' }} />
                <span className="font-body text-xs" style={{ color: '#B08D57' }}>{shopData.name}</span>
              </Link>
            )}

            {/* Price + Insight */}
            {showPrice && (
              <div className="flex items-center gap-4">
                <span className={`font-sans text-3xl font-bold ${product.status === 'sold' ? 'line-through' : ''}`}
                  style={{ color: product.status === 'sold' ? 'rgba(44, 36, 32, 0.3)' : '#0C0A08' }}>
                  {isRealEstate && product.details?.rent_or_buy === 'Аренда'
                    ? `${product.price}\u20ac / мес.`
                    : `${product.price}\u20ac`
                  }
                </span>
                {product.status === 'sold' && (
                  <span className="font-sans text-sm tracking-widest uppercase" style={{ color: '#B08D57' }}>Продано</span>
                )}
              </div>
            )}

            {/* Price insight (only for vintage items) */}
            {avgPrice && product.status !== 'sold' && !isRealEstate && !isShop && (
              <PriceInsight price={product.price} avgPrice={avgPrice} />
            )}

            {/* Divider */}
            <div className="w-12 h-px" style={{ backgroundColor: '#B08D57' }} />

            {/* Description */}
            <p className="font-body text-lg leading-relaxed" style={{ color: 'rgba(44, 36, 32, 0.6)' }}>
              {product.description}
            </p>

            {/* Details Grid */}
            {allDetails.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {allDetails.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 p-3"
                    style={{ backgroundColor: 'rgba(44, 36, 32, 0.04)', borderRadius: '2px' }}>
                    <Icon size={18} className="shrink-0" style={{ color: 'rgba(44, 36, 32, 0.25)' }} />
                    <div className="min-w-0">
                      <p className="font-sans text-[10px] uppercase tracking-wider" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>{label}</p>
                      <p className="font-body truncate" style={{ color: '#2C2420' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Shop specialization (textarea field) */}
            {isShop && product.details?.specialization && (
              <div className="p-4" style={{ backgroundColor: 'rgba(44, 36, 32, 0.04)', borderRadius: '2px' }}>
                <p className="font-sans text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>Специализация</p>
                <p className="font-body" style={{ color: 'rgba(44, 36, 32, 0.6)' }}>{product.details.specialization}</p>
              </div>
            )}

            {/* CTA — Contact Options */}
            {product.status !== 'sold' && (
              <div className="space-y-3">
                {/* WhatsApp */}
                {siteConfig.whatsapp && (
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.messageTemplates.whatsapp(product))}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-3.5 font-body text-sm tracking-[0.1em] uppercase transition-all duration-300"
                    style={{ backgroundColor: '#25D366', color: '#fff', borderRadius: '2px' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(37, 211, 102, 0.3)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
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
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 font-body text-sm tracking-[0.1em] uppercase transition-all duration-300"
                      style={{ backgroundColor: 'rgba(38, 163, 238, 0.1)', color: '#26A3EE', border: '1px solid rgba(38, 163, 238, 0.2)', borderRadius: '2px' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#26A3EE'; e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(38, 163, 238, 0.1)'; e.currentTarget.style.color = '#26A3EE' }}
                    >
                      <SendIcon size={14} />
                      Telegram
                    </a>
                  )}

                  {/* Contact Form */}
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
                  <a href={`tel:${siteConfig.phoneClean}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 font-body text-xs transition-colors"
                    style={{ color: 'rgba(44, 36, 32, 0.35)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#0C0A08'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(44, 36, 32, 0.35)'}
                  >
                    <Phone size={12} />
                    {siteConfig.phone}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Similar Products (not for shops) */}
        {!isShop && <SimilarProducts currentProduct={product} />}
      </div>
    </div>
  )
}
