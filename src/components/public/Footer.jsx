import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { categories, categoryGroups } from '../../data/demoProducts'
import { siteConfig } from '../../lib/siteConfig'
import { getCategoryCounts } from '../../lib/api'

export default function Footer() {
  const [categoryCounts, setCategoryCounts] = useState({})

  useEffect(() => {
    getCategoryCounts().then(r => setCategoryCounts(r.data || {}))
  }, [])

  const hasAnyCounts = Object.keys(categoryCounts).length > 0
  const activeCats = hasAnyCounts
    ? categories.filter(c => categoryCounts[c.id] > 0).slice(0, 8)
    : categories.slice(0, 8)

  return (
    <footer style={{ backgroundColor: '#0C0A08' }}>
      <div className="gdt-divider" />

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <span className="font-display text-2xl tracking-[0.3em] uppercase" style={{ color: '#B08D57' }}>
                Galerie
              </span>
              <br />
              <span className="font-display text-sm italic tracking-[0.2em]" style={{ color: 'rgba(176, 141, 87, 0.5)' }}>
                du Temps
              </span>
            </div>
            <div className="w-12 h-px mb-6" style={{ backgroundColor: 'rgba(176, 141, 87, 0.2)' }} />
            <p className="font-display text-lg italic leading-relaxed max-w-sm" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>
              Мы находим уникальные вещи с историей
              и даём им вторую жизнь.
            </p>
            <div className="flex gap-3 mt-6">
              {siteConfig.whatsapp && (
                <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center font-body text-xs transition-all"
                  style={{ border: '1px solid rgba(176, 141, 87, 0.15)', color: 'rgba(176, 141, 87, 0.4)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#25D366'; e.currentTarget.style.color = '#25D366' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.15)'; e.currentTarget.style.color = 'rgba(176, 141, 87, 0.4)' }}>
                  WA
                </a>
              )}
              {siteConfig.telegram && (
                <a href={`https://t.me/${siteConfig.telegram}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center font-body text-xs transition-all"
                  style={{ border: '1px solid rgba(176, 141, 87, 0.15)', color: 'rgba(176, 141, 87, 0.4)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#26A3EE'; e.currentTarget.style.color = '#26A3EE' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.15)'; e.currentTarget.style.color = 'rgba(176, 141, 87, 0.4)' }}>
                  TG
                </a>
              )}
              {siteConfig.instagram && (
                <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center font-body text-xs transition-all"
                  style={{ border: '1px solid rgba(176, 141, 87, 0.15)', color: 'rgba(176, 141, 87, 0.4)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#E1306C'; e.currentTarget.style.color = '#E1306C' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(176, 141, 87, 0.15)'; e.currentTarget.style.color = 'rgba(176, 141, 87, 0.4)' }}>
                  IG
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-body text-[10px] tracking-[0.3em] uppercase mb-6"
              style={{ color: 'rgba(176, 141, 87, 0.4)' }}>
              Навигация
            </h4>
            <div className="flex flex-col gap-4">
              {[
                { to: '/catalog', label: 'Каталог' },
                { to: '/shops', label: 'Магазины' },
                { to: '/favorites', label: 'Избранное' },
                { to: '/about', label: 'О галерее' },
                { to: '/contact', label: 'Контакт' },
                { to: '/seller/register', label: 'Стать продавцом' },
              ].map(link => (
                <Link key={link.to} to={link.to}
                  className="font-display text-sm italic tracking-wide transition-colors duration-300"
                  style={{ color: 'rgba(240, 230, 214, 0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#B08D57'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(240, 230, 214, 0.3)'}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-body text-[10px] tracking-[0.3em] uppercase mb-6"
              style={{ color: 'rgba(176, 141, 87, 0.4)' }}>
              Категории
            </h4>
            <div className="flex flex-col gap-4">
              {activeCats.map(cat => (
                <Link key={cat.id} to={`/catalog/${cat.id}`}
                  className="font-display text-sm italic tracking-wide transition-colors duration-300"
                  style={{ color: 'rgba(240, 230, 214, 0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#B08D57'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(240, 230, 214, 0.3)'}>
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(176, 141, 87, 0.08)' }}>
          <p className="font-body text-[11px] tracking-wide" style={{ color: 'rgba(240, 230, 214, 0.15)' }}>
            &copy; {new Date().getFullYear()} Galerie du Temps. Wien, Austria.
          </p>
          <p className="font-display text-sm italic" style={{ color: 'rgba(176, 141, 87, 0.2)' }}>
            Le temps embellit toute chose
          </p>
        </div>
      </div>
    </footer>
  )
}
