import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Heart, Menu, X, Sun, Moon, ChevronDown } from 'lucide-react'
import { useFavorites } from '../../lib/FavoritesContext'
import { useTheme } from '../../lib/ThemeContext'
import { useCurrency } from '../../lib/CurrencyContext'

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
  creamFaded: 'rgba(240, 230, 214, 0.7)',
  creamDim: 'rgba(240, 230, 214, 0.55)',
  creamHalf: 'rgba(240, 230, 214, 0.6)',
  goldFaded: 'rgba(176, 141, 87, 0.6)',
  goldSubtle: 'rgba(176, 141, 87, 0.12)',
  goldBorder: 'rgba(176, 141, 87, 0.1)',
  goldBorderLight: 'rgba(176, 141, 87, 0.35)',
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
  const { isDark, toggleTheme } = useTheme()
  const { currency, setCurrency, currencies } = useCurrency()
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
              isDark={isDark}
              onThemeToggle={toggleTheme}
              currency={currency}
              setCurrency={setCurrency}
              currencies={currencies}
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
          onClose={() => setMobileOpen(false)}
          currency={currency}
          setCurrency={setCurrency}
          currencies={currencies}
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

function HeaderActions({ isTransparent, searchOpen, onSearchToggle, favoritesCount, mobileOpen, onMobileToggle, isDark, onThemeToggle, currency, setCurrency, currencies }) {
  const iconColor = isTransparent ? COLORS.creamFaded : COLORS.creamDim
  const [currOpen, setCurrOpen] = useState(false)
  const currRef = useRef(null)

  useEffect(() => {
    if (!currOpen) return
    const close = (e) => { if (!currRef.current?.contains(e.target)) setCurrOpen(false) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [currOpen])

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onThemeToggle}
        className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300"
        style={{ color: iconColor }}
        title={isDark ? 'Светлый режим' : 'Тёмный режим'}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

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

      {/* Currency selector (desktop) */}
      <div ref={currRef} className="relative hidden md:block">
        <button
          onClick={() => setCurrOpen(!currOpen)}
          className="h-10 px-2 flex items-center gap-1 rounded-full transition-all duration-300"
          style={{
            color: iconColor,
            backgroundColor: currOpen ? COLORS.goldSubtle : 'transparent',
          }}
        >
          <span className="font-body text-[11px] tracking-wider font-medium">{currency}</span>
          <ChevronDown size={12} style={{ transform: currOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {currOpen && (
          <div
            className="absolute top-full right-0 mt-2 py-1 min-w-[110px]"
            style={{
              backgroundColor: 'rgba(12, 10, 8, 0.95)',
              border: `1px solid ${COLORS.goldSubtle}`,
              borderRadius: '2px',
              backdropFilter: 'blur(12px)',
            }}
          >
            {currencies.map((c) => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c.code); setCurrOpen(false) }}
                className="w-full px-3 py-1.5 flex items-center gap-2 text-left transition-colors duration-200"
                style={{
                  color: c.code === currency ? COLORS.gold : COLORS.creamDim,
                  backgroundColor: c.code === currency ? COLORS.goldSubtle : 'transparent',
                }}
              >
                <span className="font-body text-[13px]">{c.symbol}</span>
                <span className="font-body text-[11px] tracking-wider">{c.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>

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

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI']

function MobileOverlay({ links, pathname, favoritesCount, onClose, currency, setCurrency, currencies }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 z-40 md:hidden" onClick={onClose}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundColor: 'rgba(12, 10, 8, 0.6)',
          backdropFilter: 'blur(4px)',
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Side Panel */}
      <div
        className="absolute top-0 right-0 h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '75vw',
          maxWidth: 320,
          backgroundColor: 'rgba(12, 10, 8, 0.97)',
          borderLeft: `3px solid ${COLORS.gold}`,
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.45s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* Close button */}
        <div className="flex justify-end px-5 pt-6">
          <button onClick={onClose} style={{ color: COLORS.creamDim }}>
            <X size={22} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 flex flex-col justify-center px-8 gap-7">
          {links.map(({ to, label }, i) => {
            const isActive = pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className="flex items-baseline gap-4 group"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(24px)',
                  transition: `opacity 0.4s ease ${i * 80 + 200}ms, transform 0.4s ease ${i * 80 + 200}ms`,
                }}
              >
                <span
                  className="font-display text-[11px] tracking-[0.2em]"
                  style={{ color: isActive ? COLORS.gold : 'rgba(176, 141, 87, 0.35)', minWidth: 28 }}
                >
                  {ROMAN[i]}
                </span>
                <span
                  className="font-display text-2xl italic tracking-[0.08em]"
                  style={{ color: isActive ? COLORS.cream : COLORS.creamHalf }}
                >
                  {label}
                </span>
                {isActive && (
                  <div
                    className="flex-1 h-px ml-2"
                    style={{ backgroundColor: 'rgba(176, 141, 87, 0.25)', marginTop: 2 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-8 pb-10">
          {/* Gold divider */}
          <div className="flex items-center mb-6">
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(176, 141, 87, 0.2)' }} />
            <span className="mx-3" style={{ fontSize: '8px', color: 'rgba(176, 141, 87, 0.4)' }}>◆</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(176, 141, 87, 0.2)' }} />
          </div>

          <Link
            to="/favorites"
            className="flex items-center gap-2 mb-8"
            style={{
              color: COLORS.goldFaded,
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.4s ease 550ms',
            }}
          >
            <Heart size={14} />
            <span className="font-body text-[12px] tracking-[0.2em] uppercase">
              Избранное
            </span>
            {favoritesCount > 0 && (
              <span
                className="ml-1 w-5 h-5 flex items-center justify-center rounded-full font-body text-[9px] font-semibold"
                style={{ backgroundColor: 'rgba(176, 141, 87, 0.2)', color: COLORS.gold }}
              >
                {favoritesCount}
              </span>
            )}
          </Link>

          {/* Currency selector */}
          <div
            className="mb-6"
            style={{
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.4s ease 600ms',
            }}
          >
            <span
              className="font-body text-[9px] tracking-[0.2em] uppercase block mb-2"
              style={{ color: 'rgba(176, 141, 87, 0.35)' }}
            >
              Валюта
            </span>
            <div className="flex gap-2">
              {currencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className="px-2.5 py-1 font-body text-[11px] tracking-[0.1em] transition-colors duration-200"
                  style={{
                    color: c.code === currency ? COLORS.gold : 'rgba(176, 141, 87, 0.35)',
                    backgroundColor: c.code === currency ? 'rgba(176, 141, 87, 0.15)' : 'transparent',
                    borderRadius: '1px',
                    border: c.code === currency ? '1px solid rgba(176, 141, 87, 0.25)' : '1px solid transparent',
                  }}
                >
                  {c.symbol} {c.code}
                </button>
              ))}
            </div>
          </div>

          {/* Branding */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.4s ease 700ms',
            }}
          >
            <span
              className="font-display text-[13px] tracking-[0.3em] uppercase block"
              style={{ color: 'rgba(176, 141, 87, 0.3)' }}
            >
              Galerie
            </span>
            <span
              className="font-display text-[10px] italic tracking-[0.2em]"
              style={{ color: 'rgba(176, 141, 87, 0.2)' }}
            >
              du Temps
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
