import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../../data/demoProducts'
import FavoriteButton from './FavoriteButton'
import CompareButton from './CompareButton'

const COLORS = {
  dark: '#0C0A08',
  gold: '#B08D57',
  goldFaded: 'rgba(176, 141, 87, 0.6)',
  brown: '#2C2420',
  brownFaded: 'rgba(44, 36, 32, 0.3)',
  imageBg: '#E0D4C0',
  badgeBg: 'rgba(12, 10, 8, 0.8)',
  categoryBg: 'rgba(247, 242, 235, 0.9)',
  hoverGradient: 'linear-gradient(to top, rgba(12,10,8,0.4), transparent 60%)',
}

function ProductCard({ product, showCompare = false }) {
  const [imgError, setImgError] = useState(false)

  const category = categories.find((c) => c.id === product.category)
  const imageUrl = product.image_url || product.images?.[0]?.url
  const isSold = product.status === 'sold'
  const isShop = category?.group === 'shops'
  const isRental = category?.group === 'realestate' && product.details?.rent_or_buy === 'Аренда'

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block transition-all duration-500"
      style={{ borderRadius: '2px' }}
    >
      <div
        className="relative aspect-[4/5] overflow-hidden"
        style={{ backgroundColor: COLORS.imageBg, borderRadius: '2px' }}
      >
        <ProductImage
          url={imageUrl}
          alt={product.title}
          icon={category?.icon}
          hasError={imgError}
          onError={() => setImgError(true)}
        />

        <div
          className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
          style={{ background: COLORS.hoverGradient }}
        />

        {isSold && <SoldBadge />}

        <div className="absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">
          <FavoriteButton product={product} size="sm" />
          {showCompare && <CompareButton product={product} size="sm" />}
        </div>

        {category && <CategoryBadge name={category.name} />}
      </div>

      <div className="pt-4 pb-2">
        <h3
          className="font-display text-lg leading-snug transition-colors duration-300"
          style={{ color: COLORS.dark }}
        >
          {product.title}
        </h3>

        <div className="flex items-center justify-between mt-2">
          <ProductPrice
            price={product.price}
            isSold={isSold}
            isShop={isShop}
            isRental={isRental}
          />
          {product.era && (
            <span className="font-body text-[11px]" style={{ color: COLORS.brownFaded }}>
              {product.era}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function ProductImage({ url, alt, icon, hasError, onError }) {
  if (url && !hasError) {
    return (
      <img
        src={url}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
        onError={onError}
      />
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <span className="text-4xl opacity-30">{icon || '\uD83C\uDFFA'}</span>
    </div>
  )
}

function SoldBadge() {
  return (
    <div
      className="absolute top-3 left-3 px-3 py-1 font-body text-[10px] tracking-[0.2em] uppercase"
      style={{
        backgroundColor: COLORS.badgeBg,
        color: COLORS.gold,
        backdropFilter: 'blur(4px)',
        borderRadius: '1px',
      }}
    >
      Продано
    </div>
  )
}

function CategoryBadge({ name }) {
  return (
    <div
      className="absolute bottom-3 left-3 px-2.5 py-1 font-body text-[10px] tracking-[0.15em] uppercase transition-all duration-300 opacity-0 group-hover:opacity-100"
      style={{
        backgroundColor: COLORS.categoryBg,
        color: COLORS.brown,
        backdropFilter: 'blur(4px)',
        borderRadius: '1px',
      }}
    >
      {name}
    </div>
  )
}

function ProductPrice({ price, isSold, isShop, isRental }) {
  if (price > 0) {
    return (
      <span
        className={`font-body text-sm tracking-wide ${isSold ? 'line-through' : ''}`}
        style={{ color: isSold ? COLORS.brownFaded : COLORS.gold }}
      >
        {price}&euro;{isRental && ' / мес.'}
      </span>
    )
  }

  if (isShop) {
    return (
      <span className="font-body text-xs tracking-wide" style={{ color: COLORS.goldFaded }}>
        Магазин
      </span>
    )
  }

  return null
}

export default memo(ProductCard)
