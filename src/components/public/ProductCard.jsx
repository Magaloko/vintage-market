import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { conditions } from '../../data/demoProducts'

export default function ProductCard({ product }) {
  const conditionLabel = conditions.find(c => c.id === product.condition)?.name || product.condition

  return (
    <Link
      to={`/product/${product.id}`}
      className="group vintage-card block overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-vintage-beige">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {product.status === 'sold' && (
          <div className="absolute inset-0 bg-vintage-dark/60 flex items-center justify-center">
            <span className="font-sans text-sm tracking-[0.3em] uppercase text-vintage-cream">
              Продано
            </span>
          </div>
        )}
        {product.era && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-vintage-dark/80 text-vintage-cream font-sans text-xs tracking-wider">
            {product.era}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display text-lg font-semibold text-vintage-dark leading-snug group-hover:text-vintage-brown transition-colors">
            {product.title}
          </h3>
        </div>

        {product.brand && (
          <p className="font-sans text-xs tracking-wider text-vintage-brown/50 uppercase mb-3">
            {product.brand}
          </p>
        )}

        <div className="flex items-end justify-between">
          <span className="font-display text-xl font-bold text-vintage-dark">
            {product.price}€
          </span>
          <div className="flex items-center gap-3 text-vintage-brown/40">
            <span className="font-sans text-xs">{conditionLabel}</span>
            {product.views > 0 && (
              <span className="flex items-center gap-1 font-sans text-xs">
                <Eye size={12} />
                {product.views}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
