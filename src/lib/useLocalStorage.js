import { useState, useEffect, useCallback } from 'react'

/**
 * React hook that syncs state with localStorage.
 * All business-module keys are prefixed with `vm_`.
 */
export default function useLocalStorage(key, defaultValue) {
  const storageKey = `vm_${key}`

  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value))
    } catch { /* quota exceeded — ignore */ }
  }, [storageKey, value])

  const update = useCallback((updater) => {
    setValue((prev) => (typeof updater === 'function' ? updater(prev) : updater))
  }, [])

  return [value, update]
}
