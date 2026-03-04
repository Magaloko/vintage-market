import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import { getProducts } from '../../lib/api'

const MAX_SIMILAR = 4

function sortByPriceProximity(products, referencePrice) {
  return [...products].sort((a, b) => {
    const diffA = Math.abs((a.price || 0) - (referencePrice || 0))
    const diffB = Math.abs((b.price || 0) - (referencePrice || 0))
    return diffA - diffB
  })
}

export default function SimilarProducts({ currentProduct }) {
  const [similar, setSimilar] = useState([])

  useEffect(() => {
    if (!currentProduct?.category) return

    let cancelled = false

    async function load() {
      try {
        const { data } = await getProducts({ category: currentProduct.category })
        if (cancelled || !data) return

        const filtered = data.filter(
          (p) => p.id !== currentProduct.id && p.status !== 'sold',
        )
        const sorted = sortByPriceProximity(filtered, currentProduct.price)
        setSimilar(sorted.slice(0, MAX_SIMILAR))
      } catch (e) {
        console.warn('Similar products error:', e)
      }
    }

    load()
    return () => { cancelled = true }
  }, [currentProduct?.id, currentProduct?.category, currentProduct?.price])

  if (similar.length === 0) return null

  return (
    <section className="mt-16 pt-12" style={{ borderTop: '1px solid rgba(44, 36, 32, 0.1)' }}>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-8 h-px" style={{ backgroundColor: '#B08D57' }} />
        <h2 className="font-display text-2xl" style={{ color: '#0C0A08' }}>
          Похожие товары
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {similar.map((product, i) => (
          <div
            key={product.id}
            className="animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
