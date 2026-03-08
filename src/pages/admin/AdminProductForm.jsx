import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Sparkles, Tag, Info, Settings2, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProduct, createProduct, updateProduct } from '../../lib/api'
import { categories, conditions, categoryFields, categoryGroups, knownBrands, specialAttributes } from '../../data/demoProducts'
import { getActiveCategoryList } from '../../lib/categorySettings'
import ImageUploader from '../../components/admin/ImageUploader'

/* ── Empty form ────────────────────────────────────────────────── */
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
  special_attributes: [],
}

/* ── Loading skeleton ──────────────────────────────────────────── */
function FormSkeleton() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-6 p-8">
      <div className="h-8 rounded w-1/3 bg-gray-200" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="h-14 rounded bg-gray-100" />
      ))}
    </div>
  )
}

/* ── Section wrapper ───────────────────────────────────────────── */
function Section({ icon: Icon, title, children, className = '' }) {
  return (
    <div
      className={`p-6 md:p-8 rounded transition-all duration-300 hover:shadow-md ${className}`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid rgba(176, 141, 87, 0.12)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {title && (
        <div className="flex items-center gap-2.5 mb-5 pb-3" style={{ borderBottom: '1px solid rgba(176, 141, 87, 0.1)' }}>
          {Icon && <Icon size={16} style={{ color: '#B08D57' }} />}
          <h3 className="font-display text-base italic" style={{ color: '#2C2420' }}>
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  )
}

/* ── Form label ────────────────────────────────────────────────── */
function Label({ children, required }) {
  return (
    <label className="block font-body text-xs font-medium mb-1.5 tracking-wide uppercase" style={{ color: 'rgba(44, 36, 32, 0.55)' }}>
      {children}
      {required && <span className="ml-0.5" style={{ color: '#B08D57' }}>*</span>}
    </label>
  )
}

/* ── Text input ────────────────────────────────────────────────── */
function FormInput({ label, required, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <input
        {...props}
        required={required}
        className="w-full px-4 py-3 font-body text-sm rounded transition-all duration-300 focus:outline-none"
        style={{
          backgroundColor: 'rgba(247, 242, 235, 0.8)',
          border: '1px solid rgba(176, 141, 87, 0.15)',
          color: '#2C2420',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#B08D57'
          e.target.style.boxShadow = '0 0 0 3px rgba(176, 141, 87, 0.1), 0 2px 8px rgba(176, 141, 87, 0.08)'
          e.target.style.backgroundColor = '#FFFFFF'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(176, 141, 87, 0.15)'
          e.target.style.boxShadow = 'none'
          e.target.style.backgroundColor = 'rgba(247, 242, 235, 0.8)'
        }}
      />
    </div>
  )
}

/* ── Textarea ──────────────────────────────────────────────────── */
function FormTextarea({ label, required, rows = 4, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <textarea
        {...props}
        required={required}
        rows={rows}
        className="w-full px-4 py-3 font-body text-sm rounded resize-none transition-all duration-300 focus:outline-none"
        style={{
          backgroundColor: 'rgba(247, 242, 235, 0.8)',
          border: '1px solid rgba(176, 141, 87, 0.15)',
          color: '#2C2420',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#B08D57'
          e.target.style.boxShadow = '0 0 0 3px rgba(176, 141, 87, 0.1), 0 2px 8px rgba(176, 141, 87, 0.08)'
          e.target.style.backgroundColor = '#FFFFFF'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(176, 141, 87, 0.15)'
          e.target.style.boxShadow = 'none'
          e.target.style.backgroundColor = 'rgba(247, 242, 235, 0.8)'
        }}
      />
    </div>
  )
}

/* ── Select ────────────────────────────────────────────────────── */
function FormSelect({ label, required, children, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <select
        {...props}
        required={required}
        className="w-full px-4 py-3 font-body text-sm rounded transition-all duration-300 focus:outline-none appearance-none cursor-pointer"
        style={{
          backgroundColor: 'rgba(247, 242, 235, 0.8)',
          border: '1px solid rgba(176, 141, 87, 0.15)',
          color: '#2C2420',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23B08D57' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: '36px',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#B08D57'
          e.target.style.boxShadow = '0 0 0 3px rgba(176, 141, 87, 0.1)'
          e.target.style.backgroundColor = '#FFFFFF'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(176, 141, 87, 0.15)'
          e.target.style.boxShadow = 'none'
          e.target.style.backgroundColor = 'rgba(247, 242, 235, 0.8)'
        }}
      >
        {children}
      </select>
    </div>
  )
}

/* ── Dynamic detail field ──────────────────────────────────────── */
function DetailField({ field, value, onChange }) {
  if (field.type === 'select') {
    return (
      <FormSelect
        label={`${field.label}${field.required ? '' : ''}${field.unit ? ` (${field.unit})` : ''}`}
        required={field.required}
        value={value}
        onChange={(e) => onChange(field.key, e.target.value)}
      >
        <option value="">— Выбрать —</option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </FormSelect>
    )
  }

  if (field.type === 'textarea') {
    return (
      <FormTextarea
        label={`${field.label}${field.unit ? ` (${field.unit})` : ''}`}
        required={field.required}
        value={value}
        onChange={(e) => onChange(field.key, e.target.value)}
        rows={3}
        placeholder={field.placeholder || ''}
      />
    )
  }

  return (
    <FormInput
      type={field.type === 'number' ? 'number' : 'text'}
      label={`${field.label}${field.unit ? ` (${field.unit})` : ''}`}
      required={field.required}
      value={value}
      onChange={(e) => {
        const val = field.type === 'number'
          ? (e.target.value ? Number(e.target.value) : '')
          : e.target.value
        onChange(field.key, val)
      }}
      placeholder={field.placeholder || ''}
      min={field.type === 'number' ? 0 : undefined}
    />
  )
}

/* ── Main component ────────────────────────────────────────────── */
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
        special_attributes: data.special_attributes || [],
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
      special_attributes: form.special_attributes || [],
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
    <div
      className="max-w-3xl mx-auto page-enter rounded-lg p-6 md:p-10"
      style={{
        backgroundColor: '#F7F2EB',
        boxShadow: '0 4px 40px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded transition-all duration-300 hover:bg-black/5"
          style={{ color: 'rgba(44, 36, 32, 0.4)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#B08D57' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(44, 36, 32, 0.4)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-2xl italic" style={{ color: '#2C2420' }}>
            {isEditing ? 'Редактировать товар' : 'Новый товар'}
          </h1>
          <p className="font-body text-sm mt-0.5" style={{ color: 'rgba(44, 36, 32, 0.45)' }}>
            {isEditing ? 'Измените данные и сохраните' : 'Заполните информацию о товаре'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Name + Description */}
        <Section icon={Info} title="Основная информация">
          <div className="space-y-5">
            <FormInput
              type="text"
              name="title"
              label="Название"
              required
              value={form.title}
              onChange={handleChange}
              placeholder={
                isShop
                  ? 'Название магазина'
                  : isVintage
                    ? 'Например: Кожаный портфель 1960-х'
                    : 'Название'
              }
            />

            <FormTextarea
              name="description"
              label="Описание"
              required
              value={form.description}
              onChange={handleChange}
              placeholder="Подробное описание товара..."
            />

            <FormInput
              type="number"
              name="price"
              label={
                isShop
                  ? 'Цена (оставьте 0)'
                  : currentCategory?.group === 'realestate'
                    ? 'Цена (\u20ac / мес. или покупка)'
                    : 'Цена (\u20ac)'
              }
              required={!isShop}
              value={form.price}
              onChange={handleChange}
              min="0"
              step="1"
              placeholder="0"
            />
          </div>
        </Section>

        {/* 2. Images */}
        <Section icon={null} title={null}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base italic" style={{ color: '#2C2420' }}>
              Изображения
            </h3>
            <span className="font-body text-xs" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
              {images.length} фото
              {images.length > 0 && ' \u2022 первое = главное'}
            </span>
          </div>
          <ImageUploader images={images} onChange={setImages} productId={isEditing ? id : undefined} />
        </Section>

        {/* 3. Category Selection */}
        <Section icon={Tag} title="Категория">
          <FormSelect
            label="Категория товара"
            required
            value={form.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categoryGroups.map((group) => {
              const groupCats = getActiveCategoryList().filter((c) => c.group === group.id)
              if (groupCats.length === 0) return null
              return (
                <optgroup key={group.id} label={`${group.icon} ${group.name}`}>
                  {groupCats.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </optgroup>
              )
            })}
          </FormSelect>
        </Section>

        {/* 4. Category-Specific Parameters (right after category) */}
        {currentCatFields.length > 0 && (
          <Section icon={Settings2} title={`${currentCategory?.icon} Параметры: ${currentCategory?.name}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentCatFields.map((field) => (
                <div
                  key={field.key}
                  className={field.type === 'textarea' ? 'sm:col-span-2' : ''}
                >
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

        {/* 5. Brand (vintage only) */}
        {isVintage && (
          <Section icon={Tag} title="Бренд / Марка">
            <div>
              <Label>Бренд</Label>
              <select
                value={knownBrands.some(b => b.name === form.brand) ? form.brand : (form.brand ? '__custom__' : '')}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '__custom__') {
                    setForm(prev => ({ ...prev, brand: prev.brand && !knownBrands.some(b => b.name === prev.brand) ? prev.brand : '' }))
                  } else {
                    setForm(prev => ({ ...prev, brand: val }))
                  }
                }}
                className="w-full px-4 py-3 font-body text-sm rounded transition-all duration-300 focus:outline-none appearance-none cursor-pointer"
                style={{
                  backgroundColor: 'rgba(247, 242, 235, 0.8)',
                  border: '1px solid rgba(176, 141, 87, 0.15)',
                  color: '#2C2420',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23B08D57' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '36px',
                }}
              >
                <option value="">— Без бренда —</option>
                {knownBrands
                  .filter(b => b.categories.includes(form.category))
                  .map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))
                }
                <option value="__custom__">Другой бренд...</option>
              </select>
              {(form.brand && !knownBrands.some(b => b.name === form.brand)) && (
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Введите название бренда"
                  className="w-full px-4 py-2.5 font-body text-sm rounded mt-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(247, 242, 235, 0.8)',
                    border: '1px solid rgba(176, 141, 87, 0.15)',
                    color: '#2C2420',
                  }}
                />
              )}
            </div>
          </Section>
        )}

        {/* 6. Special Attributes (vintage only) */}
        {isVintage && (
          <Section icon={Award} title="Особые характеристики">
            <p className="font-body text-xs mb-4" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
              Отметьте характеристики, которые повышают ценность товара
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {specialAttributes.map((attr) => {
                const isChecked = form.special_attributes?.includes(attr.id)
                return (
                  <label
                    key={attr.id}
                    className="flex items-center gap-3 p-3 rounded cursor-pointer transition-all duration-300"
                    style={{
                      backgroundColor: isChecked ? 'rgba(176, 141, 87, 0.08)' : 'rgba(247, 242, 235, 0.5)',
                      border: `1px solid ${isChecked ? 'rgba(176, 141, 87, 0.3)' : 'rgba(176, 141, 87, 0.08)'}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setForm(prev => ({
                          ...prev,
                          special_attributes: isChecked
                            ? prev.special_attributes.filter(a => a !== attr.id)
                            : [...(prev.special_attributes || []), attr.id],
                        }))
                      }}
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-300"
                      style={{
                        backgroundColor: isChecked ? attr.color : 'transparent',
                        border: `1.5px solid ${isChecked ? attr.color : 'rgba(44, 36, 32, 0.15)'}`,
                      }}
                    >
                      {isChecked && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="font-body text-sm" style={{ color: isChecked ? attr.color : 'rgba(44, 36, 32, 0.6)' }}>
                      {attr.icon} {attr.label}
                    </span>
                  </label>
                )
              })}
            </div>
          </Section>
        )}

        {/* Vintage-specific: Condition + Era */}
        {isVintage && (
          <Section icon={Sparkles} title="Винтаж">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormSelect
                name="condition"
                label="Состояние"
                value={form.condition}
                onChange={handleChange}
              >
                {conditions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </FormSelect>

              <FormInput
                type="text"
                name="era"
                label="Эпоха / Год"
                value={form.era}
                onChange={handleChange}
                placeholder="1970-е"
              />

              <FormSelect
                name="status"
                label="Статус"
                value={form.status}
                onChange={handleChange}
              >
                <option value="active">В наличии</option>
                <option value="sold">Продано</option>
              </FormSelect>
            </div>
          </Section>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 font-body text-sm rounded transition-all duration-300"
            style={{
              color: 'rgba(44, 36, 32, 0.5)',
              border: '1px solid rgba(44, 36, 32, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(44, 36, 32, 0.25)'
              e.target.style.color = '#2C2420'
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(44, 36, 32, 0.1)'
              e.target.style.color = 'rgba(44, 36, 32, 0.5)'
            }}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 font-body text-sm font-medium tracking-wide rounded transition-all duration-300 disabled:opacity-50"
            style={{
              backgroundColor: '#B08D57',
              color: '#FFFFFF',
              boxShadow: '0 2px 12px rgba(176, 141, 87, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#C9A96E'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(176, 141, 87, 0.4)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#B08D57'
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(176, 141, 87, 0.3)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {loading ? (
              <div
                className="w-4 h-4 rounded-full animate-spin"
                style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF' }}
              />
            ) : (
              <Save size={16} />
            )}
            {isEditing ? 'Сохранить' : 'Добавить товар'}
          </button>
        </div>
      </form>
    </div>
  )
}
