import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Search, Package, X, Star, GripVertical, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProducts, deleteProduct, togglePromoted, updateProduct } from '../../lib/api'
import { categories } from '../../data/demoProducts'

/* ── Shared style tokens (light) ─────────────────────────────── */
const colors = {
  ink:   '#2C2420',
  gold:  '#B08D57',
  white: '#FFFFFF',
}

const alpha = {
  ink05: 'rgba(44, 36, 32, 0.05)',
  ink08: 'rgba(44, 36, 32, 0.08)',
  ink10: 'rgba(44, 36, 32, 0.1)',
  ink15: 'rgba(44, 36, 32, 0.15)',
  ink20: 'rgba(44, 36, 32, 0.2)',
  ink30: 'rgba(44, 36, 32, 0.3)',
  ink40: 'rgba(44, 36, 32, 0.4)',
  ink50: 'rgba(44, 36, 32, 0.5)',
  ink70: 'rgba(44, 36, 32, 0.7)',
  ink80: 'rgba(44, 36, 32, 0.8)',
  gold08: 'rgba(176, 141, 87, 0.08)',
  gold10: 'rgba(176, 141, 87, 0.1)',
  gold12: 'rgba(176, 141, 87, 0.12)',
  gold40: 'rgba(176, 141, 87, 0.4)',
}

const panelStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  border: `1px solid ${alpha.gold12}`,
  borderRadius: '2px',
  backdropFilter: 'blur(4px)',
}

const inputStyle = {
  backgroundColor: 'rgba(247, 242, 235, 0.8)',
  border: `1px solid ${alpha.gold12}`,
  borderRadius: '2px',
  color: colors.ink,
}

const thStyle = { color: alpha.ink30 }

const statusBadge = (status) => ({
  backgroundColor: status === 'active' ? 'rgba(122, 139, 111, 0.12)' : alpha.ink05,
  color: status === 'active' ? '#5A6B3C' : alpha.ink40,
})

/* ── Skeleton loader ─────────────────────────────────────────── */
function ProductsSkeleton() {
  return (
    <div style={panelStyle} className="overflow-hidden">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 animate-pulse"
          style={{ borderBottom: `1px solid ${alpha.gold08}` }}
        >
          <div className="w-16 h-16" style={{ backgroundColor: alpha.gold08, borderRadius: '2px' }} />
          <div className="flex-1 space-y-2">
            <div className="h-4 rounded w-1/3" style={{ backgroundColor: alpha.gold08 }} />
            <div className="h-3 rounded w-1/5" style={{ backgroundColor: alpha.gold08 }} />
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
      <Package size={48} className="mx-auto mb-4" style={{ color: alpha.ink15 }} />
      <p className="font-body" style={{ color: alpha.ink30 }}>
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

/* ── Inline edit cell ────────────────────────────────────────── */
function InlineEditCell({ value, onChange, onSave, type = 'text', options, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.focus()
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSave()
    if (e.key === 'Escape') onSave()
  }

  if (type === 'select') {
    return (
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onSave}
        onKeyDown={handleKeyDown}
        className={`px-2 py-1 font-body text-xs rounded ${className}`}
        style={inputStyle}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    )
  }

  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onSave}
      onKeyDown={handleKeyDown}
      className={`px-2 py-1 font-body text-sm rounded w-full ${className}`}
      style={{ ...inputStyle, minWidth: type === 'number' ? '80px' : '120px' }}
      min={type === 'number' ? 0 : undefined}
      step={type === 'number' ? 1 : undefined}
    />
  )
}

/* ── Product table row ───────────────────────────────────────── */
function ProductRow({ product, onDelete, onTogglePromote, onInlineEdit, isDragging, onDragStart, onDragOver, onDragEnd }) {
  const categoryName = categories.find((c) => c.id === product.category)?.name || product.category
  const [editField, setEditField] = useState(null)
  const [editValue, setEditValue] = useState('')

  const startEdit = (field, value) => {
    setEditField(field)
    setEditValue(value)
  }

  const saveEdit = () => {
    if (editField && editValue !== undefined) {
      const oldValue = editField === 'price'
        ? product.price
        : editField === 'title'
          ? product.title
          : product.category

      const newValue = editField === 'price' ? Number(editValue) || 0 : editValue

      if (String(newValue) !== String(oldValue)) {
        onInlineEdit(product.id, editField, newValue)
      }
    }
    setEditField(null)
  }

  return (
    <tr
      className="transition-colors group"
      style={{
        borderBottom: `1px solid ${alpha.gold08}`,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'default',
      }}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = alpha.gold08 }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {/* Drag handle */}
      <td className="px-2 py-3 w-8">
        <GripVertical
          size={14}
          className="cursor-grab active:cursor-grabbing"
          style={{ color: alpha.ink20 }}
        />
      </td>

      {/* Product info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-12 h-12 object-cover shrink-0"
              style={{ borderRadius: '2px', backgroundColor: alpha.gold08 }}
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
              backgroundColor: alpha.gold08,
              borderRadius: '2px',
            }}
          >
            🏺
          </div>
          <div className="min-w-0">
            {editField === 'title' ? (
              <InlineEditCell
                value={editValue}
                onChange={setEditValue}
                onSave={saveEdit}
              />
            ) : (
              <p
                className="font-body text-sm font-medium line-clamp-1 cursor-pointer hover:underline"
                style={{ color: alpha.ink80 }}
                onDoubleClick={() => startEdit('title', product.title)}
                title="Двойной клик для редактирования"
              >
                {product.title}
              </p>
            )}
            {product.brand && (
              <p className="font-body text-xs" style={{ color: alpha.ink30 }}>
                {product.brand}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3 hidden md:table-cell">
        {editField === 'category' ? (
          <InlineEditCell
            value={editValue}
            onChange={setEditValue}
            onSave={saveEdit}
            type="select"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        ) : (
          <span
            className="font-body text-xs cursor-pointer hover:underline"
            style={{ color: alpha.ink40 }}
            onDoubleClick={() => startEdit('category', product.category)}
            title="Двойной клик для редактирования"
          >
            {categoryName}
          </span>
        )}
      </td>

      {/* Price */}
      <td className="px-4 py-3">
        {editField === 'price' ? (
          <InlineEditCell
            value={editValue}
            onChange={setEditValue}
            onSave={saveEdit}
            type="number"
          />
        ) : (
          <span
            className="font-body text-sm font-semibold cursor-pointer hover:underline"
            style={{ color: colors.ink }}
            onDoubleClick={() => startEdit('price', product.price)}
            title="Двойной клик для редактирования"
          >
            {product.price}&euro;
          </span>
        )}
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
        <span className="font-body text-xs flex items-center gap-1" style={{ color: alpha.ink30 }}>
          <Eye size={12} /> {product.views || 0}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onTogglePromote(product.id, !product.is_promoted)}
            className="p-2 transition-colors"
            style={{ color: product.is_promoted ? colors.gold : alpha.ink30, borderRadius: '2px' }}
            title={product.is_promoted ? 'Убрать из продвигаемых' : 'Продвинуть'}
          >
            <Star size={16} fill={product.is_promoted ? colors.gold : 'none'} />
          </button>
          <Link
            to={`/product/${product.id}`}
            target="_blank"
            className="p-2 transition-colors"
            style={{ color: alpha.ink30, borderRadius: '2px' }}
          >
            <Eye size={16} />
          </Link>
          <Link
            to={`/admin/products/edit/${product.id}`}
            className="p-2 transition-colors"
            style={{ color: alpha.ink30, borderRadius: '2px' }}
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
  { label: '',          align: 'left',  className: 'w-8' },
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
  const [dragIdx, setDragIdx] = useState(null)
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

  const handleTogglePromote = async (id, isPromoted) => {
    const { error } = await togglePromoted(id, isPromoted)
    if (error) {
      toast.error('Ошибка обновления')
      return
    }
    toast.success(isPromoted ? 'Товар продвинут' : 'Продвижение снято')
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_promoted: isPromoted } : p))
    )
  }

  /* Inline editing */
  const handleInlineEdit = async (id, field, value) => {
    const product = products.find((p) => p.id === id)
    if (!product) return

    const updates = { ...product, [field]: value }
    if (field === 'price') updates.price = Number(value) || 0

    const { error } = await updateProduct(id, updates)
    if (error) {
      toast.error('Ошибка сохранения')
      return
    }
    toast.success('Сохранено')
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: field === 'price' ? Number(value) || 0 : value } : p))
    )
  }

  /* Drag-and-drop reorder */
  const handleDragStart = (idx) => setDragIdx(idx)

  const handleDragOver = (e, idx) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    const next = [...products]
    const [moved] = next.splice(dragIdx, 1)
    next.splice(idx, 0, moved)
    setProducts(next)
    setDragIdx(idx)
  }

  const handleDragEnd = () => {
    setDragIdx(null)
    // Save order to localStorage
    const order = products.map((p) => p.id)
    localStorage.setItem('gdt_product_order', JSON.stringify(order))
    toast.success('Порядок сохранён')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-body text-xl font-semibold" style={{ color: colors.ink }}>
            Товары
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: alpha.ink40 }}>
            {products.length} товаров
            <span className="ml-2 font-body text-[10px]" style={{ color: alpha.ink20 }}>
              Двойной клик для редактирования · Перетащите для сортировки
            </span>
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 font-body text-sm transition-colors"
          style={{ backgroundColor: colors.gold, color: colors.white, borderRadius: '2px' }}
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
            style={{ color: alpha.ink30 }}
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
              style={{ color: alpha.ink30 }}
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
                <tr style={{ borderBottom: `1px solid ${alpha.gold10}` }}>
                  {TABLE_COLUMNS.map((col) => (
                    <th
                      key={col.label || 'drag'}
                      className={`text-${col.align} px-4 py-3 font-body text-xs uppercase tracking-wider ${col.className}`}
                      style={thStyle}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onDelete={handleDelete}
                    onTogglePromote={handleTogglePromote}
                    onInlineEdit={handleInlineEdit}
                    isDragging={dragIdx === idx}
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
