import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProduct, createProduct, updateProduct } from '../../lib/api'
import { categories, conditions } from '../../data/demoProducts'
import ImageUploader from '../../components/admin/ImageUploader'

const emptyForm = {
  title: '',
  description: '',
  price: '',
  category: 'clothing',
  condition: 'good',
  size: '',
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
        size: data.size || '',
        era: data.era || '',
        brand: data.brand || '',
        image_url: data.image_url || '',
        status: data.status || 'active',
      })
      // Load existing gallery images
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
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const productData = {
      ...form,
      price: Number(form.price),
      image_url: images[0]?.url || form.image_url || '',
      images: images,
    }

    const { data, error } = isEditing
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

  if (loadingProduct) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-gray-100 rounded w-1/3" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-sans text-xl font-semibold text-gray-900">
            {isEditing ? 'Редактировать товар' : 'Новый товар'}
          </h1>
          <p className="font-sans text-sm text-gray-500 mt-0.5">
            {isEditing ? 'Измените данные товара' : 'Заполните информацию о новом товаре'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Gallery Upload */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans text-sm font-medium text-gray-900">
              Изображения
            </h3>
            <span className="font-sans text-xs text-gray-400">
              {images.length} {images.length === 1 ? 'фото' : images.length < 5 ? 'фото' : 'фото'}
              {images.length > 0 && ' • первое = главное'}
            </span>
          </div>
          <ImageUploader
            images={images}
            onChange={setImages}
            productId={isEditing ? id : undefined}
          />
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h3 className="font-sans text-sm font-medium text-gray-900">Основная информация</h3>

          <div>
            <label className="block font-sans text-xs text-gray-400 mb-2">Название товара *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Например: Кожаный портфель 1960-х"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-sans text-sm
                focus:outline-none focus:ring-2 focus:ring-vintage-brown/20 focus:border-vintage-brown"
            />
          </div>

          <div>
            <label className="block font-sans text-xs text-gray-400 mb-2">Описание *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Подробное описание товара..."
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-sans text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-vintage-brown/20 focus:border-vintage-brown"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs text-gray-400 mb-2">Цена (€) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                step="1"
                placeholder="0"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-sans text-sm
                  focus:outline-none focus:ring-2 focus:ring-vintage-brown/20 focus:border-vintage-brown"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 mb-2">Бренд</label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Если известен"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-sans text-sm
                  focus:outline-none focus:ring-2 focus:ring-vintage-brown/20 focus:border-vintage-brown"
              />
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h3 className="font-sans text-sm font-medium text-gray-900">Классификация</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs text-gray-400 mb-2">Категория</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-sans text-sm
                  focus:outline-none focus:ring-2 focus:ring-vintage-brown/20 focus:border-vintage-brown"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 mb-2">Состояние</label>
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-sans text-sm
                  focus:outline-none focus:ring-2 focus:ring-vintage-brown/20 focus:border-vintage-brown"
              >
                {conditions.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-sans text-xs text-gray-400 mb-2">Размер</label>
              <input
                type="text"
                name="size"
                value={form.size}
                onChange={handleChange}
                placeholder="S / M / L / 42 / ..."
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-sans text-sm
                  focus:outline-none focus:ring-2 focus:ring-vintage-brown/20 focus:border-vintage-brown"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 mb-2">Эпоха / Год</label>
              <input
                type="text"
                name="era"
                value={form.era}
                onChange={handleChange}
                placeholder="1970-е"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-sans text-sm
                  focus:outline-none focus:ring-2 focus:ring-vintage-brown/20 focus:border-vintage-brown"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 mb-2">Статус</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-sans text-sm
                  focus:outline-none focus:ring-2 focus:ring-vintage-brown/20 focus:border-vintage-brown"
              >
                <option value="active">В наличии</option>
                <option value="sold">Продано</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 font-sans text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-vintage-dark text-white font-sans text-sm rounded-lg
              hover:bg-vintage-brown transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
