import { categories } from '../data/demoProducts'

const STORAGE_KEY = 'gdt_active_categories'

/**
 * Get IDs of all active (enabled) categories.
 * Falls back to ALL category IDs if nothing is saved.
 */
export function getActiveCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    /* ignore */
  }
  // Default: all categories active
  return categories.map((c) => c.id)
}

/**
 * Save active category IDs.
 */
export function setActiveCategories(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

/**
 * Toggle a single category on/off.
 * Returns the new list of active IDs.
 */
export function toggleCategory(categoryId) {
  const current = getActiveCategories()
  const idx = current.indexOf(categoryId)
  const next = idx >= 0
    ? current.filter((id) => id !== categoryId)
    : [...current, categoryId]
  setActiveCategories(next)
  return next
}

/**
 * Get only the category objects that are currently active.
 */
export function getActiveCategoryList() {
  const activeIds = new Set(getActiveCategories())
  return categories.filter((c) => activeIds.has(c.id))
}
