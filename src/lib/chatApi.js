import { supabase, isSupabaseConfigured } from './supabase'
import { demoProducts, categories } from '../data/demoProducts'

/* ------------------------------------------------------------------ */
/*  Category keyword map for demo fallback                             */
/* ------------------------------------------------------------------ */

const CATEGORY_KEYWORDS = {
  clothing:     ['платье', 'одежд', 'пиджак', 'костюм', 'блуз', 'шуб', 'пальто', 'юбк'],
  jewelry:      ['украшен', 'кольц', 'серьг', 'брош', 'серебр', 'золот', 'ожерел', 'кулон', 'цеп'],
  ceramics:     ['посуд', 'ваз', 'фарфор', 'тарелк', 'серви', 'керами', 'чайн'],
  accessories:  ['сумк', 'портфел', 'час', 'очк', 'ремен', 'аксессуар', 'зонт', 'перчат'],
  furniture:    ['мебел', 'стул', 'кресл', 'стол', 'ламп', 'шкаф', 'интерьер', 'зеркал'],
  art:          ['картин', 'искусств', 'плакат', 'постер', 'живопис', 'литографи'],
  books:        ['книг', 'чтен', 'издан', 'роман', 'автор'],
  vinyl:        ['пластинк', 'виниl', 'музык', 'джаз', 'рок'],
  collectibles: ['коллекц', 'монет', 'марк', 'статуэтк', 'фигурк'],
}

const GIFT_KEYWORDS = ['подарок', 'подарить', 'сюрприз', 'презент']
const DECOR_KEYWORDS = ['интерьер', 'декор', 'дом', 'квартир', 'уют']

/* ------------------------------------------------------------------ */
/*  Resilience: failure tracking + circuit breaker                     */
/* ------------------------------------------------------------------ */

let consecutiveFailures = 0
const MAX_FAILURES_BEFORE_FALLBACK = 2
const CIRCUIT_RESET_MS = 5 * 60 * 1000 // 5 min
let circuitOpenedAt = 0

/** Returns true if the AI service is likely down (circuit open). */
function isCircuitOpen() {
  if (consecutiveFailures < MAX_FAILURES_BEFORE_FALLBACK) return false
  if (Date.now() - circuitOpenedAt > CIRCUIT_RESET_MS) {
    // Half-open: allow one attempt after cooldown
    consecutiveFailures = MAX_FAILURES_BEFORE_FALLBACK - 1
    return false
  }
  return true
}

function recordSuccess() { consecutiveFailures = 0 }
function recordFailure() {
  consecutiveFailures++
  if (consecutiveFailures >= MAX_FAILURES_BEFORE_FALLBACK) {
    circuitOpenedAt = Date.now()
  }
}

/* ------------------------------------------------------------------ */
/*  Rate limiter: per-session, prevent spam                            */
/* ------------------------------------------------------------------ */

let lastRequestTime = 0
const MIN_REQUEST_INTERVAL_MS = 1500 // 1.5s between requests

/* ------------------------------------------------------------------ */
/*  Demo fallback                                                      */
/* ------------------------------------------------------------------ */

function findCategoryMatch(text) {
  const lower = text.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return cat
  }
  return null
}

function extractBudget(text) {
  const m = text.match(/(\d[\d\s]*)\s*(евро|€|eur)/i)
  if (m) return parseInt(m[1].replace(/\s/g, ''), 10)
  const m2 = text.match(/до\s+(\d[\d\s]*)/i)
  if (m2) return parseInt(m2[1].replace(/\s/g, ''), 10)
  return null
}

function formatProductList(products) {
  return products
    .map(p => {
      const cat = categories.find(c => c.id === p.category)
      return `${cat?.icon || ''} **${p.title}** — ${p.price}€\n${p.description?.substring(0, 80)}...`
    })
    .join('\n\n')
}

function demoChatResponse(messages) {
  const allUserText = messages
    .filter(m => m.role === 'user')
    .map(m => m.text)
    .join(' ')
    .toLowerCase()

  const userMsgCount = messages.filter(m => m.role === 'user').length

  // Try to find matching products
  const matchedCat = findCategoryMatch(allUserText)
  const budget = extractBudget(allUserText)
  const isGift = GIFT_KEYWORDS.some(kw => allUserText.includes(kw))
  const isDecor = DECOR_KEYWORDS.some(kw => allUserText.includes(kw))

  let filtered = demoProducts.filter(p => p.status === 'active')
  if (matchedCat) filtered = filtered.filter(p => p.category === matchedCat)
  if (isDecor && !matchedCat) filtered = filtered.filter(p => ['furniture', 'ceramics', 'art'].includes(p.category))
  if (budget) filtered = filtered.filter(p => p.price <= budget)

  const recommended = filtered.slice(0, 3)

  // If we have specific matches, return recommendations
  if (recommended.length > 0 && (matchedCat || budget || isGift || isDecor)) {
    const intro = isGift
      ? 'Отличная идея для подарка! Вот что могу предложить:'
      : 'Вот что нашлось по вашему запросу:'

    return {
      reply: `${intro}\n\n${formatProductList(recommended)}\n\nХотите узнать подробнее о каком-либо товаре?`,
      products: recommended,
    }
  }

  // Scripted conversation flow
  const scripted = [
    'Здравствуйте! Я консультант Galerie du Temps. Помогу подобрать идеальную винтажную вещь. Что вас интересует — подарок, что-то для интерьера или для собственной коллекции?',
    'Отличный выбор! Какой у вас примерный бюджет? Это поможет подобрать подходящие варианты.',
    'Понимаю. Какая эпоха или стиль вам ближе? У нас есть вещи от ар-деко 1920-х до ретро 1970-х.',
    'Спасибо за подробности! Посмотрите наш каталог — там найдутся интересные варианты. Или напишите нам через форму обратной связи!',
  ]

  const idx = Math.min(userMsgCount - 1, scripted.length - 1)
  return { reply: scripted[idx], products: [] }
}

/* ------------------------------------------------------------------ */
/*  Timeout wrapper                                                    */
/* ------------------------------------------------------------------ */

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms),
    ),
  ])
}

/* ------------------------------------------------------------------ */
/*  AI edge function call with retry                                   */
/* ------------------------------------------------------------------ */

async function callAI(messages, retries = 1) {
  const { data, error } = await withTimeout(
    supabase.functions.invoke('gemini-chat', { body: { messages } }),
    15_000, // 15s timeout
  )

  if (error) throw error
  if (data?.error) {
    // Gemini returned an error in the response body
    if (retries > 0 && data.error.includes?.('429')) {
      // Rate limited — wait and retry once
      await new Promise(r => setTimeout(r, 2000))
      return callAI(messages, retries - 1)
    }
    throw new Error(data.error)
  }

  return data
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Send a chat message. Returns { reply, products, error, fallback }.
 * - `fallback: true` means the answer came from the local demo engine.
 */
export async function sendChatMessage(messages) {
  // Rate limiting
  const elapsed = Date.now() - lastRequestTime
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL_MS - elapsed))
  }
  lastRequestTime = Date.now()

  // Try AI service if Supabase is configured and circuit is closed
  if (isSupabaseConfigured && supabase && !isCircuitOpen()) {
    try {
      const data = await callAI(
        messages.map(m => ({ role: m.role, text: m.text })),
      )
      recordSuccess()
      return { reply: data.reply, products: data.products || [], error: null, fallback: false }
    } catch (err) {
      console.warn('AI chat error, falling back to demo:', err.message || err)
      recordFailure()
      // Fall through to demo fallback
    }
  }

  // Demo fallback — always available, works offline
  await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
  const result = demoChatResponse(messages)
  return { ...result, error: null, fallback: true }
}
