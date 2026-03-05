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

  const lastText = messages[messages.length - 1]?.text?.toLowerCase() || ''
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
    'Спасибо за подробности! К сожалению, в демо-каталоге пока не нашлось точного совпадения. Загляните в наш каталог — там могут быть новые поступления!',
  ]

  const idx = Math.min(userMsgCount - 1, scripted.length - 1)
  return { reply: scripted[idx], products: [] }
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export async function sendChatMessage(messages) {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { messages },
      })
      if (error) throw error
      return { reply: data.reply, products: data.products || [], error: null }
    }

    // Demo fallback
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700))
    const result = demoChatResponse(messages)
    return { ...result, error: null }
  } catch (err) {
    console.error('Chat error:', err)
    return {
      reply: null,
      products: [],
      error: 'Не удалось связаться с сервером. Попробуйте позже.',
    }
  }
}
