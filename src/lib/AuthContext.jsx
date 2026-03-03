import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'

const AuthContext = createContext({})
export const useAuth = () => useContext(AuthContext)

const DEMO_ACCOUNTS = {
  'admin@vintage.demo': { id: 'demo-admin-001', role: 'admin', password: 'demo123' },
  'seller@vintage.demo': { id: 'demo-seller-001', role: 'seller', password: 'demo123', shop_id: 'demo-shop-001' },
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState(null)
  const [shopId, setShopId] = useState(null)
  const [isDemoMode] = useState(!isSupabaseConfigured)

  // FIX: detectRole with timeout + bulletproof error handling
  const detectRole = useCallback(async (sess) => {
    if (!sess?.user) {
      setRole(null)
      setShopId(null)
      return
    }

    // Demo mode
    if (!isSupabaseConfigured) {
      const stored = sessionStorage.getItem('vintage_demo_role')
      const storedShop = sessionStorage.getItem('vintage_demo_shop_id')
      setRole(stored || 'admin')
      setShopId(storedShop || null)
      return
    }

    // Supabase mode — try to detect role with timeout
    // Default to admin if anything goes wrong
    try {
      // Wrap in Promise.race with 3s timeout
      const detectWithTimeout = Promise.race([
        (async () => {
          // 1. Check shops table
          try {
            const { data: shop, error } = await supabase
              .from('shops')
              .select('id')
              .eq('user_id', sess.user.id)
              .maybeSingle()
            if (!error && shop) {
              return { role: 'seller', shopId: shop.id }
            }
          } catch (e) {
            console.warn('Shops query failed (table may not exist):', e.message)
          }

          // 2. Check profiles table
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role, shop_id')
              .eq('id', sess.user.id)
              .maybeSingle()
            if (!error && profile) {
              return { role: profile.role || 'admin', shopId: profile.shop_id || null }
            }
          } catch (e) {
            console.warn('Profiles query failed (table may not exist):', e.message)
          }

          // 3. Default — admin
          return { role: 'admin', shopId: null }
        })(),
        new Promise(resolve => setTimeout(() => {
          console.warn('Role detection timed out — defaulting to admin')
          resolve({ role: 'admin', shopId: null })
        }, 3000))
      ])

      const result = await detectWithTimeout
      setRole(result.role)
      setShopId(result.shopId)
    } catch (e) {
      console.warn('Role detection failed entirely:', e)
      setRole('admin')
      setShopId(null)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      try {
        const ds = sessionStorage.getItem('vintage_demo_session')
        if (ds) {
          const p = JSON.parse(ds)
          setSession(p)
          detectRole(p)
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
      .catch((e) => {
        console.warn('getSession error:', e)
        if (mounted) {
          setSession(null)
          setRole(null)
          setLoading(false)
        }
      })

    let sub
    try {
      const { data } = supabase.auth.onAuthStateChange(async (_ev, ns) => {
        if (mounted) {
          setSession(ns)
          await detectRole(ns)
        }
      })
      sub = data?.subscription
    } catch {}
    return () => { mounted = false; try { sub?.unsubscribe?.() } catch {} }
  }, [detectRole])

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      const demo = DEMO_ACCOUNTS[email]
      if (demo && password === demo.password) {
        const fs = { user: { id: demo.id, email } }
        sessionStorage.setItem('vintage_demo_session', JSON.stringify(fs))
        sessionStorage.setItem('vintage_demo_role', demo.role)
        if (demo.shop_id) sessionStorage.setItem('vintage_demo_shop_id', demo.shop_id)
        setSession(fs); setRole(demo.role); setShopId(demo.shop_id || null)
        return { data: fs, error: null, role: demo.role }
      }
      try {
        const sellers = JSON.parse(localStorage.getItem('vintage_demo_sellers') || '[]')
        const s = sellers.find(x => x.email === email && x.password === password)
        if (s) {
          const fs = { user: { id: s.id, email } }
          sessionStorage.setItem('vintage_demo_session', JSON.stringify(fs))
          sessionStorage.setItem('vintage_demo_role', 'seller')
          sessionStorage.setItem('vintage_demo_shop_id', s.shop_id)
          setSession(fs); setRole('seller'); setShopId(s.shop_id)
          return { data: fs, error: null, role: 'seller' }
        }
      } catch {}
      return { data: null, error: { message: 'Неверные данные.\nАдмин: admin@vintage.demo / demo123\nПродавец: seller@vintage.demo / demo123' } }
    }

    // FIX: Supabase signIn — detect role after login and return it
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { data: null, error }

      // Wait for role detection to complete
      let detectedRole = 'admin'
      try {
        // Check shops
        const { data: shop } = await supabase
          .from('shops')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle()
        if (shop) {
          detectedRole = 'seller'
          setRole('seller')
          setShopId(shop.id)
        } else {
          setRole('admin')
          setShopId(null)
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
        id: sid, user_id: nid, name: shopName, slug, description: shopDescription || '',
        address: address || '', phone: phone || '', email, logo_url: null,
        status: 'active', created_at: new Date().toISOString(), rating: 0, review_count: 0,
      })
      localStorage.setItem('vintage_demo_shops', JSON.stringify(shops))
      const fs = { user: { id: nid, email } }
      sessionStorage.setItem('vintage_demo_session', JSON.stringify(fs))
      sessionStorage.setItem('vintage_demo_role', 'seller')
      sessionStorage.setItem('vintage_demo_shop_id', sid)
      setSession(fs); setRole('seller'); setShopId(sid)
      return { data: { user: { id: nid } }, error: null }
    }
    try {
      const { data: auth, error: ae } = await supabase.auth.signUp({ email, password })
      if (ae) return { data: null, error: ae }
      const { data: shop, error: se } = await supabase.from('shops').insert([{
        user_id: auth.user.id, name: shopName, slug, description: shopDescription || '',
        address: address || '', phone: phone || '', email, status: 'active',
      }]).select().single()
      if (se) return { data: null, error: se }
      try { await supabase.from('profiles').upsert([{ id: auth.user.id, role: 'seller', shop_id: shop.id }]) } catch {}
      return { data: auth, error: null }
    } catch (e) { return { data: null, error: { message: e.message } } }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      sessionStorage.removeItem('vintage_demo_session')
      sessionStorage.removeItem('vintage_demo_role')
      sessionStorage.removeItem('vintage_demo_shop_id')
    } else { try { await supabase.auth.signOut() } catch {} }
    setSession(null); setRole(null); setShopId(null)
  }

  const user = session?.user || null
  const isAdmin = role === 'admin'
  const isSeller = role === 'seller'

  return (
    <AuthContext.Provider value={{ session, user, loading, role, shopId, isAdmin, isSeller, isDemoMode, signIn, signOut, registerSeller }}>
      {children}
    </AuthContext.Provider>
  )
}
