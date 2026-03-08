import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../../data/demoProducts'
import { siteConfig } from '../../lib/siteConfig'
import { getCategoryCounts } from '../../lib/api'

const NAV_LINKS = [
  { to: '/catalog', label: 'Каталог' },
  { to: '/favorites', label: 'Избранное' },
  { to: '/about', label: 'О галерее' },
  { to: '/contact', label: 'Контакт' },
]

const SOCIAL_LINKS = [
  { key: 'whatsapp', label: 'WA', hrefFn: (v) => `https://wa.me/${v}`, hoverColor: '#25D366' },
  { key: 'telegram', label: 'TG', hrefFn: (v) => `https://t.me/${v}`, hoverColor: '#26A3EE' },
  { key: 'instagram', label: 'IG', hrefFn: (v) => v, hoverColor: '#E1306C' },
]

const COLORS = {
  gold: '#B08D57',
  goldFaded: 'rgba(176, 141, 87, 0.6)',
  goldDim: 'rgba(176, 141, 87, 0.5)',
  goldBorder: 'rgba(176, 141, 87, 0.2)',
  goldDivider: 'rgba(176, 141, 87, 0.25)',
  goldSubtle: 'rgba(176, 141, 87, 0.1)',
  creamFaded: 'rgba(240, 230, 214, 0.5)',
  creamDim: 'rgba(240, 230, 214, 0.35)',
}

const footerLinkStyle = { color: COLORS.creamFaded }

function useHoverStyle(hoverColor, baseColor = COLORS.creamFaded) {
  return {
    style: { color: baseColor },
    onMouseEnter: (e) => { e.currentTarget.style.color = hoverColor },
    onMouseLeave: (e) => { e.currentTarget.style.color = baseColor },
  }
}

export default function Footer() {
  const [categoryCounts, setCategoryCounts] = useState({})

  useEffect(() => {
    getCategoryCounts().then((r) => setCategoryCounts(r.data || {}))
  }, [])

  const hasAnyCounts = Object.keys(categoryCounts).length > 0
  const activeCats = hasAnyCounts
    ? categories.filter((c) => categoryCounts[c.id] > 0).slice(0, 8)
    : categories.slice(0, 8)

  return (
    <footer style={{ backgroundColor: '#0C0A08' }}>
      <div className="gdt-divider" />

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          <BrandColumn />
          <NavColumn />
          <CategoriesColumn categories={activeCats} />
        </div>

        {/* Legal Links */}
        <div
          className="mt-20 pt-8 flex flex-col gap-4"
          style={{ borderTop: `1px solid ${COLORS.goldSubtle}` }}
        >
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { to: '/privacy', label: 'Конфиденциальность' },
              { to: '/impressum', label: 'Правовая информация' },
              { to: '/terms', label: 'Условия' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="font-body text-[11px] tracking-wide transition-colors duration-300"
                {...useHoverStyle(COLORS.gold, COLORS.creamDim)}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body text-[11px] tracking-wide" style={{ color: COLORS.creamDim }}>
              &copy; {new Date().getFullYear()} Galerie du Temps. Казахстан.
            </p>
            <p className="font-display text-sm italic" style={{ color: COLORS.goldDivider }}>
              Le temps embellit toute chose
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

function BrandColumn() {
  return (
    <div className="md:col-span-2">
      <div className="mb-6">
        <span className="font-display text-2xl tracking-[0.3em] uppercase" style={{ color: COLORS.gold }}>
          Galerie
        </span>
        <br />
        <span className="font-display text-sm italic tracking-[0.2em]" style={{ color: COLORS.goldFaded }}>
          du Temps
        </span>
      </div>

      <div className="w-12 h-px mb-6" style={{ backgroundColor: COLORS.goldDivider }} />

      <p
        className="font-display text-lg italic leading-relaxed max-w-sm"
        style={{ color: COLORS.creamFaded }}
      >
        Мы находим уникальные вещи с историей
        и даём им вторую жизнь.
      </p>

      <div className="flex gap-3 mt-6">
        {SOCIAL_LINKS.map(({ key, label, hrefFn, hoverColor }) => {
          const value = siteConfig[key]
          if (!value) return null
          return (
            <SocialIcon
              key={key}
              href={hrefFn(value)}
              label={label}
              hoverColor={hoverColor}
            />
          )
        })}
      </div>
    </div>
  )
}

function SocialIcon({ href, label, hoverColor }) {
  const baseStyle = { border: `1px solid ${COLORS.goldBorder}`, color: COLORS.goldDim }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-full flex items-center justify-center font-body text-xs transition-all"
      style={baseStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = hoverColor
        e.currentTarget.style.color = hoverColor
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.goldBorder
        e.currentTarget.style.color = COLORS.goldDim
      }}
    >
      {label}
    </a>
  )
}

function NavColumn() {
  return (
    <div>
      <FooterHeading>Навигация</FooterHeading>
      <div className="flex flex-col gap-4">
        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="font-display text-sm italic tracking-wide transition-colors duration-300"
            {...useHoverStyle(COLORS.gold)}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function CategoriesColumn({ categories }) {
  return (
    <div>
      <FooterHeading>Категории</FooterHeading>
      <div className="flex flex-col gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/catalog/${cat.id}`}
            className="font-display text-sm italic tracking-wide transition-colors duration-300"
            {...useHoverStyle(COLORS.gold)}
          >
            {cat.icon} {cat.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

function FooterHeading({ children }) {
  return (
    <h4
      className="font-body text-[10px] tracking-[0.3em] uppercase mb-6"
      style={{ color: COLORS.goldDim }}
    >
      {children}
    </h4>
  )
}
