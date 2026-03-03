import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Package } from 'lucide-react'
import { getShops, getProducts } from '../lib/api'

export default function ShopsList() {
  const [shops, setShops] = useState([])
  const [shopCounts, setShopCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await getShops()
      setShops(data || [])
      // Get product counts per shop
      const counts = {}
      for (const shop of (data || [])) {
        const { data: prods } = await getProducts({ shop_id: shop.id, status: 'active' })
        counts[shop.id] = prods?.length || 0
      }
      setShopCounts(counts)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="page-enter">
      <div className="pt-28 pb-16" style={{ backgroundColor: '#0C0A08' }}>
        <div className="max-w-7xl mx-auto px-6">
          <span className="font-body text-[10px] tracking-[0.5em] uppercase" style={{ color: 'rgba(176, 141, 87, 0.4)' }}>Партнёры</span>
          <h1 className="font-display text-4xl md:text-6xl italic mt-4" style={{ color: '#F0E6D6' }}>Магазины</h1>
          <p className="font-display text-lg italic mt-4" style={{ color: 'rgba(240, 230, 214, 0.25)' }}>
            Лучшие винтажные магазины на одной площадке
          </p>
        </div>
        <div className="gdt-divider mt-16" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-6" style={{ backgroundColor: 'rgba(44, 36, 32, 0.03)', borderRadius: '2px' }}>
                <div className="w-16 h-16 rounded mb-4" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
                <div className="h-5 w-2/3 rounded mb-2" style={{ backgroundColor: 'rgba(44, 36, 32, 0.06)' }} />
                <div className="h-4 w-full rounded" style={{ backgroundColor: 'rgba(44, 36, 32, 0.04)' }} />
              </div>
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-display text-xl italic" style={{ color: 'rgba(44, 36, 32, 0.2)' }}>Магазинов пока нет</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map(shop => (
              <Link key={shop.id} to={`/shop/${shop.slug}`}
                className="group p-6 transition-all duration-500"
                style={{ backgroundColor: 'rgba(44, 36, 32, 0.02)', border: '1px solid rgba(44, 36, 32, 0.06)', borderRadius: '2px' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(44, 36, 32, 0.06)'; e.currentTarget.style.transform = 'none' }}>
                {/* Logo */}
                {shop.logo_url ? (
                  <img src={shop.logo_url} alt={shop.name} className="w-14 h-14 rounded object-cover mb-4" />
                ) : (
                  <div className="w-14 h-14 rounded flex items-center justify-center font-display text-xl mb-4"
                    style={{ backgroundColor: 'rgba(176, 141, 87, 0.08)', color: '#B08D57' }}>
                    {shop.name.charAt(0)}
                  </div>
                )}

                <h3 className="font-display text-lg italic mb-1" style={{ color: '#0C0A08' }}>{shop.name}</h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={11} fill={s <= Math.round(shop.rating || 0) ? '#B08D57' : 'none'}
                        style={{ color: s <= Math.round(shop.rating || 0) ? '#B08D57' : 'rgba(44, 36, 32, 0.15)' }} />
                    ))}
                  </div>
                  <span className="font-body text-xs" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>{shop.rating || '—'}</span>
                </div>

                {/* Description */}
                {shop.description && (
                  <p className="font-body text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
                    {shop.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: '1px solid rgba(44, 36, 32, 0.06)' }}>
                  {shop.address && (
                    <span className="flex items-center gap-1 font-body text-xs" style={{ color: 'rgba(44, 36, 32, 0.3)' }}>
                      <MapPin size={10} /> {shop.address.split(',')[0]}
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-body text-xs" style={{ color: 'rgba(176, 141, 87, 0.5)' }}>
                    <Package size={10} /> {shopCounts[shop.id] || 0} товаров
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
