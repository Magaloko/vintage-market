import { supabase, isSupabaseConfigured } from './supabase'
import { demoProducts } from '../data/demoProducts'
import { trackEvent, getLocalEvents } from './analytics'

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

let localProducts = demoProducts.map(p => ({ ...p, is_promoted: p.is_promoted ?? false }))
let localInquiries = []
let localInquiryNotes = []
let localStatusLog = []
let noteSeqId = 200
let localReviews = [
  { id: 'r1', shop_id: 'demo-shop-001', name: 'Мария К.', rating: 5, comment: 'Прекрасный магазин! Нашла уникальное платье 70-х.', created_at: '2025-02-10T14:00:00Z' },
  { id: 'r2', shop_id: 'demo-shop-001', name: 'Thomas W.', rating: 4, comment: 'Gute Qualität, nette Beratung.', created_at: '2025-03-05T10:00:00Z' },
  { id: 'r3', shop_id: 'demo-shop-001', name: 'Анна П.', rating: 5, comment: 'Рекомендую! Очень вежливые и знающие продавцы.', created_at: '2025-03-20T16:30:00Z' },
]
let localProductReviews = []
let localPriceHistory = []
let localUsers = JSON.parse(localStorage.getItem('vintage_demo_users') || '[]')
let userSeqId = 300
function persistUsers() { localStorage.setItem('vintage_demo_users', JSON.stringify(localUsers)) }

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

export async function getProducts({ category, subcategory, condition, status, search, shop_id, limit, offset = 0 } = {}) {
  if (!isSupabaseConfigured) {
    let filtered = [...localProducts]
    if (category)    filtered = filtered.filter(p => p.category === category)
    if (subcategory) filtered = filtered.filter(p => p.subcategory === subcategory)
    if (condition)   filtered = filtered.filter(p => p.condition === condition)
    if (status)      filtered = filtered.filter(p => p.status === status)
    if (shop_id)     filtered = filtered.filter(p => p.shop_id === shop_id)
    if (search) {
      const q = search.toLowerCase()
      // Hashtag search: #tag
      if (q.startsWith('#')) {
        const tag = q.slice(1)
        filtered = filtered.filter(p =>
          (p.hashtags || []).some(h => h.toLowerCase().includes(tag))
        )
      } else {
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          (p.hashtags || []).some(h => h.toLowerCase().includes(q))
        )
      }
    }
    const total = filtered.length
    if (limit) filtered = filtered.slice(offset, offset + limit)
    return { data: filtered, count: total, error: null }
  }

  return safeQuery(async () => {
    let query = supabase.from('products').select('*', { count: 'exact' })
    if (category)    query = query.eq('category', category)
    if (subcategory) query = query.eq('subcategory', subcategory)
    if (condition)   query = query.eq('condition', condition)
    if (status)      query = query.eq('status', status)
    if (shop_id)     query = query.eq('shop_id', shop_id)
    if (search) {
      const q = search.toLowerCase()
      if (q.startsWith('#')) {
        // Hashtag search via JSONB containment
        query = query.contains('hashtags', [q.slice(1)])
      } else {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`)
      }
    }
    if (limit) query = query.range(offset, offset + limit - 1)
    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query
    if (error) {
      console.warn('getProducts error:', error.message)
      return { data: [], count: 0, error }
    }
    return { data: data || [], count: count || 0, error: null }
  }, { data: [], count: 0 })
}

export async function getProductsByIds(ids) {
  if (!ids || ids.length === 0) return { data: [], error: null }

  if (!isSupabaseConfigured) {
    const found = ids.map(id => localProducts.find(p => p.id === id)).filter(Boolean)
    return { data: found, error: null }
  }

  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', ids)
    if (error) return { data: [], error }
    // Preserve original order
    const map = new Map((data || []).map(p => [p.id, p]))
    const ordered = ids.map(id => map.get(id)).filter(Boolean)
    return { data: ordered, error: null }
  }, { data: [] })
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
    if (newProduct.price) logPriceChange(newProduct.id, newProduct.price)
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

export async function bulkCreateProducts(products) {
  const results = { created: 0, errors: [] }

  if (!isSupabaseConfigured) {
    for (let i = 0; i < products.length; i++) {
      try {
        const p = { ...products[i], id: generateId(), views: 0, created_at: now() }
        localProducts.unshift(p)
        if (p.price) logPriceChange(p.id, p.price)
        results.created++
      } catch (e) {
        results.errors.push({ index: i, message: e.message })
      }
    }
    return { data: results, error: null }
  }

  return safeQuery(async () => {
    // Try batch insert first
    const cleaned = products.map(({ images, ...rest }) => rest)
    const { data, error } = await supabase.from('products').insert(cleaned).select()

    if (!error && data) {
      results.created = data.length
      data.forEach(p => { if (p.price) logPriceChange(p.id, p.price) })
      return { data: results, error: null }
    }

    // Batch failed → fallback to individual inserts for error reporting
    for (let i = 0; i < cleaned.length; i++) {
      const { data: d, error: e } = await supabase.from('products').insert([cleaned[i]]).select().single()
      if (e) {
        results.errors.push({ index: i, message: e.message })
      } else {
        results.created++
        if (d.price) logPriceChange(d.id, d.price)
      }
    }
    return { data: results, error: null }
  })
}

export async function updateProduct(id, updates) {
  if (!isSupabaseConfigured) {
    const idx = localProducts.findIndex(p => p.id === id)
    if (idx === -1) return { data: null, error: { message: 'Not found' } }
    const oldPrice = localProducts[idx].price
    localProducts[idx] = { ...localProducts[idx], ...updates }
    if (updates.price && updates.price !== oldPrice) logPriceChange(id, updates.price)
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
// Obzor — Ticket Lifecycle (Inquiries API)
// =============================================================================

export const OBZOR_TRANSITIONS = {
  new:      ['open'],
  open:     ['pending', 'on_hold', 'solved'],
  pending:  ['open'],
  on_hold:  ['open'],
  solved:   ['open', 'closed'],
  closed:   [],
  // Legacy compat
  read:     ['pending', 'on_hold', 'solved'],
  replied:  ['open', 'closed'],
}

/** Fire-and-forget Telegram notification via Edge Function. */
function notifyTelegram(type, record) {
  if (!isSupabaseConfigured) return
  supabase.functions.invoke('telegram-notify', { body: { type, record } })
    .then(({ error }) => { if (error) console.warn('Telegram notify error:', error) })
    .catch((e) => console.warn('Telegram notify failed:', e))
}

export async function createInquiry({ name, email, phone, message, product_id, product_title }) {
  const inquiry = {
    name, email,
    phone: phone || null,
    message,
    product_id: product_id || null,
    product_title: product_title || null,
    status: 'new',
    created_at: now(),
    updated_at: now(),
  }

  if (!isSupabaseConfigured) {
    inquiry.id = String(++inquiryId)
    localInquiries.unshift(inquiry)
    trackEvent('inquiry_create', { product_id: inquiry.product_id })
    return { data: inquiry, error: null }
  }

  return safeQuery(async () => {
    const { data, error } = await supabase.from('inquiries').insert([inquiry]).select().single()
    if (error) return { data: null, error }
    trackEvent('inquiry_create', { product_id: data.product_id })
    notifyTelegram('new_inquiry', data)
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

export async function updateTicketStatus(id, newStatus, changedBy = 'admin') {
  if (!isSupabaseConfigured) {
    const idx = localInquiries.findIndex(i => i.id === id)
    if (idx === -1) return { error: { message: 'Not found' } }
    const current = localInquiries[idx]
    const allowed = OBZOR_TRANSITIONS[current.status] || []
    if (!allowed.includes(newStatus)) {
      return { error: { message: `Cannot transition from ${current.status} to ${newStatus}` } }
    }
    localStatusLog.push({
      id: String(++noteSeqId),
      inquiry_id: id,
      from_status: current.status,
      to_status: newStatus,
      changed_by: changedBy,
      changed_at: now(),
    })
    current.status = newStatus
    current.updated_at = now()
    if (newStatus === 'solved') {
      current.resolved_at = now()
      const created = new Date(current.created_at).getTime()
      current.sla_resolution_hours = Number(((Date.now() - created) / 3600000).toFixed(2))
    }
    if (newStatus === 'closed') current.closed_at = now()
    return { error: null }
  }

  return safeQuery(async () => {
    const { data: current } = await supabase
      .from('inquiries').select('status, created_at').eq('id', id).single()
    if (!current) return { error: { message: 'Not found' } }
    const allowed = OBZOR_TRANSITIONS[current.status] || []
    if (!allowed.includes(newStatus)) {
      return { error: { message: `Cannot transition from ${current.status} to ${newStatus}` } }
    }
    const updates = { status: newStatus, updated_at: now() }
    if (newStatus === 'solved') {
      updates.resolved_at = now()
      const created = new Date(current.created_at).getTime()
      updates.sla_resolution_hours = Number(((Date.now() - created) / 3600000).toFixed(2))
    }
    if (newStatus === 'closed') updates.closed_at = now()
    const { error } = await supabase.from('inquiries').update(updates).eq('id', id)
    if (!error) {
      supabase.from('inquiry_status_log').insert([{
        inquiry_id: id, from_status: current.status,
        to_status: newStatus, changed_by: changedBy,
      }]).then(() => {}).catch(() => {})
      notifyTelegram('status_change', {
        inquiry_id: id, from_status: current.status,
        new_status: newStatus, changed_by: changedBy,
      })
    }
    return { error }
  }, {})
}

// Backward compat alias
export const updateInquiryStatus = updateTicketStatus

export async function deleteInquiry(id) {
  if (!isSupabaseConfigured) {
    localInquiries = localInquiries.filter(i => i.id !== id)
    localInquiryNotes = localInquiryNotes.filter(n => n.inquiry_id !== id)
    localStatusLog = localStatusLog.filter(l => l.inquiry_id !== id)
    return { error: null }
  }

  return safeQuery(async () => {
    const { error } = await supabase.from('inquiries').delete().eq('id', id)
    return { error }
  }, {})
}

export async function addInquiryNote(inquiryId, content, isInternal = true, author = 'admin') {
  const note = { inquiry_id: inquiryId, content, is_internal: isInternal, author, created_at: now() }

  if (!isSupabaseConfigured) {
    note.id = String(++noteSeqId)
    localInquiryNotes.push(note)
    const idx = localInquiries.findIndex(i => i.id === inquiryId)
    if (idx !== -1) localInquiries[idx].updated_at = now()
    return { data: note, error: null }
  }

  return safeQuery(async () => {
    const { data, error } = await supabase.from('inquiry_notes').insert([note]).select().single()
    if (!error) {
      await supabase.from('inquiries').update({ updated_at: now() }).eq('id', inquiryId)
      if (!isInternal) {
        const { data: inq } = await supabase.from('inquiries').select('name').eq('id', inquiryId).single()
        notifyTelegram('admin_reply', {
          inquiry_id: inquiryId, inquiry_name: inq?.name,
          content, author,
        })
      }
    }
    return { data, error }
  })
}

export async function getInquiryNotes(inquiryId) {
  if (!isSupabaseConfigured) {
    return {
      data: localInquiryNotes
        .filter(n => n.inquiry_id === inquiryId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
      error: null,
    }
  }

  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('inquiry_notes').select('*')
      .eq('inquiry_id', inquiryId)
      .order('created_at', { ascending: true })
    return { data: data || [], error }
  }, { data: [] })
}

export async function getStatusLog(inquiryId) {
  if (!isSupabaseConfigured) {
    return {
      data: localStatusLog
        .filter(l => l.inquiry_id === inquiryId)
        .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at)),
      error: null,
    }
  }

  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('inquiry_status_log').select('*')
      .eq('inquiry_id', inquiryId)
      .order('changed_at', { ascending: false })
    return { data: data || [], error }
  }, { data: [] })
}

// =============================================================================
// Obzor — Auto-Close, CSAT, SLA (Zendesk-inspired)
// =============================================================================

/** Auto-close solved tickets older than `days` days. Fire-and-forget. */
export async function autoCloseTickets(days = 4) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  if (!isSupabaseConfigured) {
    let closed = 0
    for (const inq of localInquiries) {
      if (inq.status === 'solved' && inq.resolved_at && inq.resolved_at < cutoff) {
        localStatusLog.push({
          id: String(++noteSeqId), inquiry_id: inq.id,
          from_status: 'solved', to_status: 'closed',
          changed_by: 'system_autoclose', changed_at: now(),
        })
        inq.status = 'closed'
        inq.closed_at = now()
        inq.updated_at = now()
        closed++
      }
    }
    return { data: { closed }, error: null }
  }

  return safeQuery(async () => {
    const { data: tickets } = await supabase
      .from('inquiries').select('id')
      .eq('status', 'solved')
      .lt('resolved_at', cutoff)
    if (!tickets?.length) return { data: { closed: 0 }, error: null }

    const ids = tickets.map(t => t.id)
    const { error } = await supabase.from('inquiries')
      .update({ status: 'closed', closed_at: now(), updated_at: now() })
      .in('id', ids)

    if (!error) {
      const logEntries = ids.map(id => ({
        inquiry_id: id, from_status: 'solved', to_status: 'closed',
        changed_by: 'system_autoclose',
      }))
      supabase.from('inquiry_status_log').insert(logEntries).then(() => {}).catch(() => {})
    }
    return { data: { closed: ids.length }, error }
  }, { data: { closed: 0 } })
}

/** Record first reply time when agent first responds to a ticket. */
export async function recordFirstReply(inquiryId) {
  if (!isSupabaseConfigured) {
    const inq = localInquiries.find(i => i.id === inquiryId)
    if (inq && !inq.first_reply_at) {
      inq.first_reply_at = now()
      const created = new Date(inq.created_at).getTime()
      inq.sla_first_reply_hours = Number(((Date.now() - created) / 3600000).toFixed(2))
    }
    return { error: null }
  }

  return safeQuery(async () => {
    const { data: inq } = await supabase.from('inquiries').select('first_reply_at, created_at').eq('id', inquiryId).single()
    if (!inq || inq.first_reply_at) return { error: null } // already recorded
    const hours = Number(((Date.now() - new Date(inq.created_at).getTime()) / 3600000).toFixed(2))
    const { error } = await supabase.from('inquiries')
      .update({ first_reply_at: now(), sla_first_reply_hours: hours })
      .eq('id', inquiryId)
    return { error }
  }, {})
}

/** Submit CSAT rating for a resolved ticket. */
export async function submitCSAT(inquiryId, rating, comment = '') {
  if (!isSupabaseConfigured) {
    const inq = localInquiries.find(i => i.id === inquiryId)
    if (!inq) return { error: { message: 'Not found' } }
    inq.csat_rating = Math.max(1, Math.min(5, rating))
    inq.csat_comment = comment || null
    inq.csat_at = now()
    return { error: null }
  }

  return safeQuery(async () => {
    const { error } = await supabase.from('inquiries')
      .update({
        csat_rating: Math.max(1, Math.min(5, rating)),
        csat_comment: comment || null,
        csat_at: now(),
      })
      .eq('id', inquiryId)
    return { error }
  }, {})
}

/** Get ticket analytics for dashboard (SLA, CSAT, FRT, resolution). */
export async function getTicketAnalytics() {
  if (!isSupabaseConfigured) {
    const all = localInquiries
    const solved = all.filter(i => ['solved', 'closed'].includes(i.status))
    const withFrt = all.filter(i => i.sla_first_reply_hours != null)
    const withCsat = all.filter(i => i.csat_rating != null)
    const withResolution = solved.filter(i => i.sla_resolution_hours != null)

    const avgFrt = withFrt.length > 0
      ? Number((withFrt.reduce((s, i) => s + i.sla_first_reply_hours, 0) / withFrt.length).toFixed(1))
      : null
    const avgResolution = withResolution.length > 0
      ? Number((withResolution.reduce((s, i) => s + i.sla_resolution_hours, 0) / withResolution.length).toFixed(1))
      : null
    const avgCsat = withCsat.length > 0
      ? Number((withCsat.reduce((s, i) => s + i.csat_rating, 0) / withCsat.length).toFixed(1))
      : null
    const slaBreachRate = withFrt.length > 0
      ? Number(((withFrt.filter(i => i.sla_first_reply_hours > 8).length / withFrt.length) * 100).toFixed(1))
      : 0

    return {
      data: {
        totalTickets: all.length,
        openTickets: all.filter(i => !['solved', 'closed'].includes(i.status)).length,
        avgFirstReplyHours: avgFrt,
        avgResolutionHours: avgResolution,
        avgCsat: avgCsat,
        csatCount: withCsat.length,
        slaBreachRate,
      },
      error: null,
    }
  }

  return safeQuery(async () => {
    const { data: all } = await supabase.from('inquiries').select('status, sla_first_reply_hours, sla_resolution_hours, csat_rating')
    if (!all) return { data: null, error: null }

    const solved = all.filter(i => ['solved', 'closed'].includes(i.status))
    const withFrt = all.filter(i => i.sla_first_reply_hours != null)
    const withCsat = all.filter(i => i.csat_rating != null)
    const withResolution = all.filter(i => i.sla_resolution_hours != null)

    const avg = (arr, key) => arr.length > 0
      ? Number((arr.reduce((s, i) => s + (i[key] || 0), 0) / arr.length).toFixed(1))
      : null

    return {
      data: {
        totalTickets: all.length,
        openTickets: all.filter(i => !['solved', 'closed'].includes(i.status)).length,
        avgFirstReplyHours: avg(withFrt, 'sla_first_reply_hours'),
        avgResolutionHours: avg(withResolution, 'sla_resolution_hours'),
        avgCsat: avg(withCsat, 'csat_rating'),
        csatCount: withCsat.length,
        slaBreachRate: withFrt.length > 0
          ? Number(((withFrt.filter(i => i.sla_first_reply_hours > 8).length / withFrt.length) * 100).toFixed(1))
          : 0,
      },
      error: null,
    }
  })
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

export async function createProductReview({ product_id, name, rating, comment, screenshot_url, instagram_handle }) {
  const review = {
    product_id,
    name: name.trim(),
    rating: Math.max(1, Math.min(5, Number(rating))),
    comment: comment.trim(),
    screenshot_url: screenshot_url || null,
    instagram_handle: instagram_handle ? instagram_handle.trim().replace(/^@/, '') : null,
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

// =============================================================================
// Price History API
// =============================================================================

function logPriceChange(productId, price) {
  if (!isSupabaseConfigured) {
    localPriceHistory.push({
      id: 'ph' + Date.now() + Math.random().toString(36).slice(2, 6),
      product_id: productId,
      price: Number(price),
      changed_at: now(),
    })
    return
  }

  // Fire-and-forget for Supabase
  supabase.from('price_history').insert([{
    product_id: productId,
    price: Number(price),
    changed_at: now(),
  }]).then(() => {}).catch(() => {})
}

export async function getPriceHistory(productId) {
  if (!isSupabaseConfigured) {
    return {
      data: localPriceHistory
        .filter(h => h.product_id === productId)
        .sort((a, b) => new Date(a.changed_at) - new Date(b.changed_at)),
      error: null,
    }
  }

  try {
    const { data, error } = await supabase
      .from('price_history').select('*')
      .eq('product_id', productId)
      .order('changed_at', { ascending: true })
    return { data: data || [], error: error?.message || null }
  } catch (e) {
    return { data: [], error: e.message }
  }
}

// =============================================================================
// Users / Contacts API
// =============================================================================

export async function getUsers({ role, status, search } = {}) {
  if (!isSupabaseConfigured) {
    let filtered = [...localUsers]
    if (role) filtered = filtered.filter(u => u.role === role)
    if (status) filtered = filtered.filter(u => u.status === status)
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(u =>
        (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
      )
    }
    return { data: filtered, error: null }
  }
  return safeQuery(async () => {
    let q = supabase.from('user_contacts').select('*')
    if (role) q = q.eq('role', role)
    if (status) q = q.eq('status', status)
    const { data, error } = await q.order('created_at', { ascending: false })
    return { data, error }
  })
}

export async function createUser(user) {
  if (!isSupabaseConfigured) {
    const newUser = { ...user, id: String(++userSeqId), created_at: now() }
    localUsers.unshift(newUser)
    persistUsers()
    return { data: newUser, error: null }
  }
  return safeQuery(async () => {
    const { data, error } = await supabase.from('user_contacts').insert([user]).select().single()
    return { data, error }
  })
}

export async function updateUser(id, updates) {
  if (!isSupabaseConfigured) {
    const idx = localUsers.findIndex(u => u.id === id)
    if (idx === -1) return { data: null, error: { message: 'Not found' } }
    localUsers[idx] = { ...localUsers[idx], ...updates }
    persistUsers()
    return { data: localUsers[idx], error: null }
  }
  return safeQuery(async () => {
    const { data, error } = await supabase.from('user_contacts').update(updates).eq('id', id).select().single()
    return { data, error }
  })
}

export async function deleteUser(id) {
  if (!isSupabaseConfigured) {
    localUsers = localUsers.filter(u => u.id !== id)
    persistUsers()
    return { error: null }
  }
  return safeQuery(async () => {
    const { error } = await supabase.from('user_contacts').delete().eq('id', id)
    return { error }
  }, {})
}

export async function getUsersByRole(...roles) {
  if (!isSupabaseConfigured) {
    return { data: localUsers.filter(u => roles.includes(u.role) && u.status === 'active'), error: null }
  }
  return safeQuery(async () => {
    const { data, error } = await supabase.from('user_contacts').select('*').in('role', roles).eq('status', 'active')
    return { data, error }
  })
}

// =============================================================================
// Agent Workspace API
// =============================================================================

export async function getAgentInquiries(agentId) {
  if (!isSupabaseConfigured) {
    return {
      data: localInquiries.filter(i => i.assigned_to === agentId || !i.assigned_to),
      error: null,
    }
  }

  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('inquiries').select('*')
      .or(`assigned_to.eq.${agentId},assigned_to.is.null`)
      .order('created_at', { ascending: false })
    return { data: data || [], error }
  }, { data: [] })
}

export async function assignTicket(ticketId, agentId) {
  if (!isSupabaseConfigured) {
    const idx = localInquiries.findIndex(i => i.id === ticketId)
    if (idx === -1) return { error: { message: 'Not found' } }
    localInquiries[idx].assigned_to = agentId || null
    localInquiries[idx].updated_at = now()
    return { error: null }
  }

  return safeQuery(async () => {
    const { error } = await supabase.from('inquiries')
      .update({ assigned_to: agentId || null, updated_at: now() })
      .eq('id', ticketId)
    return { error }
  }, {})
}

export async function getAgentDashboard(agentId) {
  if (!isSupabaseConfigured) {
    const mine = localInquiries.filter(i => i.assigned_to === agentId)
    const unassigned = localInquiries.filter(i => !i.assigned_to && !['solved', 'closed'].includes(i.status))
    const open = mine.filter(i => !['solved', 'closed'].includes(i.status))
    const withCsat = mine.filter(i => i.csat_rating != null)
    const slaBreaches = open.filter(i => {
      const hours = (Date.now() - new Date(i.created_at).getTime()) / 3600000
      return i.sla_first_reply_hours ? i.sla_first_reply_hours > 8 : hours > 8
    })
    return {
      data: {
        myTickets: open.length,
        unassigned: unassigned.length,
        slaBreaches: slaBreaches.length,
        avgCsat: withCsat.length ? +(withCsat.reduce((s, i) => s + i.csat_rating, 0) / withCsat.length).toFixed(1) : null,
        slaAlerts: slaBreaches.slice(0, 5),
      },
      error: null,
    }
  }

  return safeQuery(async () => {
    const { data: all } = await supabase.from('inquiries').select('*')
    if (!all) return { data: { myTickets: 0, unassigned: 0, slaBreaches: 0, avgCsat: null, slaAlerts: [] }, error: null }

    const mine = all.filter(i => i.assigned_to === agentId)
    const unassigned = all.filter(i => !i.assigned_to && !['solved', 'closed'].includes(i.status))
    const open = mine.filter(i => !['solved', 'closed'].includes(i.status))
    const withCsat = mine.filter(i => i.csat_rating != null)
    const slaBreaches = open.filter(i => {
      const hours = (Date.now() - new Date(i.created_at).getTime()) / 3600000
      return i.sla_first_reply_hours ? i.sla_first_reply_hours > 8 : hours > 8
    })
    return {
      data: {
        myTickets: open.length,
        unassigned: unassigned.length,
        slaBreaches: slaBreaches.length,
        avgCsat: withCsat.length ? +(withCsat.reduce((s, i) => s + i.csat_rating, 0) / withCsat.length).toFixed(1) : null,
        slaAlerts: slaBreaches.slice(0, 5),
      },
      error: null,
    }
  })
}

// =============================================================================
// Analytics Events Reader
// =============================================================================

async function fetchAnalyticsEvents(days, eventTypes = null) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceISO = since.toISOString()

  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', sinceISO)
        .order('created_at', { ascending: true })
      if (eventTypes) query = query.in('event_type', eventTypes)
      const { data, error } = await query
      if (!error && data && data.length > 0) return data
    } catch { /* fall through to local */ }
  }

  // Fallback: localStorage events
  const sinceMs = since.getTime()
  let events = getLocalEvents().filter(e => new Date(e.created_at).getTime() >= sinceMs)
  if (eventTypes) events = events.filter(e => eventTypes.includes(e.event_type))
  return events
}

function buildRealOverview(events, days) {
  const sessions = new Set(events.map(e => e.session_id))
  const totalVisits = events.length
  const uniqueVisitors = sessions.size
  const pagesPerVisit = sessions.size > 0 ? +(totalVisits / sessions.size).toFixed(1) : 0

  const byDate = {}
  events.forEach(e => {
    const d = e.created_at.slice(0, 10)
    if (!byDate[d]) byDate[d] = { total: 0, sessions: new Set() }
    byDate[d].total++
    byDate[d].sessions.add(e.session_id)
  })
  const dailyVisits = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({ date, visits: d.total, unique: d.sessions.size }))

  return {
    totalVisits, uniqueVisitors, pagesPerVisit,
    avgSessionDuration: 0, bounceRate: 0,
    totalVisitsDelta: 0, uniqueVisitorsDelta: 0, bounceRateDelta: 0,
    dailyVisits,
  }
}

function buildRealVisitors(events) {
  const deviceCounts = {}
  const browserCounts = {}
  const sessionDevices = {}
  events.forEach(e => {
    if (!sessionDevices[e.session_id]) {
      sessionDevices[e.session_id] = true
      deviceCounts[e.device_type || 'desktop'] = (deviceCounts[e.device_type || 'desktop'] || 0) + 1
      browserCounts[e.browser || 'other'] = (browserCounts[e.browser || 'other'] || 0) + 1
    }
  })
  const totalDevices = Object.values(deviceCounts).reduce((s, v) => s + v, 0) || 1
  const totalBrowsers = Object.values(browserCounts).reduce((s, v) => s + v, 0) || 1
  return {
    geography: [{ country: 'Данные', city: 'скоро', visits: events.length, percent: 100 }],
    newVsReturning: { new: 65, returning: 35 },
    devices: Object.entries(deviceCounts).map(([type, count]) => ({ type, count: Math.round(count / totalDevices * 100) })),
    browsers: Object.entries(browserCounts).map(([name, count]) => ({ name, percent: Math.round(count / totalBrowsers * 100) })),
  }
}

function buildRealActions(events, allEvents) {
  const pvEvents = events.filter(e => e.event_type === 'product_view')
  const favEvents = allEvents.filter(e => e.event_type === 'favorite_add')
  const inqEvents = allEvents.filter(e => e.event_type === 'inquiry_create')
  const shareEvents = allEvents.filter(e => e.event_type === 'share_click')

  const productViews = {}
  pvEvents.forEach(e => {
    if (!e.product_id) return
    if (!productViews[e.product_id]) productViews[e.product_id] = { views: 0, sessions: new Set() }
    productViews[e.product_id].views++
    productViews[e.product_id].sessions.add(e.session_id)
  })

  const topProducts = Object.entries(productViews)
    .map(([id, d]) => {
      const p = localProducts.find(x => x.id === id)
      return { id, title: p?.title || id, image_url: p?.image_url, views: d.views, uniqueViews: d.sessions.size, avgTime: 0, category: p?.category }
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  const catViews = {}
  pvEvents.forEach(e => { if (e.category) catViews[e.category] = (catViews[e.category] || 0) + 1 })
  const topCategories = Object.entries(catViews).map(([id, views]) => ({ id, name: id, views })).sort((a, b) => b.views - a.views).slice(0, 8)

  const byDate = {}
  allEvents.forEach(e => {
    const d = e.created_at.slice(0, 10)
    if (!byDate[d]) byDate[d] = { views: 0, favorites: 0, inquiries: 0, shares: 0 }
    if (e.event_type === 'product_view') byDate[d].views++
    if (e.event_type === 'favorite_add') byDate[d].favorites++
    if (e.event_type === 'inquiry_create') byDate[d].inquiries++
    if (e.event_type === 'share_click') byDate[d].shares++
  })
  const interactionTimeline = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, d]) => ({ date, ...d }))

  return {
    totalPageViews: pvEvents.length,
    uniquePageViews: new Set(pvEvents.map(e => e.session_id + e.product_id)).size,
    avgTimeOnPage: 0,
    topProducts, topCategories, interactionTimeline,
  }
}

function buildRealChannels(events) {
  const channelMap = {}
  events.forEach(e => {
    const ch = e.channel || (e.referrer ? 'referral' : 'direct')
    if (!channelMap[ch]) channelMap[ch] = { visits: 0, sessions: new Set() }
    channelMap[ch].visits++
    channelMap[ch].sessions.add(e.session_id)
  })
  const colorMap = { direct: '#B08D57', whatsapp: '#25D366', telegram: '#0088CC', instagram: '#E4405F', search: '#4285F4', referral: '#7A5340', native: '#9B7E4A', clipboard: '#6E5535' }
  const channels = Object.entries(channelMap).map(([key, d]) => ({
    name: key, key, color: colorMap[key] || '#7A5340',
    visits: d.visits, bounceRate: 0, conversions: 0, conversionRate: 0,
  }))
  return { channels, channelTrend: [] }
}

const REAL_DATA_THRESHOLD = 5

// =============================================================================
// Deep Analytics API (Matomo-inspired)
// =============================================================================

function seededRandom(seed) {
  let s = Math.abs(seed) || 1
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateDailyPoints(days, basePerDay, variance, rand) {
  const points = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dow = d.getDay()
    const weekendFactor = (dow === 0 || dow === 6) ? 0.6 : 1.0
    const trendFactor = 1 + (days - i) / days * 0.15
    const value = Math.round(basePerDay * weekendFactor * trendFactor * (1 + (rand() - 0.5) * variance))
    points.push({ date: d.toISOString().slice(0, 10), value: Math.max(1, value) })
  }
  return points
}

const daySeed = () => Math.floor(Date.now() / 86400000)

export async function getAnalyticsOverview(days = 30) {
  try {
    const events = await fetchAnalyticsEvents(days, ['page_view'])
    if (events.length >= REAL_DATA_THRESHOLD) {
      return { data: buildRealOverview(events, days), error: null }
    }
  } catch { /* fall through */ }

  const rand = seededRandom(daySeed() + 1)
  const dailyVisits = generateDailyPoints(days, 120, 0.4, rand)
  const totalVisits = dailyVisits.reduce((s, p) => s + p.value, 0)
  const uniqueRatio = 0.62 + rand() * 0.1
  const uniqueVisitors = Math.round(totalVisits * uniqueRatio)
  const pagesPerVisit = +(2.1 + rand() * 1.4).toFixed(1)
  const avgSessionDuration = Math.round(90 + rand() * 120)
  const bounceRate = +(38 + rand() * 18).toFixed(1)
  const totalVisitsDelta = +(-8 + rand() * 25).toFixed(1)
  const uniqueVisitorsDelta = +(-5 + rand() * 20).toFixed(1)
  const bounceRateDelta = +(-4 + rand() * 8).toFixed(1)
  return {
    data: {
      totalVisits, uniqueVisitors, pagesPerVisit, avgSessionDuration, bounceRate,
      totalVisitsDelta, uniqueVisitorsDelta, bounceRateDelta,
      dailyVisits: dailyVisits.map(p => ({ date: p.date, visits: p.value, unique: Math.round(p.value * uniqueRatio) })),
    },
    error: null,
  }
}

export async function getAnalyticsVisitors(days = 30) {
  try {
    const events = await fetchAnalyticsEvents(days, ['page_view'])
    if (events.length >= REAL_DATA_THRESHOLD) {
      return { data: buildRealVisitors(events), error: null }
    }
  } catch { /* fall through */ }

  const rand = seededRandom(daySeed() + 2)
  const totalGeo = Math.round(800 + rand() * 600) * (days / 30)
  const geoData = [
    { country: 'Казахстан', city: 'Алматы', percent: 35 },
    { country: 'Казахстан', city: 'Астана', percent: 15 },
    { country: 'Казахстан', city: 'Шымкент', percent: 10 },
    { country: 'Россия', city: 'Москва', percent: 12 },
    { country: 'Австрия', city: 'Вена', percent: 8 },
    { country: 'Турция', city: 'Стамбул', percent: 6 },
    { country: 'Германия', city: 'Берлин', percent: 5 },
    { country: 'Узбекистан', city: 'Ташкент', percent: 4 },
    { country: 'Другие', city: '—', percent: 5 },
  ].map(g => ({ ...g, visits: Math.round(totalGeo * g.percent / 100 * (0.85 + rand() * 0.3)) }))

  const newPct = 55 + Math.round(rand() * 15)
  const devices = [
    { type: 'Mobile', count: 58 + Math.round(rand() * 8) },
    { type: 'Desktop', count: 32 + Math.round(rand() * 6) },
    { type: 'Tablet', count: 5 + Math.round(rand() * 4) },
  ]
  const browsers = [
    { name: 'Chrome', percent: 52 + Math.round(rand() * 8) },
    { name: 'Safari', percent: 18 + Math.round(rand() * 5) },
    { name: 'Yandex', percent: 12 + Math.round(rand() * 4) },
    { name: 'Firefox', percent: 6 + Math.round(rand() * 3) },
    { name: 'Other', percent: 5 },
  ]
  return {
    data: {
      geography: geoData,
      newVsReturning: { new: newPct, returning: 100 - newPct },
      devices,
      browsers,
    },
    error: null,
  }
}

export async function getAnalyticsActions(days = 30) {
  try {
    const allEvents = await fetchAnalyticsEvents(days, ['product_view', 'favorite_add', 'inquiry_create', 'share_click'])
    const pvEvents = allEvents.filter(e => e.event_type === 'product_view')
    if (pvEvents.length >= REAL_DATA_THRESHOLD) {
      return { data: buildRealActions(pvEvents, allEvents), error: null }
    }
  } catch { /* fall through */ }

  const rand = seededRandom(daySeed() + 3)
  const scale = days / 30
  const totalPageViews = Math.round((3200 + rand() * 1800) * scale)
  const uniquePageViews = Math.round(totalPageViews * (0.6 + rand() * 0.12))
  const avgTimeOnPage = Math.round(35 + rand() * 50)

  const topProducts = [...localProducts]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10)
    .map(p => ({
      id: p.id, title: p.title, image_url: p.image_url,
      views: p.views || Math.round(30 + rand() * 200),
      uniqueViews: Math.round((p.views || 50) * (0.55 + rand() * 0.15)),
      avgTime: Math.round(20 + rand() * 60),
      category: p.category,
    }))

  const catMap = {}
  localProducts.forEach(p => { catMap[p.category] = (catMap[p.category] || 0) + (p.views || Math.round(10 + rand() * 40)) })
  const topCategories = Object.entries(catMap)
    .map(([id, views]) => ({ id, name: id, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)

  const interactionTimeline = generateDailyPoints(days, 100, 0.35, rand).map(p => ({
    date: p.date,
    views: p.value,
    favorites: Math.round(p.value * 0.08 * (0.7 + rand() * 0.6)),
    inquiries: Math.round(p.value * 0.03 * (0.6 + rand() * 0.8)),
    shares: Math.round(p.value * 0.02 * (0.5 + rand() * 1)),
  }))

  return {
    data: { totalPageViews, uniquePageViews, avgTimeOnPage, topProducts, topCategories, interactionTimeline },
    error: null,
  }
}

export async function getAnalyticsChannels(days = 30) {
  try {
    const events = await fetchAnalyticsEvents(days, ['page_view', 'share_click'])
    if (events.length >= REAL_DATA_THRESHOLD) {
      return { data: buildRealChannels(events), error: null }
    }
  } catch { /* fall through */ }

  const rand = seededRandom(daySeed() + 4)
  const base = Math.round((2800 + rand() * 1500) * (days / 30))
  const channels = [
    { name: 'Прямой', key: 'direct', pct: 30, color: '#B08D57' },
    { name: 'WhatsApp', key: 'whatsapp', pct: 25, color: '#25D366' },
    { name: 'Telegram', key: 'telegram', pct: 15, color: '#0088CC' },
    { name: 'Instagram', key: 'instagram', pct: 15, color: '#E4405F' },
    { name: 'Поиск', key: 'search', pct: 10, color: '#4285F4' },
    { name: 'Реферал', key: 'referral', pct: 5, color: '#7A5340' },
  ].map(ch => ({
    ...ch,
    visits: Math.round(base * ch.pct / 100 * (0.85 + rand() * 0.3)),
    bounceRate: +(30 + rand() * 30).toFixed(1),
    conversions: Math.round(base * ch.pct / 100 * 0.012 * (0.6 + rand() * 0.8)),
    conversionRate: +(0.5 + rand() * 2.5).toFixed(1),
  }))

  const trendDays = generateDailyPoints(days, base / days, 0.35, rand)
  const channelTrend = trendDays.map(p => {
    const obj = { date: p.date }
    channels.forEach(ch => { obj[ch.key] = Math.round(p.value * ch.pct / 100 * (0.8 + rand() * 0.4)) })
    return obj
  })

  return { data: { channels, channelTrend }, error: null }
}

export async function getAnalyticsSales(days = 30) {
  try {
    const events = await fetchAnalyticsEvents(days, ['inquiry_create', 'product_view', 'favorite_add'])
    const inqEvents = events.filter(e => e.event_type === 'inquiry_create')
    if (inqEvents.length >= REAL_DATA_THRESHOLD) {
      const soldProducts = localProducts.filter(p => p.status === 'sold')
      const pvEvents = events.filter(e => e.event_type === 'product_view')
      const favEvents = events.filter(e => e.event_type === 'favorite_add')
      const totalRevenue = soldProducts.reduce((s, p) => s + (p.price || 0), 0)
      const ordersCount = soldProducts.length || inqEvents.length
      const avgOrderValue = ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0
      const totalViews = pvEvents.length || 1

      const byDate = {}
      inqEvents.forEach(e => {
        const d = e.created_at.slice(0, 10)
        if (!byDate[d]) byDate[d] = { revenue: 0, orders: 0 }
        byDate[d].orders++
        byDate[d].revenue += avgOrderValue || 200
      })
      const revenueTimeline = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, d]) => ({ date, ...d }))

      const catRevenue = {}
      soldProducts.forEach(p => { catRevenue[p.category] = (catRevenue[p.category] || 0) + (p.price || 0) })
      const revenueByCategory = Object.entries(catRevenue).map(([name, revenue]) => ({
        name, revenue, orders: Math.max(1, Math.round(revenue / (avgOrderValue || 200)))
      })).sort((a, b) => b.revenue - a.revenue)

      const funnel = {
        views: totalViews,
        favorites: favEvents.length,
        inquiries: inqEvents.length,
        sales: soldProducts.length,
      }

      const topByRevenue = soldProducts.slice(0, 10).map(p => ({
        id: p.id, title: p.title, image_url: p.image_url, revenue: p.price || 0, orders: 1, category: p.category
      })).sort((a, b) => b.revenue - a.revenue)

      return {
        data: {
          totalRevenue, ordersCount, avgOrderValue,
          conversionRate: totalViews > 0 ? +(inqEvents.length / totalViews * 100).toFixed(1) : 0,
          revenueDelta: 0, revenueTimeline, revenueByCategory, funnel, topByRevenue,
        },
        error: null,
      }
    }
  } catch { /* fall through */ }

  const rand = seededRandom(daySeed() + 5)
  const scale = days / 30
  const soldProducts = localProducts.filter(p => p.status === 'sold')
  const totalRevenue = soldProducts.length > 0
    ? soldProducts.reduce((s, p) => s + (p.price || 0), 0)
    : Math.round((4500 + rand() * 3000) * scale)
  const ordersCount = soldProducts.length > 0
    ? Math.round(soldProducts.length * scale)
    : Math.round((12 + rand() * 18) * scale)
  const avgOrderValue = ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0
  const conversionRate = +(1 + rand() * 2).toFixed(1)
  const revenueDelta = +(-10 + rand() * 30).toFixed(1)

  const revenueTimeline = generateDailyPoints(days, totalRevenue / days, 0.5, rand).map(p => ({
    date: p.date,
    revenue: p.value,
    orders: Math.max(0, Math.round(p.value / (avgOrderValue || 200) * (0.7 + rand() * 0.6))),
  }))

  const catRevenue = {}
  soldProducts.forEach(p => {
    catRevenue[p.category] = (catRevenue[p.category] || 0) + (p.price || 0)
  })
  if (Object.keys(catRevenue).length === 0) {
    ;['jewelry', 'furniture', 'art', 'clothing', 'ceramics'].forEach(c => {
      catRevenue[c] = Math.round(500 + rand() * 2000)
    })
  }
  const revenueByCategory = Object.entries(catRevenue)
    .map(([name, revenue]) => ({ name, revenue, orders: Math.max(1, Math.round(revenue / (avgOrderValue || 200))) }))
    .sort((a, b) => b.revenue - a.revenue)

  const totalViews = localProducts.reduce((s, p) => s + (p.views || 0), 0) || Math.round(3000 * scale)
  const funnel = {
    views: totalViews,
    favorites: Math.round(totalViews * 0.08),
    inquiries: Math.round(totalViews * 0.03),
    sales: ordersCount,
  }

  const topByRevenue = (soldProducts.length > 0 ? soldProducts : localProducts.slice(0, 5))
    .map(p => ({ id: p.id, title: p.title, image_url: p.image_url, revenue: p.price || Math.round(100 + rand() * 800), orders: 1, category: p.category }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  return {
    data: { totalRevenue, ordersCount, avgOrderValue, conversionRate, revenueDelta, revenueTimeline, revenueByCategory, funnel, topByRevenue },
    error: null,
  }
}

export async function getAnalyticsGoals(days = 30) {
  try {
    const events = await fetchAnalyticsEvents(days, ['inquiry_create', 'favorite_add', 'page_view'])
    const inqEvents = events.filter(e => e.event_type === 'inquiry_create')
    const favEvents = events.filter(e => e.event_type === 'favorite_add')
    const pvEvents = events.filter(e => e.event_type === 'page_view')
    if (pvEvents.length >= REAL_DATA_THRESHOLD) {
      const buildGoalTrend = (evts) => {
        const byDate = {}
        evts.forEach(e => {
          const d = e.created_at.slice(0, 10)
          byDate[d] = (byDate[d] || 0) + 1
        })
        return Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, completions]) => ({ date, completions }))
      }
      const totalPV = pvEvents.length || 1
      const goals = [
        { id: 'inquiry', name: 'Заявка отправлена', completions: inqEvents.length, conversionRate: +(inqEvents.length / totalPV * 100).toFixed(1), trend: buildGoalTrend(inqEvents) },
        { id: 'favorite', name: 'Добавлено в избранное', completions: favEvents.length, conversionRate: +(favEvents.length / totalPV * 100).toFixed(1), trend: buildGoalTrend(favEvents) },
        { id: 'inquiry_to_sale', name: 'Заявка → Продажа', completions: localProducts.filter(p => p.status === 'sold').length, conversionRate: inqEvents.length > 0 ? +(localProducts.filter(p => p.status === 'sold').length / inqEvents.length * 100).toFixed(1) : 0, trend: [] },
        { id: 'response_time', name: 'Ответ < 4 часа', completions: inqEvents.length, conversionRate: 0, trend: [] },
      ]
      return { data: { goals }, error: null }
    }
  } catch { /* fall through */ }

  const rand = seededRandom(daySeed() + 6)
  const scale = days / 30
  const goals = [
    { id: 'inquiry', name: 'Заявка отправлена', base: 45, rate: 3.2 },
    { id: 'favorite', name: 'Добавлено в избранное', base: 120, rate: 8.5 },
    { id: 'inquiry_to_sale', name: 'Заявка → Продажа', base: 8, rate: 18 },
    { id: 'response_time', name: 'Ответ < 4 часа', base: 35, rate: 78 },
  ].map(g => {
    const completions = Math.round(g.base * scale * (0.8 + rand() * 0.4))
    const conversionRate = +(g.rate * (0.85 + rand() * 0.3)).toFixed(1)
    const trend = generateDailyPoints(Math.min(days, 30), g.base / 30, 0.45, rand)
      .map(p => ({ date: p.date, completions: p.value }))
    return { id: g.id, name: g.name, completions, conversionRate, trend }
  })
  return { data: { goals }, error: null }
}

export async function getAnalyticsSellers(days = 30) {
  const rand = seededRandom(daySeed() + 7)
  const scale = days / 30
  const sellerUsers = localUsers.filter(u => u.role === 'seller' || u.role === 'agent')
  const sellers = (sellerUsers.length > 0 ? sellerUsers : [
    { id: 's1', name: 'Алия К.', role: 'seller' },
    { id: 's2', name: 'Thomas M.', role: 'seller' },
    { id: 's3', name: 'Марат Б.', role: 'agent' },
  ]).map(u => ({
    id: u.id,
    name: u.name,
    role: u.role,
    products: Math.round((3 + rand() * 12) * scale),
    views: Math.round((80 + rand() * 400) * scale),
    inquiries: Math.round((2 + rand() * 15) * scale),
    sales: Math.round((1 + rand() * 6) * scale),
    revenue: Math.round((300 + rand() * 3000) * scale),
  }))

  const activityTimeline = generateDailyPoints(Math.min(days, 30), 2, 0.6, rand)
    .map(p => ({ date: p.date, newListings: Math.max(0, p.value) }))

  return { data: { sellers, activityTimeline }, error: null }
}
