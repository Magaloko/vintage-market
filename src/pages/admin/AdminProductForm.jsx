import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProduct, createProduct, updateProduct } from '../../lib/api'
import { categories, conditions, categoryFields, categoryGroups } from '../../data/demoProducts'
import ImageUploader from '../../components/admin/ImageUploader'

const emptyForm = {
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

export default function AdminProductForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [details, setDetails] = useState({})
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(isEditing)

  useEffect(() => {
    if (!isEditing) return
    async function load() {
      const { data, error } = await getProduct(id)
      if (error || !data) {
        toast.error('Товар не найден')
        navigate('/admin/products')
        return
      }
      setForm({
        title: data.title || '',
        description: data.description || '',
        price: data.price || '',
        category: data.category || 'clothing',
        condition: data.condition || 'good',
        era: data.era || '',
        brand: data.brand || '',
        image_url: data.image_url || '',
        status: data.status || 'active',
      })
      setDetails(data.details || {})
      if (data.images && data.images.length > 0) {
        setImages(data.images.map(img => ({
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleDetailChange = (key, value) => {
    setDetails(prev => ({ ...prev, [key]: value }))
  }

  // When category changes, keep matching detail fields, clear the rest
  const handleCategoryChange = (newCategory) => {
    setForm(prev => ({ ...prev, category: newCategory }))
    const newFields = categoryFields[newCategory] || []
    const newKeys = new Set(newFields.map(f => f.key))
    setDetails(prev => {
      const kept = {}
      Object.keys(prev).forEach(k => {
        if (newKeys.has(k)) kept[k] = prev[k]
      })
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
      images: images,
      details: details,
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
    navigate('/admin/products')
  }

  const inputStyle = {
    backgroundColor: 'rgba(242, 237, 227, 0.05)',
    border: '1px solid rgba(242, 237, 227, 0.08)',
    borderRadius: '6px',
    color: '#F2EDE3',
  }

  const currentCatFields = categoryFields[form.category] || []
  const currentCategory = categories.find(c => c.id === form.category)
  const isVintage = currentCategory?.group === 'vintage'
  const isShop = currentCategory?.group === 'shops'

  if (loadingProduct) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-6">
        <div className="h-8 rounded w-1/3" style={{ backgroundColor: 'rgba(242, 237, 227, 0.05)' }} />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 rounded" style={{ backgroundColor: 'rgba(242, 237, 227, 0.05)' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 transition-colors"
          style={{ color: 'rgba(242, 237, 227, 0.3)', borderRadius: '6px' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-sans text-xl font-semibold" style={{ color: '#F2EDE3' }}>
            {isEditing ? 'Редактировать' : 'Новый товар'}
          </h1>
          <p className="font-sans text-sm mt-0.5" style={{ color: 'rgba(242, 237, 227, 0.35)' }}>
            {isEditing ? 'Измените данные' : 'Заполните информацию'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="p-6" style={{ backgroundColor: '#162438', border: '1px solid rgba(242, 237, 227, 0.06)', borderRadius: '6px' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans text-sm font-medium" style={{ color: 'rgba(242, 237, 227, 0.7)' }}>
              Изображения
            </h3>
            <span className="font-sans text-xs" style={{ color: 'rgba(242, 237, 227, 0.3)' }}>
              {images.length} фото
              {images.length > 0 && ' \u2022 первое = главное'}
            </span>
          </div>
          <ImageUploader images={images} onChange={setImages} productId={isEditing ? id : undefined} />
        </div>

        {/* Category Selection */}
        <div className="p-6 space-y-4" style={{ backgroundColor: '#162438', border: '1px solid rgba(242, 237, 227, 0.06)', borderRadius: '6px' }}>
          <h3 className="font-sans text-sm font-medium" style={{ color: 'rgba(242, 237, 227, 0.7)' }}>Категория</h3>
          <div className="space-y-3">
            {categoryGroups.map(group => {
              const groupCats = categories.filter(c => c.group === group.id)
              return (
                <div key={group.id}>
                  <p className="font-sans text-[10px] tracking-wider uppercase mb-2" style={{ color: 'rgba(242, 237, 227, 0.25)' }}>
                    {group.icon} {group.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {groupCats.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryChange(cat.id)}
                        className="px-3 py-1.5 font-sans text-xs transition-all"
                        style={{
                          backgroundColor: form.category === cat.id ? 'rgba(194, 100, 44, 0.2)' : 'rgba(242, 237, 227, 0.04)',
                          color: form.category === cat.id ? '#D4784A' : 'rgba(242, 237, 227, 0.4)',
                          border: `1px solid ${form.category === cat.id ? 'rgba(194, 100, 44, 0.3)' : 'rgba(242, 237, 227, 0.06)'}`,
                          borderRadius: '6px',
                        }}
                      >
                        {cat.icon} {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Basic Info */}
        <div className="p-6 space-y-5" style={{ backgroundColor: '#162438', border: '1px solid rgba(242, 237, 227, 0.06)', borderRadius: '6px' }}>
          <h3 className="font-sans text-sm font-medium" style={{ color: 'rgba(242, 237, 227, 0.7)' }}>Основная информация</h3>

          <div>
            <label className="block font-sans text-xs mb-2" style={{ color: 'rgba(242, 237, 227, 0.3)' }}>Название *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} required
              placeholder={isShop ? 'Название магазина' : isVintage ? 'Например: Кожаный портфель 1960-х' : 'Название'}
              className="w-full px-4 py-2.5 font-sans text-sm focus:outline-none" style={inputStyle} />
          </div>

          <div>
            <label className="block font-sans text-xs mb-2" style={{ color: 'rgba(242, 237, 227, 0.3)' }}>Описание *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
              placeholder="Подробное описание..."
              className="w-full px-4 py-2.5 font-sans text-sm resize-none focus:outline-none" style={inputStyle} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs mb-2" style={{ color: 'rgba(242, 237, 227, 0.3)' }}>
                {isShop ? 'Цена (оставьте 0)' : currentCategory?.group === 'realestate' ? 'Цена (\u20ac / мес. или покупка)' : 'Цена (\u20ac) *'}
              </label>
              <input type="number" name="price" value={form.price} onChange={handleChange}
                required={!isShop} min="0" step="1" placeholder="0"
                className="w-full px-4 py-2.5 font-sans text-sm focus:outline-none" style={inputStyle} />
            </div>
            {isVintage && (
              <div>
                <label className="block font-sans text-xs mb-2" style={{ color: 'rgba(242, 237, 227, 0.3)' }}>Бренд</label>
                <input type="text" name="brand" value={form.brand} onChange={handleChange}
                  placeholder="Если известен"
                  className="w-full px-4 py-2.5 font-sans text-sm focus:outline-none" style={inputStyle} />
              </div>
            )}
          </div>
        </div>

        {/* Vintage-specific: Condition + Era */}
        {isVintage && (
          <div className="p-6 space-y-5" style={{ backgroundColor: '#162438', border: '1px solid rgba(242, 237, 227, 0.06)', borderRadius: '6px' }}>
            <h3 className="font-sans text-sm font-medium" style={{ color: 'rgba(242, 237, 227, 0.7)' }}>Винтаж</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-sans text-xs mb-2" style={{ color: 'rgba(242, 237, 227, 0.3)' }}>Состояние</label>
                <select name="condition" value={form.condition} onChange={handleChange}
                  className="w-full px-4 py-2.5 font-sans text-sm focus:outline-none" style={inputStyle}>
                  {conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-sans text-xs mb-2" style={{ color: 'rgba(242, 237, 227, 0.3)' }}>Эпоха / Год</label>
                <input type="text" name="era" value={form.era} onChange={handleChange}
                  placeholder="1970-е"
                  className="w-full px-4 py-2.5 font-sans text-sm focus:outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block font-sans text-xs mb-2" style={{ color: 'rgba(242, 237, 227, 0.3)' }}>Статус</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full px-4 py-2.5 font-sans text-sm focus:outline-none" style={inputStyle}>
                  <option value="active">В наличии</option>
                  <option value="sold">Продано</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Category-Specific Fields */}
        {currentCatFields.length > 0 && (
          <div className="p-6 space-y-5" style={{ backgroundColor: '#162438', border: '1px solid rgba(242, 237, 227, 0.06)', borderRadius: '6px' }}>
            <h3 className="font-sans text-sm font-medium" style={{ color: 'rgba(242, 237, 227, 0.7)' }}>
              {currentCategory?.icon} Параметры: {currentCategory?.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentCatFields.map(field => (
                <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="block font-sans text-xs mb-2" style={{ color: 'rgba(242, 237, 227, 0.3)' }}>
                    {field.label}{field.required ? ' *' : ''}{field.unit ? ` (${field.unit})` : ''}
                  </label>

                  {field.type === 'select' ? (
                    <select
                      value={details[field.key] || ''}
                      onChange={e => handleDetailChange(field.key, e.target.value)}
                      required={field.required}
                      className="w-full px-4 py-2.5 font-sans text-sm focus:outline-none"
                      style={inputStyle}
                    >
                      <option value="">— Выбрать —</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={details[field.key] || ''}
                      onChange={e => handleDetailChange(field.key, e.target.value)}
                      required={field.required}
                      rows={3}
                      placeholder={field.placeholder || ''}
                      className="w-full px-4 py-2.5 font-sans text-sm resize-none focus:outline-none"
                      style={inputStyle}
                    />
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={details[field.key] || ''}
                      onChange={e => handleDetailChange(field.key, field.type === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder || ''}
                      min={field.type === 'number' ? 0 : undefined}
                      className="w-full px-4 py-2.5 font-sans text-sm focus:outline-none"
                      style={inputStyle}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-2.5 font-sans text-sm transition-colors"
            style={{ color: 'rgba(242, 237, 227, 0.4)' }}>
            Отмена
          </button>
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 font-sans text-sm transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#C2642C', color: '#F2EDE3', borderRadius: '6px' }}>
            {loading ? (
              <div className="w-4 h-4 rounded-full animate-spin"
                style={{ border: '2px solid rgba(242, 237, 227, 0.2)', borderTopColor: '#F2EDE3' }} />
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
