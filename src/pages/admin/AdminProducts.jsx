import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Search, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProducts, deleteProduct } from '../../lib/api'
import { categories, conditions } from '../../data/demoProducts'

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
    if (!confirm(`Удалить «${title}»?`)) return
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
          <h1 className="font-sans text-xl font-semibold text-gray-900">Товары</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">{products.length} товаров</p>
        </div>
        <Link to="/admin/products/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-vintage-dark text-white font-sans text-sm rounded-lg hover:bg-vintage-brown transition-colors">
          <Plus size={16} />
          Добавить товар
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск товаров..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg font-sans text-sm
              focus:outline-none focus:ring-2 focus:ring-vintage-brown/20 focus:border-vintage-brown"
          />
        </form>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-sans text-sm
            focus:outline-none focus:ring-2 focus:ring-vintage-brown/20 focus:border-vintage-brown"
        >
          <option value="">Все категории</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-50 animate-pulse">
              <div className="w-16 h-16 bg-gray-100 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/5" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Package size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-sans text-gray-400">Товаров пока нет</p>
          <Link to="/admin/products/new" className="inline-flex items-center gap-2 mt-4 text-sm text-vintage-brown hover:text-vintage-dark font-sans">
            <Plus size={14} /> Добавить первый товар
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-sans text-xs uppercase tracking-wider text-gray-400">Товар</th>
                  <th className="text-left px-4 py-3 font-sans text-xs uppercase tracking-wider text-gray-400 hidden md:table-cell">Категория</th>
                  <th className="text-left px-4 py-3 font-sans text-xs uppercase tracking-wider text-gray-400">Цена</th>
                  <th className="text-left px-4 py-3 font-sans text-xs uppercase tracking-wider text-gray-400 hidden sm:table-cell">Статус</th>
                  <th className="text-left px-4 py-3 font-sans text-xs uppercase tracking-wider text-gray-400 hidden lg:table-cell">Просмотры</th>
                  <th className="text-right px-4 py-3 font-sans text-xs uppercase tracking-wider text-gray-400">Действия</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded bg-gray-100"
                        />
                        <div>
                          <p className="font-sans text-sm font-medium text-gray-900 line-clamp-1">{product.title}</p>
                          {product.brand && (
                            <p className="font-sans text-xs text-gray-400">{product.brand}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-sans text-xs text-gray-500">
                        {categories.find(c => c.id === product.category)?.name || product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-sans text-sm font-semibold text-gray-900">{product.price}€</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-flex px-2 py-1 rounded-full font-sans text-xs ${
                        product.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {product.status === 'active' ? 'В наличии' : 'Продано'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="font-sans text-xs text-gray-400 flex items-center gap-1">
                        <Eye size={12} /> {product.views || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/product/${product.id}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.title)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
