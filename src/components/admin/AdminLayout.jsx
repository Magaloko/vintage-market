import { useState } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Plus,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  AlertTriangle,
  MessageSquare,
  Calculator,
  Layers,
} from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'

const SIDEBAR_LINKS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Панель управления', end: true },
  { to: '/admin/products', icon: Package, label: 'Товары' },
  { to: '/admin/products/new', icon: Plus, label: 'Добавить товар' },
  { to: '/admin/inquiries', icon: MessageSquare, label: 'Запросы' },
  { to: '/admin/categories', icon: Layers, label: 'Категории' },
  { to: '/admin/calculator', icon: Calculator, label: 'Калькулятор' },
]

const COLORS = {
  pageBg: '#0C0A08',
  gold: '#B08D57',
  goldMuted: 'rgba(176, 141, 87, 0.4)',
  goldSubtle: 'rgba(176, 141, 87, 0.5)',
  goldBadgeBg: 'rgba(176, 141, 87, 0.1)',
  goldBadgeBorder: 'rgba(176, 141, 87, 0.2)',
  goldBadgeText: '#C9A96E',
  goldLogoBg: 'rgba(176, 141, 87, 0.15)',
  goldLogoBorder: 'rgba(176, 141, 87, 0.3)',
  textLight: 'rgba(240, 230, 214, 0.7)',
  textMuted: 'rgba(240, 230, 214, 0.5)',
  textDim: 'rgba(240, 230, 214, 0.4)',
  textFaint: 'rgba(240, 230, 214, 0.3)',
  divider: 'rgba(240, 230, 214, 0.06)',
  headerBg: 'rgba(14, 26, 43, 0.95)',
  overlayBg: 'rgba(10, 18, 32, 0.7)',
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
  return (
    <nav className="flex-1 px-4 space-y-1">
      {links.map(({ to, icon: Icon, label, end }) => (
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
      ))}
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
        style={{ backgroundColor: COLORS.pageBg }}
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
            backdropFilter: 'blur(8px)',
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
            <h2 className="font-sans text-sm font-medium" style={{ color: COLORS.textLight }}>
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
