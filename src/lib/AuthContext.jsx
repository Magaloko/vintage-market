import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

const DEMO_ADMIN = { email: 'admin@vintage.demo', id: 'demo-admin-001' }

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDemoMode] = useState(!isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      try {
        const demoSession = sessionStorage.getItem('vintage_demo_session')
        if (demoSession) setSession(JSON.parse(demoSession))
      } catch (e) {
        console.warn('Demo session read error:', e)
      }
      setLoading(false)
      return
    }

    let mounted = true

    supabase.auth.getSession()
      .then(({ data }) => {
        if (mounted) {
          setSession(data?.session || null)
          setLoading(false)
        }
      })
      .catch((e) => {
        console.warn('Auth getSession error:', e)
        if (mounted) {
          setSession(null)
          setLoading(false)
        }
      })

    let subscription
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (mounted) setSession(newSession)
      })
      subscription = data?.subscription
    } catch (e) {
      console.warn('Auth subscription error:', e)
    }

    return () => {
      mounted = false
      try { subscription?.unsubscribe?.() } catch (e) { /* safe */ }
    }
  }, [])

  // Email/Password sign in
  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      if (email === 'admin@vintage.demo' && password === 'demo123') {
        const fakeSession = { user: DEMO_ADMIN }
        sessionStorage.setItem('vintage_demo_session', JSON.stringify(fakeSession))
        setSession(fakeSession)
        return { data: fakeSession, error: null }
      }
      return { data: null, error: { message: 'Демо: admin@vintage.demo / demo123' } }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      return { data, error }
    } catch (e) {
      return { data: null, error: { message: e.message || 'Ошибка подключения' } }
    }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      sessionStorage.removeItem('vintage_demo_session')
      setSession(null)
      return
    }
    try { await supabase.auth.signOut() } catch (e) { console.warn('SignOut error:', e) }
    setSession(null)
  }

  const user = session?.user || null

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signOut, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  )
}
