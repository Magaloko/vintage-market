import { Link } from 'react-router-dom'
import { categories, conditions } from '../../data/demoProducts'
import FavoriteButton from './FavoriteButton'
import CompareButton from './CompareButton'

export default function ProductCard({ product, showCompare = false }) {
  const category = categories.find(c => c.id === product.category)
  const imageUrl = product.image_url || product.images?.[0]?.url
  const isSold = product.status === 'sold'
  const isShop = category?.group === 'shops'

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block transition-all duration-500"
      style={{ borderRadius: '2px' }}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: '#E0D4C0', borderRadius: '2px' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-30">{category?.icon || '🏺'}</span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
          style={{ background: 'linear-gradient(to top, rgba(12,10,8,0.4), transparent 60%)' }} />

        {/* Sold badge */}
        {isSold && (
          <div className="absolute top-3 left-3 px-3 py-1 font-body text-[10px] tracking-[0.2em] uppercase"
            style={{ backgroundColor: 'rgba(12, 10, 8, 0.8)', color: '#B08D57', backdropFilter: 'blur(4px)', borderRadius: '1px' }}>
            Продано
          </div>
        )}

        {/* Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">
          <FavoriteButton product={product} size="sm" />
          {showCompare && <CompareButton product={product} size="sm" />}
        </div>

        {/* Category badge */}
        {category && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 font-body text-[10px] tracking-[0.15em] uppercase transition-all duration-300 opacity-0 group-hover:opacity-100"
            style={{ backgroundColor: 'rgba(247, 242, 235, 0.9)', color: '#2C2420', backdropFilter: 'blur(4px)', borderRadius: '1px' }}>
            {category.name}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-4 pb-2">
        <h3 className="font-display text-lg leading-snug transition-colors duration-300"
          style={{ color: '#0C0A08' }}>
          {product.title}
        </h3>

        <div className="flex items-center justify-between mt-2">
          {product.price > 0 ? (
            <span className={`font-body text-sm tracking-wide ${isSold ? 'line-through' : ''}`}
              style={{ color: isSold ? 'rgba(44, 36, 32, 0.3)' : '#B08D57' }}>
              {product.price}&euro;
              {category?.group === 'realestate' && product.details?.rent_or_buy === 'Аренда' && ' / мес.'}
            </span>
          ) : isShop ? (
            <span className="font-body text-xs tracking-wide" style={{ color: 'rgba(176, 141, 87, 0.6)' }}>
              Магазин
            </span>
          ) : null}

          {product.era && (
            <span className="font-body text-[11px]" style={{ color: 'rgba(44, 36, 32, 0.3)' }}>
              {product.era}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
