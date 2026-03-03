import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

export default function ImageGallery({ images = [], title = '' }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Fallback if no images array
  if (!images.length) {
    return (
      <div className="aspect-square bg-vintage-beige/30 flex items-center justify-center">
        <span className="font-sans text-sm text-vintage-brown/30">Нет изображений</span>
      </div>
    )
  }

  const current = images[activeIndex] || images[0]

  const goTo = (idx) => {
    setActiveIndex(Math.max(0, Math.min(idx, images.length - 1)))
  }

  const goPrev = () => goTo(activeIndex - 1)
  const goNext = () => goTo(activeIndex + 1)

  return (
    <>
      <div className="relative group">
        {/* Main Image */}
        <div
          className="aspect-square overflow-hidden bg-vintage-beige/20 cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={current.url || current}
            alt={current.alt_text || `${title} — фото ${activeIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />

          {/* Zoom hint */}
          <div className="absolute top-4 right-4 p-2 bg-vintage-dark/40 backdrop-blur-sm rounded-full
            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn size={16} className="text-white" />
          </div>
        </div>

        {/* Navigation arrows (only if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              disabled={activeIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full
                shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white
                disabled:opacity-0 disabled:cursor-default"
            >
              <ChevronLeft size={18} className="text-vintage-dark" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              disabled={activeIndex === images.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full
                shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white
                disabled:opacity-0 disabled:cursor-default"
            >
              <ChevronRight size={18} className="text-vintage-dark" />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-vintage-dark/60 backdrop-blur-sm
            rounded-full font-sans text-xs text-white">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded transition-all
                ${idx === activeIndex
                  ? 'ring-2 ring-vintage-dark ring-offset-1 opacity-100'
                  : 'opacity-50 hover:opacity-80'
                }`}
            >
              <img
                src={img.url || img}
                alt={img.alt_text || `Миниатюра ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-3 text-white/70 hover:text-white transition-colors z-10"
          >
            <X size={24} />
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 font-sans text-sm text-white/60">
              {activeIndex + 1} / {images.length}
            </div>
          )}

          {/* Image */}
          <img
            src={current.url || current}
            alt={current.alt_text || title}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Lightbox arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                disabled={activeIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white
                  transition-colors disabled:opacity-20 disabled:cursor-default"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext() }}
                disabled={activeIndex === images.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white
                  transition-colors disabled:opacity-20 disabled:cursor-default"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          {/* Lightbox thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(idx) }}
                  className={`w-12 h-12 overflow-hidden rounded transition-all
                    ${idx === activeIndex ? 'ring-2 ring-white opacity-100' : 'opacity-40 hover:opacity-70'}`}
                >
                  <img src={img.url || img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
