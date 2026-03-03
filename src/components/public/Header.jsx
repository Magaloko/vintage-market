import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Heart, Menu, X } from 'lucide-react'
import { useFavorites } from '../../lib/FavoritesContext'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { favorites } = useFavorites()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const isHome = location.pathname === '/'
  const isTransparent = isHome && !scrolled && !mobileOpen

  const navLinks = [
    { to: '/catalog', label: 'Каталог' },
    { to: '/shops', label: 'Магазины' },
    { to: '/about', label: 'О нас' },
    { to: '/contact', label: 'Контакт' },
  ]

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-700"
        style={{
          backgroundColor: isTransparent ? 'transparent' : 'rgba(12, 10, 8, 0.95)',
          backdropFilter: isTransparent ? 'none' : 'blur(20px)',
          borderBottom: isTransparent ? 'none' : '1px solid rgba(176, 141, 87, 0.1)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex flex-col items-start group">
              <span
                className="font-display text-xl md:text-2xl tracking-[0.3em] uppercase transition-colors duration-500"
                style={{ color: isTransparent ? '#F0E6D6' : '#B08D57' }}
              >
                Galerie
              </span>
              <span
                className="font-display text-[10px] md:text-xs italic tracking-[0.2em] -mt-1 transition-colors duration-500"
                style={{ color: isTransparent ? 'rgba(240, 230, 214, 0.5)' : 'rgba(176, 141, 87, 0.5)' }}
              >
                du Temps
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-10">
              {navLinks.map(link => {
                const isActive = location.pathname.startsWith(link.to)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="relative font-body text-[13px] tracking-[0.15em] uppercase transition-all duration-500 group"
                    style={{ color: isActive
                      ? (isTransparent ? '#F0E6D6' : '#B08D57')
                      : (isTransparent ? 'rgba(240, 230, 214, 0.6)' : 'rgba(240, 230, 214, 0.4)')
                    }}
                  >
                    {link.label}
                    <span
                      className="absolute -bottom-1 left-0 h-px transition-all duration-500"
                      style={{
                        width: isActive ? '100%' : '0%',
                        backgroundColor: '#B08D57',
                      }}
                    />
                  </Link>
                )
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300"
                style={{
                  color: isTransparent ? 'rgba(240, 230, 214, 0.6)' : 'rgba(240, 230, 214, 0.4)',
                  backgroundColor: searchOpen ? 'rgba(176, 141, 87, 0.1)' : 'transparent',
                }}
              >
                <Search size={18} />
              </button>

              {/* Favorites */}
              <Link
                to="/favorites"
                className="relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300"
                style={{
                  color: isTransparent ? 'rgba(240, 230, 214, 0.6)' : 'rgba(240, 230, 214, 0.4)',
                }}
              >
                <Heart size={18} />
                {favorites.length > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center rounded-full font-body text-[9px] font-semibold"
                    style={{ backgroundColor: '#B08D57', color: '#0C0A08', minWidth: '18px', height: '18px' }}
                  >
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center transition-all duration-300"
                style={{ color: isTransparent ? '#F0E6D6' : 'rgba(240, 230, 214, 0.6)' }}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Drawer */}
        <div
          className="overflow-hidden transition-all duration-500 ease-out"
          style={{
            maxHeight: searchOpen ? '80px' : '0px',
            opacity: searchOpen ? 1 : 0,
            borderTop: searchOpen ? '1px solid rgba(176, 141, 87, 0.08)' : 'none',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск по коллекции..."
                autoFocus={searchOpen}
                className="w-full py-2 pl-0 pr-10 bg-transparent font-display text-lg italic border-0 focus:outline-none"
                style={{
                  color: '#F0E6D6',
                  borderBottom: '1px solid rgba(176, 141, 87, 0.3)',
                }}
              />
              <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(176, 141, 87, 0.5)' }}>
                <Search size={18} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fade-in"
          style={{ backgroundColor: 'rgba(12, 10, 8, 0.98)' }}>
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {navLinks.map((link, i) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-display text-3xl italic tracking-[0.15em] animate-slide-up"
                style={{
                  color: location.pathname.startsWith(link.to) ? '#B08D57' : 'rgba(240, 230, 214, 0.5)',
                  animationDelay: `${i * 80}ms`,
                }}
              >
                {link.label}
              </Link>
            ))}
            <div className="w-12 h-px mt-4" style={{ backgroundColor: 'rgba(176, 141, 87, 0.3)' }} />
            <Link to="/favorites" className="font-body text-sm tracking-[0.2em] uppercase animate-slide-up"
              style={{ color: 'rgba(176, 141, 87, 0.5)', animationDelay: '300ms' }}>
              Избранное ({favorites.length})
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
