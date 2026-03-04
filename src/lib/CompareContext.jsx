import { createContext, useContext, useState, useCallback } from 'react'

const CompareContext = createContext({})
export const useCompare = () => useContext(CompareContext)

const MAX_COMPARE = 3

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState([])

  const isInCompare = useCallback(
    (productId) => compareItems.some((p) => p.id === productId),
    [compareItems],
  )

  const toggleCompare = useCallback((product) => {
    setCompareItems((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id)
      }
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, product]
    })
  }, [])

  const removeFromCompare = useCallback((productId) => {
    setCompareItems((prev) => prev.filter((p) => p.id !== productId))
  }, [])

  const clearCompare = useCallback(() => setCompareItems([]), [])

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        compareCount: compareItems.length,
        isInCompare,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        maxCompare: MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  )
}
