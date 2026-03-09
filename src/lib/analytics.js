import { supabase, isSupabaseConfigured } from './supabase'

// =============================================================================
// Session Management
// =============================================================================

const SESSION_KEY = 'vintage_analytics_session'
const LOCAL_EVENTS_KEY = 'vintage_analytics_events'
const BATCH_INTERVAL = 5000
const MAX_BATCH_SIZE = 20

function getSessionId() {
  let sid = sessionStorage.getItem(SESSION_KEY)
  if (!sid) {
    sid = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}

// =============================================================================
// Device Detection
// =============================================================================

function getDeviceInfo() {
  const ua = navigator.userAgent
  let device_type = 'desktop'
  if (/Mobi|Android/i.test(ua)) device_type = 'mobile'
  else if (/Tablet|iPad/i.test(ua)) device_type = 'tablet'

  let browser = 'other'
  if (/YaBrowser/i.test(ua)) browser = 'Yandex'
  else if (/OPR/i.test(ua)) browser = 'Opera'
  else if (/Edge/i.test(ua)) browser = 'Edge'
  else if (/Chrome/i.test(ua) && !/Edge|OPR/i.test(ua)) browser = 'Chrome'
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari'
  else if (/Firefox/i.test(ua)) browser = 'Firefox'

  return { device_type, browser }
}

// =============================================================================
// Event Batch Queue
// =============================================================================

let eventQueue = []
let flushTimer = null

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(flushEvents, BATCH_INTERVAL)
}

async function flushEvents() {
  flushTimer = null
  if (eventQueue.length === 0) return

  const batch = eventQueue.splice(0, MAX_BATCH_SIZE)

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('analytics_events').insert(batch)
      if (error) {
        saveToLocalQueue(batch)
      }
    } catch {
      saveToLocalQueue(batch)
    }
  } else {
    saveToLocalQueue(batch)
  }

  if (eventQueue.length > 0) scheduleFlush()
}

function saveToLocalQueue(events) {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || '[]')
    stored.push(...events)
    if (stored.length > 5000) stored.splice(0, stored.length - 5000)
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(stored))
  } catch { /* quota exceeded */ }
}

// =============================================================================
// Public API
// =============================================================================

export function trackEvent(eventType, data = {}) {
  const { device_type, browser } = getDeviceInfo()
  const event = {
    session_id: getSessionId(),
    event_type: eventType,
    pathname: window.location.pathname,
    product_id: data.product_id || null,
    category: data.category || null,
    channel: data.channel || null,
    metadata: data.metadata || {},
    device_type,
    browser,
    referrer: document.referrer || null,
    created_at: new Date().toISOString(),
  }
  eventQueue.push(event)
  scheduleFlush()
}

// Read local events (for demo mode analytics)
export function getLocalEvents() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || '[]')
  } catch {
    return []
  }
}

// =============================================================================
// Flush on page unload + Retry pending on init
// =============================================================================

if (typeof window !== 'undefined') {
  // Save pending events before page closes
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      saveToLocalQueue(eventQueue)
      eventQueue = []
    }
  })

  // Retry pending localStorage events on startup
  if (isSupabaseConfigured) {
    try {
      const pending = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || '[]')
      if (pending.length > 0) {
        supabase.from('analytics_events').insert(pending).then(({ error }) => {
          if (!error) localStorage.removeItem(LOCAL_EVENTS_KEY)
        })
      }
    } catch { /* ignore */ }
  }
}
