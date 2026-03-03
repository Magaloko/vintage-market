import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

export default function ImageGallery({ images = [], title = '' }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!images.length) {
    return (
      <div className="aspect-square flex items-center justify-center" style={{ backgroundColor: 'rgba(91, 58, 41, 0.06)' }}>
        <span className="font-sans text-sm" style={{ color: 'rgba(91, 58, 41, 0.3)' }}>Нет изображений</span>
      </div>
    )
  }

  const current = images[activeIndex] || images[0]
  const goTo = (idx) => setActiveIndex(Math.max(0, Math.min(idx, images.length - 1)))
  const goPrev = () => goTo(activeIndex - 1)
  const goNext = () => goTo(activeIndex + 1)

  return (
    <>
      <div className="relative group">
        <div className="aspect-square overflow-hidden cursor-zoom-in"
          style={{ backgroundColor: 'rgba(242, 237, 227, 0.3)' }}
          onClick={() => setLightboxOpen(true)}>
          <img src={current.url || current} alt={current.alt_text || `${title} — фото ${activeIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
          <div className="absolute top-4 right-4 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ backgroundColor: 'rgba(14, 26, 43, 0.4)', backdropFilter: 'blur(4px)' }}>
            <ZoomIn size={16} className="text-white" />
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); goPrev() }} disabled={activeIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white disabled:opacity-0">
              <ChevronLeft size={18} style={{ color: '#0E1A2B' }} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); goNext() }} disabled={activeIndex === images.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white disabled:opacity-0">
              <ChevronRight size={18} style={{ color: '#0E1A2B' }} />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 backdrop-blur-sm rounded-full font-sans text-xs text-white"
            style={{ backgroundColor: 'rgba(14, 26, 43, 0.6)' }}>
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button key={idx} onClick={() => setActiveIndex(idx)}
              className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded transition-all
                ${idx === activeIndex ? 'ring-2 ring-offset-1 opacity-100' : 'opacity-50 hover:opacity-80'}`}
              style={idx === activeIndex ? { '--tw-ring-color': '#0E1A2B' } : undefined}>
              <img src={img.url || img} alt={img.alt_text || `Миниатюра ${idx + 1}`}
                className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-3 text-white/70 hover:text-white transition-colors z-10">
            <X size={24} />
          </button>
          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 font-sans text-sm text-white/60">
              {activeIndex + 1} / {images.length}
            </div>
          )}
          <img src={current.url || current} alt={current.alt_text || title}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()} />
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); goPrev() }} disabled={activeIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white transition-colors disabled:opacity-20">
                <ChevronLeft size={32} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); goNext() }} disabled={activeIndex === images.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white transition-colors disabled:opacity-20">
                <ChevronRight size={32} />
              </button>
            </>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, idx) => (
                <button key={idx} onClick={(e) => { e.stopPropagation(); setActiveIndex(idx) }}
                  className={`w-12 h-12 overflow-hidden rounded transition-all
                    ${idx === activeIndex ? 'ring-2 ring-white opacity-100' : 'opacity-40 hover:opacity-70'}`}>
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
