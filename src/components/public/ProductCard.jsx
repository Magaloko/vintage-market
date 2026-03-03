import { Link } from 'react-router-dom'
import { Images } from 'lucide-react'
import FavoriteButton from './FavoriteButton'
import CompareButton from './CompareButton'

export default function ProductCard({ product, showFavorite = true, showCompare = false }) {
  const imageCount = product.images?.length || (product.image_url ? 1 : 0)
  const mainImage = product.images?.[0]?.url || product.image_url

  return (
    <div className="vintage-card group relative overflow-hidden">
      {/* Action buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {showFavorite && <FavoriteButton product={product} size="sm" />}
        {showCompare && <CompareButton product={product} size="sm" />}
      </div>

      {/* Image badge: multi-image count */}
      {imageCount > 1 && (
        <div className="absolute bottom-[calc(40%+8px)] left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(14, 26, 43, 0.6)', color: '#F2EDE3' }}>
          <Images size={12} />
          <span className="font-sans text-[10px]">{imageCount}</span>
        </div>
      )}

      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden relative">
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {/* Hover darker overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ backgroundColor: 'rgba(14, 26, 43, 0.08)' }} />

          {product.status === 'sold' && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(14, 26, 43, 0.65)' }}>
              <span className="font-sans text-sm tracking-[0.3em] uppercase"
                style={{ color: 'rgba(242, 237, 227, 0.8)' }}>
                Продано
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          {/* Category label in olive */}
          {product.category && (
            <span className="font-sans text-[10px] tracking-[0.2em] uppercase"
              style={{ color: '#5A6B3C' }}>
              {product.category}
            </span>
          )}
          <h3 className="font-display text-lg leading-tight mt-1 transition-colors duration-200"
            style={{ color: '#0E1A2B' }}>
            {product.title}
          </h3>
          <div className="flex items-center justify-between mt-3">
            <span className="font-sans text-lg font-semibold" style={{ color: '#0E1A2B' }}>
              {product.price}&euro;
            </span>
            {product.era && (
              <span className="font-sans text-xs" style={{ color: 'rgba(91, 58, 41, 0.4)' }}>
                {product.era}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
