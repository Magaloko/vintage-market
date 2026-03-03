import { Link } from 'react-router-dom'
import { Images } from 'lucide-react'
import FavoriteButton from './FavoriteButton'
import CompareButton from './CompareButton'

export default function ProductCard({ product, showFavorite = true, showCompare = false }) {
  const imageCount = product.images?.length || (product.image_url ? 1 : 0)
  const mainImage = product.images?.[0]?.url || product.image_url

  return (
    <div className="vintage-card group relative">
      {/* Action buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {showFavorite && <FavoriteButton product={product} size="sm" />}
        {showCompare && <CompareButton product={product} size="sm" />}
      </div>

      {/* Image badge: multi-image count */}
      {imageCount > 1 && (
        <div className="absolute bottom-[calc(40%+8px)] left-3 z-10 flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded-full">
          <Images size={12} />
          <span className="font-sans text-[10px]">{imageCount}</span>
        </div>
      )}

      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden">
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {product.status === 'sold' && (
            <div className="absolute inset-0 bg-vintage-dark/60 flex items-center justify-center">
              <span className="font-sans text-sm tracking-[0.3em] uppercase text-vintage-cream/80">
                {'\u041f\u0440\u043e\u0434\u0430\u043d\u043e'}
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="font-display text-lg text-vintage-dark group-hover:text-vintage-brown transition-colors leading-tight">
            {product.title}
          </h3>
          <div className="flex items-center justify-between mt-3">
            <span className="font-sans text-lg font-semibold text-vintage-dark">
              {product.price}{'\u20ac'}
            </span>
            {product.era && (
              <span className="font-sans text-xs text-vintage-brown/40">{product.era}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
