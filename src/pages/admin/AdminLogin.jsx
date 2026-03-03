import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, AlertCircle, Store } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { isSupabaseConfigured } from '../../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError, role } = await signIn(email, password)
    setLoading(false)

    if (authError) { setError(authError.message); return }

    // Route based on role
    if (role === 'seller') navigate('/seller')
    else navigate('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#0C0A08' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/">
            <h1 className="font-display text-2xl tracking-[0.15em] uppercase" style={{ color: '#B08D57' }}>Galerie</h1>
            <p className="font-display text-xs italic" style={{ color: 'rgba(176, 141, 87, 0.4)' }}>du Temps</p>
          </Link>
          <p className="font-body text-xs tracking-[0.2em] uppercase mt-4" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>
            Вход
          </p>
        </div>

        {/* Demo Notice */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4" style={{ backgroundColor: 'rgba(176, 141, 87, 0.08)', border: '1px solid rgba(176, 141, 87, 0.2)', borderRadius: '2px' }}>
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#C9A96E' }} />
              <div className="font-body text-xs" style={{ color: 'rgba(201, 169, 110, 0.7)' }}>
                <p className="font-medium text-sm mb-1" style={{ color: '#C9A96E' }}>Демо-режим</p>
                Админ: <code style={{ color: '#C9A96E' }}>admin@vintage.demo</code> / <code style={{ color: '#C9A96E' }}>demo123</code><br />
                Продавец: <code style={{ color: '#C9A96E' }}>seller@vintage.demo</code> / <code style={{ color: '#C9A96E' }}>demo123</code>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-8" style={{ backgroundColor: 'rgba(240, 230, 214, 0.03)', border: '1px solid rgba(240, 230, 214, 0.08)', borderRadius: '2px' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3" style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)', border: '1px solid rgba(176, 141, 87, 0.2)', borderRadius: '2px' }}>
                <p className="font-body text-sm whitespace-pre-line" style={{ color: '#C9A96E' }}>{error}</p>
              </div>
            )}

            <div>
              <label className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(240, 230, 214, 0.35)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="gdt-input-dark" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(240, 230, 214, 0.35)' }}>Пароль</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="gdt-input-dark" placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 font-body text-sm tracking-[0.1em] uppercase transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#B08D57', color: '#F0E6D6', borderRadius: '2px' }}>
              {loading ? (
                <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid rgba(240, 230, 214, 0.2)', borderTopColor: '#F0E6D6' }} />
              ) : (<><LogIn size={16} /> Войти</>)}
            </button>
          </form>
        </div>

        {/* Register Link */}
        <div className="mt-6 p-4 text-center" style={{ border: '1px solid rgba(176, 141, 87, 0.08)', borderRadius: '2px' }}>
          <p className="font-body text-sm" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>
            Хотите продавать на Galerie du Temps?
          </p>
          <Link to="/seller/register" className="inline-flex items-center gap-2 mt-2 font-body text-sm transition-colors" style={{ color: '#B08D57' }}>
            <Store size={14} /> Создать магазин
          </Link>
        </div>
      </div>
    </div>
  )
}
