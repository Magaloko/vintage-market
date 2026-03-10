import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../supabase'

const AuthContext = createContext({})
export const useAuth = () => useContext(AuthContext)

const DEMO_ACCOUNTS = {
  'admin@vintage.demo': { id: 'demo-admin-001', role: 'admin', password: 'demo123' },
  'seller@vintage.demo': { id: 'demo-seller-001', role: 'seller', password: 'demo123', shop_id: 'demo-shop-001' },
  'agent@vintage.demo': { id: 'demo-agent-001', role: 'agent', password: 'demo123' },
}

const ROLE_TIMEOUT_MS = 3000

async function detectRoleFromDB(userId) {
  try {
    const { data: shop, error } = await supabase
      .from('shops').select('id').eq('user_id', userId).maybeSingle()
    if (!error && shop) return { role: 'seller', shopId: shop.id }
  } catch {}

  try {
    const { data: profile, error } = await supabase
      .from('profiles').select('role, shop_id').eq('id', userId).maybeSingle()
    if (!error && profile) return { role: profile.role || 'admin', shopId: profile.shop_id || null }
  } catch {}

  return { role: 'admin', shopId: null }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState(null)
  const [shopId, setShopId] = useState(null)
  const [isDemoMode] = useState(!isSupabaseConfigured)

  const detectRole = useCallback(async (sess) => {
    if (!sess?.user) {
      setRole(null)
      setShopId(null)
      return
    }

    if (!isSupabaseConfigured) {
      setRole(sessionStorage.getItem('vintage_demo_role') || 'admin')
      setShopId(sessionStorage.getItem('vintage_demo_shop_id') || null)
      return
    }

    try {
      const result = await Promise.race([
        detectRoleFromDB(sess.user.id),
        new Promise((resolve) =>
          setTimeout(() => resolve({ role: 'admin', shopId: null }), ROLE_TIMEOUT_MS),
        ),
      ])
      setRole(result.role)
      setShopId(result.shopId)
    } catch {
      setRole('admin')
      setShopId(null)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      try {
        const stored = sessionStorage.getItem('vintage_demo_session')
        if (stored) {
          const parsed = JSON.parse(stored)
          setSession(parsed)
          detectRole(parsed)
        }
      } catch {}
      setLoading(false)
      return
    }

    let mounted = true

    supabase.auth.getSession()
      .then(async ({ data }) => {
        if (!mounted) return
        const s = data?.session || null
        setSession(s)
        await detectRole(s)
        setLoading(false)
      })
      .catch(() => {
        if (mounted) {
          setSession(null)
          setRole(null)
          setLoading(false)
        }
      })

    let sub
    try {
      const { data } = supabase.auth.onAuthStateChange(async (_ev, newSession) => {
        if (mounted) {
          setSession(newSession)
          await detectRole(newSession)
        }
      })
      sub = data?.subscription
    } catch {}

    return () => {
      mounted = false
      try { sub?.unsubscribe?.() } catch {}
    }
  }, [detectRole])

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) return demoSignIn(email, password)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { data: null, error }

      let detectedRole = 'admin'
      try {
        const { data: shop } = await supabase
          .from('shops').select('id').eq('user_id', data.user.id).maybeSingle()
        if (shop) {
          detectedRole = 'seller'
          setRole('seller')
          setShopId(shop.id)
        } else {
          // Check profiles for agent role
          try {
            const { data: profile } = await supabase
              .from('profiles').select('role').eq('id', data.user.id).maybeSingle()
            if (profile?.role === 'agent') {
              detectedRole = 'agent'
              setRole('agent')
              setShopId(null)
            } else {
              setRole('admin')
              setShopId(null)
            }
          } catch {
            setRole('admin')
            setShopId(null)
          }
        }
      } catch {
        setRole('admin')
        setShopId(null)
      }

      return { data, error: null, role: detectedRole }
    } catch (e) {
      return { data: null, error: { message: e.message } }
    }
  }

  const demoSignIn = (email, password) => {
    const demo = DEMO_ACCOUNTS[email]
    if (demo && password === demo.password) {
      const fakeSession = { user: { id: demo.id, email } }
      sessionStorage.setItem('vintage_demo_session', JSON.stringify(fakeSession))
      sessionStorage.setItem('vintage_demo_role', demo.role)
      if (demo.shop_id) sessionStorage.setItem('vintage_demo_shop_id', demo.shop_id)
      setSession(fakeSession)
      setRole(demo.role)
      setShopId(demo.shop_id || null)
      return { data: fakeSession, error: null, role: demo.role }
    }

    try {
      const sellers = JSON.parse(localStorage.getItem('vintage_demo_sellers') || '[]')
      const seller = sellers.find((s) => s.email === email && s.password === password)
      if (seller) {
        const fakeSession = { user: { id: seller.id, email } }
        sessionStorage.setItem('vintage_demo_session', JSON.stringify(fakeSession))
        sessionStorage.setItem('vintage_demo_role', 'seller')
        sessionStorage.setItem('vintage_demo_shop_id', seller.shop_id)
        setSession(fakeSession)
        setRole('seller')
        setShopId(seller.shop_id)
        return { data: fakeSession, error: null, role: 'seller' }
      }
    } catch {}

    return {
      data: null,
      error: {
        message: 'Неверные данные.\nАдмин: admin@vintage.demo / demo123\nПродавец: seller@vintage.demo / demo123\nАгент: agent@vintage.demo / demo123',
      },
    }
  }

  const registerSeller = async ({ email, password, shopName, shopDescription, address, phone }) => {
    const slug = shopName.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/-+$/, '')

    if (!isSupabaseConfigured) {
      const nid = 'demo-seller-' + Date.now()
      const sid = 'demo-shop-' + Date.now()

      const sellers = JSON.parse(localStorage.getItem('vintage_demo_sellers') || '[]')
      sellers.push({ id: nid, email, password, shop_id: sid })
      localStorage.setItem('vintage_demo_sellers', JSON.stringify(sellers))

      const shops = JSON.parse(localStorage.getItem('vintage_demo_shops') || '[]')
      shops.push({
        id: sid, user_id: nid, name: shopName, slug,
        description: shopDescription || '', address: address || '',
        phone: phone || '', email, logo_url: null,
        status: 'active', created_at: new Date().toISOString(),
        rating: 0, review_count: 0,
      })
      localStorage.setItem('vintage_demo_shops', JSON.stringify(shops))

      const fakeSession = { user: { id: nid, email } }
      sessionStorage.setItem('vintage_demo_session', JSON.stringify(fakeSession))
      sessionStorage.setItem('vintage_demo_role', 'seller')
      sessionStorage.setItem('vintage_demo_shop_id', sid)
      setSession(fakeSession)
      setRole('seller')
      setShopId(sid)
      return { data: { user: { id: nid } }, error: null }
    }

    try {
      const { data: auth, error: authErr } = await supabase.auth.signUp({ email, password })
      if (authErr) return { data: null, error: authErr }

      const { data: shop, error: shopErr } = await supabase.from('shops').insert([{
        user_id: auth.user.id, name: shopName, slug,
        description: shopDescription || '', address: address || '',
        phone: phone || '', email, status: 'active',
      }]).select().single()
      if (shopErr) return { data: null, error: shopErr }

      try {
        await supabase.from('profiles').upsert([{
          id: auth.user.id, role: 'seller', shop_id: shop.id,
        }])
      } catch {}

      return { data: auth, error: null }
    } catch (e) {
      return { data: null, error: { message: e.message } }
    }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      sessionStorage.removeItem('vintage_demo_session')
      sessionStorage.removeItem('vintage_demo_role')
      sessionStorage.removeItem('vintage_demo_shop_id')
    } else {
      try { await supabase.auth.signOut() } catch {}
    }
    setSession(null)
    setRole(null)
    setShopId(null)
  }

  const user = session?.user || null

  return (
    <AuthContext.Provider value={{
      session, user, loading, role, shopId,
      isAdmin: role === 'admin',
      isSeller: role === 'seller',
      isAgent: role === 'agent',
      isDemoMode,
      signIn, signOut, registerSeller,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
