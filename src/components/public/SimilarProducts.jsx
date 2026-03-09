import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import { getProducts, getProductsByIds } from '../../lib/api'

const MAX_SIMILAR = 4

function computeSimilarityScore(candidate, reference) {
  let score = 0

  // Same category: +10
  if (candidate.category === reference.category) score += 10

  // Same subcategory: +8
  if (candidate.subcategory && candidate.subcategory === reference.subcategory) score += 8

  // Same brand: +5
  if (candidate.brand && candidate.brand === reference.brand) score += 5

  // Shared hashtags: +3 per tag
  if (candidate.hashtags?.length > 0 && reference.hashtags?.length > 0) {
    const refTags = new Set(reference.hashtags)
    for (const tag of candidate.hashtags) {
      if (refTags.has(tag)) score += 3
    }
  }

  // Price proximity (within 30%): +2
  if (candidate.price && reference.price) {
    const diff = Math.abs(candidate.price - reference.price)
    if (diff <= reference.price * 0.3) score += 2
  }

  // Similar era: +1
  if (candidate.era_start && reference.era_start) {
    const cMid = (candidate.era_start + (candidate.era_end || candidate.era_start)) / 2
    const rMid = (reference.era_start + (reference.era_end || reference.era_start)) / 2
    if (Math.abs(cMid - rMid) <= 20) score += 1
  }

  return score
}

export default function SimilarProducts({ currentProduct }) {
  const [similar, setSimilar] = useState([])

  useEffect(() => {
    if (!currentProduct?.category) return

    let cancelled = false

    async function load() {
      try {
        // 1. Load manually linked products first
        let linked = []
        const linkedIds = currentProduct.linked_product_ids || []
        if (linkedIds.length > 0) {
          const { data } = await getProductsByIds(linkedIds)
          if (!cancelled && data) {
            linked = data.filter(p => p.id !== currentProduct.id && p.status !== 'sold')
          }
        }

        // 2. Load category products for scoring
        const { data: categoryProducts } = await getProducts({ category: currentProduct.category })
        if (cancelled || !categoryProducts) return

        const linkedIdSet = new Set(linked.map(p => p.id))
        const candidates = categoryProducts.filter(
          (p) => p.id !== currentProduct.id && p.status !== 'sold' && !linkedIdSet.has(p.id),
        )

        // 3. Score and sort candidates
        const scored = candidates
          .map(p => ({ product: p, score: computeSimilarityScore(p, currentProduct) }))
          .sort((a, b) => b.score - a.score)
          .map(s => s.product)

        // 4. Combine: linked first, then scored, up to MAX_SIMILAR
        const remaining = MAX_SIMILAR - linked.length
        const result = [...linked, ...scored.slice(0, Math.max(0, remaining))]
        setSimilar(result.slice(0, MAX_SIMILAR))
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
