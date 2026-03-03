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
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#0E1A2B' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-btn flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(184, 154, 90, 0.1)', border: '1px solid rgba(184, 154, 90, 0.25)' }}>
            <span className="font-display text-3xl font-bold" style={{ color: '#B89A5A' }}>Э</span>
          </div>
          <h1 className="font-display text-2xl font-bold" style={{ color: '#F2EDE3' }}>ЭПОХА</h1>
          <p className="font-sans text-xs tracking-[0.3em] uppercase mt-1"
            style={{ color: 'rgba(184, 154, 90, 0.4)' }}>
            Админ-панель
          </p>
        </div>

        {/* Demo Notice */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4" style={{
            backgroundColor: 'rgba(194, 100, 44, 0.08)',
            border: '1px solid rgba(194, 100, 44, 0.2)',
            borderRadius: '6px',
          }}>
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#D4784A' }} />
              <div>
                <p className="font-sans text-sm font-medium" style={{ color: '#D4784A' }}>Демо-режим</p>
                <p className="font-sans text-xs mt-1" style={{ color: 'rgba(212, 120, 74, 0.6)' }}>
                  Supabase не настроен. Используйте:<br />
                  Email: <code style={{ color: '#D4784A' }}>admin@vintage.demo</code><br />
                  Пароль: <code style={{ color: '#D4784A' }}>demo123</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-8" style={{
          backgroundColor: 'rgba(242, 237, 227, 0.03)',
          border: '1px solid rgba(242, 237, 227, 0.08)',
          borderRadius: '6px',
        }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3" style={{ backgroundColor: 'rgba(194, 100, 44, 0.1)', border: '1px solid rgba(194, 100, 44, 0.2)', borderRadius: '6px' }}>
                <p className="font-sans text-sm" style={{ color: '#D4784A' }}>{error}</p>
              </div>
            )}

            <div>
              <label className="block font-sans text-xs tracking-wider uppercase mb-2"
                style={{ color: 'rgba(242, 237, 227, 0.35)' }}>
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
                style={{ color: 'rgba(242, 237, 227, 0.35)' }}>
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
                backgroundColor: '#C2642C',
                color: '#F2EDE3',
                borderRadius: '6px',
              }}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full animate-spin"
                  style={{ border: '2px solid rgba(242, 237, 227, 0.2)', borderTopColor: '#F2EDE3' }} />
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
