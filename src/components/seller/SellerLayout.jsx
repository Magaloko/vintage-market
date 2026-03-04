import { useState } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Plus,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Store,
} from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'

const NAV_LINKS = [
  { to: '/seller', icon: LayoutDashboard, label: 'Панель', end: true },
  { to: '/seller/products', icon: Package, label: 'Мои товары' },
  { to: '/seller/products/new', icon: Plus, label: 'Добавить товар' },
  { to: '/seller/inquiries', icon: MessageSquare, label: 'Запросы' },
  { to: '/seller/profile', icon: Store, label: 'Мой магазин' },
]

const COLORS = {
  pageBg: '#0C0A08',
  sidebarBg: '#1A1410',
  sidebarText: '#F0E6D6',
  gold: '#B08D57',
  goldMuted: 'rgba(176, 141, 87, 0.4)',
  sidebarBorder: 'rgba(176, 141, 87, 0.08)',
  textFaint: 'rgba(240, 230, 214, 0.3)',
  logoutColor: 'rgba(181, 115, 106, 0.6)',
  overlayBg: 'rgba(0, 0, 0, 0.5)',
}

function MobileMenuButton({ isOpen, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 flex items-center justify-center"
      style={{
        backgroundColor: COLORS.sidebarBg,
        color: COLORS.sidebarText,
        borderRadius: '2px',
      }}
    >
      {isOpen ? <X size={18} /> : <Menu size={18} />}
    </button>
  )
}

function SidebarHeader() {
  return (
    <div className="p-6">
      <Link to="/" className="block">
        <p className="font-display text-sm tracking-[0.15em] uppercase" style={{ color: COLORS.gold }}>
          Galerie
        </p>
        <p className="font-display text-[10px] italic" style={{ color: COLORS.goldMuted }}>
          du Temps — Seller
        </p>
      </Link>
    </div>
  )
}

function SidebarNav({ links, onLinkClick }) {
  return (
    <nav className="flex-1 px-3 space-y-1">
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

function SidebarFooter({ onLinkClick, onLogout }) {
  return (
    <div className="p-3 space-y-1" style={{ borderTop: `1px solid ${COLORS.sidebarBorder}` }}>
      <Link
        to="/"
        onClick={onLinkClick}
        className="admin-sidebar-link"
        style={{ color: COLORS.textFaint }}
      >
        <Store size={18} />
        На сайт
      </Link>
      <button
        onClick={onLogout}
        className="admin-sidebar-link w-full"
        style={{ color: COLORS.logoutColor }}
      >
        <LogOut size={18} />
        Выйти
      </button>
    </div>
  )
}

export default function SellerLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: COLORS.pageBg }}>
      <MobileMenuButton isOpen={sidebarOpen} onToggle={() => setSidebarOpen((prev) => !prev)} />

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen w-64
          flex flex-col z-40 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          backgroundColor: COLORS.sidebarBg,
          borderRight: `1px solid ${COLORS.sidebarBorder}`,
        }}
      >
        <SidebarHeader />
        <SidebarNav links={NAV_LINKS} onLinkClick={closeSidebar} />
        <SidebarFooter onLinkClick={closeSidebar} onLogout={handleLogout} />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ backgroundColor: COLORS.overlayBg }}
          onClick={closeSidebar}
        />
      )}

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
