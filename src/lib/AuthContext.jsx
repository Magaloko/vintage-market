import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

// Demo mode when Supabase is not configured
const DEMO_ADMIN = { email: 'admin@vintage.demo', id: 'demo-admin-001' }

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Check for demo session in memory
      const demoSession = sessionStorage.getItem('vintage_demo_session')
      if (demoSession) {
        setSession(JSON.parse(demoSession))
      }
      setLoading(false)
      return
    }

    // Real Supabase auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      // Demo login
      if (email === 'admin@vintage.demo' && password === 'demo123') {
        const fakeSession = { user: DEMO_ADMIN }
        sessionStorage.setItem('vintage_demo_session', JSON.stringify(fakeSession))
        setSession(fakeSession)
        return { data: fakeSession, error: null }
      }
      return { data: null, error: { message: 'Демо: admin@vintage.demo / demo123' } }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      sessionStorage.removeItem('vintage_demo_session')
      setSession(null)
      return
    }
    await supabase.auth.signOut()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  )
}
