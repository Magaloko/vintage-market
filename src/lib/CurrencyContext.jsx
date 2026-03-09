import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CurrencyContext = createContext()

const CURRENCIES = [
  { code: 'EUR', symbol: '€' },
  { code: 'USD', symbol: '$' },
  { code: 'RUB', symbol: '₽' },
  { code: 'KZT', symbol: '₸' },
]

const FALLBACK_RATES = { EUR: 1, USD: 1.08, RUB: 97, KZT: 490 }
const STORAGE_KEY = 'vintage_currency'
const RATES_KEY = 'vintage_exchange_rates'
const RATES_TTL = 24 * 60 * 60 * 1000
const API_URL = 'https://api.exchangerate-api.com/v4/latest/EUR'

function readStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
}

function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'EUR' } catch { return 'EUR' }
  })
  const [rates, setRates] = useState(null)

  const setCurrency = useCallback((code) => {
    setCurrencyState(code)
    try { localStorage.setItem(STORAGE_KEY, code) } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    const cached = readStorage(RATES_KEY)
    if (cached && Date.now() - cached.ts < RATES_TTL) {
      setRates(cached.rates)
      return
    }

    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => {
        const r = data.rates || FALLBACK_RATES
        setRates(r)
        writeStorage(RATES_KEY, { ts: Date.now(), rates: r })
      })
      .catch(() => setRates(FALLBACK_RATES))
  }, [])

  const formatPrice = useCallback(
    (eurPrice) => {
      if (!eurPrice || eurPrice <= 0) return null
      if (currency === 'EUR') return `${eurPrice}€`

      const rate = rates?.[currency] || FALLBACK_RATES[currency]
      const converted = Math.round(eurPrice * rate)
      const formatted = converted.toLocaleString('ru-RU')
      const info = CURRENCIES.find((c) => c.code === currency)

      if (currency === 'USD') return `$${formatted}`
      return `${formatted}${info?.symbol || ''}`
    },
    [currency, rates],
  )

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}

export { CURRENCIES, FALLBACK_RATES }
