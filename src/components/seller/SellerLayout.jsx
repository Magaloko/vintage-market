import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { LayoutDashboard, Package, Plus, LogOut, Menu, X, MessageSquare, Store, BarChart3 } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'

const navLinks = [
  { to: '/seller', icon: LayoutDashboard, label: 'Панель', end: true },
  { to: '/seller/products', icon: Package, label: 'Мои товары' },
  { to: '/seller/products/new', icon: Plus, label: 'Добавить товар' },
  { to: '/seller/inquiries', icon: MessageSquare, label: 'Запросы' },
  { to: '/seller/profile', icon: Store, label: 'Мой магазин' },
]

export default function SellerLayout() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => { await signOut(); navigate('/') }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0C0A08' }}>
      {/* Mobile toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 flex items-center justify-center"
        style={{ backgroundColor: '#1A1410', color: '#F0E6D6', borderRadius: '2px' }}>
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 flex flex-col z-40 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ backgroundColor: '#1A1410', borderRight: '1px solid rgba(176, 141, 87, 0.08)' }}>

        <div className="p-6">
          <Link to="/" className="block">
            <p className="font-display text-sm tracking-[0.15em] uppercase" style={{ color: '#B08D57' }}>Galerie</p>
            <p className="font-display text-[10px] italic" style={{ color: 'rgba(176, 141, 87, 0.4)' }}>du Temps — Seller</p>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navLinks.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 space-y-1" style={{ borderTop: '1px solid rgba(176, 141, 87, 0.08)' }}>
          <Link to="/" onClick={() => setSidebarOpen(false)}
            className="admin-sidebar-link" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>
            <Store size={18} /> На сайт
          </Link>
          <button onClick={handleLogout} className="admin-sidebar-link w-full" style={{ color: 'rgba(181, 115, 106, 0.6)' }}>
            <LogOut size={18} /> Выйти
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 md:hidden" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
