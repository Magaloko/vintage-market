import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Search, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProducts, deleteProduct } from '../../lib/api'
import { categories } from '../../data/demoProducts'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')

  const load = async () => {
    setLoading(true)
    const { data } = await getProducts({
      category: filter || undefined,
      search: search || undefined,
    })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  const handleSearch = (e) => {
    e.preventDefault()
    load()
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-body text-xl font-semibold" style={{ color: '#F0E6D6' }}>Товары</h1>
          <p className="font-body text-sm mt-1" style={{ color: 'rgba(240, 230, 214, 0.4)' }}>{products.length} товаров</p>
        </div>
        <Link to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 font-body text-sm transition-colors"
          style={{ backgroundColor: '#B08D57', color: '#F0E6D6', borderRadius: '2px' }}>
          <Plus size={16} />
          Добавить товар
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(240, 230, 214, 0.3)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск товаров..."
            className="w-full pl-10 pr-4 py-2.5 font-body text-sm transition-all"
            style={{
              backgroundColor: 'rgba(240, 230, 214, 0.05)',
              border: '1px solid rgba(240, 230, 214, 0.08)',
              borderRadius: '2px',
              color: '#F0E6D6',
            }}
          />
        </form>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 font-body text-sm"
          style={{
            backgroundColor: 'rgba(240, 230, 214, 0.05)',
            border: '1px solid rgba(240, 230, 214, 0.08)',
            borderRadius: '2px',
            color: '#F0E6D6',
          }}
        >
          <option value="">Все категории</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      {loading ? (
        <div style={{ backgroundColor: '#1A1410', border: '1px solid rgba(240, 230, 214, 0.06)', borderRadius: '2px' }} className="overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 animate-pulse" style={{ borderBottom: '1px solid rgba(240, 230, 214, 0.04)' }}>
              <div className="w-16 h-16" style={{ backgroundColor: 'rgba(240, 230, 214, 0.05)', borderRadius: '2px' }} />
              <div className="flex-1 space-y-2">
                <div className="h-4 rounded w-1/3" style={{ backgroundColor: 'rgba(240, 230, 214, 0.05)' }} />
                <div className="h-3 rounded w-1/5" style={{ backgroundColor: 'rgba(240, 230, 214, 0.05)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16" style={{ backgroundColor: '#1A1410', border: '1px solid rgba(240, 230, 214, 0.06)', borderRadius: '2px' }}>
          <Package size={48} className="mx-auto mb-4" style={{ color: 'rgba(240, 230, 214, 0.1)' }} />
          <p className="font-body" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>Товаров пока нет</p>
          <Link to="/admin/products/new" className="inline-flex items-center gap-2 mt-4 text-sm font-body"
            style={{ color: '#B08D57' }}>
            <Plus size={14} /> Добавить первый товар
          </Link>
        </div>
      ) : (
        <div style={{ backgroundColor: '#1A1410', border: '1px solid rgba(240, 230, 214, 0.06)', borderRadius: '2px' }} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(240, 230, 214, 0.06)' }}>
                  <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider" style={{ color: 'rgba(240, 230, 214, 0.25)' }}>Товар</th>
                  <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider hidden md:table-cell" style={{ color: 'rgba(240, 230, 214, 0.25)' }}>Категория</th>
                  <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider" style={{ color: 'rgba(240, 230, 214, 0.25)' }}>Цена</th>
                  <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider hidden sm:table-cell" style={{ color: 'rgba(240, 230, 214, 0.25)' }}>Статус</th>
                  <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider hidden lg:table-cell" style={{ color: 'rgba(240, 230, 214, 0.25)' }}>Просмотры</th>
                  <th className="text-right px-4 py-3 font-body text-xs uppercase tracking-wider" style={{ color: 'rgba(240, 230, 214, 0.25)' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="transition-colors"
                    style={{ borderBottom: '1px solid rgba(240, 230, 214, 0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(240, 230, 214, 0.02)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-12 h-12 object-cover"
                          style={{ borderRadius: '2px', backgroundColor: 'rgba(240, 230, 214, 0.05)' }}
                        />
                        <div>
                          <p className="font-body text-sm font-medium line-clamp-1" style={{ color: 'rgba(240, 230, 214, 0.8)' }}>{product.title}</p>
                          {product.brand && (
                            <p className="font-body text-xs" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>{product.brand}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-body text-xs" style={{ color: 'rgba(240, 230, 214, 0.4)' }}>
                        {categories.find(c => c.id === product.category)?.name || product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-body text-sm font-semibold" style={{ color: '#F0E6D6' }}>{product.price}&euro;</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="inline-flex px-2 py-1 rounded-full font-body text-xs"
                        style={{
                          backgroundColor: product.status === 'active' ? 'rgba(90, 107, 60, 0.15)' : 'rgba(240, 230, 214, 0.05)',
                          color: product.status === 'active' ? '#6E7F4E' : 'rgba(240, 230, 214, 0.4)',
                        }}>
                        {product.status === 'active' ? 'В наличии' : 'Продано'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="font-body text-xs flex items-center gap-1" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>
                        <Eye size={12} /> {product.views || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/product/${product.id}`}
                          target="_blank"
                          className="p-2 transition-colors"
                          style={{ color: 'rgba(240, 230, 214, 0.3)', borderRadius: '2px' }}
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="p-2 transition-colors"
                          style={{ color: 'rgba(240, 230, 214, 0.3)', borderRadius: '2px' }}
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.title)}
                          className="p-2 transition-colors"
                          style={{ color: 'rgba(176, 141, 87, 0.4)', borderRadius: '2px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
