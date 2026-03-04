import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Heart, Menu, X } from 'lucide-react'
import { useFavorites } from '../../lib/FavoritesContext'

const NAV_LINKS = [
  { to: '/catalog', label: 'Каталог' },
  { to: '/shops', label: 'Магазины' },
  { to: '/about', label: 'О нас' },
  { to: '/contact', label: 'Контакт' },
]

const COLORS = {
  cream: '#F0E6D6',
  gold: '#B08D57',
  dark: 'rgba(12, 10, 8, 0.95)',
  creamFaded: 'rgba(240, 230, 214, 0.6)',
  creamDim: 'rgba(240, 230, 214, 0.4)',
  creamHalf: 'rgba(240, 230, 214, 0.5)',
  goldFaded: 'rgba(176, 141, 87, 0.5)',
  goldSubtle: 'rgba(176, 141, 87, 0.1)',
  goldBorder: 'rgba(176, 141, 87, 0.08)',
  goldBorderLight: 'rgba(176, 141, 87, 0.3)',
  overlay: 'rgba(12, 10, 8, 0.98)',
}

function getNavColor(isActive, isTransparent) {
  if (isActive) return isTransparent ? COLORS.cream : COLORS.gold
  return isTransparent ? COLORS.creamFaded : COLORS.creamDim
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const searchInputRef = useRef(null)
  const { favorites } = useFavorites()
  const location = useLocation()
  const navigate = useNavigate()

  const isHome = location.pathname === '/'
  const isTransparent = isHome && !scrolled && !mobileOpen

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!searchOpen) return
    const timer = setTimeout(() => searchInputRef.current?.focus(), 50)
    return () => clearTimeout(timer)
  }, [searchOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    navigate(`/catalog?search=${encodeURIComponent(q)}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-700"
        style={{
          backgroundColor: isTransparent ? 'transparent' : COLORS.dark,
          backdropFilter: isTransparent ? 'none' : 'blur(20px)',
          borderBottom: isTransparent ? 'none' : `1px solid ${COLORS.goldSubtle}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Logo isTransparent={isTransparent} />
            <DesktopNav links={NAV_LINKS} pathname={location.pathname} isTransparent={isTransparent} />
            <HeaderActions
              isTransparent={isTransparent}
              searchOpen={searchOpen}
              onSearchToggle={() => setSearchOpen(!searchOpen)}
              favoritesCount={favorites.length}
              mobileOpen={mobileOpen}
              onMobileToggle={() => setMobileOpen(!mobileOpen)}
            />
          </div>
        </div>

        <SearchDrawer
          open={searchOpen}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSubmit={handleSearch}
          inputRef={searchInputRef}
        />
      </header>

      {mobileOpen && (
        <MobileOverlay
          links={NAV_LINKS}
          pathname={location.pathname}
          favoritesCount={favorites.length}
        />
      )}
    </>
  )
}

function Logo({ isTransparent }) {
  return (
    <Link to="/" className="flex flex-col items-start group">
      <span
        className="font-display text-xl md:text-2xl tracking-[0.3em] uppercase transition-colors duration-500"
        style={{ color: isTransparent ? COLORS.cream : COLORS.gold }}
      >
        Galerie
      </span>
      <span
        className="font-display text-[10px] md:text-xs italic tracking-[0.2em] -mt-1 transition-colors duration-500"
        style={{ color: isTransparent ? COLORS.creamHalf : COLORS.goldFaded }}
      >
        du Temps
      </span>
    </Link>
  )
}

function DesktopNav({ links, pathname, isTransparent }) {
  return (
    <nav className="hidden md:flex items-center gap-10">
      {links.map(({ to, label }) => {
        const isActive = pathname.startsWith(to)
        return (
          <Link
            key={to}
            to={to}
            className="relative font-body text-[13px] tracking-[0.15em] uppercase transition-all duration-500 group"
            style={{ color: getNavColor(isActive, isTransparent) }}
          >
            {label}
            <span
              className="absolute -bottom-1 left-0 h-px transition-all duration-500"
              style={{ width: isActive ? '100%' : '0%', backgroundColor: COLORS.gold }}
            />
          </Link>
        )
      })}
    </nav>
  )
}

function HeaderActions({ isTransparent, searchOpen, onSearchToggle, favoritesCount, mobileOpen, onMobileToggle }) {
  const iconColor = isTransparent ? COLORS.creamFaded : COLORS.creamDim

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onSearchToggle}
        className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300"
        style={{
          color: iconColor,
          backgroundColor: searchOpen ? COLORS.goldSubtle : 'transparent',
        }}
      >
        <Search size={18} />
      </button>

      <Link
        to="/favorites"
        className="relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300"
        style={{ color: iconColor }}
      >
        <Heart size={18} />
        {favoritesCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center rounded-full font-body text-[9px] font-semibold"
            style={{ backgroundColor: COLORS.gold, color: '#0C0A08', minWidth: '18px', height: '18px' }}
          >
            {favoritesCount}
          </span>
        )}
      </Link>

      <button
        onClick={onMobileToggle}
        className="md:hidden w-10 h-10 flex items-center justify-center transition-all duration-300"
        style={{ color: isTransparent ? COLORS.cream : COLORS.creamFaded }}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  )
}

function SearchDrawer({ open, query, onQueryChange, onSubmit, inputRef }) {
  return (
    <div
      className="overflow-hidden transition-all duration-500 ease-out"
      style={{
        maxHeight: open ? '80px' : '0px',
        opacity: open ? 1 : 0,
        borderTop: open ? `1px solid ${COLORS.goldBorder}` : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <form onSubmit={onSubmit} className="relative max-w-lg mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Поиск по коллекции..."
            className="w-full py-2 pl-0 pr-10 bg-transparent font-display text-lg italic border-0 focus:outline-none"
            style={{ color: COLORS.cream, borderBottom: `1px solid ${COLORS.goldBorderLight}` }}
          />
          <button
            type="submit"
            className="absolute right-0 top-1/2 -translate-y-1/2"
            style={{ color: COLORS.goldFaded }}
          >
            <Search size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}

function MobileOverlay({ links, pathname, favoritesCount }) {
  return (
    <div
      className="fixed inset-0 z-40 md:hidden animate-fade-in"
      style={{ backgroundColor: COLORS.overlay }}
    >
      <div className="flex flex-col items-center justify-center h-full gap-8">
        {links.map(({ to, label }, i) => (
          <Link
            key={to}
            to={to}
            className="font-display text-3xl italic tracking-[0.15em] animate-slide-up"
            style={{
              color: pathname.startsWith(to) ? COLORS.gold : COLORS.creamHalf,
              animationDelay: `${i * 80}ms`,
            }}
          >
            {label}
          </Link>
        ))}
        <div className="w-12 h-px mt-4" style={{ backgroundColor: COLORS.goldBorderLight }} />
        <Link
          to="/favorites"
          className="font-body text-sm tracking-[0.2em] uppercase animate-slide-up"
          style={{ color: COLORS.goldFaded, animationDelay: '300ms' }}
        >
          Избранное ({favoritesCount})
        </Link>
      </div>
    </div>
  )
}
