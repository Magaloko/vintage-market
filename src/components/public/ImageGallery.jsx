import { useState, useCallback } from 'react'
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
    <>
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

      {hasMultiple && (
        <ThumbnailStrip
          images={images}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />
      )}

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
    </>
  )
}

function MainImage({ src, alt, onZoom }) {
  return (
    <div
      className="aspect-square overflow-hidden cursor-zoom-in"
      style={{ backgroundColor: GALLERY_BG }}
      onClick={onZoom}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
      <div
        className="absolute top-4 right-4 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ backgroundColor: OVERLAY_BG, backdropFilter: 'blur(4px)' }}
      >
        <ZoomIn size={16} className="text-white" />
      </div>
    </div>
  )
}

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

function ThumbnailStrip({ images, activeIndex, onSelect }) {
  return (
    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
      {images.map((img, idx) => {
        const isActive = idx === activeIndex
        return (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded transition-all ${
              isActive ? 'ring-2 ring-offset-1 opacity-100' : 'opacity-50 hover:opacity-80'
            }`}
            style={isActive ? { '--tw-ring-color': '#0C0A08' } : undefined}
          >
            <img
              src={getImageSrc(img)}
              alt={getImageAlt(img, `Миниатюра ${idx + 1}`)}
              className="w-full h-full object-cover"
            />
          </button>
        )
      })}
    </div>
  )
}

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
