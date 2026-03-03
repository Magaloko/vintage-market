<<<<<<< HEAD
import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Search, Heart, User, LogOut, LogIn, UserPlus, ChevronDown } from 'lucide-react'
import { useFavorites } from '../../lib/FavoritesContext'
import { useCompare } from '../../lib/CompareContext'
import { useAuth } from '../../lib/AuthContext'
import toast from 'react-hot-toast'

const navLinks = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/favorites', label: 'Избранное', isFav: true },
  { to: '/compare', label: 'Сравнение', isCompare: true },
  { to: '/about', label: 'О нас' },
  { to: '/contact', label: 'Контакты' },
]

function GoogleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [authDropdown, setAuthDropdown] = useState(false)
  const [authMode, setAuthMode] = useState(null)
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const dropdownRef = useRef(null)

  const { favoritesCount } = useFavorites()
  const { compareCount } = useCompare()
  const { user, signIn, signUp, signInWithGoogle, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAuthDropdown(false)
        setAuthMode(null)
        setAuthError('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle()
    if (error) toast.error(error.message)
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    if (authMode === 'login') {
      const { error } = await signIn(authForm.email, authForm.password)
      if (error) {
        setAuthError(error.message)
      } else {
        setAuthDropdown(false)
        setAuthMode(null)
        setAuthForm({ email: '', password: '' })
        toast.success('Вы вошли в аккаунт')
      }
    } else {
      const { error } = await signUp(authForm.email, authForm.password)
      if (error) {
        setAuthError(error.message)
      } else {
        setAuthDropdown(false)
        setAuthMode(null)
        setAuthForm({ email: '', password: '' })
        toast.success('Проверьте email для подтверждения')
      }
    }
    setAuthLoading(false)
  }

  const handleLogout = async () => {
    await signOut()
    setAuthDropdown(false)
    toast.success('Вы вышли из аккаунта')
  }

  const userDisplayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Аккаунт'
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture

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
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `relative font-sans text-sm tracking-wider uppercase transition-colors duration-200 flex items-center gap-1.5 ${isActive ? 'font-medium' : ''}`
                }
                style={({ isActive }) => ({
                  color: isActive ? '#B89A5A' : 'rgba(242, 237, 227, 0.5)',
                })}
                onMouseEnter={e => { if (e.currentTarget.getAttribute('aria-current') !== 'page') e.currentTarget.style.color = '#F2EDE3' }}
                onMouseLeave={e => { if (e.currentTarget.getAttribute('aria-current') !== 'page') e.currentTarget.style.color = 'rgba(242, 237, 227, 0.5)' }}
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 transition-colors"
              style={{ color: 'rgba(242, 237, 227, 0.5)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#F2EDE3'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(242, 237, 227, 0.5)'}
            >
              <Search size={18} />
            </button>

            <Link to="/favorites" className="lg:hidden relative p-2 transition-colors"
              style={{ color: 'rgba(242, 237, 227, 0.5)' }}>
              <Heart size={18} />
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-medium rounded-full"
                  style={{ backgroundColor: '#C2642C', color: '#F2EDE3' }}>
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Auth Button / User Menu */}
            <div className="relative" ref={dropdownRef}>
              {user ? (
                <button
                  onClick={() => setAuthDropdown(!authDropdown)}
                  className="flex items-center gap-2 p-1.5 pl-2 transition-colors"
                  style={{ borderRadius: '6px', backgroundColor: authDropdown ? 'rgba(242, 237, 227, 0.08)' : 'transparent' }}
                >
                  {userAvatar ? (
                    <img src={userAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(184, 154, 90, 0.2)' }}>
                      <User size={14} style={{ color: '#B89A5A' }} />
                    </div>
                  )}
                  <span className="hidden md:block font-sans text-xs max-w-[100px] truncate"
                    style={{ color: 'rgba(242, 237, 227, 0.7)' }}>
                    {userDisplayName}
                  </span>
                  <ChevronDown size={12} style={{ color: 'rgba(242, 237, 227, 0.3)' }}
                    className={`transition-transform ${authDropdown ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <button
                  onClick={() => { setAuthDropdown(!authDropdown); setAuthMode(null); setAuthError('') }}
                  className="flex items-center gap-2 px-3 py-2 font-sans text-xs tracking-wider uppercase transition-all"
                  style={{ color: '#F2EDE3', backgroundColor: 'rgba(194, 100, 44, 0.8)', borderRadius: '6px' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#C2642C'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(194, 100, 44, 0.8)'}
                >
                  <User size={14} />
                  <span className="hidden md:inline">Войти</span>
                </button>
              )}

              {/* Auth Dropdown */}
              {authDropdown && (
                <div className="absolute right-0 top-full mt-2 w-72 animate-fade-in z-50"
                  style={{ backgroundColor: '#0E1A2B', border: '1px solid rgba(242, 237, 227, 0.1)', borderRadius: '6px', boxShadow: '0 12px 36px rgba(0,0,0,0.4)' }}>

                  {user ? (
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid rgba(242, 237, 227, 0.06)' }}>
                        {userAvatar ? (
                          <img src={userAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(184, 154, 90, 0.15)' }}>
                            <User size={18} style={{ color: '#B89A5A' }} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-sans text-sm font-medium truncate" style={{ color: '#F2EDE3' }}>{userDisplayName}</p>
                          <p className="font-sans text-xs truncate" style={{ color: 'rgba(242, 237, 227, 0.35)' }}>{user.email}</p>
                        </div>
                      </div>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 font-sans text-sm transition-colors"
                        style={{ color: 'rgba(242, 237, 227, 0.5)', borderRadius: '6px' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(194, 100, 44, 0.1)'; e.currentTarget.style.color = '#D4784A' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(242, 237, 227, 0.5)' }}
                      >
                        <LogOut size={16} />
                        Выйти
                      </button>
                    </div>

                  ) : authMode ? (
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-sans text-sm font-medium" style={{ color: '#F2EDE3' }}>
                          {authMode === 'login' ? 'Вход' : 'Регистрация'}
                        </h3>
                        <button onClick={() => { setAuthMode(null); setAuthError('') }}
                          className="p-1" style={{ color: 'rgba(242, 237, 227, 0.3)' }}>
                          <X size={14} />
                        </button>
                      </div>

                      {authError && (
                        <div className="mb-3 p-2.5 font-sans text-xs"
                          style={{ backgroundColor: 'rgba(194, 100, 44, 0.1)', border: '1px solid rgba(194, 100, 44, 0.2)', borderRadius: '6px', color: '#D4784A' }}>
                          {authError}
                        </div>
                      )}

                      <form onSubmit={handleEmailSubmit} className="space-y-3">
                        <input type="email" value={authForm.email}
                          onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                          required placeholder="Email" className="vintage-input-dark text-xs" />
                        <input type="password" value={authForm.password}
                          onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                          required minLength={6} placeholder="Пароль" className="vintage-input-dark text-xs" />
                        <button type="submit" disabled={authLoading}
                          className="w-full py-2.5 font-sans text-xs font-medium tracking-wider uppercase transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          style={{ backgroundColor: '#C2642C', color: '#F2EDE3', borderRadius: '6px' }}>
                          {authLoading ? (
                            <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(242,237,227,0.2)', borderTopColor: '#F2EDE3' }} />
                          ) : (
                            <>{authMode === 'login' ? <LogIn size={14} /> : <UserPlus size={14} />}
                              {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}</>
                          )}
                        </button>
                      </form>

                      <div className="flex items-center gap-3 my-3">
                        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(242, 237, 227, 0.06)' }} />
                        <span className="font-sans text-[10px] uppercase tracking-wider" style={{ color: 'rgba(242, 237, 227, 0.2)' }}>или</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(242, 237, 227, 0.06)' }} />
                      </div>

                      <button onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-2 py-2.5 font-sans text-xs font-medium transition-all"
                        style={{ backgroundColor: 'rgba(242, 237, 227, 0.05)', border: '1px solid rgba(242, 237, 227, 0.1)', borderRadius: '6px', color: 'rgba(242, 237, 227, 0.7)' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(242, 237, 227, 0.1)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(242, 237, 227, 0.05)'}
                      >
                        <GoogleIcon size={16} />
                        Продолжить с Google
                      </button>

                      <p className="mt-3 text-center font-sans text-xs" style={{ color: 'rgba(242, 237, 227, 0.3)' }}>
                        {authMode === 'login' ? (
                          <>Нет аккаунта?{' '}<button onClick={() => { setAuthMode('register'); setAuthError('') }} className="underline" style={{ color: '#B89A5A' }}>Регистрация</button></>
                        ) : (
                          <>Уже есть аккаунт?{' '}<button onClick={() => { setAuthMode('login'); setAuthError('') }} className="underline" style={{ color: '#B89A5A' }}>Войти</button></>
                        )}
                      </p>
                    </div>

                  ) : (
                    <div className="p-4 space-y-2">
                      <button onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 py-3 font-sans text-sm font-medium transition-all"
                        style={{ backgroundColor: 'rgba(242, 237, 227, 0.06)', border: '1px solid rgba(242, 237, 227, 0.1)', borderRadius: '6px', color: 'rgba(242, 237, 227, 0.8)' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(242, 237, 227, 0.1)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(242, 237, 227, 0.06)'}
                      >
                        <GoogleIcon size={18} />
                        Войти через Google
                      </button>

                      <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(242, 237, 227, 0.06)' }} />
                        <span className="font-sans text-[10px] uppercase tracking-wider" style={{ color: 'rgba(242, 237, 227, 0.2)' }}>или</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(242, 237, 227, 0.06)' }} />
                      </div>

                      <button onClick={() => setAuthMode('login')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 font-sans text-xs font-medium tracking-wider uppercase transition-all"
                        style={{ backgroundColor: '#C2642C', color: '#F2EDE3', borderRadius: '6px' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#A45322'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#C2642C'}
                      >
                        <LogIn size={14} />
                        Войти по Email
                      </button>

                      <button onClick={() => setAuthMode('register')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 font-sans text-xs font-medium tracking-wider uppercase transition-all"
                        style={{ backgroundColor: 'transparent', color: 'rgba(242, 237, 227, 0.5)', border: '1px solid rgba(242, 237, 227, 0.1)', borderRadius: '6px' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(242, 237, 227, 0.25)'; e.currentTarget.style.color = '#F2EDE3' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(242, 237, 227, 0.1)'; e.currentTarget.style.color = 'rgba(242, 237, 227, 0.5)' }}
                      >
                        <UserPlus size={14} />
                        Регистрация
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button className="lg:hidden p-2" style={{ color: 'rgba(242, 237, 227, 0.5)' }}
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4 animate-fade-in">
            <form onSubmit={(e) => { e.preventDefault(); const q = e.target.elements.search.value; if (q.trim()) { navigate(`/catalog?search=${encodeURIComponent(q)}`); setSearchOpen(false) } }}>
              <input name="search" type="text" placeholder="Поиск по каталогу..." className="vintage-input-dark" autoFocus />
            </form>
          </div>
        )}

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="lg:hidden pb-6 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map(link => (
                <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 font-sans text-sm tracking-wider uppercase transition-colors flex items-center gap-2"
                  style={({ isActive }) => ({ backgroundColor: isActive ? 'rgba(194, 100, 44, 0.15)' : 'transparent', color: isActive ? '#D4784A' : 'rgba(242, 237, 227, 0.5)', borderRadius: '6px' })}>
                  {link.isFav && <Heart size={14} />}
                  {link.label}
                  {link.isFav && favoritesCount > 0 && (
                    <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-medium rounded-full"
                      style={{ backgroundColor: '#C2642C', color: '#F2EDE3' }}>{favoritesCount}</span>
                  )}
                </NavLink>
              ))}

              {/* Mobile auth */}
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(242, 237, 227, 0.06)' }}>
                {user ? (
                  <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {userAvatar ? <img src={userAvatar} alt="" className="w-7 h-7 rounded-full" /> : <User size={16} style={{ color: '#B89A5A' }} />}
                      <span className="font-sans text-sm truncate" style={{ color: 'rgba(242, 237, 227, 0.7)' }}>{userDisplayName}</span>
                    </div>
                    <button onClick={handleLogout} className="font-sans text-xs" style={{ color: 'rgba(194, 100, 44, 0.6)' }}>Выйти</button>
                  </div>
                ) : (
                  <div className="px-4 space-y-2">
                    <button onClick={() => { handleGoogleLogin(); setMobileOpen(false) }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 font-sans text-xs transition-all"
                      style={{ backgroundColor: 'rgba(242, 237, 227, 0.06)', border: '1px solid rgba(242, 237, 227, 0.1)', borderRadius: '6px', color: 'rgba(242, 237, 227, 0.7)' }}>
                      <GoogleIcon size={16} /> Войти через Google
                    </button>
                    <button onClick={() => { setAuthDropdown(true); setAuthMode('login'); setMobileOpen(false) }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 font-sans text-xs tracking-wider uppercase"
                      style={{ backgroundColor: '#C2642C', color: '#F2EDE3', borderRadius: '6px' }}>
                      <LogIn size={14} /> Войти по Email
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
      <div className="section-gold-line" />
    </header>
  )
}
=======
import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Search, Heart, User, LogOut, LogIn, UserPlus, ChevronDown } from 'lucide-react'
import { useFavorites } from '../../lib/FavoritesContext'
import { useCompare } from '../../lib/CompareContext'
import { useAuth } from '../../lib/AuthContext'
import toast from 'react-hot-toast'

const navLinks = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/favorites', label: 'Избранное', isFav: true },
  { to: '/compare', label: 'Сравнение', isCompare: true },
  { to: '/about', label: 'О нас' },
  { to: '/contact', label: 'Контакты' },
]

function GoogleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [authDropdown, setAuthDropdown] = useState(false)
  const [authMode, setAuthMode] = useState(null)
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const dropdownRef = useRef(null)

  const { favoritesCount } = useFavorites()
  const { compareCount } = useCompare()
  const { user, signIn, signUp, signInWithGoogle, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAuthDropdown(false)
        setAuthMode(null)
        setAuthError('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle()
    if (error) toast.error(error.message)
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    if (authMode === 'login') {
      const { error } = await signIn(authForm.email, authForm.password)
      if (error) {
        setAuthError(error.message)
      } else {
        setAuthDropdown(false)
        setAuthMode(null)
        setAuthForm({ email: '', password: '' })
        toast.success('Вы вошли в аккаунт')
      }
    } else {
      const { error } = await signUp(authForm.email, authForm.password)
      if (error) {
        setAuthError(error.message)
      } else {
        setAuthDropdown(false)
        setAuthMode(null)
        setAuthForm({ email: '', password: '' })
        toast.success('Проверьте email для подтверждения')
      }
    }
    setAuthLoading(false)
  }

  const handleLogout = async () => {
    await signOut()
    setAuthDropdown(false)
    toast.success('Вы вышли из аккаунта')
  }

  const userDisplayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Аккаунт'
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture

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
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `relative font-sans text-sm tracking-wider uppercase transition-colors duration-200 flex items-center gap-1.5 ${isActive ? 'font-medium' : ''}`
                }
                style={({ isActive }) => ({
                  color: isActive ? '#B89A5A' : 'rgba(242, 237, 227, 0.5)',
                })}
                onMouseEnter={e => { if (e.currentTarget.getAttribute('aria-current') !== 'page') e.currentTarget.style.color = '#F2EDE3' }}
                onMouseLeave={e => { if (e.currentTarget.getAttribute('aria-current') !== 'page') e.currentTarget.style.color = 'rgba(242, 237, 227, 0.5)' }}
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 transition-colors"
              style={{ color: 'rgba(242, 237, 227, 0.5)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#F2EDE3'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(242, 237, 227, 0.5)'}
            >
              <Search size={18} />
            </button>

            <Link to="/favorites" className="lg:hidden relative p-2 transition-colors"
              style={{ color: 'rgba(242, 237, 227, 0.5)' }}>
              <Heart size={18} />
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-medium rounded-full"
                  style={{ backgroundColor: '#C2642C', color: '#F2EDE3' }}>
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Auth Button / User Menu */}
            <div className="relative" ref={dropdownRef}>
              {user ? (
                <button
                  onClick={() => setAuthDropdown(!authDropdown)}
                  className="flex items-center gap-2 p-1.5 pl-2 transition-colors"
                  style={{ borderRadius: '6px', backgroundColor: authDropdown ? 'rgba(242, 237, 227, 0.08)' : 'transparent' }}
                >
                  {userAvatar ? (
                    <img src={userAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(184, 154, 90, 0.2)' }}>
                      <User size={14} style={{ color: '#B89A5A' }} />
                    </div>
                  )}
                  <span className="hidden md:block font-sans text-xs max-w-[100px] truncate"
                    style={{ color: 'rgba(242, 237, 227, 0.7)' }}>
                    {userDisplayName}
                  </span>
                  <ChevronDown size={12} style={{ color: 'rgba(242, 237, 227, 0.3)' }}
                    className={`transition-transform ${authDropdown ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <button
                  onClick={() => { setAuthDropdown(!authDropdown); setAuthMode(null); setAuthError('') }}
                  className="flex items-center gap-2 px-3 py-2 font-sans text-xs tracking-wider uppercase transition-all"
                  style={{ color: '#F2EDE3', backgroundColor: 'rgba(194, 100, 44, 0.8)', borderRadius: '6px' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#C2642C'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(194, 100, 44, 0.8)'}
                >
                  <User size={14} />
                  <span className="hidden md:inline">Войти</span>
                </button>
              )}

              {/* Auth Dropdown */}
              {authDropdown && (
                <div className="absolute right-0 top-full mt-2 w-72 animate-fade-in z-50"
                  style={{ backgroundColor: '#0E1A2B', border: '1px solid rgba(242, 237, 227, 0.1)', borderRadius: '6px', boxShadow: '0 12px 36px rgba(0,0,0,0.4)' }}>

                  {user ? (
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid rgba(242, 237, 227, 0.06)' }}>
                        {userAvatar ? (
                          <img src={userAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(184, 154, 90, 0.15)' }}>
                            <User size={18} style={{ color: '#B89A5A' }} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-sans text-sm font-medium truncate" style={{ color: '#F2EDE3' }}>{userDisplayName}</p>
                          <p className="font-sans text-xs truncate" style={{ color: 'rgba(242, 237, 227, 0.35)' }}>{user.email}</p>
                        </div>
                      </div>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 font-sans text-sm transition-colors"
                        style={{ color: 'rgba(242, 237, 227, 0.5)', borderRadius: '6px' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(194, 100, 44, 0.1)'; e.currentTarget.style.color = '#D4784A' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(242, 237, 227, 0.5)' }}
                      >
                        <LogOut size={16} />
                        Выйти
                      </button>
                    </div>

                  ) : authMode ? (
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-sans text-sm font-medium" style={{ color: '#F2EDE3' }}>
                          {authMode === 'login' ? 'Вход' : 'Регистрация'}
                        </h3>
                        <button onClick={() => { setAuthMode(null); setAuthError('') }}
                          className="p-1" style={{ color: 'rgba(242, 237, 227, 0.3)' }}>
                          <X size={14} />
                        </button>
                      </div>

                      {authError && (
                        <div className="mb-3 p-2.5 font-sans text-xs"
                          style={{ backgroundColor: 'rgba(194, 100, 44, 0.1)', border: '1px solid rgba(194, 100, 44, 0.2)', borderRadius: '6px', color: '#D4784A' }}>
                          {authError}
                        </div>
                      )}

                      <form onSubmit={handleEmailSubmit} className="space-y-3">
                        <input type="email" value={authForm.email}
                          onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                          required placeholder="Email" className="vintage-input-dark text-xs" />
                        <input type="password" value={authForm.password}
                          onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                          required minLength={6} placeholder="Пароль" className="vintage-input-dark text-xs" />
                        <button type="submit" disabled={authLoading}
                          className="w-full py-2.5 font-sans text-xs font-medium tracking-wider uppercase transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          style={{ backgroundColor: '#C2642C', color: '#F2EDE3', borderRadius: '6px' }}>
                          {authLoading ? (
                            <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(242,237,227,0.2)', borderTopColor: '#F2EDE3' }} />
                          ) : (
                            <>{authMode === 'login' ? <LogIn size={14} /> : <UserPlus size={14} />}
                              {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}</>
                          )}
                        </button>
                      </form>

                      <div className="flex items-center gap-3 my-3">
                        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(242, 237, 227, 0.06)' }} />
                        <span className="font-sans text-[10px] uppercase tracking-wider" style={{ color: 'rgba(242, 237, 227, 0.2)' }}>или</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(242, 237, 227, 0.06)' }} />
                      </div>

                      <button onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-2 py-2.5 font-sans text-xs font-medium transition-all"
                        style={{ backgroundColor: 'rgba(242, 237, 227, 0.05)', border: '1px solid rgba(242, 237, 227, 0.1)', borderRadius: '6px', color: 'rgba(242, 237, 227, 0.7)' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(242, 237, 227, 0.1)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(242, 237, 227, 0.05)'}
                      >
                        <GoogleIcon size={16} />
                        Продолжить с Google
                      </button>

                      <p className="mt-3 text-center font-sans text-xs" style={{ color: 'rgba(242, 237, 227, 0.3)' }}>
                        {authMode === 'login' ? (
                          <>Нет аккаунта?{' '}<button onClick={() => { setAuthMode('register'); setAuthError('') }} className="underline" style={{ color: '#B89A5A' }}>Регистрация</button></>
                        ) : (
                          <>Уже есть аккаунт?{' '}<button onClick={() => { setAuthMode('login'); setAuthError('') }} className="underline" style={{ color: '#B89A5A' }}>Войти</button></>
                        )}
                      </p>
                    </div>

                  ) : (
                    <div className="p-4 space-y-2">
                      <button onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 py-3 font-sans text-sm font-medium transition-all"
                        style={{ backgroundColor: 'rgba(242, 237, 227, 0.06)', border: '1px solid rgba(242, 237, 227, 0.1)', borderRadius: '6px', color: 'rgba(242, 237, 227, 0.8)' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(242, 237, 227, 0.1)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(242, 237, 227, 0.06)'}
                      >
                        <GoogleIcon size={18} />
                        Войти через Google
                      </button>

                      <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(242, 237, 227, 0.06)' }} />
                        <span className="font-sans text-[10px] uppercase tracking-wider" style={{ color: 'rgba(242, 237, 227, 0.2)' }}>или</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(242, 237, 227, 0.06)' }} />
                      </div>

                      <button onClick={() => setAuthMode('login')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 font-sans text-xs font-medium tracking-wider uppercase transition-all"
                        style={{ backgroundColor: '#C2642C', color: '#F2EDE3', borderRadius: '6px' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#A45322'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#C2642C'}
                      >
                        <LogIn size={14} />
                        Войти по Email
                      </button>

                      <button onClick={() => setAuthMode('register')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 font-sans text-xs font-medium tracking-wider uppercase transition-all"
                        style={{ backgroundColor: 'transparent', color: 'rgba(242, 237, 227, 0.5)', border: '1px solid rgba(242, 237, 227, 0.1)', borderRadius: '6px' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(242, 237, 227, 0.25)'; e.currentTarget.style.color = '#F2EDE3' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(242, 237, 227, 0.1)'; e.currentTarget.style.color = 'rgba(242, 237, 227, 0.5)' }}
                      >
                        <UserPlus size={14} />
                        Регистрация
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button className="lg:hidden p-2" style={{ color: 'rgba(242, 237, 227, 0.5)' }}
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4 animate-fade-in">
            <form onSubmit={(e) => { e.preventDefault(); const q = e.target.elements.search.value; if (q.trim()) window.location.href = `/catalog?search=${encodeURIComponent(q)}` }}>
              <input name="search" type="text" placeholder="Поиск по каталогу..." className="vintage-input-dark" autoFocus />
            </form>
          </div>
        )}

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="lg:hidden pb-6 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map(link => (
                <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 font-sans text-sm tracking-wider uppercase transition-colors flex items-center gap-2"
                  style={({ isActive }) => ({ backgroundColor: isActive ? 'rgba(194, 100, 44, 0.15)' : 'transparent', color: isActive ? '#D4784A' : 'rgba(242, 237, 227, 0.5)', borderRadius: '6px' })}>
                  {link.isFav && <Heart size={14} />}
                  {link.label}
                  {link.isFav && favoritesCount > 0 && (
                    <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-medium rounded-full"
                      style={{ backgroundColor: '#C2642C', color: '#F2EDE3' }}>{favoritesCount}</span>
                  )}
                </NavLink>
              ))}

              {/* Mobile auth */}
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(242, 237, 227, 0.06)' }}>
                {user ? (
                  <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {userAvatar ? <img src={userAvatar} alt="" className="w-7 h-7 rounded-full" /> : <User size={16} style={{ color: '#B89A5A' }} />}
                      <span className="font-sans text-sm truncate" style={{ color: 'rgba(242, 237, 227, 0.7)' }}>{userDisplayName}</span>
                    </div>
                    <button onClick={handleLogout} className="font-sans text-xs" style={{ color: 'rgba(194, 100, 44, 0.6)' }}>Выйти</button>
                  </div>
                ) : (
                  <div className="px-4 space-y-2">
                    <button onClick={() => { handleGoogleLogin(); setMobileOpen(false) }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 font-sans text-xs transition-all"
                      style={{ backgroundColor: 'rgba(242, 237, 227, 0.06)', border: '1px solid rgba(242, 237, 227, 0.1)', borderRadius: '6px', color: 'rgba(242, 237, 227, 0.7)' }}>
                      <GoogleIcon size={16} /> Войти через Google
                    </button>
                    <button onClick={() => { setAuthDropdown(true); setAuthMode('login'); setMobileOpen(false) }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 font-sans text-xs tracking-wider uppercase"
                      style={{ backgroundColor: '#C2642C', color: '#F2EDE3', borderRadius: '6px' }}>
                      <LogIn size={14} /> Войти по Email
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
      <div className="section-gold-line" />
    </header>
  )
}
>>>>>>> d1c11eab00b0d51de132727e86796842253046a6
