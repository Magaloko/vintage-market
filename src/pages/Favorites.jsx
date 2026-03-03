import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import { useFavorites } from '../lib/FavoritesContext'
import { getProduct } from '../lib/api'
import ProductCard from '../components/public/ProductCard'

export default function Favorites() {
  const { favorites, favoritesCount, loading: favLoading } = useFavorites()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      if (favLoading) return
      setLoading(true)

      try {
        const loaded = []
        for (const productId of favorites) {
          try {
            const { data } = await getProduct(productId)
            if (data) loaded.push(data)
          } catch (e) {
            console.warn('Failed to load favorite product:', productId, e)
          }
        }
        setProducts(loaded)
      } catch (e) {
        console.error('Favorites load error:', e)
        setProducts([])
      }
      setLoading(false)
    }
    loadProducts()
  }, [favorites, favLoading])

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ backgroundColor: 'rgba(44, 36, 32, 0.04)' }}>
        <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
          <div className="flex items-center gap-3 mb-3">
            <Heart size={24} style={{ color: '#B08D57' }} fill="currentColor" />
            <h1 className="font-display text-3xl md:text-4xl font-bold" style={{ color: '#0C0A08' }}>
              Избранное
            </h1>
          </div>
          <p className="font-body text-lg" style={{ color: 'rgba(28, 28, 26, 0.5)' }}>
            {favoritesCount > 0
              ? `${favoritesCount} ${favoritesCount === 1 ? 'товар' : favoritesCount < 5 ? 'товара' : 'товаров'} в вашей коллекции`
              : 'Ваша коллекция избранных товаров пока пуста'
            }
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5]" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)', borderRadius: '2px' }} />
                <div className="mt-4 h-4 rounded w-3/4" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
                <div className="mt-2 h-4 rounded w-1/4" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(44, 36, 32, 0.04)' }}>
              <Heart size={32} style={{ color: 'rgba(44, 36, 32, 0.15)' }} />
            </div>
            <h3 className="font-display text-xl mb-2" style={{ color: '#0C0A08' }}>
              Пока ничего не добавлено
            </h3>
            <p className="font-body mb-8 max-w-md mx-auto" style={{ color: 'rgba(28, 28, 26, 0.4)' }}>
              Нажмите на сердечко рядом с товаром, чтобы добавить его в избранное.
              Так вы не потеряете понравившиеся находки.
            </p>
            <Link to="/catalog" className="btn-primary inline-flex items-center gap-2">
              <ShoppingBag size={16} />
              Перейти в каталог
            </Link>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-8">
            {products.map((product, idx) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <ProductCard product={product} showFavorite />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
