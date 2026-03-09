import { useState, useMemo } from 'react'
import {
  Star, Plus, Trash2, Edit, X, Search, ExternalLink,
  Instagram, Phone, Send, MessageCircle, Image,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useLocalStorage from '../../lib/useLocalStorage'

const GOLD = '#B08D57'
const INK = '#2C2420'
const MUTED = 'rgba(44, 36, 32, 0.5)'
const FAINT = 'rgba(44, 36, 32, 0.15)'
const panelStyle = { backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid rgba(176,141,87,0.12)', borderRadius: '2px' }

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

/* ── Seed data (migrated from hardcoded Home.jsx TESTIMONIALS) ── */

const SEED_REVIEWS = [
  { id: 's1', type: 'product', productId: '1', productTitle: '', name: 'Мария К.', rating: 5, comment: 'Нашла уникальное платье 70-х годов. Качество невероятное, как будто вчера пошито!', instagram: 'maria_vintage', whatsapp: '', telegram: '', screenshotUrl: '', featured: true, createdAt: '2025-11-10T12:00:00Z', updatedAt: '2025-11-10T12:00:00Z' },
  { id: 's2', type: 'product', productId: '3', productTitle: '', name: 'Thomas W.', rating: 5, comment: 'Die Art-Deco-Lampe ist ein absolutes Schmuckstück. Hervorragender Zustand und faire Preise.', instagram: 'thomas_antik', whatsapp: '', telegram: '', screenshotUrl: '', featured: true, createdAt: '2025-11-15T12:00:00Z', updatedAt: '2025-11-15T12:00:00Z' },
  { id: 's3', type: 'product', productId: '5', productTitle: '', name: 'Анна П.', rating: 4, comment: 'Прекрасная коллекция винтажной посуды. Meissen фарфор в отличном состоянии!', instagram: 'anna_retro', whatsapp: '', telegram: '', screenshotUrl: '', featured: true, createdAt: '2025-12-01T12:00:00Z', updatedAt: '2025-12-01T12:00:00Z' },
  { id: 's4', type: 'product', productId: '10', productTitle: '', name: 'Sophie L.', rating: 5, comment: 'Die Vintage-Schallplatten sind in erstaunlich gutem Zustand. Toller Service!', instagram: 'sophie_collect', whatsapp: '', telegram: '', screenshotUrl: '', featured: true, createdAt: '2025-12-20T12:00:00Z', updatedAt: '2025-12-20T12:00:00Z' },
  { id: 's5', type: 'general', productId: '', productTitle: '', name: 'Дмитрий В.', rating: 5, comment: 'Антикварная мебель высочайшего качества. Буфет стал центром нашей гостиной.', instagram: 'dmitry_design', whatsapp: '', telegram: '', screenshotUrl: '', featured: true, createdAt: '2026-01-05T12:00:00Z', updatedAt: '2026-01-05T12:00:00Z' },
]

const RATING_LABELS = ['', 'Плохо', 'Ниже среднего', 'Нормально', 'Хорошо', 'Отлично']

const TABS = [
  { key: 'all', label: 'Все' },
  { key: 'general', label: 'Общие' },
  { key: 'product', label: 'О товарах' },
  { key: 'featured', label: '⭐ На главной' },
]

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

/* ── Helpers ────────────────────────────────────────────────────── */

function readLS(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

/* ── Star rating (interactive + display) ─────────────────────── */

function StarRating({ value, onChange, size = 16 }) {
  const [hover, setHover] = useState(0)
  const interactive = !!onChange
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={interactive ? 'cursor-pointer transition-colors' : ''}
          fill={s <= (hover || value) ? GOLD : 'none'}
          stroke={s <= (hover || value) ? GOLD : 'rgba(44,36,32,0.2)'}
          onMouseEnter={interactive ? () => setHover(s) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
          onClick={interactive ? () => onChange(s) : undefined}
        />
      ))}
      {interactive && value > 0 && (
        <span className="ml-2 text-xs" style={{ color: MUTED }}>{RATING_LABELS[value]}</span>
      )}
    </div>
  )
}

/* ── Review Card ─────────────────────────────────────────────── */

function ReviewCard({ review, onEdit, onDelete, onToggleFeatured }) {
  return (
    <div style={panelStyle} className="p-5 flex flex-col gap-3">
      {/* Header: name + featured toggle */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-sm font-semibold truncate" style={{ color: INK }}>{review.name}</span>
            <span
              className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium"
              style={{
                color: review.type === 'general' ? '#5A7A8B' : GOLD,
                backgroundColor: review.type === 'general' ? 'rgba(90,122,139,0.1)' : 'rgba(176,141,87,0.08)',
                borderRadius: '2px',
              }}
            >
              {review.type === 'general' ? 'Общий' : 'Товар'}
            </span>
          </div>
          <StarRating value={review.rating} size={13} />
        </div>
        <button
          onClick={() => onToggleFeatured(review.id)}
          title={review.featured ? 'Убрать с главной' : 'Показать на главной'}
          className="p-1.5 rounded transition-colors shrink-0"
          style={{ color: review.featured ? '#f59e0b' : 'rgba(44,36,32,0.2)' }}
        >
          <Star size={18} fill={review.featured ? '#f59e0b' : 'none'} />
        </button>
      </div>

      {/* Comment */}
      <p className="font-sans text-sm leading-relaxed" style={{ color: 'rgba(44,36,32,0.65)' }}>
        &ldquo;{review.comment}&rdquo;
      </p>

      {/* Product link */}
      {review.type === 'product' && review.productId && (
        <div className="flex items-center gap-1.5">
          <ExternalLink size={12} style={{ color: GOLD }} />
          <span className="text-xs" style={{ color: GOLD }}>
            {review.productTitle || `Товар #${review.productId}`}
          </span>
        </div>
      )}

      {/* Social links */}
      <div className="flex items-center gap-3 flex-wrap">
        {review.instagram && (
          <a
            href={`https://instagram.com/${review.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs transition-colors hover:opacity-70"
            style={{ color: '#E1306C' }}
          >
            <Instagram size={13} />
            @{review.instagram}
          </a>
        )}
        {review.whatsapp && (
          <a
            href={`https://wa.me/${review.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs transition-colors hover:opacity-70"
            style={{ color: '#25D366' }}
          >
            <Phone size={13} />
            {review.whatsapp}
          </a>
        )}
        {review.telegram && (
          <a
            href={`https://t.me/${review.telegram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs transition-colors hover:opacity-70"
            style={{ color: '#0088cc' }}
          >
            <Send size={13} />
            @{review.telegram}
          </a>
        )}
      </div>

      {/* Screenshot */}
      {review.screenshotUrl && (
        <a
          href={review.screenshotUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs hover:opacity-70"
          style={{ color: MUTED }}
        >
          <Image size={12} />
          Скриншот
        </a>
      )}

      {/* Footer: date + actions */}
      <div className="flex items-center justify-between pt-2 mt-auto" style={{ borderTop: `1px solid ${FAINT}` }}>
        <span className="text-[11px]" style={{ color: MUTED }}>{fmtDate(review.createdAt)}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(review)} className="p-1.5 rounded transition-colors hover:bg-black/5">
            <Edit size={14} style={{ color: MUTED }} />
          </button>
          <button onClick={() => onDelete(review.id)} className="p-1.5 rounded transition-colors hover:bg-red-50">
            <Trash2 size={14} style={{ color: '#B5736A' }} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Modal ────────────────────────────────────────────────────── */

function ReviewModal({ review, onClose, onSave, products }) {
  const isNew = !review.id
  const [form, setForm] = useState({
    type: review.type || 'general',
    productId: review.productId || '',
    name: review.name || '',
    rating: review.rating || 5,
    comment: review.comment || '',
    instagram: review.instagram || '',
    whatsapp: review.whatsapp || '',
    telegram: review.telegram || '',
    screenshotUrl: review.screenshotUrl || '',
    featured: review.featured ?? false,
  })

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = () => {
    if (!form.name.trim()) return toast.error('Имя обязательно')
    if (!form.comment.trim()) return toast.error('Комментарий обязателен')
    if (form.type === 'product' && !form.productId) return toast.error('Выберите товар')

    const productTitle = form.type === 'product'
      ? (products.find((p) => String(p.id) === String(form.productId))?.title || '')
      : ''

    onSave({
      ...form,
      productTitle,
      productId: form.type === 'product' ? form.productId : '',
    })
    onClose()
  }

  const inputStyle = {
    backgroundColor: 'rgba(255,255,255,0.7)',
    border: `1px solid ${FAINT}`,
    borderRadius: '2px',
    color: INK,
    fontSize: '14px',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        style={{ ...panelStyle, backgroundColor: '#FFFFFF' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-sans text-lg font-semibold" style={{ color: INK }}>
            {isNew ? 'Новый отзыв' : 'Редактировать отзыв'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-black/5 rounded">
            <X size={20} style={{ color: MUTED }} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: MUTED }}>Тип отзыва</label>
            <div className="flex gap-3">
              {[
                { key: 'general', label: 'Общий' },
                { key: 'product', label: 'О товаре' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => set('type', t.key)}
                  className="px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    backgroundColor: form.type === t.key ? 'rgba(176,141,87,0.1)' : 'transparent',
                    border: `1px solid ${form.type === t.key ? GOLD : FAINT}`,
                    color: form.type === t.key ? GOLD : MUTED,
                    borderRadius: '2px',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product picker */}
          {form.type === 'product' && (
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: MUTED }}>Товар</label>
              <select
                value={form.productId}
                onChange={(e) => set('productId', e.target.value)}
                className="w-full px-3 py-2"
                style={inputStyle}
              >
                <option value="">— Выберите товар —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: MUTED }}>Имя</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Имя рецензента"
              className="w-full px-3 py-2"
              style={inputStyle}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: MUTED }}>Рейтинг</label>
            <StarRating value={form.rating} onChange={(v) => set('rating', v)} size={20} />
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: MUTED }}>Комментарий</label>
            <textarea
              value={form.comment}
              onChange={(e) => set('comment', e.target.value)}
              rows={3}
              placeholder="Текст отзыва…"
              className="w-full px-3 py-2 resize-none"
              style={inputStyle}
            />
          </div>

          {/* Social: Instagram */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: '#E1306C' }}>
                <Instagram size={12} /> Instagram
              </label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => set('instagram', e.target.value)}
                placeholder="username"
                className="w-full px-3 py-2"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: '#25D366' }}>
                <Phone size={12} /> WhatsApp
              </label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => set('whatsapp', e.target.value)}
                placeholder="+43..."
                className="w-full px-3 py-2"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: '#0088cc' }}>
                <Send size={12} /> Telegram
              </label>
              <input
                type="text"
                value={form.telegram}
                onChange={(e) => set('telegram', e.target.value)}
                placeholder="username"
                className="w-full px-3 py-2"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Screenshot URL */}
          <div>
            <label className="text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: MUTED }}>
              <Image size={12} /> URL скриншота (необязательно)
            </label>
            <input
              type="url"
              value={form.screenshotUrl}
              onChange={(e) => set('screenshotUrl', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2"
              style={inputStyle}
            />
          </div>

          {/* Featured */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set('featured', e.target.checked)}
              className="accent-[#B08D57]"
            />
            <span className="text-sm" style={{ color: INK }}>
              ⭐ Показать на главной странице
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: `1px solid ${FAINT}` }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5"
            style={{ color: MUTED, border: `1px solid ${FAINT}`, borderRadius: '2px' }}
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: GOLD, borderRadius: '2px' }}
          >
            {isNew ? 'Создать' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────── */

export default function AdminReviews() {
  const [reviews, setReviews] = useLocalStorage('reviews', SEED_REVIEWS)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState(0)
  const [editing, setEditing] = useState(null) // null | {} (new) | review obj

  // Product list for the picker
  const products = useMemo(() => readLS('vm_products', []), [])

  /* ── Stats ── */
  const stats = useMemo(() => {
    const total = reviews.length
    const avgRating = total > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
      : '—'
    const featuredCount = reviews.filter((r) => r.featured).length
    const generalCount = reviews.filter((r) => r.type === 'general').length
    const productCount = reviews.filter((r) => r.type === 'product').length
    return { total, avgRating, featuredCount, generalCount, productCount }
  }, [reviews])

  /* ── Filtered list ── */
  const displayed = useMemo(() => {
    let list = [...reviews]

    // Tab filter
    if (tab === 'general') list = list.filter((r) => r.type === 'general')
    else if (tab === 'product') list = list.filter((r) => r.type === 'product')
    else if (tab === 'featured') list = list.filter((r) => r.featured)

    // Rating filter
    if (ratingFilter > 0) list = list.filter((r) => r.rating === ratingFilter)

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          (r.instagram || '').toLowerCase().includes(q) ||
          (r.telegram || '').toLowerCase().includes(q)
      )
    }

    // Sort by date (newest first)
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return list
  }, [reviews, tab, search, ratingFilter])

  /* ── CRUD ── */
  const handleSave = (formData) => {
    if (editing && editing.id) {
      // Update
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? { ...r, ...formData, updatedAt: new Date().toISOString() }
            : r
        )
      )
      toast.success('Отзыв обновлён')
    } else {
      // Create
      const newReview = {
        id: uid(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setReviews((prev) => [newReview, ...prev])
      toast.success('Отзыв добавлен')
    }
    setEditing(null)
  }

  const handleDelete = (id) => {
    setReviews((prev) => prev.filter((r) => r.id !== id))
    toast.success('Отзыв удалён')
  }

  const toggleFeatured = (id) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, featured: !r.featured, updatedAt: new Date().toISOString() } : r
      )
    )
  }

  /* ── Render ── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-sans text-2xl font-semibold" style={{ color: INK }}>
            Отзывы
          </h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            Управление рецензиями и отображение на главной
          </p>
        </div>
        <button
          onClick={() => setEditing({})}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: GOLD, borderRadius: '2px' }}
        >
          <Plus size={16} />
          Новый отзыв
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Всего', value: stats.total, color: INK },
          { label: '⌀ Рейтинг', value: stats.avgRating, color: GOLD },
          { label: '⭐ На главной', value: stats.featuredCount, color: '#f59e0b' },
          { label: 'Общие', value: stats.generalCount, color: '#5A7A8B' },
          { label: 'О товарах', value: stats.productCount, color: GOLD },
        ].map((s) => (
          <div key={s.label} style={panelStyle} className="p-4 text-center">
            <div className="font-sans text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] mt-1" style={{ color: MUTED }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-3 py-1.5 text-sm font-medium transition-all"
              style={{
                color: tab === t.key ? GOLD : MUTED,
                borderBottom: tab === t.key ? `2px solid ${GOLD}` : '2px solid transparent',
              }}
            >
              {t.label}
              {t.key === 'all' && ` (${reviews.length})`}
              {t.key === 'general' && ` (${stats.generalCount})`}
              {t.key === 'product' && ` (${stats.productCount})`}
              {t.key === 'featured' && ` (${stats.featuredCount})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Rating filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(Number(e.target.value))}
            className="px-2 py-1.5 text-sm"
            style={{
              backgroundColor: 'rgba(255,255,255,0.7)',
              border: `1px solid ${FAINT}`,
              borderRadius: '2px',
              color: INK,
            }}
          >
            <option value={0}>Все оценки</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск…"
              className="pl-8 pr-3 py-1.5 text-sm w-48"
              style={{
                backgroundColor: 'rgba(255,255,255,0.7)',
                border: `1px solid ${FAINT}`,
                borderRadius: '2px',
                color: INK,
              }}
            />
          </div>
        </div>
      </div>

      {/* Reviews grid */}
      {displayed.length === 0 ? (
        <div style={panelStyle} className="p-12 text-center">
          <MessageCircle size={32} className="mx-auto mb-3" style={{ color: FAINT }} />
          <p className="text-sm" style={{ color: MUTED }}>
            {search || ratingFilter > 0 || tab !== 'all'
              ? 'Нет отзывов по заданным фильтрам'
              : 'Пока нет отзывов'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              onEdit={setEditing}
              onDelete={handleDelete}
              onToggleFeatured={toggleFeatured}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {editing !== null && (
        <ReviewModal
          review={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          products={products}
        />
      )}
    </div>
  )
}
