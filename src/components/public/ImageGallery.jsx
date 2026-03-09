import { useState, useCallback, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

function getImageSrc(img) {
  return img?.url || img
}

function getImageAlt(img, fallback) {
  return img?.alt_text || fallback
}

export default function ImageGallery({ images = [], title = '' }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const sliderRef = useRef(null)

  const goTo = useCallback(
    (idx) => setActiveIndex(Math.max(0, Math.min(idx, images.length - 1))),
    [images.length],
  )
  const goPrev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex])
  const goNext = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex])

  // Scroll slider to active image
  useEffect(() => {
    const container = sliderRef.current
    if (!container) return
    const el = container.children[activeIndex]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [activeIndex])

  if (!images.length) {
    return (
      <div
        className="aspect-[16/9] md:aspect-[2/1] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(44, 36, 32, 0.04)' }}
      >
        <span className="font-sans text-sm" style={{ color: 'rgba(44, 36, 32, 0.3)' }}>
          Нет изображений
        </span>
      </div>
    )
  }

  const hasMultiple = images.length > 1
  const isFirst = activeIndex === 0
  const isLast = activeIndex === images.length - 1

  return (
    <div>
      {/* Main image slider — fixed height, images fit within */}
      <div className="relative group">
        <div
          ref={sliderRef}
          className="pamono-slider flex overflow-x-auto snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth', gap: '2px', height: 'clamp(260px, 45vw, 480px)' }}
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              className="snap-center flex-shrink-0 cursor-zoom-in h-full"
              style={{ width: images.length === 1 ? '100%' : images.length === 2 ? '50%' : 'auto' }}
              onClick={() => { setActiveIndex(idx); setLightboxOpen(true) }}
            >
              <img
                src={getImageSrc(img)}
                alt={getImageAlt(img, `${title} — фото ${idx + 1}`)}
                className="h-full w-auto max-w-none object-cover transition-transform duration-500 hover:scale-[1.02] bg-neutral-100"
                style={images.length <= 2 ? { width: '100%' } : undefined}
                loading={idx > 2 ? 'lazy' : 'eager'}
              />
            </div>
          ))}
        </div>

        {/* Nav arrows — always visible on desktop, tap on mobile */}
        {hasMultiple && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              disabled={isFirst}
              className="absolute left-0 top-0 bottom-0 w-12 md:w-14 flex items-center justify-center transition-all bg-gradient-to-r from-black/20 to-transparent md:from-black/10 opacity-80 hover:opacity-100 disabled:opacity-0"
              aria-label="Назад"
            >
              <ChevronLeft size={28} className="text-white drop-shadow-md" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              disabled={isLast}
              className="absolute right-0 top-0 bottom-0 w-12 md:w-14 flex items-center justify-center transition-all bg-gradient-to-l from-black/20 to-transparent md:from-black/10 opacity-80 hover:opacity-100 disabled:opacity-0"
              aria-label="Вперёд"
            >
              <ChevronRight size={28} className="text-white drop-shadow-md" />
            </button>
          </>
        )}

        {/* Image counter overlay — mobile friendly */}
        {hasMultiple && (
          <div
            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full font-sans text-xs text-white/90"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          >
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* Zoom hint */}
        <div
          className="absolute bottom-3 left-3 p-2 rounded-full opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none hidden md:block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <ZoomIn size={14} className="text-white" />
        </div>
      </div>

      {/* Thumbnails below */}
      {hasMultiple && (
        <div className="flex gap-1 mt-2 overflow-x-auto pamono-slider pb-1">
          {images.map((img, idx) => {
            const isActive = idx === activeIndex
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className="flex-shrink-0 overflow-hidden transition-all duration-200"
                style={{
                  width: '60px',
                  height: '60px',
                  border: isActive ? '2px solid #2C2420' : '2px solid transparent',
                  opacity: isActive ? 1 : 0.5,
                }}
              >
                <img
                  src={getImageSrc(img)}
                  alt={getImageAlt(img, `${title} — миниатюра ${idx + 1}`)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            )
          })}
        </div>
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
/*  Lightbox                                                            */
/* ------------------------------------------------------------------ */

function Lightbox({ images, activeIndex, title, onClose, onPrev, onNext, onSelect, isFirst, isLast }) {
  const current = images[activeIndex] || images[0]
  const hasMultiple = images.length > 1

  // Keyboard + swipe navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onPrev, onNext])

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 text-white/70 hover:text-white transition-colors z-10"
        aria-label="Закрыть"
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
        className="max-w-[92vw] max-h-[85vh] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />

      {hasMultiple && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev() }}
            disabled={isFirst}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 text-white/60 hover:text-white transition-colors disabled:opacity-20"
            aria-label="Назад"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext() }}
            disabled={isLast}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 text-white/60 hover:text-white transition-colors disabled:opacity-20"
            aria-label="Вперёд"
          >
            <ChevronRight size={32} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); onSelect(idx) }}
                className={`w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded transition-all ${
                  idx === activeIndex ? 'ring-2 ring-white opacity-100' : 'opacity-40 hover:opacity-70'
                }`}
              >
                <img src={getImageSrc(img)} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
