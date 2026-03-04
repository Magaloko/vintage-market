import { supabase, isSupabaseConfigured } from './supabase'
import { demoProducts } from '../data/demoProducts'

// =============================================================================
// TTL Cache
// =============================================================================

const cache = new Map()

function cachedFetch(key, ttlMs, fetchFn) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.ts < ttlMs) return Promise.resolve(hit.value)
  return fetchFn().then(result => {
    cache.set(key, { ts: Date.now(), value: result })
    return result
  })
}

export function invalidateCache(key) {
  cache.delete(key)
}

// =============================================================================
// Demo Mode State
// =============================================================================

let localProducts = [...demoProducts]
let localInquiries = []
let localReviews = [
  { id: 'r1', shop_id: 'demo-shop-001', name: 'Мария К.', rating: 5, comment: 'Прекрасный магазин! Нашла уникальное платье 70-х.', created_at: '2025-02-10T14:00:00Z' },
  { id: 'r2', shop_id: 'demo-shop-001', name: 'Thomas W.', rating: 4, comment: 'Gute Qualität, nette Beratung.', created_at: '2025-03-05T10:00:00Z' },
  { id: 'r3', shop_id: 'demo-shop-001', name: 'Анна П.', rating: 5, comment: 'Рекомендую! Очень вежливые и знающие продавцы.', created_at: '2025-03-20T16:30:00Z' },
]
let localProductReviews = []

let nextId = 100
let inquiryId = 100

const DEMO_SHOP = {
  id: 'demo-shop-001', user_id: 'demo-seller-001', name: 'Vintage Corner',
  slug: 'vintage-corner',
  description: 'Уникальные винтажные находки из Европы. Одежда, аксессуары и предметы интерьера 1960-1980х годов.',
  address: 'Нашмаркт, 1060 Вена', phone: '+43 660 123 4567', email: 'seller@vintage.demo',
  website: '', logo_url: null, opening_hours: 'Пн-Сб 10:00-18:00',
  status: 'active', created_at: '2025-01-15T10:00:00Z', rating: 4.7, review_count: 12,
  lat: 48.1985, lng: 16.3584,
}

// =============================================================================
// Helpers
// =============================================================================

function generateId() {
  return String(++nextId)
}

function now() {
  return new Date().toISOString()
}

function getDemoShops() {
  const extra = JSON.parse(localStorage.getItem('vintage_demo_shops') || '[]')
  return [DEMO_SHOP, ...extra]
}

/** Standard wrapper for Supabase calls. Returns { data, error } or { error }. */
async function safeQuery(fn, fallback = { data: null }) {
  try {
    return await fn()
  } catch (e) {
    console.error(e)
    return { ...fallback, error: { message: e.message } }
  }
}

/** Count occurrences by a key function, optionally filtering. */
function countBy(arr, keyFn, filterFn) {
  const counts = {}
  for (const item of arr) {
    if (filterFn && !filterFn(item)) continue
    const k = keyFn(item)
    counts[k] = (counts[k] || 0) + 1
  }
  return counts
}

/** Build price-range histogram from a flat array of numbers. */
function buildPriceRanges(prices) {
  return [
    { range: '0-50',    count: prices.filter(p => p <= 50).length },
    { range: '50-100',  count: prices.filter(p => p > 50  && p <= 100).length },
    { range: '100-200', count: prices.filter(p => p > 100 && p <= 200).length },
    { range: '200-500', count: prices.filter(p => p > 200 && p <= 500).length },
    { range: '500+',    count: prices.filter(p => p > 500).length },
  ]
}

/** Compute basic product statistics from an array of products. */
function computeProductStats(products) {
  const total  = products.length
  const active = products.filter(p => p.status === 'active').length
  const sold   = products.filter(p => p.status === 'sold').length
  const prices = products.map(p => p.price).filter(Boolean)
  const avgPrice = prices.length
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : 0
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0)

  const cats = countBy(products, p => p.category)
  const topCategoryEntry = Object.entries(cats).sort((a, b) => b[1] - a[1])[0]

  const totalRevenue = products
    .filter(p => p.status === 'sold')
    .reduce((s, p) => s + (p.price || 0), 0)

  const revByCat = {}
  products.filter(p => p.status === 'sold').forEach(p => {
    revByCat[p.category] = (revByCat[p.category] || 0) + (p.price || 0)
  })
  const revenueByCategory = Object.entries(revByCat).map(([name, revenue]) => ({ name, revenue }))

  const topByViews = [...products]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)

  return {
    total, active, sold, avgPrice, totalViews,
    topCategory: topCategoryEntry ? topCategoryEntry[0] : '-',
    categories: cats,
    priceRanges: buildPriceRanges(prices),
    totalRevenue, revenueByCategory, topByViews,
  }
}

// =============================================================================
// Products API
// =============================================================================

export async function getProducts({ category, condition, status, search, shop_id, limit, offset = 0 } = {}) {
  if (!isSupabaseConfigured) {
    let filtered = [...localProducts]
    if (category)  filtered = filtered.filter(p => p.category === category)
    if (condition) filtered = filtered.filter(p => p.condition === condition)
    if (status)    filtered = filtered.filter(p => p.status === status)
    if (shop_id)   filtered = filtered.filter(p => p.shop_id === shop_id)
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

  return safeQuery(async () => {
    let query = supabase.from('products').select('*', { count: 'exact' })
    if (category)  query = query.eq('category', category)
    if (condition) query = query.eq('condition', condition)
    if (status)    query = query.eq('status', status)
    if (shop_id)   query = query.eq('shop_id', shop_id)
    if (search)    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`)
    if (limit)     query = query.range(offset, offset + limit - 1)
    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query
    if (error) {
      console.warn('getProducts error:', error.message)
      return { data: [], count: 0, error }
    }
    return { data: data || [], count: count || 0, error: null }
  }, { data: [], count: 0 })
}

export async function getProduct(id) {
  if (!isSupabaseConfigured) {
    const product = localProducts.find(p => p.id === id)
    if (product) product.views = (product.views || 0) + 1
    return { data: product || null, error: product ? null : { message: 'Not found' } }
  }

  return safeQuery(async () => {
    // Increment view count (safe to fail)
    try { await supabase.rpc('increment_views', { product_id: id }) } catch (_) { /* ok */ }

    const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
    if (error) return { data: null, error }

    if (data) {
      // Load gallery images (safe to fail if table missing)
      try {
        const { data: images, error: imgErr } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', id)
          .order('position', { ascending: true })
        data.images = (!imgErr && images) ? images : []
      } catch (_) {
        data.images = []
      }

      // Fallback: single image_url when no gallery images
      if (!data.images.length && data.image_url) {
        data.images = [{ url: data.image_url, alt_text: data.title }]
      }
    }

    return { data, error: null }
  })
}

export async function createProduct(product) {
  if (!isSupabaseConfigured) {
    const newProduct = { ...product, id: generateId(), views: 0, created_at: now() }
    localProducts.unshift(newProduct)
    return { data: newProduct, error: null }
  }

  return safeQuery(async () => {
    const { images, ...productData } = product
    const { data, error } = await supabase.from('products').insert([productData]).select().single()
    if (error) return { data: null, error }
    if (images?.length > 0) {
      try { await saveProductImages(data.id, images) } catch (_) { /* ok */ }
    }
    return { data, error: null }
  })
}

export async function updateProduct(id, updates) {
  if (!isSupabaseConfigured) {
    const idx = localProducts.findIndex(p => p.id === id)
    if (idx === -1) return { data: null, error: { message: 'Not found' } }
    localProducts[idx] = { ...localProducts[idx], ...updates }
    return { data: localProducts[idx], error: null }
  }

  return safeQuery(async () => {
    const { images, ...productUpdates } = updates
    const { data, error } = await supabase.from('products').update(productUpdates).eq('id', id).select().single()
    if (error) return { data: null, error }
    if (images !== undefined) {
      try { await saveProductImages(id, images) } catch (_) { /* ok */ }
    }
    return { data, error: null }
  })
}

export async function deleteProduct(id) {
  if (!isSupabaseConfigured) {
    localProducts = localProducts.filter(p => p.id !== id)
    return { error: null }
  }

  return safeQuery(async () => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    return { error }
  }, {})
}

export async function togglePromoted(id, isPromoted) {
  if (!isSupabaseConfigured) {
    const idx = localProducts.findIndex((p) => p.id === id)
    if (idx === -1) return { data: null, error: { message: 'Not found' } }
    localProducts[idx].is_promoted = isPromoted
    return { data: localProducts[idx], error: null }
  }

  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('products')
      .update({ is_promoted: isPromoted })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  })
}

// =============================================================================
// Product Images API
// =============================================================================

export async function saveProductImages(productId, images) {
  if (!isSupabaseConfigured) return { error: null }

  return safeQuery(async () => {
    await supabase.from('product_images').delete().eq('product_id', productId)

    if (images.length > 0) {
      const rows = images.map((img, idx) => ({
        product_id: productId,
        url: img.url,
        storage_path: img.path || null,
        position: idx,
        alt_text: img.alt_text || null,
      }))
      const { error } = await supabase.from('product_images').insert(rows)
      return { error }
    }
    return { error: null }
  }, {})
}

export async function getProductImages(productId) {
  if (!isSupabaseConfigured) {
    const product = localProducts.find(p => p.id === productId)
    return { data: product?.images || [], error: null }
  }

  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('position', { ascending: true })
    return { data: data || [], error }
  }, { data: [] })
}

// =============================================================================
// Favorites API
// =============================================================================

export async function getFavorites(userId) {
  if (!isSupabaseConfigured) return { data: [], error: null }

  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data: data || [], error }
  }, { data: [] })
}

export async function addFavorite(userId, productId) {
  if (!isSupabaseConfigured) return { error: null }

  return safeQuery(async () => {
    const { error } = await supabase.from('favorites').insert({ user_id: userId, product_id: productId })
    return { error }
  }, {})
}

export async function removeFavorite(userId, productId) {
  if (!isSupabaseConfigured) return { error: null }

  return safeQuery(async () => {
    const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('product_id', productId)
    return { error }
  }, {})
}

// =============================================================================
// Shops API
// =============================================================================

export async function getShops() {
  if (!isSupabaseConfigured) {
    return { data: getDemoShops().filter(s => s.status === 'active'), error: null }
  }

  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('shops').select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    return { data: data || [], error }
  }, { data: [] })
}

export async function getShop(idOrSlug) {
  if (!isSupabaseConfigured) {
    const shop = getDemoShops().find(s => s.id === idOrSlug || s.slug === idOrSlug)
    return { data: shop || null, error: shop ? null : { message: 'Not found' } }
  }

  return safeQuery(async () => {
    // Try slug first, then id
    let { data, error } = await supabase.from('shops').select('*').eq('slug', idOrSlug).maybeSingle()
    if (!data) {
      const res = await supabase.from('shops').select('*').eq('id', idOrSlug).maybeSingle()
      data = res.data
      error = res.error
    }
    return { data, error }
  })
}

export async function getMyShop(shopId) {
  if (!isSupabaseConfigured) {
    const shop = getDemoShops().find(s => s.id === shopId)
    return { data: shop || null, error: null }
  }

  return safeQuery(async () => {
    const { data, error } = await supabase.from('shops').select('*').eq('id', shopId).single()
    return { data, error }
  })
}

export async function updateShop(shopId, updates) {
  if (!isSupabaseConfigured) {
    const shops = getDemoShops()
    const idx = shops.findIndex(s => s.id === shopId)
    if (idx === -1) return { data: null, error: { message: 'Not found' } }

    if (idx === 0) {
      Object.assign(DEMO_SHOP, updates)
      return { data: DEMO_SHOP, error: null }
    }

    const extra = JSON.parse(localStorage.getItem('vintage_demo_shops') || '[]')
    const ei = extra.findIndex(s => s.id === shopId)
    if (ei !== -1) {
      Object.assign(extra[ei], updates)
      localStorage.setItem('vintage_demo_shops', JSON.stringify(extra))
    }
    return { data: { ...shops[idx], ...updates }, error: null }
  }

  return safeQuery(async () => {
    const { data, error } = await supabase.from('shops').update(updates).eq('id', shopId).select().single()
    return { data, error }
  })
}

export async function getShopProducts(shopId) {
  if (!isSupabaseConfigured) {
    return { data: localProducts.filter(p => p.shop_id === shopId), error: null }
  }

  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('products').select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
    return { data: data || [], error }
  }, { data: [] })
}

export async function getShopInquiries(shopId) {
  if (!isSupabaseConfigured) {
    const shopProductIds = localProducts.filter(p => p.shop_id === shopId).map(p => p.id)
    return { data: localInquiries.filter(i => shopProductIds.includes(i.product_id)), error: null }
  }

  return safeQuery(async () => {
    const { data: prods } = await supabase.from('products').select('id').eq('shop_id', shopId)
    const ids = (prods || []).map(p => p.id)
    if (ids.length === 0) return { data: [], error: null }

    const { data, error } = await supabase
      .from('inquiries').select('*')
      .in('product_id', ids)
      .order('created_at', { ascending: false })
    return { data: data || [], error }
  }, { data: [] })
}

export async function getShopStats(shopId) {
  if (!isSupabaseConfigured) {
    const prods = localProducts.filter(p => p.shop_id === shopId)
    const shopInqs = localInquiries.filter(i => prods.some(p => p.id === i.product_id))
    return {
      data: {
        total: prods.length,
        active: prods.filter(p => p.status === 'active').length,
        sold: prods.filter(p => p.status === 'sold').length,
        totalViews: prods.reduce((s, p) => s + (p.views || 0), 0),
        newInquiries: shopInqs.filter(i => i.status === 'new').length,
        totalInquiries: shopInqs.length,
      },
      error: null,
    }
  }

  return safeQuery(async () => {
    const { data: prods } = await supabase.from('products').select('*').eq('shop_id', shopId)
    const products = prods || []
    const ids = products.map(p => p.id)

    let newInquiries = 0
    let totalInquiries = 0
    if (ids.length > 0) {
      try {
        const { data: inqs } = await supabase.from('inquiries').select('status').in('product_id', ids)
        totalInquiries = inqs?.length || 0
        newInquiries = (inqs || []).filter(i => i.status === 'new').length
      } catch (_) { /* ok */ }
    }

    return {
      data: {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        sold: products.filter(p => p.status === 'sold').length,
        totalViews: products.reduce((s, p) => s + (p.views || 0), 0),
        newInquiries,
        totalInquiries,
      },
      error: null,
    }
  })
}

// =============================================================================
// Shop Reviews API
// =============================================================================

export async function getShopReviews(shopId) {
  if (!isSupabaseConfigured) {
    return { data: localReviews.filter(r => r.shop_id === shopId), error: null }
  }

  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('shop_reviews').select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
    return { data: data || [], error }
  }, { data: [] })
}

export async function createShopReview({ shop_id, name, rating, comment }) {
  const review = { shop_id, name, rating, comment, created_at: now() }

  if (!isSupabaseConfigured) {
    review.id = 'r' + Date.now()
    localReviews.unshift(review)
    return { data: review, error: null }
  }

  return safeQuery(async () => {
    const { data, error } = await supabase.from('shop_reviews').insert([review]).select().single()
    return { data, error }
  })
}

// =============================================================================
// Category Counts API (cached)
// =============================================================================

export function getCategoryCounts() {
  return cachedFetch('categoryCounts', 5 * 60 * 1000, _getCategoryCounts)
}

async function _getCategoryCounts() {
  if (!isSupabaseConfigured) {
    return {
      data: countBy(localProducts, p => p.category, p => p.status !== 'sold'),
      error: null,
    }
  }

  try {
    // Fetch ALL products and count in JS -- avoids PostgreSQL NULL filtering issue
    // (.neq('status','sold') excludes rows where status IS NULL!)
    const { data, error } = await supabase.from('products').select('category, status')
    if (error) {
      console.warn('getCategoryCounts error:', error.message)
      return { data: {}, error: null }
    }
    return {
      data: countBy(data || [], p => p.category, p => p.status !== 'sold'),
      error: null,
    }
  } catch (e) {
    console.warn('getCategoryCounts exception:', e)
    return { data: {}, error: null }
  }
}

// =============================================================================
// Inquiries API
// =============================================================================

export async function createInquiry({ name, email, phone, message, product_id, product_title }) {
  const inquiry = {
    name, email,
    phone: phone || null,
    message,
    product_id: product_id || null,
    product_title: product_title || null,
    status: 'new',
    created_at: now(),
  }

  if (!isSupabaseConfigured) {
    inquiry.id = String(++inquiryId)
    localInquiries.unshift(inquiry)
    return { data: inquiry, error: null }
  }

  return safeQuery(async () => {
    const { data, error } = await supabase.from('inquiries').insert([inquiry]).select().single()
    if (error) return { data: null, error }
    return { data, error: null }
  })
}

export async function getInquiries() {
  if (!isSupabaseConfigured) return { data: localInquiries, error: null }

  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('inquiries').select('*')
      .order('created_at', { ascending: false })
    if (error) return { data: [], error }
    return { data: data || [], error: null }
  }, { data: [] })
}

export async function updateInquiryStatus(id, status) {
  if (!isSupabaseConfigured) {
    const idx = localInquiries.findIndex(i => i.id === id)
    if (idx !== -1) localInquiries[idx].status = status
    return { error: null }
  }

  return safeQuery(async () => {
    const { error } = await supabase.from('inquiries').update({ status }).eq('id', id)
    return { error }
  }, {})
}

export async function deleteInquiry(id) {
  if (!isSupabaseConfigured) {
    localInquiries = localInquiries.filter(i => i.id !== id)
    return { error: null }
  }

  return safeQuery(async () => {
    const { error } = await supabase.from('inquiries').delete().eq('id', id)
    return { error }
  }, {})
}

// =============================================================================
// Statistics API (cached avg price + full stats)
// =============================================================================

export function getCategoryAvgPrice(categoryId) {
  return cachedFetch(`avgPrice:${categoryId}`, 10 * 60 * 1000, () => _getCategoryAvgPrice(categoryId))
}

async function _getCategoryAvgPrice(categoryId) {
  if (!isSupabaseConfigured) {
    const catProducts = localProducts.filter(p => p.category === categoryId && p.price)
    if (catProducts.length === 0) return 0
    return Math.round(catProducts.reduce((sum, p) => sum + p.price, 0) / catProducts.length)
  }

  try {
    const { data, error } = await supabase
      .from('products').select('price')
      .eq('category', categoryId)
      .not('price', 'is', null)
    if (error || !data || data.length === 0) return 0
    return Math.round(data.reduce((sum, p) => sum + p.price, 0) / data.length)
  } catch (_) {
    return 0
  }
}

export async function getStats() {
  if (!isSupabaseConfigured) {
    const stats = computeProductStats(localProducts)

    const monthlyData = [
      { month: 'Jan', products: 3, views: 120 },
      { month: 'Feb', products: 5, views: 180 },
      { month: 'Mar', products: 4, views: 250 },
      { month: 'Apr', products: 7, views: 310 },
      { month: 'Mai', products: 6, views: 280 },
      { month: 'Jun', products: 8, views: 420 },
    ]

    const topByFavorites = [...localProducts].map((p, i) => ({
      ...p, favCount: [12, 9, 8, 7, 5, 4, 3, 2, 1, 1][i] || 1,
    })).sort((a, b) => b.favCount - a.favCount).slice(0, 5)

    const totalFavorites = topByFavorites.reduce((s, p) => s + p.favCount, 0)

    return {
      data: {
        ...stats,
        monthlyData,
        topByFavorites,
        totalFavorites,
        newInquiries: localInquiries.filter(i => i.status === 'new').length,
        totalInquiries: localInquiries.length,
      },
      error: null,
    }
  }

  return safeQuery(async () => {
    const { data: products, error } = await supabase.from('products').select('*')
    if (error) return { data: null, error }

    const stats = computeProductStats(products)

    // Monthly data from created_at
    const mNames = ['Jan','Feb','Mar','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
    const mMap = {}
    products.forEach(p => {
      if (!p.created_at) return
      const d = new Date(p.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
      if (!mMap[key]) mMap[key] = { products: 0, views: 0, month: mNames[d.getMonth()] }
      mMap[key].products++
      mMap[key].views += (p.views || 0)
    })
    const monthlyData = Object.entries(mMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, v]) => v)

    // Top by favorites (safe to fail)
    let topByFavorites = []
    let totalFavorites = 0
    try {
      const { data: favData } = await supabase.from('favorites').select('product_id')
      if (favData?.length > 0) {
        const fc = {}
        favData.forEach(f => { fc[f.product_id] = (fc[f.product_id] || 0) + 1 })
        totalFavorites = favData.length
        topByFavorites = Object.entries(fc)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([pid, count]) => {
            const p = products.find(x => x.id === pid)
            return p ? { ...p, favCount: count } : null
          })
          .filter(Boolean)
      }
    } catch (_) { /* favorites table may not exist yet */ }

    // Inquiry counts (safe to fail)
    let newInquiries = 0
    let totalInquiries = 0
    try {
      const { data: inqData } = await supabase.from('inquiries').select('status')
      if (inqData) {
        totalInquiries = inqData.length
        newInquiries = inqData.filter(i => i.status === 'new').length
      }
    } catch (_) { /* inquiries table may not exist */ }

    return {
      data: {
        ...stats,
        monthlyData,
        topByFavorites,
        totalFavorites,
        newInquiries,
        totalInquiries,
      },
      error: null,
    }
  })
}

// =============================================================================
// Product Reviews API
// =============================================================================

export async function getProductReviews(productId) {
  if (!isSupabaseConfigured) {
    return { data: localProductReviews.filter(r => r.product_id === productId), error: null }
  }

  try {
    const { data, error } = await supabase
      .from('product_reviews').select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    return { data: data || [], error: error?.message || null }
  } catch (e) {
    return { data: [], error: e.message }
  }
}

export async function createProductReview({ product_id, name, rating, comment }) {
  const review = {
    product_id,
    name: name.trim(),
    rating: Math.max(1, Math.min(5, Number(rating))),
    comment: comment.trim(),
    created_at: now(),
  }

  if (!isSupabaseConfigured) {
    review.id = 'pr' + Date.now()
    localProductReviews.unshift(review)
    return { data: review, error: null }
  }

  try {
    const { data, error } = await supabase.from('product_reviews').insert([review]).select().single()
    return { data, error: error?.message || null }
  } catch (e) {
    return { data: null, error: e.message }
  }
}
