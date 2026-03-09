export default function VintagePriceTag({ price, isSold, isRental, formatPrice }) {
  const displayPrice = isRental ? `${formatPrice(price)} / мес.` : formatPrice(price)

  return (
    <div className="relative inline-block">
      {/* Decorative "string hole" */}
      <div
        className="absolute -top-[5px] right-5 w-3 h-3 rounded-full z-10"
        style={{
          border: '1.5px solid rgba(176, 141, 87, 0.5)',
          backgroundColor: '#F7F2EB',
        }}
      />
      {/* String line from hole */}
      <div
        className="absolute -top-[12px] right-[26px] w-px h-3"
        style={{ backgroundColor: 'rgba(176, 141, 87, 0.3)' }}
      />

      {/* Tag body */}
      <div
        style={{
          backgroundColor: 'rgba(255, 252, 245, 0.95)',
          border: '1px solid rgba(176, 141, 87, 0.25)',
          borderTop: '3px solid #B08D57',
          padding: '14px 28px 12px 20px',
          boxShadow: '0 2px 12px rgba(12, 10, 8, 0.06)',
        }}
      >
        {/* Micro label */}
        <p
          className="font-body tracking-[0.35em] uppercase mb-1"
          style={{
            fontSize: '8px',
            color: 'rgba(176, 141, 87, 0.55)',
            letterSpacing: '0.35em',
          }}
        >
          Цена
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span
            className={`font-display text-3xl ${isSold ? 'line-through' : ''}`}
            style={{
              color: isSold ? 'rgba(44, 36, 32, 0.25)' : '#0C0A08',
              fontStyle: 'italic',
              fontWeight: 500,
            }}
          >
            {displayPrice}
          </span>

          {isSold && (
            <span
              className="font-body text-[10px] tracking-[0.25em] uppercase"
              style={{ color: '#B08D57' }}
            >
              Продано
            </span>
          )}
        </div>

        {/* Bottom decorative divider */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(176, 141, 87, 0.15)' }} />
          <div
            className="w-1 h-1"
            style={{
              backgroundColor: 'rgba(176, 141, 87, 0.3)',
              transform: 'rotate(45deg)',
            }}
          />
          <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(176, 141, 87, 0.15)' }} />
        </div>
      </div>
    </div>
  )
}
