import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, ShoppingBag, Tag, Clock, Award, Ruler } from 'lucide-react'
import { getProduct, getCategoryAvgPrice } from '../lib/api'
import { categories, conditions } from '../data/demoProducts'
import ImageGallery from '../components/public/ImageGallery'
import FavoriteButton from '../components/public/FavoriteButton'
import CompareButton from '../components/public/CompareButton'
import PriceInsight from '../components/public/PriceInsight'
import SimilarProducts from '../components/public/SimilarProducts'

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

        // Load category average for price insight
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
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-vintage-beige/30 rounded-lg" />
          <div className="space-y-6">
            <div className="h-8 bg-vintage-beige/30 rounded w-3/4" />
            <div className="h-6 bg-vintage-beige/30 rounded w-1/4" />
            <div className="h-24 bg-vintage-beige/30 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const images = product.images?.length > 0
    ? product.images.map(img => ({ src: img.url, alt: img.alt_text || product.title }))
    : product.image_url
      ? [{ src: product.image_url, alt: product.title }]
      : []

  const category = categories.find(c => c.id === product.category)
  const condition = conditions.find(c => c.id === product.condition)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: product.title, url }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(url) } catch {}
    }
  }

  const details = [
    { icon: Tag, label: '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f', value: category?.name },
    { icon: Award, label: '\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435', value: condition?.name },
    { icon: Clock, label: '\u042d\u043f\u043e\u0445\u0430', value: product.era },
    { icon: ShoppingBag, label: '\u0411\u0440\u0435\u043d\u0434', value: product.brand },
    { icon: Ruler, label: '\u0420\u0430\u0437\u043c\u0435\u0440', value: product.size },
  ].filter(d => d.value)

  return (
    <div className="page-enter">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-2 font-sans text-xs text-vintage-brown/40">
          <Link to="/catalog" className="hover:text-vintage-brown transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            {'\u041a\u0430\u0442\u0430\u043b\u043e\u0433'}
          </Link>
          {category && (
            <>
              <span>/</span>
              <Link to={`/catalog/${category.id}`} className="hover:text-vintage-brown transition-colors">
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-vintage-brown/60 truncate max-w-[200px]">{product.title}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <ImageGallery images={images} isSold={product.status === 'sold'} />

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title + Actions */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-display text-3xl md:text-4xl text-vintage-dark leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-2 shrink-0 mt-1">
                <FavoriteButton product={product} size="md" />
                <CompareButton product={product} size="md" />
                <button onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-vintage-beige/50 flex items-center justify-center text-vintage-brown/40 hover:text-vintage-brown transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Price + Insight */}
            <div className="flex items-center gap-4">
              <span className={`font-sans text-3xl font-bold ${product.status === 'sold' ? 'text-vintage-brown/30 line-through' : 'text-vintage-dark'}`}>
                {product.price}{'\u20ac'}
              </span>
              {product.status === 'sold' && (
                <span className="font-sans text-sm tracking-widest uppercase text-vintage-rust">{'\u041f\u0440\u043e\u0434\u0430\u043d\u043e'}</span>
              )}
            </div>

            {/* Price insight */}
            {avgPrice && product.status !== 'sold' && (
              <PriceInsight price={product.price} avgPrice={avgPrice} />
            )}

            {/* Divider */}
            <div className="vintage-divider !mx-0 !w-12" />

            {/* Description */}
            <p className="font-body text-lg leading-relaxed text-vintage-brown/70">
              {product.description}
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {details.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-vintage-beige/20 rounded-lg">
                  <Icon size={18} className="text-vintage-brown/30 shrink-0" />
                  <div>
                    <p className="font-sans text-[10px] uppercase tracking-wider text-vintage-brown/40">{label}</p>
                    <p className="font-body text-vintage-ink">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            {product.status !== 'sold' && (
              <Link to="/contact" className="vintage-btn w-full text-center">
                {'\u0421\u0432\u044f\u0437\u0430\u0442\u044c\u0441\u044f \u0434\u043b\u044f \u043f\u043e\u043a\u0443\u043f\u043a\u0438'}
              </Link>
            )}
          </div>
        </div>

        {/* Similar Products */}
        <SimilarProducts currentProduct={product} />
      </div>
    </div>
  )
}
