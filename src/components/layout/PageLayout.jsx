export default function PageLayout({ title, subtitle, children }) {
  return (
    <div className="page-enter">
      {/* Dark Hero Header */}
      <div className="pt-28 pb-16" style={{ backgroundColor: '#0C0A08' }}>
        <div className="max-w-7xl mx-auto px-6">
          {subtitle && (
            <span
              className="font-sans text-xs tracking-[0.3em] uppercase"
              style={{ color: 'rgba(176, 141, 87, 0.5)' }}
            >
              {subtitle}
            </span>
          )}
          <h1
            className="font-display text-4xl md:text-6xl font-bold mt-3 italic"
            style={{ color: '#F0E6D6' }}
          >
            {title}
          </h1>
        </div>
        <div className="section-gold-line mt-16" />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-24">
        {children}
      </div>
    </div>
  )
}
