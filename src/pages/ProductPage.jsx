import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Eye, Calendar, Tag, Ruler, Clock, Package, Share2 } from 'lucide-react'
import { getProduct } from '../lib/api'
import { categories, conditions } from '../data/demoProducts'
import ImageGallery from '../components/public/ImageGallery'
import FavoriteButton from '../components/public/FavoriteButton'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await getProduct(id)
      setProduct(data)
      setLoading(false)
    }
    load()
  }, [id])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `${product.title} — ${product.price}€`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Ссылка скопирована')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-vintage-beige/30 rounded" />
          <div className="space-y-6">
            <div className="h-8 bg-vintage-beige/30 rounded w-3/4" />
            <div className="h-6 bg-vintage-beige/30 rounded w-1/4" />
            <div className="h-32 bg-vintage-beige/30 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-3xl text-vintage-brown/30 mb-4">Товар не найден</h2>
        <Link to="/catalog" className="vintage-btn-outline">Вернуться в каталог</Link>
      </div>
    )
  }

  const categoryLabel = categories.find(c => c.id === product.category)?.name || product.category
  const conditionLabel = conditions.find(c => c.id === product.condition)?.name || product.condition

  // Build images array — prefer images array, fallback to image_url
  const galleryImages = product.images?.length > 0
    ? product.images
    : product.image_url
      ? [{ url: product.image_url, alt_text: product.title }]
      : []

  return (
    <div className="page-enter">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 text-sm font-sans">
          <Link to="/catalog" className="text-vintage-brown/40 hover:text-vintage-dark transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Каталог
          </Link>
          <span className="text-vintage-brown/20">/</span>
          <Link to={`/catalog/${product.category}`} className="text-vintage-brown/40 hover:text-vintage-dark transition-colors">
            {categoryLabel}
          </Link>
          <span className="text-vintage-brown/20">/</span>
          <span className="text-vintage-brown/60 truncate">{product.title}</span>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Gallery */}
          <div className="relative sticky top-24 self-start">
            <ImageGallery images={galleryImages} title={product.title} />

            {/* Sold overlay on gallery */}
            {product.status === 'sold' && (
              <div className="absolute inset-0 bg-vintage-dark/50 flex items-center justify-center pointer-events-none"
                style={{ bottom: galleryImages.length > 1 ? '5rem' : 0 }}>
                <span className="font-sans text-lg tracking-[0.4em] uppercase text-vintage-cream">Продано</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.era && (
              <span className="inline-block px-3 py-1 bg-vintage-dark text-vintage-cream font-sans text-xs tracking-wider mb-4">
                {product.era}
              </span>
            )}

            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-vintage-dark leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                <FavoriteButton productId={product.id} size="md" />
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80
                    text-vintage-brown/40 hover:text-vintage-dark hover:bg-white shadow-sm hover:shadow-md transition-all"
                  title="Поделиться"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {product.brand && (
              <p className="font-sans text-sm tracking-[0.2em] uppercase text-vintage-brown/50 mb-6">
                {product.brand}
              </p>
            )}

            <div className="flex items-baseline gap-4 mb-8">
              <span className="font-display text-4xl font-bold text-vintage-dark">
                {product.price}€
              </span>
              <span className={`font-sans text-sm tracking-wider uppercase ${
                product.status === 'sold' ? 'text-red-600' : 'text-vintage-green'
              }`}>
                {product.status === 'sold' ? 'Продано' : 'В наличии'}
              </span>
            </div>

            <div className="vintage-divider !mx-0 mb-8" />

            {/* Description */}
            <div className="mb-10">
              <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-vintage-brown/40 mb-3">
                Описание
              </h3>
              <p className="font-body text-lg text-vintage-ink/80 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specs */}
            <div className="mb-10">
              <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-vintage-brown/40 mb-4">
                Характеристики
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-vintage-beige/20 rounded">
                  <Tag size={16} className="text-vintage-brown/40" />
                  <div>
                    <p className="font-sans text-xs text-vintage-brown/40">Категория</p>
                    <p className="font-body text-sm text-vintage-dark">{categoryLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-vintage-beige/20 rounded">
                  <Package size={16} className="text-vintage-brown/40" />
                  <div>
                    <p className="font-sans text-xs text-vintage-brown/40">Состояние</p>
                    <p className="font-body text-sm text-vintage-dark">{conditionLabel}</p>
                  </div>
                </div>
                {product.size && (
                  <div className="flex items-center gap-3 p-3 bg-vintage-beige/20 rounded">
                    <Ruler size={16} className="text-vintage-brown/40" />
                    <div>
                      <p className="font-sans text-xs text-vintage-brown/40">Размер</p>
                      <p className="font-body text-sm text-vintage-dark">{product.size}</p>
                    </div>
                  </div>
                )}
                {product.era && (
                  <div className="flex items-center gap-3 p-3 bg-vintage-beige/20 rounded">
                    <Clock size={16} className="text-vintage-brown/40" />
                    <div>
                      <p className="font-sans text-xs text-vintage-brown/40">Эпоха</p>
                      <p className="font-body text-sm text-vintage-dark">{product.era}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-vintage-beige/20 rounded">
                  <Eye size={16} className="text-vintage-brown/40" />
                  <div>
                    <p className="font-sans text-xs text-vintage-brown/40">Просмотры</p>
                    <p className="font-body text-sm text-vintage-dark">{product.views || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-vintage-beige/20 rounded">
                  <Calendar size={16} className="text-vintage-brown/40" />
                  <div>
                    <p className="font-sans text-xs text-vintage-brown/40">Добавлено</p>
                    <p className="font-body text-sm text-vintage-dark">
                      {new Date(product.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            {product.status !== 'sold' && (
              <div className="flex flex-wrap gap-4">
                <a
                  href={`mailto:info@vintage-epoha.com?subject=Запрос: ${product.title}`}
                  className="vintage-btn"
                >
                  Связаться
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Здравствуйте! Меня интересует: ${product.title} (${product.price}€)`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vintage-btn-outline"
                >
                  WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
