import { Link } from 'react-router-dom'
import { Eye, Images } from 'lucide-react'
import { conditions } from '../../data/demoProducts'
import FavoriteButton from './FavoriteButton'

export default function ProductCard({ product, showFavorite = true }) {
  const conditionLabel = conditions.find(c => c.id === product.condition)?.name || ''
  const imageCount = product.images?.length || 1

  return (
    <div className="group relative">
      <Link to={`/product/${product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-vintage-beige/20">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Sold overlay */}
          {product.status === 'sold' && (
            <div className="absolute inset-0 bg-vintage-dark/40 flex items-center justify-center">
              <span className="font-sans text-sm tracking-[0.3em] uppercase text-vintage-cream">
                Продано
              </span>
            </div>
          )}

          {/* Image count badge */}
          {imageCount > 1 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1
              bg-black/40 backdrop-blur-sm rounded-full">
              <Images size={12} className="text-white" />
              <span className="font-sans text-[10px] text-white">{imageCount}</span>
            </div>
          )}

          {/* Views */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1
            bg-black/40 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye size={12} className="text-white" />
            <span className="font-sans text-[10px] text-white">{product.views || 0}</span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-vintage-dark leading-snug
              group-hover:text-vintage-brown transition-colors line-clamp-2">
              {product.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {conditionLabel && (
              <span className="font-sans text-[10px] tracking-wider uppercase text-vintage-brown/40">
                {conditionLabel}
              </span>
            )}
            {product.era && (
              <>
                <span className="text-vintage-brown/20">·</span>
                <span className="font-sans text-[10px] tracking-wider uppercase text-vintage-brown/40">
                  {product.era}
                </span>
              </>
            )}
          </div>

          <p className="font-display text-lg font-bold text-vintage-dark">
            {product.price}€
          </p>
        </div>
      </Link>

      {/* Favorite Button — positioned over the card */}
      {showFavorite && (
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100
          transition-opacity duration-200"
          style={{ opacity: undefined }} // Allow override by hover
        >
          <FavoriteButton productId={product.id} size="sm" />
        </div>
      )}
    </div>
  )
}
