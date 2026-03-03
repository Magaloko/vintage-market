import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Search, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProducts, deleteProduct } from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'
import { categories } from '../../data/demoProducts'

export default function SellerProducts() {
  const { shopId } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [shopId])

  async function load() {
    if (!shopId) return
    setLoading(true)
    const { data } = await getProducts({ shop_id: shopId })
    setProducts(data || [])
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить товар?')) return
    const { error } = await deleteProduct(id)
    if (error) toast.error('Ошибка удаления')
    else { toast.success('Удалено'); load() }
  }

  const filtered = search
    ? products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : products

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl italic" style={{ color: '#F0E6D6' }}>Мои товары</h1>
        <Link to="/seller/products/new" className="btn-primary text-sm py-2 px-4">
          <Plus size={14} className="mr-2" /> Добавить
        </Link>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(240, 230, 214, 0.2)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Поиск товаров..." className="gdt-input-dark pl-10" />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" style={{ color: '#B08D57' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="mx-auto mb-4" style={{ color: 'rgba(240, 230, 214, 0.1)' }} />
          <p className="font-body" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>Товаров пока нет</p>
          <Link to="/seller/products/new" className="inline-flex items-center gap-2 mt-4 text-sm font-body" style={{ color: '#B08D57' }}>
            <Plus size={14} /> Добавить первый товар
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(product => {
            const cat = categories.find(c => c.id === product.category)
            return (
              <div key={product.id} className="flex items-center gap-4 p-4"
                style={{ backgroundColor: 'rgba(240, 230, 214, 0.02)', border: '1px solid rgba(240, 230, 214, 0.05)', borderRadius: '2px' }}>
                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0" style={{ backgroundColor: 'rgba(240, 230, 214, 0.05)' }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">{cat?.icon || '📦'}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium truncate" style={{ color: '#F0E6D6' }}>{product.title}</p>
                  <p className="font-body text-xs" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>
                    {cat?.name || product.category} · {product.price}€
                    {product.status === 'sold' && ' · Продано'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-body text-xs mr-3" style={{ color: 'rgba(240, 230, 214, 0.2)' }}>
                    <Eye size={12} className="inline mr-1" />{product.views || 0}
                  </span>
                  <Link to={`/seller/products/edit/${product.id}`}
                    className="w-8 h-8 flex items-center justify-center transition-colors"
                    style={{ color: 'rgba(176, 141, 87, 0.5)' }}>
                    <Edit size={14} />
                  </Link>
                  <button onClick={() => handleDelete(product.id)}
                    className="w-8 h-8 flex items-center justify-center transition-colors"
                    style={{ color: 'rgba(181, 115, 106, 0.5)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
