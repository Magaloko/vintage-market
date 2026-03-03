import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, AlertCircle } from 'lucide-react'
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

    const { data, error: authError } = await signIn(email, password)
    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    navigate('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#0C0A08' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-btn flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)', border: '1px solid rgba(176, 141, 87, 0.25)' }}>
            <span className="font-display text-3xl font-bold" style={{ color: '#B08D57' }}>Э</span>
          </div>
          <h1 className="font-display text-2xl font-bold" style={{ color: '#F0E6D6' }}>Galerie du Temps</h1>
          <p className="font-sans text-xs tracking-[0.3em] uppercase mt-1"
            style={{ color: 'rgba(176, 141, 87, 0.4)' }}>
            Админ-панель
          </p>
        </div>

        {/* Demo Notice */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4" style={{
            backgroundColor: 'rgba(176, 141, 87, 0.08)',
            border: '1px solid rgba(176, 141, 87, 0.2)',
            borderRadius: '2px',
          }}>
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#C9A96E' }} />
              <div>
                <p className="font-sans text-sm font-medium" style={{ color: '#C9A96E' }}>Демо-режим</p>
                <p className="font-sans text-xs mt-1" style={{ color: 'rgba(212, 120, 74, 0.6)' }}>
                  Supabase не настроен. Используйте:<br />
                  Email: <code style={{ color: '#C9A96E' }}>admin@vintage.demo</code><br />
                  Пароль: <code style={{ color: '#C9A96E' }}>demo123</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-8" style={{
          backgroundColor: 'rgba(240, 230, 214, 0.03)',
          border: '1px solid rgba(240, 230, 214, 0.08)',
          borderRadius: '2px',
        }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3" style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)', border: '1px solid rgba(176, 141, 87, 0.2)', borderRadius: '2px' }}>
                <p className="font-sans text-sm" style={{ color: '#C9A96E' }}>{error}</p>
              </div>
            )}

            <div>
              <label className="block font-sans text-xs tracking-wider uppercase mb-2"
                style={{ color: 'rgba(240, 230, 214, 0.35)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="vintage-input-dark"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block font-sans text-xs tracking-wider uppercase mb-2"
                style={{ color: 'rgba(240, 230, 214, 0.35)' }}>
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="vintage-input-dark"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-sans text-sm font-medium tracking-wider uppercase transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#B08D57',
                color: '#F0E6D6',
                borderRadius: '2px',
              }}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full animate-spin"
                  style={{ border: '2px solid rgba(240, 230, 214, 0.2)', borderTopColor: '#F0E6D6' }} />
              ) : (
                <>
                  <LogIn size={16} />
                  Войти
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
