import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Plus,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  MessageSquare,
  Calculator,
  Layers,
  Upload,
  Users,
  BarChart3,
} from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'

const SIDEBAR_LINKS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Панель управления', end: true },
  { to: '/admin/analytics', icon: BarChart3, label: 'Аналитика' },
  {
    id: 'products',
    icon: Package,
    label: 'Товары',
    children: [
      { to: '/admin/products', icon: Package, label: 'Все товары' },
      { to: '/admin/products/new', icon: Plus, label: 'Новый товар' },
      { to: '/admin/products/bulk', icon: Upload, label: 'Массовый импорт' },
    ],
  },
  { to: '/admin/inquiries', icon: MessageSquare, label: 'Заявки' },
  { to: '/admin/categories', icon: Layers, label: 'Категории' },
  { to: '/admin/users', icon: Users, label: 'Пользователи' },
  { to: '/admin/calculator', icon: Calculator, label: 'Калькулятор' },
]

const COLORS = {
  pageBg: '#F7F2EB',
  sidebarBg: '#FFFFFF',
  headerBg: 'rgba(255, 255, 255, 0.92)',
  gold: '#B08D57',
  goldMuted: 'rgba(176, 141, 87, 0.5)',
  goldSubtle: 'rgba(176, 141, 87, 0.6)',
  goldBadgeBg: 'rgba(176, 141, 87, 0.08)',
  goldBadgeBorder: 'rgba(176, 141, 87, 0.2)',
  goldBadgeText: '#9B7E4A',
  goldLogoBg: 'rgba(176, 141, 87, 0.1)',
  goldLogoBorder: 'rgba(176, 141, 87, 0.25)',
  textDark: '#2C2420',
  textMuted: 'rgba(44, 36, 32, 0.5)',
  textDim: 'rgba(44, 36, 32, 0.4)',
  textFaint: 'rgba(44, 36, 32, 0.35)',
  divider: 'rgba(176, 141, 87, 0.1)',
  overlayBg: 'rgba(44, 36, 32, 0.3)',
}

function DemoBadge() {
  return (
    <div
      className="mx-4 mb-4 px-3 py-2"
      style={{
        backgroundColor: COLORS.goldBadgeBg,
        border: `1px solid ${COLORS.goldBadgeBorder}`,
        borderRadius: '2px',
      }}
    >
      <div className="flex items-center gap-2" style={{ color: COLORS.goldBadgeText }}>
        <AlertTriangle size={14} />
        <span className="font-sans text-xs">Демо-режим</span>
      </div>
    </div>
  )
}

function SidebarHeader({ onClose }) {
  return (
    <div className="p-6 flex items-center justify-between">
      <Link to="/admin" className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-btn flex items-center justify-center"
          style={{
            backgroundColor: COLORS.goldLogoBg,
            border: `1px solid ${COLORS.goldLogoBorder}`,
          }}
        >
          <span className="font-display text-sm font-bold" style={{ color: COLORS.gold }}>
            Э
          </span>
        </div>
        <div>
          <p className="font-display text-sm tracking-[0.15em] uppercase" style={{ color: COLORS.gold }}>
            Galerie
          </p>
          <p className="font-display text-[10px] italic" style={{ color: COLORS.goldMuted }}>
            du Temps
          </p>
          <p
            className="font-sans text-[9px] tracking-[0.2em] uppercase"
            style={{ color: COLORS.goldSubtle }}
          >
            Админ-панель
          </p>
        </div>
      </Link>
      <button onClick={onClose} className="lg:hidden" style={{ color: COLORS.textDim }}>
        <X size={18} />
      </button>
    </div>
  )
}

function SidebarNav({ links, onLinkClick }) {
  const location = useLocation()
  const [expanded, setExpanded] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vintage_admin_sidebar_expanded') || '{}') }
    catch { return {} }
  })

  // Auto-expand group if current URL matches a child
  useEffect(() => {
    let changed = false
    const next = { ...expanded }
    links.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(c =>
          location.pathname === c.to || location.pathname.startsWith(c.to + '/')
        )
        if (isChildActive && !next[item.id]) {
          next[item.id] = true
          changed = true
        }
      }
    })
    if (changed) {
      setExpanded(next)
      localStorage.setItem('vintage_admin_sidebar_expanded', JSON.stringify(next))
    }
  }, [location.pathname])

  const toggle = (id) => {
    setExpanded(prev => {
      const next = { ...prev, [id]: !prev[id] }
      localStorage.setItem('vintage_admin_sidebar_expanded', JSON.stringify(next))
      return next
    })
  }

  return (
    <nav className="flex-1 px-4 space-y-1">
      {links.map(item => {
        if (item.children) {
          const Icon = item.icon
          const isOpen = !!expanded[item.id]
          const isChildActive = item.children.some(c =>
            location.pathname === c.to || location.pathname.startsWith(c.to + '/')
          )
          return (
            <div key={item.id}>
              <button
                onClick={() => toggle(item.id)}
                className={`admin-sidebar-link w-full ${isChildActive ? 'active' : ''}`}
                style={{ justifyContent: 'space-between' }}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.label}
                </span>
                {isOpen
                  ? <ChevronDown size={14} style={{ opacity: 0.4 }} />
                  : <ChevronRight size={14} style={{ opacity: 0.4 }} />
                }
              </button>
              <div
                className="overflow-hidden transition-all duration-200"
                style={{
                  maxHeight: isOpen ? `${item.children.length * 44}px` : '0px',
                  opacity: isOpen ? 1 : 0,
                }}
              >
                {item.children.map(child => {
                  const ChildIcon = child.icon
                  return (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      end
                      onClick={onLinkClick}
                      className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}
                      style={{ paddingLeft: '2.75rem', fontSize: '0.8125rem' }}
                    >
                      <ChildIcon size={15} />
                      {child.label}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          )
        }
        const { to, icon: Icon, label, end } = item
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onLinkClick}
            className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        )
      })}
    </nav>
  )
}

function SidebarFooter({ onLogout }) {
  return (
    <div className="p-4 space-y-2" style={{ borderTop: `1px solid ${COLORS.divider}` }}>
      <Link to="/" className="admin-sidebar-link" style={{ color: COLORS.textFaint }}>
        <ChevronLeft size={18} />
        На сайт
      </Link>
      <button
        onClick={onLogout}
        className="admin-sidebar-link w-full"
        style={{ color: COLORS.goldSubtle }}
      >
        <LogOut size={18} />
        Выйти
      </button>
    </div>
  )
}

export default function AdminLayout() {
  const { signOut, isDemoMode } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: COLORS.pageBg }}>
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static
        `}
        style={{
          backgroundColor: COLORS.sidebarBg,
          borderRight: `1px solid ${COLORS.divider}`,
        }}
      >
        <div className="flex flex-col h-full">
          <SidebarHeader onClose={closeSidebar} />
          {isDemoMode && <DemoBadge />}
          <SidebarNav links={SIDEBAR_LINKS} onLinkClick={closeSidebar} />
          <SidebarFooter onLogout={handleLogout} />
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: COLORS.overlayBg }}
          onClick={closeSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header
          className="sticky top-0 z-30 px-6 py-4"
          style={{
            backgroundColor: COLORS.headerBg,
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${COLORS.divider}`,
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
              style={{ color: COLORS.textMuted }}
            >
              <Menu size={20} />
            </button>
            <h2 className="font-sans text-sm font-medium" style={{ color: COLORS.textDark }}>
              Панель управления
            </h2>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
