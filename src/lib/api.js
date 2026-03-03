import { supabase, isSupabaseConfigured } from './supabase'
import { demoProducts } from '../data/demoProducts'

// In-memory store for demo mode
let localProducts = [...demoProducts]
let nextId = 100

function generateId() {
  return String(++nextId)
}

// ─── Products API ────────────────────────────────────────────

export async function getProducts({ category, status, search, limit, offset = 0 } = {}) {
  if (!isSupabaseConfigured) {
    let filtered = [...localProducts]
    if (category) filtered = filtered.filter(p => p.category === category)
    if (status) filtered = filtered.filter(p => p.status === status)
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      )
    }
    const total = filtered.length
    if (limit) filtered = filtered.slice(offset, offset + limit)
    return { data: filtered, count: total, error: null }
  }

  let query = supabase.from('products').select('*', { count: 'exact' })
  if (category) query = query.eq('category', category)
  if (status) query = query.eq('status', status)
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`)
  if (limit) query = query.range(offset, offset + limit - 1)
  query = query.order('created_at', { ascending: false })

  const { data, count, error } = await query
  return { data, count, error }
}

export async function getProduct(id) {
  if (!isSupabaseConfigured) {
    const product = localProducts.find(p => p.id === id)
    // Increment views
    if (product) product.views = (product.views || 0) + 1
    return { data: product || null, error: product ? null : { message: 'Not found' } }
  }

  // Increment view count
  await supabase.rpc('increment_views', { product_id: id })
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  return { data, error }
}

export async function createProduct(product) {
  if (!isSupabaseConfigured) {
    const newProduct = {
      ...product,
      id: generateId(),
      views: 0,
      created_at: new Date().toISOString(),
    }
    localProducts.unshift(newProduct)
    return { data: newProduct, error: null }
  }

  const { data, error } = await supabase.from('products').insert([product]).select().single()
  return { data, error }
}

export async function updateProduct(id, updates) {
  if (!isSupabaseConfigured) {
    const idx = localProducts.findIndex(p => p.id === id)
    if (idx === -1) return { data: null, error: { message: 'Not found' } }
    localProducts[idx] = { ...localProducts[idx], ...updates }
    return { data: localProducts[idx], error: null }
  }

  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single()
  return { data, error }
}

export async function deleteProduct(id) {
  if (!isSupabaseConfigured) {
    localProducts = localProducts.filter(p => p.id !== id)
    return { error: null }
  }

  const { error } = await supabase.from('products').delete().eq('id', id)
  return { error }
}

// ─── Statistics API ──────────────────────────────────────────

export async function getStats() {
  if (!isSupabaseConfigured) {
    const total = localProducts.length
    const active = localProducts.filter(p => p.status === 'active').length
    const sold = localProducts.filter(p => p.status === 'sold').length
    const prices = localProducts.map(p => p.price).filter(Boolean)
    const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0
    const totalViews = localProducts.reduce((sum, p) => sum + (p.views || 0), 0)

    // Category distribution
    const categories = {}
    localProducts.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1
    })
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]

    // Price ranges
    const priceRanges = [
      { range: '0-50€', count: prices.filter(p => p <= 50).length },
      { range: '50-100€', count: prices.filter(p => p > 50 && p <= 100).length },
      { range: '100-200€', count: prices.filter(p => p > 100 && p <= 200).length },
      { range: '200-500€', count: prices.filter(p => p > 200 && p <= 500).length },
      { range: '500€+', count: prices.filter(p => p > 500).length },
    ]

    // Monthly data (demo)
    const monthlyData = [
      { month: 'Янв', products: 3, views: 120 },
      { month: 'Фев', products: 5, views: 180 },
      { month: 'Мар', products: 4, views: 250 },
      { month: 'Апр', products: 7, views: 310 },
      { month: 'Май', products: 6, views: 280 },
      { month: 'Июн', products: 8, views: 420 },
    ]

    return {
      data: {
        total,
        active,
        sold,
        avgPrice,
        totalViews,
        topCategory: topCategory ? topCategory[0] : '—',
        categories,
        priceRanges,
        monthlyData,
      },
      error: null,
    }
  }

  // Real Supabase queries
  const { data: products, error } = await supabase.from('products').select('*')
  if (error) return { data: null, error }

  const total = products.length
  const active = products.filter(p => p.status === 'active').length
  const sold = products.filter(p => p.status === 'sold').length
  const prices = products.map(p => p.price).filter(Boolean)
  const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0)

  const categories = {}
  products.forEach(p => { categories[p.category] = (categories[p.category] || 0) + 1 })
  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]

  const priceRanges = [
    { range: '0-50€', count: prices.filter(p => p <= 50).length },
    { range: '50-100€', count: prices.filter(p => p > 50 && p <= 100).length },
    { range: '100-200€', count: prices.filter(p => p > 100 && p <= 200).length },
    { range: '200-500€', count: prices.filter(p => p > 200 && p <= 500).length },
    { range: '500€+', count: prices.filter(p => p > 500).length },
  ]

  return {
    data: { total, active, sold, avgPrice, totalViews, topCategory: topCategory ? topCategory[0] : '—', categories, priceRanges, monthlyData: [] },
    error: null,
  }
}
