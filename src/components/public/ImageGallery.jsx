import { useState, useCallback, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

const EMPTY_BG = 'rgba(44, 36, 32, 0.04)'

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

  // Scroll the slider to show the active image
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
      <div className="aspect-[16/9] flex items-center justify-center" style={{ backgroundColor: EMPTY_BG }}>
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
      {/* Horizontal image slider — shows multiple images side-by-side */}
      <div className="relative group">
        <div
          ref={sliderRef}
          className="pamono-slider flex gap-2 overflow-x-auto snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth' }}
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              className="snap-center flex-shrink-0 cursor-zoom-in"
              style={{
                width: images.length === 1 ? '100%' : images.length === 2 ? '50%' : 'calc(50% - 4px)',
                minWidth: images.length === 1 ? '100%' : '300px',
              }}
              onClick={() => { setActiveIndex(idx); setLightboxOpen(true) }}
            >
              <div className="aspect-[4/3] overflow-hidden bg-white">
                <img
                  src={getImageSrc(img)}
                  alt={getImageAlt(img, `${title} — фото ${idx + 1}`)}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows on page edges */}
        {hasMultiple && (
          <>
            <button
              onClick={goPrev}
              disabled={isFirst}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-md transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 hover:bg-white"
              style={{ borderRadius: '0 2px 2px 0' }}
            >
              <ChevronLeft size={20} style={{ color: '#2C2420' }} />
            </button>
            <button
              onClick={goNext}
              disabled={isLast}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-md transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 hover:bg-white"
              style={{ borderRadius: '2px 0 0 2px' }}
            >
              <ChevronRight size={20} style={{ color: '#2C2420' }} />
            </button>
          </>
        )}

        {/* Zoom hint */}
        <div
          className="absolute bottom-3 right-3 p-2 rounded-full opacity-0 group-hover:opacity-70 transition-opacity pointer-events-none"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <ZoomIn size={14} className="text-white" />
        </div>
      </div>

      {/* Small thumbnails below */}
      {hasMultiple && (
        <div className="flex gap-1.5 mt-3">
          {images.map((img, idx) => {
            const isActive = idx === activeIndex
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className="flex-shrink-0 overflow-hidden transition-all duration-200"
                style={{
                  width: '64px',
                  height: '64px',
                  border: isActive ? '2px solid #2C2420' : '2px solid transparent',
                  opacity: isActive ? 1 : 0.5,
                }}
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

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onPrev, onNext])

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
          <button
            onClick={(e) => { e.stopPropagation(); onPrev() }}
            disabled={isFirst}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white transition-colors disabled:opacity-20"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext() }}
            disabled={isLast}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white transition-colors disabled:opacity-20"
          >
            <ChevronRight size={32} />
          </button>

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
        </>
      )}
    </div>
  )
}
