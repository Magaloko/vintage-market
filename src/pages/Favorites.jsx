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

      const loaded = []
      for (const productId of favorites) {
        const { data } = await getProduct(productId)
        if (data) loaded.push(data)
      }
      setProducts(loaded)
      setLoading(false)
    }
    loadProducts()
  }, [favorites, favLoading])

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="bg-gradient-to-b from-vintage-beige/40 to-transparent">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-3">
            <Heart size={24} className="text-red-400" fill="currentColor" />
            <h1 className="font-display text-3xl md:text-4xl font-bold text-vintage-dark">
              Избранное
            </h1>
          </div>
          <p className="font-body text-lg text-vintage-ink/60">
            {favoritesCount > 0
              ? `${favoritesCount} ${favoritesCount === 1 ? 'товар' : favoritesCount < 5 ? 'товара' : 'товаров'} в вашей коллекции`
              : 'Ваша коллекция избранных товаров пока пуста'
            }
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-vintage-beige/30 rounded" />
                <div className="mt-4 h-4 bg-vintage-beige/30 rounded w-3/4" />
                <div className="mt-2 h-4 bg-vintage-beige/30 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-vintage-beige/30 flex items-center justify-center">
              <Heart size={32} className="text-vintage-brown/20" />
            </div>
            <h3 className="font-display text-xl text-vintage-dark mb-2">
              Пока ничего не добавлено
            </h3>
            <p className="font-body text-vintage-ink/50 mb-8 max-w-md mx-auto">
              Нажмите на сердечко рядом с товаром, чтобы добавить его в избранное.
              Так вы не потеряете понравившиеся находки.
            </p>
            <Link
              to="/catalog"
              className="vintage-btn inline-flex items-center gap-2"
            >
              <ShoppingBag size={16} />
              Перейти в каталог
            </Link>
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
