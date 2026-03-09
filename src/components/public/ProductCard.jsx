import { memo, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Star, TrendingUp, Flame, Sparkles } from 'lucide-react'
import { categories, conditions, specialAttributes, formatEra } from '../../data/demoProducts'
import { FINAL_STATUSES } from '../../data/productStatuses'
import { useCurrency } from '../../lib/CurrencyContext'
import { useTheme } from '../../lib/ThemeContext'
import FavoriteButton from './FavoriteButton'
import CompareButton from './CompareButton'

const LIGHT = {
  cardBg: '#F7F2EB',
  text: '#0C0A08',
  textFaded: 'rgba(44, 36, 32, 0.55)',
  textDim: 'rgba(44, 36, 32, 0.3)',
  gold: '#B08D57',
  goldFaded: 'rgba(176, 141, 87, 0.6)',
  imageBg: '#E0D4C0',
  border: 'rgba(176, 141, 87, 0.18)',
  borderHover: 'rgba(176, 141, 87, 0.45)',
  shadow: '0 2px 12px rgba(44, 36, 32, 0.06)',
  shadowHover: '0 4px 20px rgba(176, 141, 87, 0.12), 0 2px 8px rgba(44, 36, 32, 0.06)',
  dividerBg: '#F7F2EB',
  dividerLine: 'rgba(176, 141, 87, 0.25)',
  dividerDiamond: 'rgba(176, 141, 87, 0.45)',
  separator: 'rgba(176, 141, 87, 0.12)',
  separatorDashed: 'rgba(176, 141, 87, 0.2)',
  materialBg: 'rgba(176, 141, 87, 0.06)',
  materialText: 'rgba(176, 141, 87, 0.7)',
  badgeBg: 'rgba(12, 10, 8, 0.8)',
  categoryBg: 'rgba(247, 242, 235, 0.9)',
  categoryText: '#2C2420',
  hoverGradient: 'linear-gradient(to top, rgba(12,10,8,0.5), transparent 60%)',
  cornerGold: 'rgba(176, 141, 87, 0.55)',
}

const DARK = {
  cardBg: '#1A1410',
  text: '#F0E6D6',
  textFaded: 'rgba(240, 230, 214, 0.55)',
  textDim: 'rgba(240, 230, 214, 0.3)',
  gold: '#C9A96E',
  goldFaded: 'rgba(201, 169, 110, 0.6)',
  imageBg: '#2C2420',
  border: 'rgba(176, 141, 87, 0.15)',
  borderHover: 'rgba(176, 141, 87, 0.4)',
  shadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
  shadowHover: '0 4px 20px rgba(176, 141, 87, 0.15), 0 2px 8px rgba(0, 0, 0, 0.3)',
  dividerBg: '#1A1410',
  dividerLine: 'rgba(176, 141, 87, 0.2)',
  dividerDiamond: 'rgba(176, 141, 87, 0.35)',
  separator: 'rgba(176, 141, 87, 0.1)',
  separatorDashed: 'rgba(176, 141, 87, 0.15)',
  materialBg: 'rgba(176, 141, 87, 0.08)',
  materialText: 'rgba(201, 169, 110, 0.6)',
  badgeBg: 'rgba(12, 10, 8, 0.85)',
  categoryBg: 'rgba(26, 20, 16, 0.9)',
  categoryText: '#F0E6D6',
  hoverGradient: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)',
  cornerGold: 'rgba(176, 141, 87, 0.35)',
}

const CONDITION_STYLES = {
  new:               { color: '#7A8B6F', label: 'Новое' },
  excellent:         { color: '#B08D57', label: 'Отличное' },
  good:              { color: '#C9956B', label: 'Хорошее' },
  vintage_character: { color: '#B5736A', label: 'Винтаж' },
}

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

function getKeyDetail(product) {
  if (product.category === 'jewelry') {
    const mat = product.details?.material
    const hall = product.details?.hallmark
    if (mat && hall) return `${mat} ${hall}`
    return mat || null
  }
  if (product.category === 'ceramics') {
    return product.details?.manufacturer || product.details?.material || null
  }
  return null
}

function getMaterialTag(product) {
  const material = product.details?.material
  const origin = product.details?.manufacturer || product.details?.origin
  if (material && origin) return `${material} · ${origin}`
  return material || origin || null
}

function GoldDivider({ c }) {
  return (
    <div className="flex items-center" style={{ padding: '5px 12px', backgroundColor: c.dividerBg }}>
      <div className="flex-1 h-px" style={{ backgroundColor: c.dividerLine }} />
      <span className="mx-2" style={{ fontSize: '7px', color: c.dividerDiamond, lineHeight: 1 }}>◆</span>
      <div className="flex-1 h-px" style={{ backgroundColor: c.dividerLine }} />
    </div>
  )
}

const CORNER_STYLE = { position: 'absolute', width: 14, height: 14, pointerEvents: 'none', zIndex: 20 }

function GoldCorners({ gold }) {
  return (
    <>
      <div style={{ ...CORNER_STYLE, top: 0, left: 0, borderTop: `1.5px solid ${gold}`, borderLeft: `1.5px solid ${gold}` }} />
      <div style={{ ...CORNER_STYLE, top: 0, right: 0, borderTop: `1.5px solid ${gold}`, borderRight: `1.5px solid ${gold}` }} />
      <div style={{ ...CORNER_STYLE, bottom: 0, left: 0, borderBottom: `1.5px solid ${gold}`, borderLeft: `1.5px solid ${gold}` }} />
      <div style={{ ...CORNER_STYLE, bottom: 0, right: 0, borderBottom: `1.5px solid ${gold}`, borderRight: `1.5px solid ${gold}` }} />
    </>
  )
}

function ProductCard({ product, showCompare = false, isBestseller = false, isPopular = false }) {
  const [imgError, setImgError] = useState(false)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const { formatPrice } = useCurrency()
  const { isDark } = useTheme()
  const c = isDark ? DARK : LIGHT

  const category = categories.find((cat) => cat.id === product.category)
  const allImages = product.images?.length > 0
    ? product.images.map(img => img.url || img)
    : (product.image_url ? [product.image_url] : [])
  const imageUrl = allImages[activeImageIdx] || allImages[0]
  const imageCount = allImages.length
  const isSold = FINAL_STATUSES.includes(product.status)
  const isReserved = product.status === 'reserved'
  const isShop = category?.group === 'shops'
  const isRental = category?.group === 'realestate' && product.details?.rent_or_buy === 'Аренда'
  const isNew = !isSold && product.created_at && (Date.now() - new Date(product.created_at).getTime()) < SEVEN_DAYS
  const keyDetail = getKeyDetail(product)
  const conditionStyle = CONDITION_STYLES[product.condition]

  // Image cycling on hover
  useEffect(() => {
    if (!isHovered || imageCount <= 1) return
    const interval = setInterval(() => {
      setActiveImageIdx(prev => (prev + 1) % imageCount)
    }, 2000)
    return () => clearInterval(interval)
  }, [isHovered, imageCount])

  const handleMouseEnter = useCallback((e) => {
    setIsHovered(true)
    e.currentTarget.style.borderColor = c.borderHover
    e.currentTarget.style.boxShadow = c.shadowHover
  }, [c])

  const handleMouseLeave = useCallback((e) => {
    setIsHovered(false)
    setActiveImageIdx(0)
    e.currentTarget.style.borderColor = c.border
    e.currentTarget.style.boxShadow = c.shadow
  }, [c])

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block relative h-full flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        border: `1px solid ${c.border}`,
        borderRadius: '2px',
        backgroundColor: c.cardBg,
        boxShadow: c.shadow,
        transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
      }}
    >
      <GoldCorners gold={c.cornerGold} />

      <div
        className="relative aspect-[4/5] overflow-hidden"
        style={{ backgroundColor: c.imageBg, margin: '4px 4px 0 4px', borderRadius: '1px' }}
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
          style={{ background: c.hoverGradient }}
        />

        {/* Brand ribbon */}
        {product.brand && !isSold && <BrandRibbon brand={product.brand} />}

        {/* Special attribute badges */}
        {product.special_attributes?.length > 0 && !isSold && (
          <SpecialBadges attrs={product.special_attributes} />
        )}

        {isSold ? <SoldBadge /> : isReserved ? <ReservedBadge /> : isNew && <NewBadge />}

        <ProductBadges isPromoted={product.is_promoted} isBestseller={isBestseller} isPopular={isPopular} />

        <div className="absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
          style={{ top: (product.is_promoted || isBestseller || isPopular) ? '2.75rem' : '0.75rem' }}
        >
          <FavoriteButton product={product} size="sm" />
          {showCompare && <CompareButton product={product} size="sm" />}
        </div>

        {keyDetail ? <KeyDetailTag text={keyDetail} /> : category && <CategoryBadge name={category.name} c={c} />}

        {/* Hashtag badges (max 2) */}
        {product.hashtags?.length > 0 && !isSold && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10" style={{ maxWidth: '70%' }}>
            {product.hashtags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 font-body text-[8px] tracking-wide"
                style={{
                  backgroundColor: 'rgba(176, 141, 87, 0.85)',
                  color: '#0C0A08',
                  borderRadius: '1px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Quantity badge */}
        {product.quantity > 1 && !isSold && (
          <div
            className="absolute bottom-3 right-3 px-1.5 py-0.5 font-body text-[9px] tracking-wider z-10"
            style={{
              backgroundColor: 'rgba(12, 10, 8, 0.75)',
              color: '#C9A96E',
              backdropFilter: 'blur(4px)',
              borderRadius: '1px',
            }}
          >
            {product.quantity} шт.
          </div>
        )}

        {imageCount > 1 && <ImageCountIndicator count={imageCount} activeIdx={activeImageIdx} />}

        <HoverSpecs product={product} />
      </div>

      <GoldDivider c={c} />

      <div className="px-3 pb-3 flex-1 flex flex-col" style={{ backgroundColor: c.cardBg }}>
        <h3
          className="font-display text-lg leading-snug italic"
          style={{ color: c.text }}
        >
          {product.title}
        </h3>

        {product.description && (
          <p
            className="font-body text-[11px] leading-relaxed mt-1"
            style={{
              color: c.textFaded,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.description}
          </p>
        )}

        <div className="w-full h-px my-2" style={{ backgroundColor: c.separator }} />

        {getMaterialTag(product) && (
          <div className="mb-1.5">
            <span
              className="font-body text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 inline-block"
              style={{
                backgroundColor: c.materialBg,
                color: c.materialText,
                borderRadius: '1px',
              }}
            >
              {getMaterialTag(product)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          {conditionStyle && (
            <ConditionDot color={conditionStyle.color} label={conditionStyle.label} />
          )}
          {product.avgRating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={10} fill={c.gold} stroke="none" />
              <span className="font-body text-[10px]" style={{ color: c.goldFaded }}>
                {product.avgRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1" />
        <div className="flex items-center justify-between mt-2 pt-2"
          style={{ borderTop: `1px dashed ${c.separatorDashed}` }}
        >
          <ProductPrice
            price={product.price}
            isSold={isSold}
            isShop={isShop}
            isRental={isRental}
            formatPrice={formatPrice}
            c={c}
          />
          {formatEra(product.era_start, product.era_end) && (
            <span className="font-body text-[11px]" style={{ color: c.textDim }}>
              {formatEra(product.era_start, product.era_end)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

/* ── Image ──────────────────────────────────────────────────── */

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

/* ── Badges (top-left) ──────────────────────────────────────── */

function SoldBadge() {
  return (
    <div
      className="absolute top-3 left-3 px-3 py-1 font-body text-[10px] tracking-[0.2em] uppercase z-10"
      style={{
        backgroundColor: 'rgba(12, 10, 8, 0.8)',
        color: '#B08D57',
        backdropFilter: 'blur(4px)',
        borderRadius: '1px',
      }}
    >
      Продано
    </div>
  )
}

function ReservedBadge() {
  return (
    <div
      className="absolute top-3 left-3 px-3 py-1 font-body text-[10px] tracking-[0.2em] uppercase z-10"
      style={{
        backgroundColor: 'rgba(155, 124, 184, 0.85)',
        color: '#fff',
        backdropFilter: 'blur(4px)',
        borderRadius: '1px',
      }}
    >
      Забронировано
    </div>
  )
}

function NewBadge() {
  return (
    <div
      className="absolute top-3 left-3 px-3 py-1 font-body text-[10px] tracking-[0.2em] uppercase z-10"
      style={{
        background: 'linear-gradient(135deg, rgba(176, 141, 87, 0.85), rgba(201, 169, 110, 0.85))',
        color: '#0C0A08',
        backdropFilter: 'blur(4px)',
        borderRadius: '1px',
      }}
    >
      Новинка
    </div>
  )
}

/* ── Badges (top-right) ─────────────────────────────────────── */

function ProductBadges({ isPromoted, isBestseller, isPopular }) {
  const badges = []
  if (isPromoted) badges.push('promoted')
  if (isBestseller && badges.length < 2) badges.push('bestseller')
  if (isPopular && !isBestseller && badges.length < 2) badges.push('popular')
  if (badges.length === 0) return null

  return (
    <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
      {badges.map((type) => {
        if (type === 'promoted') return <PromotedBadge key={type} />
        if (type === 'bestseller') return <BestsellerBadge key={type} />
        return <PopularBadge key={type} />
      })}
    </div>
  )
}

function PromotedBadge() {
  return (
    <div
      className="px-2 py-1 font-body text-[9px] tracking-[0.15em] uppercase flex items-center gap-1"
      style={{
        background: 'linear-gradient(135deg, #B08D57, #C9A96E)',
        color: '#0C0A08',
        borderRadius: '1px',
        boxShadow: '0 2px 8px rgba(176, 141, 87, 0.3)',
      }}
    >
      <Star size={8} fill="#0C0A08" />
      Реклама
    </div>
  )
}

function BestsellerBadge() {
  return (
    <div
      className="px-2 py-1 font-body text-[9px] tracking-[0.15em] uppercase flex items-center gap-1"
      style={{
        backgroundColor: 'rgba(12, 10, 8, 0.85)',
        color: '#C9A96E',
        backdropFilter: 'blur(4px)',
        borderRadius: '1px',
        border: '1px solid rgba(176, 141, 87, 0.3)',
      }}
    >
      <Flame size={8} />
      Bestseller
    </div>
  )
}

function PopularBadge() {
  return (
    <div
      className="px-2 py-1 font-body text-[9px] tracking-[0.15em] uppercase flex items-center gap-1"
      style={{
        backgroundColor: 'rgba(12, 10, 8, 0.7)',
        color: 'rgba(240, 230, 214, 0.7)',
        backdropFilter: 'blur(4px)',
        borderRadius: '1px',
      }}
    >
      <TrendingUp size={8} />
      Популярное
    </div>
  )
}

/* ── Bottom-of-image elements ───────────────────────────────── */

function CategoryBadge({ name, c }) {
  return (
    <div
      className="absolute bottom-3 left-3 px-2.5 py-1 font-body text-[10px] tracking-[0.15em] uppercase transition-all duration-300 opacity-0 group-hover:opacity-100"
      style={{
        backgroundColor: c.categoryBg,
        color: c.categoryText,
        backdropFilter: 'blur(4px)',
        borderRadius: '1px',
      }}
    >
      {name}
    </div>
  )
}

function KeyDetailTag({ text }) {
  return (
    <div
      className="absolute bottom-3 left-3 px-2.5 py-1 font-body text-[10px] tracking-[0.15em] uppercase z-10"
      style={{
        backgroundColor: 'rgba(12, 10, 8, 0.75)',
        color: '#C9A96E',
        backdropFilter: 'blur(4px)',
        borderRadius: '1px',
      }}
    >
      {text}
    </div>
  )
}

function ImageCountIndicator({ count, activeIdx = 0 }) {
  const dots = Math.min(count, 5)
  return (
    <div className="absolute bottom-3 right-3 flex items-center gap-1 z-10">
      {Array.from({ length: dots }, (_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === activeIdx % dots ? 6 : 4,
            height: i === activeIdx % dots ? 6 : 4,
            backgroundColor: i === activeIdx % dots ? 'rgba(176, 141, 87, 0.9)' : 'rgba(176, 141, 87, 0.35)',
          }}
        />
      ))}
      {count > 5 && (
        <span className="font-body text-[8px]" style={{ color: 'rgba(176, 141, 87, 0.5)' }}>
          +{count - 5}
        </span>
      )}
    </div>
  )
}

/* ── Brand ribbon (diagonal) ────────────────────────────────── */

function BrandRibbon({ brand }) {
  if (!brand) return null
  const displayBrand = brand.length > 14 ? brand.slice(0, 12) + '…' : brand
  return (
    <div
      className="absolute top-0 left-0 z-10 overflow-hidden"
      style={{ width: '110px', height: '110px', pointerEvents: 'none' }}
    >
      <div
        className="absolute font-body text-center"
        style={{
          width: '160px',
          top: '18px',
          left: '-38px',
          transform: 'rotate(-45deg)',
          backgroundColor: 'rgba(12, 10, 8, 0.82)',
          backdropFilter: 'blur(4px)',
          color: '#C9A96E',
          fontSize: '8px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '3px 0',
          borderTop: '1px solid rgba(176, 141, 87, 0.3)',
          borderBottom: '1px solid rgba(176, 141, 87, 0.3)',
        }}
      >
        {displayBrand}
      </div>
    </div>
  )
}

/* ── Special attribute badges ──────────────────────────────── */

function SpecialBadges({ attrs }) {
  if (!attrs || attrs.length === 0) return null

  const badges = attrs
    .map(id => specialAttributes.find(a => a.id === id))
    .filter(Boolean)
    .slice(0, 2)

  if (badges.length === 0) return null

  return (
    <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
      {badges.map((attr) => (
        <div
          key={attr.id}
          className="px-1.5 py-0.5 font-body text-[8px] tracking-[0.1em] uppercase flex items-center gap-1"
          style={{
            backgroundColor: 'rgba(12, 10, 8, 0.8)',
            backdropFilter: 'blur(4px)',
            color: attr.color,
            borderRadius: '1px',
            border: `1px solid ${attr.color}30`,
          }}
        >
          <span style={{ fontSize: '9px' }}>{attr.icon}</span>
          {attr.label.length > 16 ? attr.label.slice(0, 14) + '…' : attr.label}
        </div>
      ))}
    </div>
  )
}

/* ── Hover specs overlay ────────────────────────────────────── */

function HoverSpecs({ product }) {
  const specs = []

  if (product.category === 'jewelry') {
    if (product.details?.material) specs.push(product.details.material)
    if (product.details?.stones) specs.push(product.details.stones)
    if (product.details?.weight_grams) specs.push(`${product.details.weight_grams} г`)
  } else if (product.category === 'ceramics') {
    if (product.details?.material) specs.push(product.details.material)
    if (product.details?.manufacturer) specs.push(product.details.manufacturer)
    if (product.details?.set_pieces) specs.push(`${product.details.set_pieces} пр.`)
  }

  if (specs.length === 0) return null

  return (
    <div
      className="absolute bottom-0 left-0 right-0 px-3 py-2.5 flex items-center gap-2 transition-all duration-500 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 z-10"
      style={{ background: 'linear-gradient(to top, rgba(12,10,8,0.7), transparent)' }}
    >
      <Sparkles size={10} style={{ color: 'rgba(201, 169, 110, 0.7)', flexShrink: 0 }} />
      {specs.map((spec, i) => (
        <span key={i} className="font-body text-[10px] tracking-wide" style={{ color: 'rgba(240, 230, 214, 0.8)' }}>
          {spec}{i < specs.length - 1 && <span style={{ color: 'rgba(176, 141, 87, 0.4)', margin: '0 2px' }}> · </span>}
        </span>
      ))}
    </div>
  )
}

/* ── Text area sub-components ───────────────────────────────── */

function ConditionDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-body text-[10px] tracking-wide" style={{ color }}>{label}</span>
    </div>
  )
}

function ProductPrice({ price, isSold, isShop, isRental, formatPrice, c }) {
  if (price > 0) {
    return (
      <span
        className={`font-body text-sm tracking-wide ${isSold ? 'line-through' : ''}`}
        style={{ color: isSold ? c.textDim : c.gold }}
      >
        {formatPrice ? formatPrice(price) : `${price}€`}{isRental && ' / мес.'}
      </span>
    )
  }

  if (isShop) {
    return (
      <span className="font-body text-xs tracking-wide" style={{ color: c.goldFaded }}>
        Магазин
      </span>
    )
  }

  return null
}

export default memo(ProductCard)
