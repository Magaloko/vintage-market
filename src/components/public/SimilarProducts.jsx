import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import { getProducts } from '../../lib/api'

export default function SimilarProducts({ currentProduct }) {
  const [similar, setSimilar] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const { data } = await getProducts({ category: currentProduct.category })
        if (data) {
          const filtered = data
            .filter(p => p.id !== currentProduct.id && p.status !== 'sold')
            .sort((a, b) => {
              const priceDiffA = Math.abs((a.price || 0) - (currentProduct.price || 0))
              const priceDiffB = Math.abs((b.price || 0) - (currentProduct.price || 0))
              return priceDiffA - priceDiffB
            })
            .slice(0, 4)
          setSimilar(filtered)
        }
      } catch (e) {
        console.warn('Similar products error:', e)
      }
    }
    if (currentProduct?.category) load()
  }, [currentProduct?.id, currentProduct?.category])

  if (similar.length === 0) return null

  return (
    <section className="mt-16 pt-12 border-t border-vintage-sand/30">
      <div className="flex items-center gap-4 mb-8">
        <div className="vintage-divider !w-8 !mx-0" />
        <h2 className="font-display text-2xl text-vintage-dark">{'\u041f\u043e\u0445\u043e\u0436\u0438\u0435 \u0442\u043e\u0432\u0430\u0440\u044b'}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {similar.map((product, i) => (
          <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
