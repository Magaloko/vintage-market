import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Search, Package, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProducts, deleteProduct } from '../../lib/api'
import { categories } from '../../data/demoProducts'

/* ── Shared style tokens ─────────────────────────────────────── */
const colors = {
  cream: '#F0E6D6',
  gold:  '#B08D57',
  panel: '#1A1410',
}

const alpha = {
  cream02: 'rgba(240, 230, 214, 0.02)',
  cream04: 'rgba(240, 230, 214, 0.04)',
  cream05: 'rgba(240, 230, 214, 0.05)',
  cream06: 'rgba(240, 230, 214, 0.06)',
  cream08: 'rgba(240, 230, 214, 0.08)',
  cream10: 'rgba(240, 230, 214, 0.1)',
  cream25: 'rgba(240, 230, 214, 0.25)',
  cream30: 'rgba(240, 230, 214, 0.3)',
  cream40: 'rgba(240, 230, 214, 0.4)',
  cream80: 'rgba(240, 230, 214, 0.8)',
  gold40:  'rgba(176, 141, 87, 0.4)',
}

const panelStyle = {
  backgroundColor: colors.panel,
  border: `1px solid ${alpha.cream06}`,
  borderRadius: '2px',
}

const inputStyle = {
  backgroundColor: alpha.cream05,
  border: `1px solid ${alpha.cream08}`,
  borderRadius: '2px',
  color: colors.cream,
}

const thStyle = { color: alpha.cream25 }

const statusBadge = (status) => ({
  backgroundColor: status === 'active' ? 'rgba(90, 107, 60, 0.15)' : alpha.cream05,
  color: status === 'active' ? '#6E7F4E' : alpha.cream40,
})

/* ── Skeleton loader ─────────────────────────────────────────── */
function ProductsSkeleton() {
  return (
    <div style={panelStyle} className="overflow-hidden">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 animate-pulse"
          style={{ borderBottom: `1px solid ${alpha.cream04}` }}
        >
          <div className="w-16 h-16" style={{ backgroundColor: alpha.cream05, borderRadius: '2px' }} />
          <div className="flex-1 space-y-2">
            <div className="h-4 rounded w-1/3" style={{ backgroundColor: alpha.cream05 }} />
            <div className="h-3 rounded w-1/5" style={{ backgroundColor: alpha.cream05 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Empty state ─────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="text-center py-16" style={panelStyle}>
      <Package size={48} className="mx-auto mb-4" style={{ color: alpha.cream10 }} />
      <p className="font-body" style={{ color: alpha.cream30 }}>
        Товаров пока нет
      </p>
      <Link
        to="/admin/products/new"
        className="inline-flex items-center gap-2 mt-4 text-sm font-body"
        style={{ color: colors.gold }}
      >
        <Plus size={14} /> Добавить первый товар
      </Link>
    </div>
  )
}

/* ── Product table row ───────────────────────────────────────── */
function ProductRow({ product, onDelete }) {
  const categoryName = categories.find((c) => c.id === product.category)?.name || product.category

  const handleMouseEnter = (e) => { e.currentTarget.style.backgroundColor = alpha.cream02 }
  const handleMouseLeave = (e) => { e.currentTarget.style.backgroundColor = 'transparent' }

  return (
    <tr
      className="transition-colors"
      style={{ borderBottom: `1px solid ${alpha.cream04}` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Product info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-12 h-12 object-cover shrink-0"
              style={{ borderRadius: '2px', backgroundColor: alpha.cream05 }}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            className="w-12 h-12 shrink-0 items-center justify-center text-2xl"
            style={{
              display: product.image_url ? 'none' : 'flex',
              backgroundColor: alpha.cream05,
              borderRadius: '2px',
            }}
          >
            🏺
          </div>
          <div>
            <p className="font-body text-sm font-medium line-clamp-1" style={{ color: alpha.cream80 }}>
              {product.title}
            </p>
            {product.brand && (
              <p className="font-body text-xs" style={{ color: alpha.cream30 }}>
                {product.brand}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="font-body text-xs" style={{ color: alpha.cream40 }}>
          {categoryName}
        </span>
      </td>

      {/* Price */}
      <td className="px-4 py-3">
        <span className="font-body text-sm font-semibold" style={{ color: colors.cream }}>
          {product.price}&euro;
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <span
          className="inline-flex px-2 py-1 rounded-full font-body text-xs"
          style={statusBadge(product.status)}
        >
          {product.status === 'active' ? 'В наличии' : 'Продано'}
        </span>
      </td>

      {/* Views */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="font-body text-xs flex items-center gap-1" style={{ color: alpha.cream30 }}>
          <Eye size={12} /> {product.views || 0}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Link
            to={`/product/${product.id}`}
            target="_blank"
            className="p-2 transition-colors"
            style={{ color: alpha.cream30, borderRadius: '2px' }}
          >
            <Eye size={16} />
          </Link>
          <Link
            to={`/admin/products/edit/${product.id}`}
            className="p-2 transition-colors"
            style={{ color: alpha.cream30, borderRadius: '2px' }}
          >
            <Edit size={16} />
          </Link>
          <button
            onClick={() => onDelete(product.id, product.title)}
            className="p-2 transition-colors"
            style={{ color: alpha.gold40, borderRadius: '2px' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}

/* ── Table header columns ────────────────────────────────────── */
const TABLE_COLUMNS = [
  { label: 'Товар',     align: 'left',  className: '' },
  { label: 'Категория', align: 'left',  className: 'hidden md:table-cell' },
  { label: 'Цена',      align: 'left',  className: '' },
  { label: 'Статус',    align: 'left',  className: 'hidden sm:table-cell' },
  { label: 'Просмотры', align: 'left',  className: 'hidden lg:table-cell' },
  { label: 'Действия',  align: 'right', className: '' },
]

/* ── Main component ──────────────────────────────────────────── */
export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const debounceRef = useRef(null)

  const load = useCallback(async (searchVal, filterVal) => {
    setLoading(true)
    const { data } = await getProducts({
      category: filterVal || undefined,
      search: searchVal || undefined,
    })
    setProducts(data || [])
    setLoading(false)
  }, [])

  /* Debounced search -- 300ms after last keystroke */
  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => load(val, filter), 300)
  }

  const clearSearch = () => {
    setSearch('')
    clearTimeout(debounceRef.current)
    load('', filter)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    load(search, filter)
  }

  useEffect(() => { load(search, filter) }, [filter]) // eslint-disable-line

  const handleDelete = async (id, title) => {
    if (!confirm(`Удалить \u00ab${title}\u00bb?`)) return
    const { error } = await deleteProduct(id)
    if (error) {
      toast.error('Ошибка удаления')
      return
    }
    toast.success('Товар удалён')
    load()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-body text-xl font-semibold" style={{ color: colors.cream }}>
            Товары
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: alpha.cream40 }}>
            {products.length} товаров
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 font-body text-sm transition-colors"
          style={{ backgroundColor: colors.gold, color: colors.cream, borderRadius: '2px' }}
        >
          <Plus size={16} /> Добавить товар
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: alpha.cream30 }}
          />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Поиск товаров..."
            className="w-full pl-10 pr-10 py-2.5 font-body text-sm transition-all"
            style={inputStyle}
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: alpha.cream30 }}
            >
              <X size={14} />
            </button>
          )}
        </form>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 font-body text-sm"
          style={inputStyle}
        >
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products table / skeleton / empty */}
      {loading ? (
        <ProductsSkeleton />
      ) : products.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={panelStyle} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${alpha.cream06}` }}>
                  {TABLE_COLUMNS.map((col) => (
                    <th
                      key={col.label}
                      className={`text-${col.align} px-4 py-3 font-body text-xs uppercase tracking-wider ${col.className}`}
                      style={thStyle}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <ProductRow key={product.id} product={product} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
