/**
 * ATS Scoring Engine — портирован из CareerOS
 * Адаптирован для оценки кандидатов на позиции продавцов/представителей
 *
 * 3 Dimension: 40% Keywords, 30% Struktur, 30% Ergebnisse
 */

const ATS_KNOWLEDGE = {
  roleProfiles: {
    'sales-rep': {
      label: 'Торговый представитель',
      coreKeywords: [
        'pipeline', 'quota', 'outbound', 'CRM', 'lead', 'prospect', 'conversion',
        'revenue', 'KPI', 'forecast', 'cadence', 'cold call', 'B2B', 'account',
        'upsell', 'cross-sell', 'deal', 'close', 'SDR', 'BDR', 'SaaS', 'demo',
        'discovery', 'objection', 'follow-up', 'sequence', 'Salesforce', 'HubSpot',
        'Pipedrive', 'pipeline management', 'lead generation', 'qualification',
        'sales cycle', 'win rate', 'deal velocity', 'MQL', 'SQL', 'opportunity',
        'revenue target', 'attainment', 'commission', 'OTE', 'inbound', 'outreach',
      ],
      competencies: {
        'Проспектирование и квалификация': {
          keywords: ['prospect', 'lead', 'qualify', 'qualification', 'outbound', 'cold call',
            'SDR', 'BDR', 'lead generation', 'discovery', 'MQL', 'SQL', 'sourcing', 'ICP'],
          weight: 1.5,
        },
        'Outbound-стратегия': {
          keywords: ['cadence', 'sequence', 'outreach', 'follow-up', 'touchpoint',
            'email campaign', 'LinkedIn', 'cold email', 'cold calling', 'outbound'],
          weight: 1.2,
        },
        'CRM и отчётность': {
          keywords: ['CRM', 'Salesforce', 'HubSpot', 'Pipedrive', 'reporting', 'forecast',
            'activity tracking', 'pipeline hygiene', 'dashboard', 'KPI tracking'],
          weight: 1.0,
        },
        'Управление Pipeline': {
          keywords: ['pipeline', 'funnel', 'opportunity', 'stage', 'close', 'velocity', 'deal',
            'forecast', 'pipeline review', 'sales cycle', 'win rate', 'conversion rate'],
          weight: 1.3,
        },
        'Ответственность за выручку': {
          keywords: ['quota', 'target', 'revenue', 'attainment', 'OTE', 'commission', 'KPI',
            'achievement', 'performance', '% of quota', 'ARR', 'MRR', 'ACV', 'deal size'],
          weight: 1.5,
        },
        'Кросс-функциональная работа': {
          keywords: ['collaborate', 'cross-functional', 'marketing', 'product', 'customer success',
            'team', 'stakeholder', 'handover', 'presales'],
          weight: 0.8,
        },
      },
    },
    'key-account': {
      label: 'Менеджер по ключевым клиентам',
      coreKeywords: [
        'account', 'client', 'relationship', 'retention', 'upsell', 'expansion', 'renewal',
        'NPS', 'satisfaction', 'strategic', 'key account', 'revenue', 'portfolio',
        'churn', 'lifetime value', 'LTV', 'QBR', 'business review', 'stakeholder',
        'negotiation', 'contract', 'P&L', 'budget', 'executive', 'growth',
        'customer success', 'onboarding', 'implementation', 'escalation', 'CSAT',
      ],
      competencies: {
        'Управление отношениями': {
          keywords: ['relationship', 'account', 'client', 'partner', 'stakeholder', 'executive',
            'C-level', 'trust', 'QBR', 'business review'],
          weight: 1.5,
        },
        'Расширение выручки': {
          keywords: ['upsell', 'cross-sell', 'expansion', 'growth', 'revenue', 'ARR', 'MRR',
            'additional revenue', 'land and expand', 'upgrade', 'renewal'],
          weight: 1.5,
        },
        'Удержание и Churn': {
          keywords: ['retention', 'churn', 'renewal', 'NPS', 'CSAT', 'satisfaction', 'at-risk',
            'health score', 'customer success', 'escalation'],
          weight: 1.3,
        },
        'Переговоры': {
          keywords: ['negotiation', 'contract', 'pricing', 'commercial', 'P&L', 'margin', 'discount',
            'budget', 'ROI', 'business case', 'value proposition'],
          weight: 1.2,
        },
        'Планирование аккаунтов': {
          keywords: ['portfolio', 'account plan', 'territory', 'segmentation', 'prioritization',
            'whitespace', 'opportunity mapping', 'strategic account'],
          weight: 1.0,
        },
        'Онбординг клиентов': {
          keywords: ['onboarding', 'implementation', 'training', 'adoption', 'time to value',
            'customer success', 'support', 'SLA'],
          weight: 0.9,
        },
      },
    },
    'sales-consultant': {
      label: 'Продавец-консультант',
      coreKeywords: [
        'sales', 'target', 'client', 'revenue', 'team', 'performance', 'result', 'growth',
        'strategy', 'project', 'management', 'communication', 'negotiation', 'presentation',
        'B2B', 'B2C', 'customer', 'market', 'product', 'solution', 'commercial',
      ],
      competencies: {
        'Продажи и развитие': {
          keywords: ['sales', 'business development', 'BD', 'acquisition', 'revenue', 'target',
            'new business', 'hunter', 'growth', 'market'],
          weight: 1.5,
        },
        'Работа с клиентами': {
          keywords: ['customer', 'client', 'relationship', 'account', 'satisfaction', 'loyalty',
            'retention', 'service', 'support'],
          weight: 1.2,
        },
        'Коммерческое мышление': {
          keywords: ['commercial', 'negotiation', 'pricing', 'margin', 'P&L', 'budget', 'ROI',
            'business case', 'value', 'investment'],
          weight: 1.2,
        },
        'Результативность': {
          keywords: ['target', 'quota', 'KPI', 'metric', 'performance', 'achievement', 'result',
            'overachieve', 'goal', 'OKR'],
          weight: 1.3,
        },
        'Лидерство': {
          keywords: ['team', 'leadership', 'manage', 'lead', 'mentor', 'coordinate', 'delegate',
            'cross-functional'],
          weight: 0.9,
        },
        'Стратегия': {
          keywords: ['strategy', 'plan', 'forecast', 'roadmap', 'market analysis', 'segmentation',
            'positioning', 'go-to-market', 'GTM'],
          weight: 1.0,
        },
      },
    },
  },

  revenueSignals: [
    'quota', 'attainment', 'revenue', 'pipeline', 'forecast', 'conversion rate',
    'win rate', 'deal velocity', 'ARR', 'MRR', 'ACV', 'LTV', 'churn rate', 'NPS',
    'CSAT', 'ROI', 'margin', 'growth', '%', '€', '$', 'million', 'mio', 'tsd', 'k €',
    'top performer', 'overachieved', 'exceeded', 'ranked', 'award', 'target', 'objective',
    'increase', 'grew', 'generated', 'saved', 'reduced', 'improved',
  ],

  structureSignals: {
    sectionHeaders: [
      'experience', 'erfahrung', 'education', 'ausbildung', 'skills', 'fähigkeiten',
      'summary', 'profil', 'contact', 'kontakt', 'languages', 'sprachen', 'certifications',
      'achievements', 'erfolge', 'career', 'beruf', 'опыт', 'образование', 'навыки',
    ],
    bulletIndicators: /^[\s]*[•\-*→▶◆▪]\s/m,
    contactPatterns: /[\w.]+@[\w.]+\.\w+|[+\d][\d\s\-()]{6,}/,
  },

  repositioningSteps: {
    'sales-rep': [
      { title: 'Уточните позиционирование', desc: 'Заголовок и саммари должны чётко сигнализировать "Торговый представитель" / "B2B Sales". Рекрутер за 5 секунд должен понять вашу целевую роль.' },
      { title: 'Извлеките доказательства выручки', desc: 'Квантифицируйте каждое достижение: % выполнения плана, сгенерированный pipeline (€), конверсия, кол-во сделок. Добавьте цифры к каждому пункту.' },
      { title: 'Перестройте нарратив', desc: 'Пункты по формуле: Действие → Метрика → Результат. Начинайте с pipeline ownership, outbound cadence, CRM дисциплины.' },
      { title: 'Покажите осознанность пути', desc: 'Карьера должна читаться как целенаправленная специализация. Свяжите каждую роль с навыками продаж.' },
    ],
    'key-account': [
      { title: 'Позиционируйтесь как стратег', desc: 'Заголовок: "Account Manager | B2B | Revenue Expansion". Покажите прогрессию к Key Account Management.' },
      { title: 'Квантифицируйте удержание', desc: 'Renewal rate, предотвращённый churn, upsell выручка, NPS, размер портфеля (кол-во аккаунтов, ARR).' },
      { title: 'Покажите глубину отношений', desc: 'C-level контакты, QBR, решённые эскалации. Рекрутеры ищут стратегическое влияние.' },
      { title: 'Покажите коммерческую ответственность', desc: 'Переговоры о контрактах, коммерческие условия, бюджетные обсуждения.' },
    ],
    'sales-consultant': [
      { title: 'Определите коммерческую идентичность', desc: 'Охота (new business), фарминг (рост аккаунтов) или управление? Фокус конвертирует лучше.' },
      { title: 'Начните с результатов', desc: 'Топ-3 квантифицированных достижения — в начало каждой роли. Рекрутеры сканируют первую треть.' },
      { title: 'Используйте профессиональную терминологию', desc: '"Проспектирование" вместо "поиск клиентов", "pipeline management" вместо "отслеживание лидов".' },
      { title: 'Оптимизируйте структуру для ATS', desc: 'Чёткие секции (Experience, Skills, Education). Без таблиц и графики. Буллеты.' },
    ],
  },
}

/* ── Stopwords ────────────────────────────────────────────── */

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'are', 'was', 'were',
  'has', 'have', 'had', 'will', 'would', 'could', 'should', 'been', 'being',
  'their', 'they', 'you', 'your', 'our', 'not', 'but', 'more', 'than', 'into',
  'also', 'can', 'all', 'any', 'its', 'one', 'may', 'both', 'each', 'when',
  'die', 'der', 'das', 'und', 'ist', 'mit', 'von', 'auf', 'dem', 'den', 'ein',
  'eine', 'einer', 'eines', 'einem', 'des', 'oder', 'wie', 'für', 'über', 'aus',
  'nach', 'vor', 'sich', 'auch', 'nur', 'noch', 'aber', 'alle', 'wird', 'hat',
])

/* ── Engine ───────────────────────────────────────────────── */

function extractKeywords(text) {
  return [...new Set(
    text.toLowerCase().replace(/[^\w\s\-äöüß]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !STOPWORDS.has(w))
  )]
}

function findPhrases(text, phrases) {
  const lower = text.toLowerCase()
  return phrases.filter((p) => lower.includes(p.toLowerCase()))
}

function scoreKeywords(cvText, jdText, roleProfile) {
  const jdKeywords = extractKeywords(jdText)
  const cvLower = cvText.toLowerCase()
  const coreKeywords = roleProfile.coreKeywords

  const jdMatched = jdKeywords.filter((kw) => cvLower.includes(kw))
  const jdRatio = jdKeywords.length > 0 ? jdMatched.length / jdKeywords.length : 0

  const coreFound = findPhrases(cvText, coreKeywords)
  const coreRatio = coreKeywords.length > 0 ? coreFound.length / coreKeywords.length : 0

  const combined = jdRatio * 0.6 + coreRatio * 0.4
  const score = Math.min(100, Math.round(combined * 130))

  const missing = coreKeywords.filter((kw) => !cvLower.includes(kw.toLowerCase()))
  const found = coreKeywords.filter((kw) => cvLower.includes(kw.toLowerCase()))

  return { score, missing, found, jdMatched, jdKeywords }
}

function scoreStructure(cvText) {
  let points = 0
  const lower = cvText.toLowerCase()
  const signals = ATS_KNOWLEDGE.structureSignals

  const headersFound = signals.sectionHeaders.filter((h) => lower.includes(h))
  points += Math.min(30, headersFound.length * 5)
  if (signals.bulletIndicators.test(cvText)) points += 20
  if (signals.contactPatterns.test(cvText)) points += 15
  const wordCount = cvText.split(/\s+/).length
  if (wordCount >= 300 && wordCount <= 2000) points += 15
  else if (wordCount >= 150) points += 8
  if (lower.match(/\b(summary|profil|professional|objective|ziel|über mich|о себе)\b/)) points += 10
  if (!cvText.match(/\|\s+\|/)) points += 10

  return Math.min(100, points)
}

function scoreResults(cvText) {
  let points = 0
  const lower = cvText.toLowerCase()

  const foundSignals = ATS_KNOWLEDGE.revenueSignals.filter((s) => lower.includes(s.toLowerCase()))
  points += Math.min(50, foundSignals.length * 4)
  points += Math.min(20, ((cvText.match(/\d+\s*%/g) || []).length) * 5)
  points += Math.min(15, ((cvText.match(/[€$£]\s*[\d,]+|[\d,]+\s*[€$£]/g) || []).length) * 5)
  points += Math.min(15, ((cvText.match(/20\d\d\s*[–\-]\s*(20\d\d|present|heute|now|настоящее)/gi) || []).length) * 5)

  return Math.min(100, points)
}

function scoreCompetencies(cvText, roleProfile) {
  const results = {}
  const lower = cvText.toLowerCase()

  Object.entries(roleProfile.competencies).forEach(([name, data]) => {
    const matched = data.keywords.filter((kw) => lower.includes(kw.toLowerCase()))
    const ratio = matched.length / data.keywords.length
    let level, fillPct
    if (matched.length >= 3 || ratio >= 0.3) {
      level = 'strong'; fillPct = 100
    } else if (matched.length >= 1) {
      level = 'partial'; fillPct = 50
    } else {
      level = 'missing'; fillPct = 0
    }
    results[name] = { level, fillPct, matched, total: data.keywords.length }
  })

  return results
}

/* ── Main API ─────────────────────────────────────────────── */

export function getRoleProfiles() {
  return Object.entries(ATS_KNOWLEDGE.roleProfiles).map(([key, p]) => ({ key, label: p.label }))
}

export function analyze(cvText, jdTexts, roleKey) {
  const roleProfile = ATS_KNOWLEDGE.roleProfiles[roleKey]
  if (!roleProfile) return null

  const jdCombined = jdTexts.filter(Boolean).join('\n')
  const kw = scoreKeywords(cvText, jdCombined, roleProfile)
  const struct = scoreStructure(cvText)
  const results = scoreResults(cvText)
  const total = Math.round(kw.score * 0.40 + struct * 0.30 + results * 0.30)
  const competencies = scoreCompetencies(cvText, roleProfile)
  const steps = ATS_KNOWLEDGE.repositioningSteps[roleKey]

  return {
    score: total,
    breakdown: {
      keywords: { score: kw.score, weight: 40 },
      structure: { score: struct, weight: 30 },
      results: { score: results, weight: 30 },
    },
    keywords: {
      found: kw.found,
      missing: kw.missing.slice(0, 20),
      jdMatched: kw.jdMatched.slice(0, 15),
    },
    competencies,
    steps,
    roleLabel: roleProfile.label,
  }
}
