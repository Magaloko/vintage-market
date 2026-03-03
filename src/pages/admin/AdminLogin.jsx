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
    <div className="min-h-screen bg-vintage-dark flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-vintage-cream/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="font-display text-3xl font-bold text-vintage-cream">Э</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-vintage-cream">ЭПОХА</h1>
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-vintage-cream/30 mt-1">
            Админ-панель
          </p>
        </div>

        {/* Demo Notice */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-sans text-sm text-amber-300 font-medium">Демо-режим</p>
                <p className="font-sans text-xs text-amber-400/60 mt-1">
                  Supabase не настроен. Используйте:<br />
                  Email: <code className="text-amber-300">admin@vintage.demo</code><br />
                  Пароль: <code className="text-amber-300">demo123</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="font-sans text-sm text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="block font-sans text-xs tracking-wider uppercase text-vintage-cream/40 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-vintage-cream placeholder-vintage-cream/20
                  focus:outline-none focus:border-vintage-gold/50 focus:ring-1 focus:ring-vintage-gold/20 rounded-lg
                  font-sans text-sm transition-all"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block font-sans text-xs tracking-wider uppercase text-vintage-cream/40 mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-vintage-cream placeholder-vintage-cream/20
                  focus:outline-none focus:border-vintage-gold/50 focus:ring-1 focus:ring-vintage-gold/20 rounded-lg
                  font-sans text-sm transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-vintage-cream text-vintage-dark font-sans text-sm font-medium tracking-wider uppercase
                rounded-lg hover:bg-vintage-gold hover:text-white transition-all duration-300 disabled:opacity-50
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-vintage-dark/20 border-t-vintage-dark rounded-full animate-spin" />
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
