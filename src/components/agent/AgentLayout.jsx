import { useState } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Headphones,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'

const SIDEBAR_LINKS = [
  { to: '/agent', icon: LayoutDashboard, label: 'Обзор', end: true },
  { to: '/agent/workspace', icon: Headphones, label: 'Рабочее место' },
]

const COLORS = {
  pageBg: '#F7F2EB',
  sidebarBg: '#FFFFFF',
  headerBg: 'rgba(255, 255, 255, 0.92)',
  accent: '#4A8B6E',
  accentMuted: 'rgba(74, 139, 110, 0.5)',
  accentSubtle: 'rgba(74, 139, 110, 0.6)',
  accentBg: 'rgba(74, 139, 110, 0.08)',
  accentBorder: 'rgba(74, 139, 110, 0.2)',
  accentLogoBg: 'rgba(74, 139, 110, 0.1)',
  accentLogoBorder: 'rgba(74, 139, 110, 0.25)',
  gold: '#B08D57',
  goldMuted: 'rgba(176, 141, 87, 0.5)',
  textDark: '#2C2420',
  textMuted: 'rgba(44, 36, 32, 0.5)',
  textDim: 'rgba(44, 36, 32, 0.4)',
  textFaint: 'rgba(44, 36, 32, 0.35)',
  divider: 'rgba(74, 139, 110, 0.1)',
  overlayBg: 'rgba(44, 36, 32, 0.3)',
}

function SidebarHeader({ onClose }) {
  return (
    <div className="p-6 flex items-center justify-between">
      <Link to="/agent" className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-btn flex items-center justify-center"
          style={{
            backgroundColor: COLORS.accentLogoBg,
            border: `1px solid ${COLORS.accentLogoBorder}`,
          }}
        >
          <span className="font-display text-sm font-bold" style={{ color: COLORS.accent }}>
            A
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
            style={{ color: COLORS.accentSubtle }}
          >
            Агент
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
          className={({ isActive }) =>
            `agent-sidebar-link flex items-center gap-3 px-3 py-2.5 font-sans text-sm transition-all duration-200 ${isActive ? 'active' : ''}`
          }
          style={({ isActive }) => ({
            color: isActive ? COLORS.accent : COLORS.textMuted,
            backgroundColor: isActive ? COLORS.accentBg : 'transparent',
            borderRadius: '2px',
            fontWeight: isActive ? 500 : 400,
          })}
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
      <Link
        to="/"
        className="flex items-center gap-3 px-3 py-2.5 font-sans text-sm transition-colors"
        style={{ color: COLORS.textFaint }}
      >
        <ChevronLeft size={18} />
        На сайт
      </Link>
      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-3 py-2.5 font-sans text-sm w-full transition-colors"
        style={{ color: COLORS.accentSubtle }}
      >
        <LogOut size={18} />
        Выйти
      </button>
    </div>
  )
}

export default function AgentLayout() {
  const { signOut } = useAuth()
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
              Рабочее место агента
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
