import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'
import { useAuth } from './AuthContext'

const FavoritesContext = createContext({})

export const useFavorites = () => useContext(FavoritesContext)

// Local storage key for demo/anonymous favorites
const LOCAL_KEY = 'vintage_favorites'

export function FavoritesProvider({ children }) {
  const { session } = useAuth()
  const [favorites, setFavorites] = useState([]) // Array of product IDs
  const [favoriteProducts, setFavoriteProducts] = useState([]) // Full product objects
  const [loading, setLoading] = useState(true)

  // Load favorites on auth change
  useEffect(() => {
    loadFavorites()
  }, [session])

  const loadFavorites = async () => {
    setLoading(true)

    if (isSupabaseConfigured && session?.user) {
      // Load from Supabase
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', session.user.id)

      if (!error && data) {
        setFavorites(data.map(f => f.product_id))
      }
    } else {
      // Load from localStorage (demo/anonymous mode)
      try {
        const stored = localStorage.getItem(LOCAL_KEY)
        if (stored) setFavorites(JSON.parse(stored))
      } catch {
        setFavorites([])
      }
    }

    setLoading(false)
  }

  // Persist demo favorites to localStorage
  const persistLocal = (ids) => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(ids))
    } catch { /* silent fail */ }
  }

  const isFavorite = useCallback((productId) => {
    return favorites.includes(productId)
  }, [favorites])

  const toggleFavorite = async (productId) => {
    const isCurrentlyFavorite = favorites.includes(productId)

    if (isCurrentlyFavorite) {
      // Remove
      const updated = favorites.filter(id => id !== productId)
      setFavorites(updated)

      if (isSupabaseConfigured && session?.user) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('product_id', productId)
      } else {
        persistLocal(updated)
      }
    } else {
      // Add
      const updated = [...favorites, productId]
      setFavorites(updated)

      if (isSupabaseConfigured && session?.user) {
        await supabase
          .from('favorites')
          .insert({ user_id: session.user.id, product_id: productId })
      } else {
        persistLocal(updated)
      }
    }
  }

  const favoritesCount = favorites.length

  return (
    <FavoritesContext.Provider value={{
      favorites,
      favoritesCount,
      isFavorite,
      toggleFavorite,
      loading,
      loadFavorites,
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}
