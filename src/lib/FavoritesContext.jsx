import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'
import { useAuth } from './AuthContext'
import { trackEvent } from './analytics'

const FavoritesContext = createContext({})
export const useFavorites = () => useContext(FavoritesContext)

const LOCAL_KEY = 'vintage_favorites'

function readLocal() {
  try {
    const stored = localStorage.getItem(LOCAL_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function writeLocal(ids) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids))
  } catch {}
}

export function FavoritesProvider({ children }) {
  const { session } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const loadFavorites = useCallback(async () => {
    setLoading(true)
    try {
      if (isSupabaseConfigured && session?.user) {
        const { data, error } = await supabase
          .from('favorites')
          .select('product_id')
          .eq('user_id', session.user.id)

        if (!error && data) {
          setFavorites(data.map((f) => f.product_id))
        } else {
          setFavorites(readLocal())
        }
      } else {
        setFavorites(readLocal())
      }
    } catch {
      setFavorites(readLocal())
    }
    setLoading(false)
  }, [session])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const isFavorite = useCallback(
    (productId) => favorites.includes(productId),
    [favorites],
  )

  const toggleFavorite = async (productId) => {
    const removing = favorites.includes(productId)
    const updated = removing
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId]

    setFavorites(updated)
    writeLocal(updated)
    trackEvent(removing ? 'favorite_remove' : 'favorite_add', { product_id: productId })

    if (isSupabaseConfigured && session?.user) {
      try {
        if (removing) {
          await supabase.from('favorites').delete()
            .eq('user_id', session.user.id)
            .eq('product_id', productId)
        } else {
          await supabase.from('favorites').insert({
            user_id: session.user.id,
            product_id: productId,
          })
        }
      } catch (e) {
        console.warn('Favorite sync error:', e)
      }
    }
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoritesCount: favorites.length,
        isFavorite,
        toggleFavorite,
        loading,
        loadFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}
