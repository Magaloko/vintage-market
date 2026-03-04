import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Globe, Clock, Star, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { getShop, getShopProducts, getShopReviews, createShopReview } from '../lib/api'
import ProductCard from '../components/public/ProductCard'

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StarRating({ value, size = 14, interactive = false, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type={interactive ? 'button' : undefined}
          onClick={interactive ? () => onChange?.(s) : undefined}
          className={interactive ? '' : 'pointer-events-none'}
        >
          <Star
            size={size}
            fill={s <= Math.round(value) ? '#B08D57' : 'none'}
            style={{
              color:
                s <= Math.round(value) ? '#B08D57' : 'rgba(44, 36, 32, 0.15)',
            }}
          />
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function ShopPage() {
  const { slug } = useParams()

  const [shop, setShop] = useState(null)
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  /* ---------- Load shop data ---------- */

  useEffect(() => {
    ;(async () => {
      setLoading(true)

      const { data: shopData } = await getShop(slug)
      if (!shopData) {
        setLoading(false)
        return
      }

      setShop(shopData)

      const [prodRes, revRes] = await Promise.all([
        getShopProducts(shopData.id),
        getShopReviews(shopData.id),
      ])

      setProducts(prodRes.data || [])
      setReviews(revRes.data || [])
      setLoading(false)
    })()
  }, [slug])

  /* ---------- Submit review ---------- */

  const handleReview = async (e) => {
    e.preventDefault()
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) return

    setSubmitting(true)
    const { data, error } = await createShopReview({
      shop_id: shop.id,
      ...reviewForm,
    })
    setSubmitting(false)

    if (error) {
      toast.error('Ошибка')
      return
    }

    const newReview = data || {
      ...reviewForm,
      id: Date.now(),
      created_at: new Date().toISOString(),
    }
    setReviews((prev) => [newReview, ...prev])
    setReviewForm({ name: '', rating: 5, comment: '' })
    setShowReviewForm(false)
    toast.success('Отзыв отправлен!')
  }

  /* ---------- Derived ---------- */

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : shop?.rating || 0

  /* ---------- Loading state ---------- */

  if (loading) {
    return (
      <div className="page-enter">
        <div className="pt-28 pb-16" style={{ backgroundColor: '#0C0A08' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div
              className="h-8 w-48 rounded animate-pulse"
              style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)' }}
            />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded animate-pulse"
                style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ---------- Not found ---------- */

  if (!shop) {
    return (
      <div className="page-enter">
        <div className="pt-28 pb-16" style={{ backgroundColor: '#0C0A08' }}>
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="font-display text-4xl italic" style={{ color: '#F0E6D6' }}>
              Магазин не найден
            </h1>
          </div>
        </div>
      </div>
    )
  }

  /* ---------- Contact items ---------- */

  const contactItems = [
    shop.address && { icon: MapPin, value: shop.address },
    shop.phone && {
      icon: Phone,
      value: shop.phone,
      href: `tel:${shop.phone.replace(/\s/g, '')}`,
    },
    shop.email && { icon: Mail, value: shop.email, href: `mailto:${shop.email}` },
    shop.website && {
      icon: Globe,
      value: shop.website.replace(/^https?:\/\//, ''),
      href: shop.website,
    },
    shop.opening_hours && { icon: Clock, value: shop.opening_hours },
  ].filter(Boolean)

  /* ---------- Render ---------- */

  return (
    <div className="page-enter">
      {/* Hero */}
      <div className="pt-28 pb-16" style={{ backgroundColor: '#0C0A08' }}>
        <div className="max-w-7xl mx-auto px-6">
          <span
            className="font-body text-[10px] tracking-[0.5em] uppercase"
            style={{ color: 'rgba(176, 141, 87, 0.4)' }}
          >
            Магазин
          </span>

          <div className="flex items-start gap-6 mt-4">
            {shop.logo_url ? (
              <img
                src={shop.logo_url}
                alt={shop.name}
                className="w-20 h-20 rounded object-cover"
              />
            ) : (
              <div
                className="w-20 h-20 rounded flex items-center justify-center font-display text-2xl"
                style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)', color: '#B08D57' }}
              >
                {shop.name.charAt(0)}
              </div>
            )}

            <div>
              <h1
                className="font-display text-3xl md:text-5xl italic"
                style={{ color: '#F0E6D6' }}
              >
                {shop.name}
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <StarRating value={avgRating} />
                <span className="font-body text-sm" style={{ color: '#B08D57' }}>
                  {avgRating}
                </span>
                <span
                  className="font-body text-xs"
                  style={{ color: 'rgba(240, 230, 214, 0.3)' }}
                >
                  ({reviews.length} отзывов)
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="gdt-divider mt-12" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Description */}
            {shop.description && (
              <div className="mb-12">
                <p
                  className="font-display text-lg italic leading-relaxed"
                  style={{ color: 'rgba(44, 36, 32, 0.6)' }}
                >
                  {shop.description}
                </p>
              </div>
            )}

            {/* Products */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl italic" style={{ color: '#0C0A08' }}>
                  Товары
                  <span
                    className="font-body text-sm ml-2"
                    style={{ color: 'rgba(44, 36, 32, 0.3)' }}
                  >
                    ({products.length})
                  </span>
                </h2>
              </div>

              {products.length === 0 ? (
                <p
                  className="font-body text-center py-12"
                  style={{ color: 'rgba(44, 36, 32, 0.3)' }}
                >
                  Товаров пока нет
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {products
                    .filter((p) => p.status === 'active')
                    .map((p) => (
                      <ProductCard key={p.id} product={p} showCompare />
                    ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl italic" style={{ color: '#0C0A08' }}>
                  Отзывы
                  <span
                    className="font-body text-sm ml-2"
                    style={{ color: 'rgba(44, 36, 32, 0.3)' }}
                  >
                    ({reviews.length})
                  </span>
                </h2>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Оставить отзыв
                </button>
              </div>

              {/* Review form */}
              {showReviewForm && (
                <form onSubmit={handleReview} className="vintage-card p-6 mb-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2"
                        style={{ color: 'rgba(44, 36, 32, 0.35)' }}
                      >
                        Имя *
                      </label>
                      <input
                        type="text"
                        value={reviewForm.name}
                        onChange={(e) =>
                          setReviewForm({ ...reviewForm, name: e.target.value })
                        }
                        required
                        className="gdt-input"
                        placeholder="Ваше имя"
                      />
                    </div>
                    <div>
                      <label
                        className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2"
                        style={{ color: 'rgba(44, 36, 32, 0.35)' }}
                      >
                        Оценка *
                      </label>
                      <div className="mt-1">
                        <StarRating
                          value={reviewForm.rating}
                          size={20}
                          interactive
                          onChange={(rating) =>
                            setReviewForm({ ...reviewForm, rating })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2"
                      style={{ color: 'rgba(44, 36, 32, 0.35)' }}
                    >
                      Отзыв *
                    </label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, comment: e.target.value })
                      }
                      required
                      rows={3}
                      className="gdt-input resize-none"
                      placeholder="Ваш опыт..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-sm py-2 px-6 disabled:opacity-50"
                  >
                    {submitting ? 'Отправка...' : 'Отправить'}
                  </button>
                </form>
              )}

              {/* Reviews list */}
              {reviews.length === 0 ? (
                <p
                  className="font-body text-center py-8"
                  style={{ color: 'rgba(44, 36, 32, 0.3)' }}
                >
                  Ещё нет отзывов
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="p-4"
                      style={{
                        backgroundColor: 'rgba(44, 36, 32, 0.02)',
                        border: '1px solid rgba(44, 36, 32, 0.06)',
                        borderRadius: '2px',
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-body text-sm font-medium"
                            style={{ color: '#0C0A08' }}
                          >
                            {r.name}
                          </span>
                          <StarRating value={r.rating} size={11} />
                        </div>
                        <span
                          className="font-body text-[10px]"
                          style={{ color: 'rgba(44, 36, 32, 0.25)' }}
                        >
                          {new Date(r.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p
                        className="font-body text-sm"
                        style={{ color: 'rgba(44, 36, 32, 0.5)' }}
                      >
                        {r.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="vintage-card p-6 sticky top-24">
              <h3 className="font-display text-lg italic mb-4" style={{ color: '#0C0A08' }}>
                Контакт
              </h3>
              <div className="w-8 h-px mb-4" style={{ backgroundColor: '#B08D57' }} />

              <div className="space-y-4 mb-6">
                {contactItems.map(({ icon: Icon, value, href }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Icon
                      size={14}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: '#B08D57' }}
                    />
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="font-body text-sm transition-colors"
                        style={{ color: 'rgba(44, 36, 32, 0.6)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#0C0A08')}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = 'rgba(44, 36, 32, 0.6)')
                        }
                      >
                        {value}
                      </a>
                    ) : (
                      <span
                        className="font-body text-sm"
                        style={{ color: 'rgba(44, 36, 32, 0.6)' }}
                      >
                        {value}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Map */}
              {shop.address && (
                <div className="mt-6">
                  <div className="aspect-[4/3] overflow-hidden" style={{ borderRadius: '2px' }}>
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(shop.address)}&zoom=15`}
                      title="Shop location"
                    />
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 mt-2 font-body text-xs transition-colors"
                    style={{ color: 'rgba(176, 141, 87, 0.5)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#B08D57')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = 'rgba(176, 141, 87, 0.5)')
                    }
                  >
                    <MapPin size={10} /> Открыть в Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
