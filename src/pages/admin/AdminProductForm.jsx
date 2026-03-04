import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProduct, createProduct, updateProduct } from '../../lib/api'
import { categories, conditions, categoryFields, categoryGroups } from '../../data/demoProducts'
import ImageUploader from '../../components/admin/ImageUploader'

/* ── Shared style tokens ─────────────────────────────────────── */
const colors = {
  cream: '#F0E6D6',
  gold:  '#B08D57',
}

const alpha = {
  cream05: 'rgba(240, 230, 214, 0.05)',
  cream06: 'rgba(240, 230, 214, 0.06)',
  cream08: 'rgba(240, 230, 214, 0.08)',
  cream20: 'rgba(240, 230, 214, 0.2)',
  cream25: 'rgba(240, 230, 214, 0.25)',
  cream30: 'rgba(240, 230, 214, 0.3)',
  cream35: 'rgba(240, 230, 214, 0.35)',
  cream40: 'rgba(240, 230, 214, 0.4)',
  cream70: 'rgba(240, 230, 214, 0.7)',
  gold06:  'rgba(240, 230, 214, 0.06)',
  gold20:  'rgba(176, 141, 87, 0.2)',
  gold30:  'rgba(176, 141, 87, 0.3)',
}

const sectionStyle = {
  backgroundColor: '#1A1410',
  border: `1px solid ${alpha.cream06}`,
  borderRadius: '2px',
}

const inputStyle = {
  backgroundColor: alpha.cream05,
  border: `1px solid ${alpha.cream08}`,
  borderRadius: '2px',
  color: colors.cream,
}

const submitBtnStyle = {
  backgroundColor: colors.gold,
  color: colors.cream,
  borderRadius: '2px',
}

const spinnerStyle = {
  border: `2px solid ${alpha.cream20}`,
  borderTopColor: colors.cream,
}

const EMPTY_FORM = {
  title: '',
  description: '',
  price: '',
  category: 'clothing',
  condition: 'good',
  era: '',
  brand: '',
  image_url: '',
  status: 'active',
}

/* ── Loading skeleton ────────────────────────────────────────── */
function FormSkeleton() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-6">
      <div className="h-8 rounded w-1/3" style={{ backgroundColor: alpha.cream05 }} />
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-12 rounded" style={{ backgroundColor: alpha.cream05 }} />
      ))}
    </div>
  )
}

/* ── Section wrapper ─────────────────────────────────────────── */
function Section({ title, children, className = '' }) {
  return (
    <div className={`p-6 ${className}`} style={sectionStyle}>
      {title && (
        <h3 className="font-body text-sm font-medium mb-4" style={{ color: alpha.cream70 }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

/* ── Form label ──────────────────────────────────────────────── */
function Label({ children }) {
  return (
    <label className="block font-body text-xs mb-2" style={{ color: alpha.cream30 }}>
      {children}
    </label>
  )
}

/* ── Category button ─────────────────────────────────────────── */
function CategoryButton({ cat, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 font-body text-xs transition-all"
      style={{
        backgroundColor: isActive ? alpha.gold20 : 'rgba(240, 230, 214, 0.04)',
        color: isActive ? '#C9A96E' : alpha.cream40,
        border: `1px solid ${isActive ? alpha.gold30 : alpha.cream06}`,
        borderRadius: '2px',
      }}
    >
      {cat.icon} {cat.name}
    </button>
  )
}

/* ── Dynamic detail field ────────────────────────────────────── */
function DetailField({ field, value, onChange }) {
  const commonProps = {
    className: 'w-full px-4 py-2.5 font-body text-sm focus:outline-none',
    style: inputStyle,
    required: field.required,
  }

  if (field.type === 'select') {
    return (
      <select
        value={value}
        onChange={(e) => onChange(field.key, e.target.value)}
        {...commonProps}
      >
        <option value="">— Выбрать —</option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    )
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(field.key, e.target.value)}
        rows={3}
        placeholder={field.placeholder || ''}
        {...commonProps}
        className={`${commonProps.className} resize-none`}
      />
    )
  }

  return (
    <input
      type={field.type === 'number' ? 'number' : 'text'}
      value={value}
      onChange={(e) => {
        const val = field.type === 'number'
          ? (e.target.value ? Number(e.target.value) : '')
          : e.target.value
        onChange(field.key, val)
      }}
      placeholder={field.placeholder || ''}
      min={field.type === 'number' ? 0 : undefined}
      {...commonProps}
    />
  )
}

/* ── Main component ──────────────────────────────────────────── */
export default function AdminProductForm({ sellerShopId, sellerMode } = {}) {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [details, setDetails] = useState({})
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(isEditing)

  const basePath = sellerMode ? '/seller/products' : '/admin/products'

  /* Load existing product for editing */
  useEffect(() => {
    if (!isEditing) return

    async function load() {
      const { data, error } = await getProduct(id)
      if (error || !data) {
        toast.error('Товар не найден')
        navigate(basePath)
        return
      }

      setForm({
        title:       data.title || '',
        description: data.description || '',
        price:       data.price || '',
        category:    data.category || 'clothing',
        condition:   data.condition || 'good',
        era:         data.era || '',
        brand:       data.brand || '',
        image_url:   data.image_url || '',
        status:      data.status || 'active',
      })

      setDetails(data.details || {})

      if (data.images?.length > 0) {
        setImages(data.images.map((img) => ({
          url: img.url,
          path: img.storage_path || null,
          alt_text: img.alt_text || '',
        })))
      } else if (data.image_url) {
        setImages([{ url: data.image_url, path: null, alt_text: data.title }])
      }

      setLoadingProduct(false)
    }

    load()
  }, [id, isEditing, navigate])

  /* Handlers */
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleDetailChange = (key, value) => {
    setDetails((prev) => ({ ...prev, [key]: value }))
  }

  const handleCategoryChange = (newCategory) => {
    setForm((prev) => ({ ...prev, category: newCategory }))

    const newKeys = new Set((categoryFields[newCategory] || []).map((f) => f.key))
    setDetails((prev) => {
      const kept = {}
      for (const k of Object.keys(prev)) {
        if (newKeys.has(k)) kept[k] = prev[k]
      }
      return kept
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const productData = {
      ...form,
      price: Number(form.price) || 0,
      image_url: images[0]?.url || form.image_url || '',
      images,
      details,
      ...(sellerShopId && { shop_id: sellerShopId }),
    }

    const { error } = isEditing
      ? await updateProduct(id, productData)
      : await createProduct(productData)

    setLoading(false)

    if (error) {
      toast.error(error.message || 'Ошибка сохранения')
      return
    }

    toast.success(isEditing ? 'Товар обновлён' : 'Товар добавлен')
    navigate(basePath)
  }

  /* Derived state */
  const currentCatFields = categoryFields[form.category] || []
  const currentCategory  = categories.find((c) => c.id === form.category)
  const isVintage        = currentCategory?.group === 'vintage'
  const isShop           = currentCategory?.group === 'shops'

  if (loadingProduct) return <FormSkeleton />

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 transition-colors"
          style={{ color: alpha.cream30, borderRadius: '2px' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-body text-xl font-semibold" style={{ color: colors.cream }}>
            {isEditing ? 'Редактировать' : 'Новый товар'}
          </h1>
          <p className="font-body text-sm mt-0.5" style={{ color: alpha.cream35 }}>
            {isEditing ? 'Измените данные' : 'Заполните информацию'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <Section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-body text-sm font-medium" style={{ color: alpha.cream70 }}>
              Изображения
            </h3>
            <span className="font-body text-xs" style={{ color: alpha.cream30 }}>
              {images.length} фото
              {images.length > 0 && ' \u2022 первое = главное'}
            </span>
          </div>
          <ImageUploader images={images} onChange={setImages} productId={isEditing ? id : undefined} />
        </Section>

        {/* Category Selection */}
        <Section title="Категория" className="space-y-4">
          <div className="space-y-3">
            {categoryGroups.map((group) => {
              const groupCats = categories.filter((c) => c.group === group.id)
              return (
                <div key={group.id}>
                  <p
                    className="font-body text-[10px] tracking-wider uppercase mb-2"
                    style={{ color: alpha.cream25 }}
                  >
                    {group.icon} {group.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {groupCats.map((cat) => (
                      <CategoryButton
                        key={cat.id}
                        cat={cat}
                        isActive={form.category === cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {/* Basic Info */}
        <Section title="Основная информация" className="space-y-5">
          <div>
            <Label>Название *</Label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder={
                isShop
                  ? 'Название магазина'
                  : isVintage
                    ? 'Например: Кожаный портфель 1960-х'
                    : 'Название'
              }
              className="w-full px-4 py-2.5 font-body text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <Label>Описание *</Label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Подробное описание..."
              className="w-full px-4 py-2.5 font-body text-sm resize-none focus:outline-none"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>
                {isShop
                  ? 'Цена (оставьте 0)'
                  : currentCategory?.group === 'realestate'
                    ? 'Цена (\u20ac / мес. или покупка)'
                    : 'Цена (\u20ac) *'}
              </Label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required={!isShop}
                min="0"
                step="1"
                placeholder="0"
                className="w-full px-4 py-2.5 font-body text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>
            {isVintage && (
              <div>
                <Label>Бренд</Label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="Если известен"
                  className="w-full px-4 py-2.5 font-body text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
            )}
          </div>
        </Section>

        {/* Vintage-specific: Condition + Era */}
        {isVintage && (
          <Section title="Винтаж" className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Состояние</Label>
                <select
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 font-body text-sm focus:outline-none"
                  style={inputStyle}
                >
                  {conditions.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Эпоха / Год</Label>
                <input
                  type="text"
                  name="era"
                  value={form.era}
                  onChange={handleChange}
                  placeholder="1970-е"
                  className="w-full px-4 py-2.5 font-body text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <Label>Статус</Label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 font-body text-sm focus:outline-none"
                  style={inputStyle}
                >
                  <option value="active">В наличии</option>
                  <option value="sold">Продано</option>
                </select>
              </div>
            </div>
          </Section>
        )}

        {/* Dynamic Category-Specific Fields */}
        {currentCatFields.length > 0 && (
          <Section
            title={`${currentCategory?.icon} Параметры: ${currentCategory?.name}`}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentCatFields.map((field) => (
                <div
                  key={field.key}
                  className={field.type === 'textarea' ? 'sm:col-span-2' : ''}
                >
                  <Label>
                    {field.label}
                    {field.required ? ' *' : ''}
                    {field.unit ? ` (${field.unit})` : ''}
                  </Label>
                  <DetailField
                    field={field}
                    value={details[field.key] || ''}
                    onChange={handleDetailChange}
                  />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 font-body text-sm transition-colors"
            style={{ color: alpha.cream40 }}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 font-body text-sm transition-colors disabled:opacity-50"
            style={submitBtnStyle}
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full animate-spin" style={spinnerStyle} />
            ) : (
              <Save size={16} />
            )}
            {isEditing ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </form>
    </div>
  )
}
