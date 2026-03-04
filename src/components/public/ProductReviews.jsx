import { useState, useEffect } from 'react'
import { Star, User, ChevronDown, ChevronUp, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProductReviews, createProductReview } from '../../lib/api'

const STARS = [1, 2, 3, 4, 5]
const RATING_LABELS = ['', 'Плохо', 'Ниже среднего', 'Нормально', 'Хорошо', 'Отлично']
const GOLD = '#B08D57'

const COLORS = {
  dark: '#0C0A08',
  cream: '#F0E6D6',
  brown: '#2C2420',
  brownFaded: 'rgba(44, 36, 32, 0.35)',
  brownDim: 'rgba(44, 36, 32, 0.25)',
  brownHalf: 'rgba(44, 36, 32, 0.5)',
  brownLight: 'rgba(44, 36, 32, 0.4)',
  brownSubtle: 'rgba(44, 36, 32, 0.15)',
  starInactive: 'rgba(44, 36, 32, 0.2)',
  border: 'rgba(44, 36, 32, 0.08)',
  inputBorder: 'rgba(44, 36, 32, 0.12)',
  inputBg: 'rgba(44, 36, 32, 0.04)',
  formBg: 'rgba(44, 36, 32, 0.03)',
  skeletonBg: 'rgba(44, 36, 32, 0.06)',
  skeletonBgLight: 'rgba(44, 36, 32, 0.04)',
  goldBg: 'rgba(176, 141, 87, 0.1)',
  error: 'rgba(176, 60, 60, 0.4)',
  errorText: 'rgba(176, 60, 60, 0.8)',
}

const INITIAL_FORM = { name: '', rating: 0, comment: '' }

// -- StarRating --

function StarRating({ rating, onChange, size = 20, readOnly = false }) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {STARS.map((star) => {
        const filled = (hover || rating) >= star
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={readOnly ? 'cursor-default' : 'cursor-pointer transition-transform hover:scale-110'}
          >
            <Star
              size={size}
              fill={filled ? GOLD : 'none'}
              stroke={filled ? GOLD : COLORS.starInactive}
            />
          </button>
        )
      })}
    </div>
  )
}

// -- ReviewCard --

function ReviewCard({ review }) {
  const date = new Date(review.created_at).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="py-5" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: COLORS.goldBg }}
          >
            <User size={16} style={{ color: GOLD }} />
          </div>
          <div>
            <p className="font-body text-sm font-medium" style={{ color: COLORS.brown }}>
              {review.name}
            </p>
            <p className="font-body text-xs mt-0.5" style={{ color: COLORS.brownFaded }}>
              {date}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} readOnly size={14} />
      </div>

      {review.comment && (
        <p
          className="font-body text-sm mt-3 leading-relaxed"
          style={{ color: 'rgba(44, 36, 32, 0.65)', paddingLeft: '48px' }}
        >
          {review.comment}
        </p>
      )}
    </div>
  )
}

// -- ReviewForm --

function ReviewForm({ onSubmit, submitting }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Введите имя'
    if (!form.rating) errs.rating = 'Выберите оценку'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(form, () => setForm(INITIAL_FORM))
  }

  const inputStyle = (hasError) => ({
    backgroundColor: COLORS.inputBg,
    border: `1px solid ${hasError ? COLORS.error : COLORS.inputBorder}`,
    borderRadius: '2px',
    color: COLORS.brown,
    outline: 'none',
  })

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-10 p-6"
      style={{
        backgroundColor: COLORS.formBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '2px',
      }}
    >
      <h3
        className="font-body text-sm font-medium mb-5 uppercase tracking-wider"
        style={{ color: COLORS.brownHalf }}
      >
        Ваш отзыв
      </h3>

      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Ваше имя *"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full px-4 py-3 font-body text-sm transition-all"
            style={inputStyle(errors.name)}
          />
          {errors.name && (
            <p className="font-body text-xs mt-1" style={{ color: COLORS.errorText }}>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3">
            <StarRating
              rating={form.rating}
              onChange={(r) => updateField('rating', r)}
              size={22}
            />
            {form.rating > 0 && (
              <span className="font-body text-xs" style={{ color: COLORS.brownLight }}>
                {RATING_LABELS[form.rating]}
              </span>
            )}
          </div>
          {errors.rating && (
            <p className="font-body text-xs mt-1" style={{ color: COLORS.errorText }}>
              {errors.rating}
            </p>
          )}
        </div>

        <textarea
          placeholder="Расскажите о товаре (необязательно)"
          value={form.comment}
          onChange={(e) => updateField('comment', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 font-body text-sm resize-none transition-all"
          style={inputStyle(false)}
        />

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-3 font-body text-sm tracking-wider uppercase transition-all duration-300"
          style={{
            backgroundColor: submitting ? 'rgba(44, 36, 32, 0.3)' : COLORS.dark,
            color: COLORS.cream,
            borderRadius: '2px',
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          <Send size={14} />
          {submitting ? 'Отправка...' : 'Отправить'}
        </button>
      </div>
    </form>
  )
}

// -- Loading Skeleton --

function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="animate-pulse py-5" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full" style={{ backgroundColor: COLORS.skeletonBg }} />
            <div className="space-y-2">
              <div className="h-4 w-28 rounded" style={{ backgroundColor: COLORS.skeletonBg }} />
              <div className="h-3 w-20 rounded" style={{ backgroundColor: COLORS.skeletonBgLight }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// -- Empty State --

function ReviewsEmpty() {
  return (
    <div className="text-center py-12">
      <Star size={36} className="mx-auto mb-3" style={{ color: COLORS.brownSubtle }} />
      <p className="font-body" style={{ color: COLORS.brownFaded }}>Пока нет отзывов</p>
      <p className="font-body text-sm mt-1" style={{ color: COLORS.brownDim }}>Будьте первым!</p>
    </div>
  )
}

// -- Main Component --

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getProductReviews(productId).then(({ data }) => {
      if (mounted) {
        setReviews(data || [])
        setLoading(false)
      }
    })
    return () => { mounted = false }
  }, [productId])

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const handleSubmit = async (form, resetForm) => {
    setSubmitting(true)
    const { data, error } = await createProductReview({ product_id: productId, ...form })
    setSubmitting(false)

    if (error) {
      toast.error('Ошибка при отправке')
      return
    }

    setReviews((prev) => [data, ...prev])
    resetForm()
    setShowForm(false)
    toast.success('Отзыв добавлен!')
  }

  return (
    <div className="mt-16 pt-12" style={{ borderTop: `1px solid ${COLORS.border}` }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl" style={{ color: COLORS.dark }}>Отзывы</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <StarRating rating={Math.round(avgRating)} readOnly size={16} />
              <span className="font-body text-sm" style={{ color: COLORS.brownHalf }}>
                {avgRating.toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'отзыв' : 'отзывов'}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 font-body text-sm transition-all duration-300"
          style={{
            backgroundColor: showForm ? COLORS.dark : 'transparent',
            color: showForm ? COLORS.cream : COLORS.dark,
            border: `1px solid ${COLORS.starInactive}`,
            borderRadius: '2px',
          }}
        >
          {showForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showForm ? 'Закрыть' : 'Написать отзыв'}
        </button>
      </div>

      {showForm && <ReviewForm onSubmit={handleSubmit} submitting={submitting} />}

      {loading ? (
        <ReviewsSkeleton />
      ) : reviews.length === 0 ? (
        <ReviewsEmpty />
      ) : (
        <div>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}
