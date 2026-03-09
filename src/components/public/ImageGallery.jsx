import { useState, useCallback, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

const OVERLAY_BG = 'rgba(14, 26, 43, 0.4)'
const COUNTER_BG = 'rgba(14, 26, 43, 0.6)'
const EMPTY_BG = 'rgba(44, 36, 32, 0.06)'
const GALLERY_BG = 'rgba(242, 237, 227, 0.3)'

function getImageSrc(img) {
  return img?.url || img
}

function getImageAlt(img, fallback) {
  return img?.alt_text || fallback
}

export default function ImageGallery({ images = [], title = '' }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const goTo = useCallback(
    (idx) => setActiveIndex(Math.max(0, Math.min(idx, images.length - 1))),
    [images.length],
  )
  const goPrev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex])
  const goNext = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex])

  if (!images.length) {
    return (
      <div className="aspect-square flex items-center justify-center" style={{ backgroundColor: EMPTY_BG }}>
        <span className="font-sans text-sm" style={{ color: 'rgba(44, 36, 32, 0.3)' }}>
          Нет изображений
        </span>
      </div>
    )
  }

  const current = images[activeIndex] || images[0]
  const hasMultiple = images.length > 1
  const isFirst = activeIndex === 0
  const isLast = activeIndex === images.length - 1

  return (
    <div>
      {/* Main image */}
      <div className="relative group">
        <MainImage
          src={getImageSrc(current)}
          alt={getImageAlt(current, `${title} — фото ${activeIndex + 1}`)}
          onZoom={() => setLightboxOpen(true)}
        />

        {hasMultiple && (
          <>
            <NavButton direction="prev" onClick={goPrev} disabled={isFirst} />
            <NavButton direction="next" onClick={goNext} disabled={isLast} />
            <ImageCounter current={activeIndex + 1} total={images.length} />
          </>
        )}
      </div>

      {/* Thumbnail slider below main image */}
      {hasMultiple && (
        <ThumbnailSlider
          images={images}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
          title={title}
        />
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          activeIndex={activeIndex}
          title={title}
          onClose={() => setLightboxOpen(false)}
          onPrev={goPrev}
          onNext={goNext}
          onSelect={setActiveIndex}
          isFirst={isFirst}
          isLast={isLast}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Thumbnail Slider                                                    */
/* ------------------------------------------------------------------ */

function ThumbnailSlider({ images, activeIndex, onSelect, title }) {
  const sliderRef = useRef(null)

  useEffect(() => {
    const container = sliderRef.current
    if (!container) return
    const el = container.children[activeIndex]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [activeIndex])

  return (
    <div
      ref={sliderRef}
      className="thumbnail-slider flex gap-2 mt-3 pb-2 overflow-x-auto"
      style={{
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {images.map((img, idx) => {
        const isActive = idx === activeIndex
        return (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className="flex-shrink-0 overflow-hidden rounded transition-all duration-200"
            style={{
              scrollSnapAlign: 'center',
              width: '72px',
              height: '72px',
              border: isActive ? '2px solid #B08D57' : '2px solid transparent',
              opacity: isActive ? 1 : 0.55,
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.opacity = '0.8' }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.opacity = '0.55' }}
          >
            <img
              src={getImageSrc(img)}
              alt={getImageAlt(img, `${title} — миниатюра ${idx + 1}`)}
              className="w-full h-full object-cover"
            />
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Image                                                          */
/* ------------------------------------------------------------------ */

function MainImage({ src, alt, onZoom }) {
  return (
    <div className="relative cursor-zoom-in" onClick={onZoom}>
      {/* Outer vintage frame */}
      <div
        className="relative p-[6px] md:p-2"
        style={{
          background: 'linear-gradient(135deg, #C9A96E 0%, #8A6D3B 25%, #B08D57 50%, #8A6D3B 75%, #C9A96E 100%)',
          boxShadow: '0 4px 24px rgba(12, 10, 8, 0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
      >
        {/* Inner border line */}
        <div
          className="relative p-[3px] md:p-1"
          style={{
            border: '1px solid rgba(201, 169, 110, 0.4)',
            backgroundColor: 'rgba(12, 10, 8, 0.08)',
          }}
        >
          {/* Image container */}
          <div
            className="aspect-[4/5] overflow-hidden relative"
            style={{ backgroundColor: GALLERY_BG }}
          >
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />

            {/* Vintage vignette overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 60px rgba(12, 10, 8, 0.12), inset 0 0 120px rgba(12, 10, 8, 0.06)',
              }}
            />

            {/* Zoom icon */}
            <div
              className="absolute top-4 right-4 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ backgroundColor: OVERLAY_BG, backdropFilter: 'blur(4px)' }}
            >
              <ZoomIn size={16} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Corner ornaments */}
      <FrameCorner position="top-left" />
      <FrameCorner position="top-right" />
      <FrameCorner position="bottom-left" />
      <FrameCorner position="bottom-right" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Frame Corner Ornaments                                              */
/* ------------------------------------------------------------------ */

function FrameCorner({ position }) {
  const posMap = {
    'top-left': { top: '-2px', left: '-2px' },
    'top-right': { top: '-2px', right: '-2px' },
    'bottom-left': { bottom: '-2px', left: '-2px' },
    'bottom-right': { bottom: '-2px', right: '-2px' },
  }

  const rotMap = {
    'top-left': '0deg',
    'top-right': '90deg',
    'bottom-left': '-90deg',
    'bottom-right': '180deg',
  }

  return (
    <div
      className="absolute w-5 h-5 pointer-events-none"
      style={{ ...posMap[position] }}
    >
      <svg
        viewBox="0 0 20 20"
        className="w-full h-full"
        style={{ transform: `rotate(${rotMap[position]})`, opacity: 0.5 }}
      >
        <path
          d="M0 0 L8 0 L6 2 L2 2 L2 6 L0 8 Z"
          fill="#B08D57"
        />
        <path
          d="M0 0 L4 0 L3 1 L1 1 L1 3 L0 4 Z"
          fill="#C9A96E"
        />
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Navigation                                                          */
/* ------------------------------------------------------------------ */

function NavButton({ direction, onClick, disabled }) {
  const isLeft = direction === 'prev'

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      disabled={disabled}
      className={`absolute ${isLeft ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white disabled:opacity-0`}
    >
      {isLeft
        ? <ChevronLeft size={18} style={{ color: '#0C0A08' }} />
        : <ChevronRight size={18} style={{ color: '#0C0A08' }} />
      }
    </button>
  )
}

function ImageCounter({ current, total }) {
  return (
    <div
      className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 backdrop-blur-sm rounded-full font-sans text-xs text-white"
      style={{ backgroundColor: COUNTER_BG }}
    >
      {current} / {total}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Lightbox                                                            */
/* ------------------------------------------------------------------ */

function Lightbox({ images, activeIndex, title, onClose, onPrev, onNext, onSelect, isFirst, isLast }) {
  const current = images[activeIndex] || images[0]
  const hasMultiple = images.length > 1

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 text-white/70 hover:text-white transition-colors z-10"
      >
        <X size={24} />
      </button>

      {hasMultiple && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 font-sans text-sm text-white/60">
          {activeIndex + 1} / {images.length}
        </div>
      )}

      <img
        src={getImageSrc(current)}
        alt={getImageAlt(current, title)}
        className="max-w-[90vw] max-h-[85vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {hasMultiple && (
        <>
          <LightboxNavButton direction="prev" onClick={onPrev} disabled={isFirst} />
          <LightboxNavButton direction="next" onClick={onNext} disabled={isLast} />
          <LightboxThumbnails
            images={images}
            activeIndex={activeIndex}
            onSelect={onSelect}
          />
        </>
      )}
    </div>
  )
}

function LightboxNavButton({ direction, onClick, disabled }) {
  const isLeft = direction === 'prev'

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      disabled={disabled}
      className={`absolute ${isLeft ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white transition-colors disabled:opacity-20`}
    >
      {isLeft ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}
    </button>
  )
}

function LightboxThumbnails({ images, activeIndex, onSelect }) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
      {images.map((img, idx) => (
        <button
          key={idx}
          onClick={(e) => { e.stopPropagation(); onSelect(idx) }}
          className={`w-12 h-12 overflow-hidden rounded transition-all ${
            idx === activeIndex ? 'ring-2 ring-white opacity-100' : 'opacity-40 hover:opacity-70'
          }`}
        >
          <img src={getImageSrc(img)} alt="" className="w-full h-full object-cover" />
        </button>
      ))}
    </div>
  )
}
