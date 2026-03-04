import { useState, useEffect } from 'react'
import { Star, User, ChevronDown, ChevronUp, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProductReviews, createProductReview } from '../../lib/api'

function StarRating({ rating, onChange, size = 20, readOnly = false }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type={readOnly ? 'button' : 'button'}
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={readOnly ? 'cursor-default' : 'cursor-pointer transition-transform hover:scale-110'}
        >
          <Star
            size={size}
            fill={(hover || rating) >= star ? '#B08D57' : 'none'}
            stroke={(hover || rating) >= star ? '#B08D57' : 'rgba(44, 36, 32, 0.2)'}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review }) {
  const date = new Date(review.created_at).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  return (
    <div className="py-5" style={{ borderBottom: '1px solid rgba(44, 36, 32, 0.08)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)' }}>
            <User size={16} style={{ color: '#B08D57' }} />
          </div>
          <div>
            <p className="font-body text-sm font-medium" style={{ color: '#2C2420' }}>{review.name}</p>
            <p className="font-body text-xs mt-0.5" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>{date}</p>
          </div>
        </div>
        <StarRating rating={review.rating} readOnly size={14} />
      </div>
      {review.comment && (
        <p className="font-body text-sm mt-3 leading-relaxed" style={{ color: 'rgba(44, 36, 32, 0.65)', paddingLeft: '48px' }}>
          {review.comment}
        </p>
      )}
    </div>
  )
}

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', rating: 0, comment: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getProductReviews(productId).then(({ data }) => {
      if (mounted) { setReviews(data || []); setLoading(false) }
    })
    return () => { mounted = false }
  }, [productId])

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Введите имя'
    if (!form.rating) e.rating = 'Выберите оценку'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    const { data, error } = await createProductReview({ product_id: productId, ...form })
    setSubmitting(false)
    if (error) {
      toast.error('Ошибка при отправке')
      return
    }
    setReviews(prev => [data, ...prev])
    setForm({ name: '', rating: 0, comment: '' })
    setShowForm(false)
    toast.success('Отзыв добавлен!')
  }

  return (
    <div className="mt-16 pt-12" style={{ borderTop: '1px solid rgba(44, 36, 32, 0.08)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl" style={{ color: '#0C0A08' }}>Отзывы</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <StarRating rating={Math.round(avgRating)} readOnly size={16} />
              <span className="font-body text-sm" style={{ color: 'rgba(44, 36, 32, 0.5)' }}>
                {avgRating.toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'отзыв' : 'отзывов'}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 font-body text-sm transition-all duration-300"
          style={{
            backgroundColor: showForm ? '#0C0A08' : 'transparent',
            color: showForm ? '#F0E6D6' : '#0C0A08',
            border: '1px solid rgba(44, 36, 32, 0.2)',
            borderRadius: '2px',
          }}
        >
          {showForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showForm ? 'Закрыть' : 'Написать отзыв'}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-10 p-6"
          style={{ backgroundColor: 'rgba(44, 36, 32, 0.03)', border: '1px solid rgba(44, 36, 32, 0.08)', borderRadius: '2px' }}>
          <h3 className="font-body text-sm font-medium mb-5 uppercase tracking-wider" style={{ color: 'rgba(44, 36, 32, 0.5)' }}>
            Ваш отзыв
          </h3>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <input
                type="text"
                placeholder="Ваше имя *"
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })) }}
                className="w-full px-4 py-3 font-body text-sm transition-all"
                style={{
                  backgroundColor: 'rgba(44, 36, 32, 0.04)',
                  border: `1px solid ${errors.name ? 'rgba(176, 60, 60, 0.4)' : 'rgba(44, 36, 32, 0.12)'}`,
                  borderRadius: '2px',
                  color: '#2C2420',
                  outline: 'none',
                }}
              />
              {errors.name && <p className="font-body text-xs mt-1" style={{ color: 'rgba(176, 60, 60, 0.8)' }}>{errors.name}</p>}
            </div>

            {/* Stars */}
            <div>
              <div className="flex items-center gap-3">
                <StarRating rating={form.rating} onChange={r => { setForm(f => ({ ...f, rating: r })); setErrors(er => ({ ...er, rating: '' })) }} size={22} />
                {form.rating > 0 && (
                  <span className="font-body text-xs" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
                    {['', 'Плохо', 'Ниже среднего', 'Нормально', 'Хорошо', 'Отлично'][form.rating]}
                  </span>
                )}
              </div>
              {errors.rating && <p className="font-body text-xs mt-1" style={{ color: 'rgba(176, 60, 60, 0.8)' }}>{errors.rating}</p>}
            </div>

            {/* Comment */}
            <textarea
              placeholder="Расскажите о товаре (необязательно)"
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 font-body text-sm resize-none transition-all"
              style={{
                backgroundColor: 'rgba(44, 36, 32, 0.04)',
                border: '1px solid rgba(44, 36, 32, 0.12)',
                borderRadius: '2px',
                color: '#2C2420',
                outline: 'none',
              }}
            />

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 font-body text-sm tracking-wider uppercase transition-all duration-300"
              style={{
                backgroundColor: submitting ? 'rgba(44, 36, 32, 0.3)' : '#0C0A08',
                color: '#F0E6D6',
                borderRadius: '2px',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              <Send size={14} />
              {submitting ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse py-5" style={{ borderBottom: '1px solid rgba(44, 36, 32, 0.08)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
                <div className="space-y-2">
                  <div className="h-4 w-28 rounded" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
                  <div className="h-3 w-20 rounded" style={{ backgroundColor: 'rgba(44, 36, 32, 0.04)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <Star size={36} className="mx-auto mb-3" style={{ color: 'rgba(44, 36, 32, 0.15)' }} />
          <p className="font-body" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>Пока нет отзывов</p>
          <p className="font-body text-sm mt-1" style={{ color: 'rgba(44, 36, 32, 0.25)' }}>Будьте первым!</p>
        </div>
      ) : (
        <div>
          {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
        </div>
      )}
    </div>
  )
}
