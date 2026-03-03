import { useState } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { LayoutDashboard, Package, Plus, LogOut, Menu, X, ChevronLeft, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { isSupabaseConfigured } from '../../lib/supabase'

const sidebarLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Панель управления', end: true },
  { to: '/admin/products', icon: Package, label: 'Товары' },
  { to: '/admin/products/new', icon: Plus, label: 'Добавить товар' },
]

export default function AdminLayout() {
  const { signOut, isDemoMode } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0C0A08' }}>
      {/* Sidebar — Deep Navy */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}
        style={{ backgroundColor: '#0C0A08' }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-btn flex items-center justify-center"
                style={{ backgroundColor: 'rgba(176, 141, 87, 0.15)', border: '1px solid rgba(176, 141, 87, 0.3)' }}>
                <span className="font-display text-sm font-bold" style={{ color: '#B08D57' }}>Э</span>
              </div>
              <div>
                <p className="font-display text-sm tracking-[0.15em] uppercase" style={{ color: '#B08D57' }}>Galerie</p><p className="font-display text-[10px] italic" style={{ color: 'rgba(176, 141, 87, 0.4)' }}>du Temps</p>
                <p className="font-sans text-[9px] tracking-[0.2em] uppercase"
                  style={{ color: 'rgba(176, 141, 87, 0.5)' }}>Админ-панель</p>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden"
              style={{ color: 'rgba(240, 230, 214, 0.4)' }}>
              <X size={18} />
            </button>
          </div>

          {/* Demo Badge */}
          {isDemoMode && (
            <div className="mx-4 mb-4 px-3 py-2" style={{
              backgroundColor: 'rgba(176, 141, 87, 0.1)',
              border: '1px solid rgba(176, 141, 87, 0.2)',
              borderRadius: '2px',
            }}>
              <div className="flex items-center gap-2" style={{ color: '#C9A96E' }}>
                <AlertTriangle size={14} />
                <span className="font-sans text-xs">Демо-режим</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {sidebarLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `admin-sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <link.icon size={18} />
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Bottom */}
          <div className="p-4 space-y-2" style={{ borderTop: '1px solid rgba(240, 230, 214, 0.06)' }}>
            <Link
              to="/"
              className="admin-sidebar-link"
              style={{ color: 'rgba(240, 230, 214, 0.3)' }}
            >
              <ChevronLeft size={18} />
              На сайт
            </Link>
            <button onClick={handleLogout} className="admin-sidebar-link w-full"
              style={{ color: 'rgba(176, 141, 87, 0.5)' }}>
              <LogOut size={18} />
              Выйти
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ backgroundColor: 'rgba(10, 18, 32, 0.7)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 px-6 py-4"
          style={{ backgroundColor: 'rgba(14, 26, 43, 0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(240, 230, 214, 0.06)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden"
              style={{ color: 'rgba(240, 230, 214, 0.5)' }}>
              <Menu size={20} />
            </button>
            <h2 className="font-sans text-sm font-medium" style={{ color: 'rgba(240, 230, 214, 0.7)' }}>Панель управления</h2>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
