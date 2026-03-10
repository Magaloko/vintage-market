import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, AlertCircle, Store } from 'lucide-react'
import { useAuth } from '../../lib/contexts/AuthContext'
import { isSupabaseConfigured } from '../../lib/supabase'

/* ── Shared style tokens ─────────────────────────────────────── */
const colors = {
  bg:        '#0C0A08',
  gold:      '#B08D57',
  goldLight: '#C9A96E',
  cream:     '#F0E6D6',
}

const alpha = {
  cream03:  'rgba(240, 230, 214, 0.03)',
  cream08:  'rgba(240, 230, 214, 0.08)',
  cream30:  'rgba(240, 230, 214, 0.3)',
  gold08:   'rgba(176, 141, 87, 0.08)',
  gold20:   'rgba(176, 141, 87, 0.2)',
  gold40:   'rgba(176, 141, 87, 0.4)',
  gold70:   'rgba(201, 169, 110, 0.7)',
}

const cardStyle = {
  backgroundColor: alpha.cream03,
  border: `1px solid ${alpha.cream08}`,
  borderRadius: '2px',
}

const alertStyle = {
  backgroundColor: alpha.gold08,
  border: `1px solid ${alpha.gold20}`,
  borderRadius: '2px',
}

const submitStyle = {
  backgroundColor: colors.gold,
  color: colors.cream,
  borderRadius: '2px',
}

const spinnerStyle = {
  border: `2px solid ${alpha.cream30}`,
  borderTopColor: colors.cream,
}

/* ── Component ───────────────────────────────────────────────── */
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

    const { error: authError, role } = await signIn(email, password)
    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    navigate(role === 'seller' ? '/seller' : role === 'agent' ? '/agent' : '/admin')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/">
            <h1
              className="font-display text-2xl tracking-[0.15em] uppercase"
              style={{ color: colors.gold }}
            >
              Galerie
            </h1>
            <p
              className="font-display text-xs italic"
              style={{ color: alpha.gold40 }}
            >
              du Temps
            </p>
          </Link>
          <p
            className="font-body text-xs tracking-[0.2em] uppercase mt-4"
            style={{ color: alpha.cream30 }}
          >
            Вход
          </p>
        </div>

        {/* Demo Notice */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4" style={alertStyle}>
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: colors.goldLight }} />
              <div className="font-body text-xs" style={{ color: alpha.gold70 }}>
                <p className="font-medium text-sm mb-1" style={{ color: colors.goldLight }}>
                  Демо-режим
                </p>
                Админ: <code style={{ color: colors.goldLight }}>admin@vintage.demo</code>{' '}
                / <code style={{ color: colors.goldLight }}>demo123</code>
                <br />
                Продавец: <code style={{ color: colors.goldLight }}>seller@vintage.demo</code>{' '}
                / <code style={{ color: colors.goldLight }}>demo123</code>
                <br />
                Агент: <code style={{ color: colors.goldLight }}>agent@vintage.demo</code>{' '}
                / <code style={{ color: colors.goldLight }}>demo123</code>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-8" style={cardStyle}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                className="p-3"
                style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)', border: `1px solid ${alpha.gold20}`, borderRadius: '2px' }}
              >
                <p className="font-body text-sm whitespace-pre-line" style={{ color: colors.goldLight }}>
                  {error}
                </p>
              </div>
            )}

            <div>
              <label
                className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2"
                style={{ color: 'rgba(240, 230, 214, 0.35)' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="gdt-input-dark"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label
                className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2"
                style={{ color: 'rgba(240, 230, 214, 0.35)' }}
              >
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="gdt-input-dark"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-body text-sm tracking-[0.1em] uppercase transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              style={submitStyle}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full animate-spin" style={spinnerStyle} />
              ) : (
                <>
                  <LogIn size={16} /> Войти
                </>
              )}
            </button>
          </form>
        </div>

        {/* Register Link */}
        <div
          className="mt-6 p-4 text-center"
          style={{ border: `1px solid ${alpha.gold08}`, borderRadius: '2px' }}
        >
          <p className="font-body text-sm" style={{ color: alpha.cream30 }}>
            Хотите продавать на Galerie du Temps?
          </p>
          <Link
            to="/seller/register"
            className="inline-flex items-center gap-2 mt-2 font-body text-sm transition-colors"
            style={{ color: colors.gold }}
          >
            <Store size={14} /> Создать магазин
          </Link>
        </div>
      </div>
    </div>
  )
}
