import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Search, Heart } from 'lucide-react'
import { useFavorites } from '../../lib/FavoritesContext'
import { useCompare } from '../../lib/CompareContext'

const navLinks = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/favorites', label: 'Избранное', isFav: true },
  { to: '/compare', label: 'Сравнение', isCompare: true },
  { to: '/about', label: 'О нас' },
  { to: '/contact', label: 'Контакты' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { favoritesCount } = useFavorites()
  const { compareCount } = useCompare()

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: '#0E1A2B' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-btn flex items-center justify-center"
              style={{ backgroundColor: 'rgba(184, 154, 90, 0.15)', border: '1px solid rgba(184, 154, 90, 0.3)' }}>
              <span className="font-display text-xl font-bold" style={{ color: '#B89A5A' }}>Э</span>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-wide leading-none"
                style={{ color: '#F2EDE3' }}>
                ЭПОХА
              </h1>
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase"
                style={{ color: 'rgba(184, 154, 90, 0.6)' }}>
                Винтажный Маркетплейс
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `relative font-sans text-sm tracking-wider uppercase transition-colors duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'font-medium'
                      : ''
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? '#B89A5A' : 'rgba(242, 237, 227, 0.5)',
                })}
                onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.color = '#F2EDE3' }}
                onMouseLeave={e => {
                  const isActive = e.currentTarget.getAttribute('aria-current') === 'page'
                  if (!isActive) e.currentTarget.style.color = 'rgba(242, 237, 227, 0.5)'
                }}
              >
                {link.isFav && <Heart size={14} />}
                {link.label}
                {link.isFav && favoritesCount > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-medium rounded-full"
                    style={{ backgroundColor: '#C2642C', color: '#F2EDE3' }}>
                    {favoritesCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 transition-colors"
              style={{ color: 'rgba(242, 237, 227, 0.5)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#F2EDE3'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(242, 237, 227, 0.5)'}
            >
              <Search size={18} />
            </button>

            {/* Mobile favorites icon */}
            <Link
              to="/favorites"
              className="md:hidden relative p-2 transition-colors"
              style={{ color: 'rgba(242, 237, 227, 0.5)' }}
            >
              <Heart size={18} />
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-medium rounded-full"
                  style={{ backgroundColor: '#C2642C', color: '#F2EDE3' }}>
                  {favoritesCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2"
              style={{ color: 'rgba(242, 237, 227, 0.5)' }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4 animate-fade-in">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const q = e.target.elements.search.value
                if (q.trim()) {
                  window.location.href = `/catalog?search=${encodeURIComponent(q)}`
                }
              }}
            >
              <input
                name="search"
                type="text"
                placeholder="Поиск по каталогу..."
                className="vintage-input-dark"
                autoFocus
              />
            </form>
          </div>
        )}

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-6 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 font-sans text-sm tracking-wider uppercase transition-colors flex items-center gap-2`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? 'rgba(194, 100, 44, 0.15)' : 'transparent',
                    color: isActive ? '#D4784A' : 'rgba(242, 237, 227, 0.5)',
                    borderRadius: '6px',
                  })}
                >
                  {link.isFav && <Heart size={14} />}
                  {link.label}
                  {link.isFav && favoritesCount > 0 && (
                    <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-medium rounded-full"
                      style={{ backgroundColor: '#C2642C', color: '#F2EDE3' }}>
                      {favoritesCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </div>

      {/* Subtle gold bottom line */}
      <div className="section-gold-line" />
    </header>
  )
}
