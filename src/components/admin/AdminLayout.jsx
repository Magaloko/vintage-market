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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-vintage-dark transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-vintage-cream/10 rounded flex items-center justify-center">
                <span className="font-display text-vintage-cream text-sm font-bold">Э</span>
              </div>
              <div>
                <p className="font-display text-sm font-bold text-vintage-cream">ЭПОХА</p>
                <p className="font-sans text-[9px] tracking-[0.2em] text-vintage-cream/40 uppercase">Админ-панель</p>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-vintage-cream/50">
              <X size={18} />
            </button>
          </div>

          {/* Demo Badge */}
          {isDemoMode && (
            <div className="mx-4 mb-4 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-amber-400">
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
          <div className="p-4 space-y-2">
            <Link
              to="/"
              className="admin-sidebar-link text-vintage-cream/40 hover:text-vintage-cream/60"
            >
              <ChevronLeft size={18} />
              На сайт
            </Link>
            <button onClick={handleLogout} className="admin-sidebar-link w-full text-red-400/60 hover:text-red-400">
              <LogOut size={18} />
              Выйти
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
              <Menu size={20} />
            </button>
            <h2 className="font-sans text-sm font-medium text-gray-800">Панель управления</h2>
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
