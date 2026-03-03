import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Search, Heart } from 'lucide-react'
import { useFavorites } from '../../lib/FavoritesContext'

const navLinks = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/favorites', label: 'Избранное', isFav: true },
  { to: '/about', label: 'О нас' },
  { to: '/contact', label: 'Контакты' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { favoritesCount } = useFavorites()

  return (
    <header className="sticky top-0 z-50 bg-vintage-paper/95 backdrop-blur-md border-b border-vintage-sand/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-vintage-dark rounded flex items-center justify-center">
              <span className="font-display text-vintage-cream text-xl font-bold">Э</span>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-vintage-dark tracking-wide leading-none">
                ЭПОХА
              </h1>
              <p className="font-sans text-[10px] tracking-[0.3em] text-vintage-brown/60 uppercase">
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
                      ? 'text-vintage-dark font-medium'
                      : 'text-vintage-brown/60 hover:text-vintage-dark'
                  }`
                }
              >
                {link.isFav && <Heart size={14} />}
                {link.label}
                {link.isFav && favoritesCount > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-[16px] h-4 px-1 flex items-center justify-center
                    bg-red-500 text-white text-[9px] font-medium rounded-full">
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
              className="p-2 text-vintage-brown/60 hover:text-vintage-dark transition-colors"
            >
              <Search size={18} />
            </button>

            {/* Mobile favorites icon */}
            <Link
              to="/favorites"
              className="md:hidden relative p-2 text-vintage-brown/60 hover:text-vintage-dark transition-colors"
            >
              <Heart size={18} />
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center
                  bg-red-500 text-white text-[9px] font-medium rounded-full">
                  {favoritesCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 text-vintage-brown/60"
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
                className="vintage-input"
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
                    `px-4 py-3 font-sans text-sm tracking-wider uppercase rounded-lg transition-colors
                    flex items-center gap-2 ${
                      isActive
                        ? 'bg-vintage-dark text-vintage-cream'
                        : 'text-vintage-brown/70 hover:bg-vintage-beige/50'
                    }`
                  }
                >
                  {link.isFav && <Heart size={14} />}
                  {link.label}
                  {link.isFav && favoritesCount > 0 && (
                    <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center
                      bg-red-500 text-white text-[10px] font-medium rounded-full">
                      {favoritesCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
