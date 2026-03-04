import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Search, Package, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProducts, deleteProduct, togglePromoted } from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'
import { categories } from '../../data/demoProducts'

// -- Constants ----------------------------------------------------------------

const GOLD = '#B08D57'
const TEXT = '#F0E6D6'
const TEXT_MUTED = 'rgba(240, 230, 214, 0.3)'
const TEXT_GHOST = 'rgba(240, 230, 214, 0.2)'
const TEXT_FAINT = 'rgba(240, 230, 214, 0.1)'

const ROW_STYLE = {
  backgroundColor: 'rgba(240, 230, 214, 0.02)',
  border: '1px solid rgba(240, 230, 214, 0.05)',
  borderRadius: '2px',
}

const THUMB_STYLE = {
  backgroundColor: 'rgba(240, 230, 214, 0.05)',
}

// -- Helpers ------------------------------------------------------------------

function Spinner() {
  return (
    <div className="text-center py-12">
      <div
        className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"
        style={{ color: GOLD }}
      />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <Package size={40} className="mx-auto mb-4" style={{ color: TEXT_FAINT }} />
      <p className="font-body" style={{ color: TEXT_MUTED }}>
        Товаров пока нет
      </p>
      <Link
        to="/seller/products/new"
        className="inline-flex items-center gap-2 mt-4 text-sm font-body"
        style={{ color: GOLD }}
      >
        <Plus size={14} /> Добавить первый товар
      </Link>
    </div>
  )
}

function ProductRow({ product, onDelete, onTogglePromote }) {
  const category = categories.find((c) => c.id === product.category)

  return (
    <div className="flex items-center gap-4 p-4" style={ROW_STYLE}>
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0" style={THUMB_STYLE}>
        {product.image_url ? (
          <img src={product.image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg">
            {category?.icon || '📦'}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-medium truncate" style={{ color: TEXT }}>
          {product.title}
        </p>
        <p className="font-body text-xs" style={{ color: TEXT_MUTED }}>
          {category?.name || product.category} · {product.price}€
          {product.status === 'sold' && ' · Продано'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <span className="font-body text-xs mr-3" style={{ color: TEXT_GHOST }}>
          <Eye size={12} className="inline mr-1" />
          {product.views || 0}
        </span>
        <button
          onClick={() => onTogglePromote(product.id, !product.is_promoted)}
          className="w-8 h-8 flex items-center justify-center transition-colors"
          style={{ color: product.is_promoted ? GOLD : TEXT_MUTED }}
          title={product.is_promoted ? 'Убрать из продвигаемых' : 'Продвигать'}
        >
          <Star size={14} fill={product.is_promoted ? GOLD : 'none'} />
        </button>
        <Link
          to={`/seller/products/edit/${product.id}`}
          className="w-8 h-8 flex items-center justify-center transition-colors"
          style={{ color: 'rgba(176, 141, 87, 0.5)' }}
        >
          <Edit size={14} />
        </Link>
        <button
          onClick={() => onDelete(product.id)}
          className="w-8 h-8 flex items-center justify-center transition-colors"
          style={{ color: 'rgba(181, 115, 106, 0.5)' }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

// -- Component ----------------------------------------------------------------

export default function SellerProducts() {
  const { shopId } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadProducts()
  }, [shopId])

  async function loadProducts() {
    if (!shopId) return
    setLoading(true)
    const { data } = await getProducts({ shop_id: shopId })
    setProducts(data || [])
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить товар?')) return
    const { error } = await deleteProduct(id)
    if (error) {
      toast.error('Ошибка удаления')
    } else {
      toast.success('Удалено')
      loadProducts()
    }
  }

  const handleTogglePromote = async (id, isPromoted) => {
    const { error } = await togglePromoted(id, isPromoted)
    if (error) {
      toast.error('Ошибка обновления')
    } else {
      toast.success(isPromoted ? 'Товар продвигается' : 'Продвижение снято')
      loadProducts()
    }
  }

  const filtered = search
    ? products.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : products

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl italic" style={{ color: TEXT }}>
          Мои товары
        </h1>
        <Link to="/seller/products/new" className="btn-primary text-sm py-2 px-4">
          <Plus size={14} className="mr-2" /> Добавить
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: TEXT_GHOST }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск товаров..."
          className="gdt-input-dark pl-10"
        />
      </div>

      {/* Product List */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <ProductRow key={product.id} product={product} onDelete={handleDelete} onTogglePromote={handleTogglePromote} />
          ))}
        </div>
      )}
    </div>
  )
}
