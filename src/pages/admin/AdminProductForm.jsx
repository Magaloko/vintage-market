import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Save, ArrowLeft, Sparkles, Tag, Info, Settings2, Award,
  MessageCircle, Send as SendIcon, Instagram, Package, Hash,
  Link2, QrCode, Truck, X, Search, Plus,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'
import { getProduct, createProduct, updateProduct, getProducts } from '../../lib/api'
import {
  categories, conditions, categoryFields, categoryGroups,
  knownBrands, specialAttributes, subcategories, shippingOptions,
} from '../../data/demoProducts'
import { getActiveCategoryList } from '../../lib/categorySettings'
import { CURRENCIES, FALLBACK_RATES } from '../../lib/CurrencyContext'
import ImageUploader from '../../components/admin/ImageUploader'

/* ── Empty form ────────────────────────────────────────────────── */
const EMPTY_FORM = {
  title: '',
  description: '',
  price: '',
  category: 'clothing',
  subcategory: '',
  condition: 'good',
  era_start: '',
  era_end: '',
  brand: '',
  image_url: '',
  status: 'active',
  special_attributes: [],
  quantity: 1,
  contact_whatsapp: '',
  contact_telegram: '',
  contact_instagram: '',
  hashtags: [],
  linked_product_ids: [],
}

/* ── Loading skeleton ──────────────────────────────────────────── */
function FormSkeleton() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-6 p-8">
      <div className="h-8 rounded w-1/3 bg-gray-200" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="h-14 rounded bg-gray-100" />
      ))}
    </div>
  )
}

/* ── Section wrapper ───────────────────────────────────────────── */
function Section({ icon: Icon, title, children, className = '' }) {
  return (
    <div
      className={`p-6 md:p-8 rounded transition-all duration-300 hover:shadow-md ${className}`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid rgba(176, 141, 87, 0.12)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {title && (
        <div className="flex items-center gap-2.5 mb-5 pb-3" style={{ borderBottom: '1px solid rgba(176, 141, 87, 0.1)' }}>
          {Icon && <Icon size={16} style={{ color: '#B08D57' }} />}
          <h3 className="font-display text-base italic" style={{ color: '#2C2420' }}>
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  )
}

/* ── Form label ────────────────────────────────────────────────── */
function Label({ children, required }) {
  return (
    <label className="block font-body text-xs font-medium mb-1.5 tracking-wide uppercase" style={{ color: 'rgba(44, 36, 32, 0.55)' }}>
      {children}
      {required && <span className="ml-0.5" style={{ color: '#B08D57' }}>*</span>}
    </label>
  )
}

/* ── Text input ────────────────────────────────────────────────── */
function FormInput({ label, required, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <input
        {...props}
        required={required}
        className="w-full px-4 py-3 font-body text-sm rounded transition-all duration-300 focus:outline-none"
        style={{
          backgroundColor: 'rgba(247, 242, 235, 0.8)',
          border: '1px solid rgba(176, 141, 87, 0.15)',
          color: '#2C2420',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#B08D57'
          e.target.style.boxShadow = '0 0 0 3px rgba(176, 141, 87, 0.1), 0 2px 8px rgba(176, 141, 87, 0.08)'
          e.target.style.backgroundColor = '#FFFFFF'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(176, 141, 87, 0.15)'
          e.target.style.boxShadow = 'none'
          e.target.style.backgroundColor = 'rgba(247, 242, 235, 0.8)'
        }}
      />
    </div>
  )
}

/* ── Textarea ──────────────────────────────────────────────────── */
function FormTextarea({ label, required, rows = 4, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <textarea
        {...props}
        required={required}
        rows={rows}
        className="w-full px-4 py-3 font-body text-sm rounded resize-none transition-all duration-300 focus:outline-none"
        style={{
          backgroundColor: 'rgba(247, 242, 235, 0.8)',
          border: '1px solid rgba(176, 141, 87, 0.15)',
          color: '#2C2420',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#B08D57'
          e.target.style.boxShadow = '0 0 0 3px rgba(176, 141, 87, 0.1), 0 2px 8px rgba(176, 141, 87, 0.08)'
          e.target.style.backgroundColor = '#FFFFFF'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(176, 141, 87, 0.15)'
          e.target.style.boxShadow = 'none'
          e.target.style.backgroundColor = 'rgba(247, 242, 235, 0.8)'
        }}
      />
    </div>
  )
}

/* ── Select ────────────────────────────────────────────────────── */
function FormSelect({ label, required, children, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <select
        {...props}
        required={required}
        className="w-full px-4 py-3 font-body text-sm rounded transition-all duration-300 focus:outline-none appearance-none cursor-pointer"
        style={{
          backgroundColor: 'rgba(247, 242, 235, 0.8)',
          border: '1px solid rgba(176, 141, 87, 0.15)',
          color: '#2C2420',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23B08D57' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: '36px',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#B08D57'
          e.target.style.boxShadow = '0 0 0 3px rgba(176, 141, 87, 0.1)'
          e.target.style.backgroundColor = '#FFFFFF'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(176, 141, 87, 0.15)'
          e.target.style.boxShadow = 'none'
          e.target.style.backgroundColor = 'rgba(247, 242, 235, 0.8)'
        }}
      >
        {children}
      </select>
    </div>
  )
}

/* ── Dynamic detail field ──────────────────────────────────────── */
function DetailField({ field, value, onChange }) {
  if (field.type === 'select') {
    return (
      <FormSelect
        label={`${field.label}${field.unit ? ` (${field.unit})` : ''}`}
        required={field.required}
        value={value}
        onChange={(e) => onChange(field.key, e.target.value)}
      >
        <option value="">— Выбрать —</option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </FormSelect>
    )
  }

  if (field.type === 'textarea') {
    return (
      <FormTextarea
        label={`${field.label}${field.unit ? ` (${field.unit})` : ''}`}
        required={field.required}
        value={value}
        onChange={(e) => onChange(field.key, e.target.value)}
        rows={3}
        placeholder={field.placeholder || ''}
      />
    )
  }

  return (
    <FormInput
      type={field.type === 'number' ? 'number' : 'text'}
      label={`${field.label}${field.unit ? ` (${field.unit})` : ''}`}
      required={field.required}
      value={value}
      onChange={(e) => {
        const val = field.type === 'number'
          ? (e.target.value ? Number(e.target.value) : '')
          : e.target.value
        onChange(field.key, val)
      }}
      placeholder={field.placeholder || ''}
      min={field.type === 'number' ? 0 : undefined}
    />
  )
}

/* ── Hashtag Input ─────────────────────────────────────────────── */
function HashtagInput({ tags, onChange, max = 5 }) {
  const [input, setInput] = useState('')

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase().replace(/^#/, '').replace(/[^a-zа-яёії0-9_]/gi, '')
    if (!tag || tags.includes(tag) || tags.length >= max) return
    onChange([...tags, tag])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
      setInput('')
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div>
      <Label>Хэштеги (макс. {max})</Label>
      <div
        className="flex flex-wrap items-center gap-2 px-3 py-2 rounded min-h-[44px]"
        style={{
          backgroundColor: 'rgba(247, 242, 235, 0.8)',
          border: '1px solid rgba(176, 141, 87, 0.15)',
        }}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 font-body text-xs rounded-full"
            style={{ backgroundColor: 'rgba(176, 141, 87, 0.12)', color: '#B08D57' }}
          >
            #{tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="hover:opacity-70"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {tags.length < max && (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? 'Введите тег и нажмите Enter...' : ''}
            className="flex-1 min-w-[100px] bg-transparent border-none outline-none font-body text-sm"
            style={{ color: '#2C2420' }}
          />
        )}
      </div>
      <p className="font-body text-[10px] mt-1" style={{ color: 'rgba(44, 36, 32, 0.35)' }}>
        Enter или запятая для добавления
      </p>
    </div>
  )
}

/* ── Shipping Section ──────────────────────────────────────────── */
function ShippingSection({ shipping, onChange }) {
  const selected = shipping || []

  const toggleOption = (optId) => {
    const exists = selected.find((s) => s.id === optId)
    if (exists) {
      onChange(selected.filter((s) => s.id !== optId))
    } else {
      onChange([...selected, { id: optId, price: '', note: '' }])
    }
  }

  const updateField = (optId, field, value) => {
    onChange(selected.map((s) => s.id === optId ? { ...s, [field]: value } : s))
  }

  return (
    <div className="space-y-3">
      {shippingOptions.map((opt) => {
        const sel = selected.find((s) => s.id === opt.id)
        const isChecked = Boolean(sel)
        return (
          <div key={opt.id}>
            <label
              className="flex items-center gap-3 p-3 rounded cursor-pointer transition-all duration-300"
              style={{
                backgroundColor: isChecked ? 'rgba(176, 141, 87, 0.08)' : 'rgba(247, 242, 235, 0.5)',
                border: `1px solid ${isChecked ? 'rgba(176, 141, 87, 0.3)' : 'rgba(176, 141, 87, 0.08)'}`,
              }}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleOption(opt.id)}
                className="sr-only"
              />
              <div
                className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{
                  backgroundColor: isChecked ? '#B08D57' : 'transparent',
                  border: `1.5px solid ${isChecked ? '#B08D57' : 'rgba(44, 36, 32, 0.15)'}`,
                }}
              >
                {isChecked && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <Truck size={14} style={{ color: isChecked ? '#B08D57' : 'rgba(44, 36, 32, 0.3)' }} />
              <span className="font-body text-sm" style={{ color: isChecked ? '#2C2420' : 'rgba(44, 36, 32, 0.6)' }}>
                {opt.name}
              </span>
            </label>
            {isChecked && (
              <div className="flex gap-3 mt-2 ml-11">
                <input
                  type="text"
                  value={sel.price || ''}
                  onChange={(e) => updateField(opt.id, 'price', e.target.value)}
                  placeholder="Цена доставки"
                  className="flex-1 px-3 py-2 font-body text-xs rounded"
                  style={{
                    backgroundColor: 'rgba(247, 242, 235, 0.8)',
                    border: '1px solid rgba(176, 141, 87, 0.15)',
                    color: '#2C2420',
                  }}
                />
                <input
                  type="text"
                  value={sel.note || ''}
                  onChange={(e) => updateField(opt.id, 'note', e.target.value)}
                  placeholder="Примечание"
                  className="flex-1 px-3 py-2 font-body text-xs rounded"
                  style={{
                    backgroundColor: 'rgba(247, 242, 235, 0.8)',
                    border: '1px solid rgba(176, 141, 87, 0.15)',
                    color: '#2C2420',
                  }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Product Linker ────────────────────────────────────────────── */
function ProductLinker({ linkedIds, onChange, currentProductId }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [linkedProducts, setLinkedProducts] = useState([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef(null)

  // Load linked products on mount
  useEffect(() => {
    if (linkedIds.length === 0) { setLinkedProducts([]); return }
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await getProducts({})
        if (!cancelled && data) {
          setLinkedProducts(data.filter(p => linkedIds.includes(p.id)))
        }
      } catch { /* ignore */ }
    })()
    return () => { cancelled = true }
  }, [linkedIds])

  const searchProducts = useCallback((q) => {
    if (!q || q.length < 2) { setResults([]); return }
    setSearching(true)
    getProducts({ search: q, limit: 5 })
      .then(({ data }) => {
        setResults((data || []).filter(p => p.id !== currentProductId && !linkedIds.includes(p.id)))
      })
      .catch(() => setResults([]))
      .finally(() => setSearching(false))
  }, [currentProductId, linkedIds])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchProducts(val), 300)
  }

  const addProduct = (product) => {
    onChange([...linkedIds, product.id])
    setLinkedProducts(prev => [...prev, product])
    setQuery('')
    setResults([])
  }

  const removeProduct = (id) => {
    onChange(linkedIds.filter(pid => pid !== id))
    setLinkedProducts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(44, 36, 32, 0.3)' }} />
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder="Поиск товаров для связывания..."
          className="w-full pl-9 pr-4 py-3 font-body text-sm rounded"
          style={{
            backgroundColor: 'rgba(247, 242, 235, 0.8)',
            border: '1px solid rgba(176, 141, 87, 0.15)',
            color: '#2C2420',
          }}
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full animate-spin"
            style={{ border: '2px solid rgba(176, 141, 87, 0.2)', borderTopColor: '#B08D57' }} />
        )}
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div className="rounded overflow-hidden" style={{ border: '1px solid rgba(176, 141, 87, 0.15)' }}>
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => addProduct(p)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-amber-50/50"
              style={{ borderBottom: '1px solid rgba(176, 141, 87, 0.08)' }}
            >
              {p.image_url ? (
                <img src={p.image_url} alt="" className="w-8 h-8 rounded object-cover" />
              ) : (
                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)' }}>
                  <Package size={12} style={{ color: '#B08D57' }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm truncate" style={{ color: '#2C2420' }}>{p.title}</p>
                <p className="font-body text-[10px]" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>{p.price ? `${p.price}\u20ac` : ''}</p>
              </div>
              <Plus size={14} style={{ color: '#B08D57' }} />
            </button>
          ))}
        </div>
      )}

      {/* Linked products */}
      {linkedProducts.length > 0 && (
        <div className="space-y-2">
          <p className="font-body text-[10px] uppercase tracking-wider" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
            Связанные товары ({linkedProducts.length})
          </p>
          {linkedProducts.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-3 py-2 rounded"
              style={{ backgroundColor: 'rgba(176, 141, 87, 0.06)', border: '1px solid rgba(176, 141, 87, 0.12)' }}
            >
              {p.image_url ? (
                <img src={p.image_url} alt="" className="w-8 h-8 rounded object-cover" />
              ) : (
                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)' }}>
                  <Package size={12} style={{ color: '#B08D57' }} />
                </div>
              )}
              <p className="font-body text-sm flex-1 truncate" style={{ color: '#2C2420' }}>{p.title}</p>
              <button type="button" onClick={() => removeProduct(p.id)} className="hover:opacity-70">
                <X size={14} style={{ color: 'rgba(44, 36, 32, 0.4)' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── QR Code Preview ───────────────────────────────────────────── */
function QRCodePreview({ productId }) {
  if (!productId) return null

  const url = `${window.location.origin}/product/${productId}`

  const handleDownload = () => {
    const svg = document.getElementById('product-qr-code')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 256, 256)
      ctx.drawImage(img, 0, 0, 256, 256)
      const a = document.createElement('a')
      a.download = `product-${productId}-qr.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="flex items-center gap-4">
      <QRCodeSVG
        id="product-qr-code"
        value={url}
        size={96}
        level="M"
        fgColor="#2C2420"
        bgColor="#F7F2EB"
      />
      <div className="flex-1">
        <p className="font-body text-xs mb-1" style={{ color: 'rgba(44, 36, 32, 0.5)' }}>
          QR-код ведёт на страницу товара
        </p>
        <p className="font-body text-[10px] mb-2 truncate" style={{ color: 'rgba(44, 36, 32, 0.3)' }}>
          {url}
        </p>
        <button
          type="button"
          onClick={handleDownload}
          className="px-3 py-1.5 font-body text-xs rounded transition-all"
          style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)', color: '#B08D57', border: '1px solid rgba(176, 141, 87, 0.2)' }}
        >
          Скачать PNG
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════ */
/*  Main component                                                   */
/* ══════════════════════════════════════════════════════════════════ */

export default function AdminProductForm({ sellerShopId, sellerMode } = {}) {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [details, setDetails] = useState({})
  const [images, setImages] = useState([])
  const [shipping, setShipping] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(isEditing)
  const [priceCurrency, setPriceCurrency] = useState('EUR')
  const [exchangeRates, setExchangeRates] = useState(FALLBACK_RATES)

  /* Load exchange rates */
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('vintage_exchange_rates'))
      if (cached?.rates) { setExchangeRates(cached.rates); return }
    } catch { /* ignore */ }
    fetch('https://api.exchangerate-api.com/v4/latest/EUR')
      .then(r => r.json())
      .then(data => { if (data.rates) setExchangeRates(data.rates) })
      .catch(() => {})
  }, [])

  const basePath = sellerMode ? '/seller/products' : '/admin/products'

  /* Load existing product for editing */
  useEffect(() => {
    if (!isEditing) return

    async function load() {
      const { data, error } = await getProduct(id)
      if (error || !data) {
        toast.error('Товар не найден')
        navigate(basePath)
        return
      }

      setForm({
        title:              data.title || '',
        description:        data.description || '',
        price:              data.price || '',
        category:           data.category || 'clothing',
        subcategory:        data.subcategory || '',
        condition:          data.condition || 'good',
        era_start:          data.era_start || '',
        era_end:            data.era_end || '',
        brand:              data.brand || '',
        image_url:          data.image_url || '',
        status:             data.status || 'active',
        special_attributes: data.special_attributes || [],
        quantity:           data.quantity || 1,
        contact_whatsapp:   data.contact_whatsapp || '',
        contact_telegram:   data.contact_telegram || '',
        contact_instagram:  data.contact_instagram || '',
        hashtags:           data.hashtags || [],
        linked_product_ids: data.linked_product_ids || [],
      })

      setDetails(data.details || {})
      setShipping(data.shipping || [])

      if (data.images?.length > 0) {
        setImages(data.images.map((img) => ({
          url: img.url,
          path: img.storage_path || null,
          alt_text: img.alt_text || '',
        })))
      } else if (data.image_url) {
        setImages([{ url: data.image_url, path: null, alt_text: data.title }])
      }

      setLoadingProduct(false)
    }

    load()
  }, [id, isEditing, navigate])

  /* Handlers */
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleDetailChange = (key, value) => {
    setDetails((prev) => ({ ...prev, [key]: value }))
  }

  const handleCategoryChange = (newCategory) => {
    setForm((prev) => ({ ...prev, category: newCategory, subcategory: '' }))

    const newKeys = new Set((categoryFields[newCategory] || []).map((f) => f.key))
    setDetails((prev) => {
      const kept = {}
      for (const k of Object.keys(prev)) {
        if (newKeys.has(k)) kept[k] = prev[k]
      }
      return kept
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (form.era_start && form.era_end && Number(form.era_start) > Number(form.era_end)) {
      toast.error('Начало эпохи не может быть позже конца')
      setLoading(false)
      return
    }

    // Convert price to EUR if entered in another currency
    let priceEur = Number(form.price) || 0
    if (priceCurrency !== 'EUR' && priceEur > 0) {
      const rate = exchangeRates[priceCurrency] || FALLBACK_RATES[priceCurrency]
      if (rate) priceEur = Math.round((priceEur / rate) * 100) / 100
    }

    const productData = {
      ...form,
      price: priceEur,
      era_start: form.era_start ? Number(form.era_start) : null,
      era_end: form.era_end ? Number(form.era_end) : null,
      quantity: Number(form.quantity) || 1,
      subcategory: form.subcategory || null,
      hashtags: form.hashtags || [],
      linked_product_ids: form.linked_product_ids || [],
      shipping: shipping,
      contact_whatsapp: form.contact_whatsapp || null,
      contact_telegram: form.contact_telegram || null,
      contact_instagram: form.contact_instagram || null,
      image_url: images[0]?.url || form.image_url || '',
      images,
      details,
      special_attributes: form.special_attributes || [],
      ...(sellerShopId && { shop_id: sellerShopId }),
    }

    const { error } = isEditing
      ? await updateProduct(id, productData)
      : await createProduct(productData)

    setLoading(false)

    if (error) {
      toast.error(error.message || 'Ошибка сохранения')
      return
    }

    toast.success(isEditing ? 'Товар обновлён' : 'Товар добавлен')
    navigate(basePath)
  }

  /* Derived state */
  const currentCatFields = categoryFields[form.category] || []
  const currentCategory  = categories.find((c) => c.id === form.category)
  const isVintage        = currentCategory?.group === 'vintage'
  const isShop           = currentCategory?.group === 'shops'
  const currentSubcats   = subcategories[form.category] || []

  if (loadingProduct) return <FormSkeleton />

  return (
    <div
      className="max-w-3xl mx-auto page-enter rounded-lg p-6 md:p-10"
      style={{
        backgroundColor: '#F7F2EB',
        boxShadow: '0 4px 40px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded transition-all duration-300 hover:bg-black/5"
          style={{ color: 'rgba(44, 36, 32, 0.4)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#B08D57' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(44, 36, 32, 0.4)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-2xl italic" style={{ color: '#2C2420' }}>
            {isEditing ? 'Редактировать товар' : 'Новый товар'}
          </h1>
          <p className="font-body text-sm mt-0.5" style={{ color: 'rgba(44, 36, 32, 0.45)' }}>
            {isEditing ? 'Измените данные и сохраните' : 'Заполните информацию о товаре'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ════════ 1. FOTOS ════════ */}
        <Section icon={null} title={null}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base italic" style={{ color: '#2C2420' }}>
              Изображения
            </h3>
            <span className="font-body text-xs" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
              {images.length} фото
              {images.length > 0 && ' \u2022 первое = главное'}
            </span>
          </div>
          <ImageUploader images={images} onChange={setImages} productId={isEditing ? id : undefined} />
        </Section>

        {/* ════════ 2. PREIS + WÄHRUNG ════════ */}
        <Section icon={Info} title="Цена">
          <div>
            <label className="block font-body text-sm mb-1.5" style={{ color: 'rgba(44, 36, 32, 0.7)' }}>
              {isShop ? 'Цена (оставьте 0)' : 'Цена'}
              {!isShop && <span style={{ color: '#B5736A' }}> *</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="price"
                required={!isShop}
                value={form.price}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="0"
                className="flex-1 px-4 py-3 rounded-lg border font-body text-base transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: '#FAFAF8',
                  borderColor: 'rgba(44, 36, 32, 0.12)',
                  color: '#2C2420',
                }}
              />
              <select
                value={priceCurrency}
                onChange={(e) => setPriceCurrency(e.target.value)}
                className="px-3 py-3 rounded-lg border font-body text-base transition-colors focus:outline-none focus:ring-2 cursor-pointer"
                style={{
                  backgroundColor: '#FAFAF8',
                  borderColor: 'rgba(44, 36, 32, 0.12)',
                  color: '#2C2420',
                  minWidth: '80px',
                }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                ))}
              </select>
            </div>
            {priceCurrency !== 'EUR' && form.price > 0 && (
              <p className="font-body text-xs mt-1" style={{ color: 'rgba(44, 36, 32, 0.45)' }}>
                &asymp; {Math.round((Number(form.price) / (exchangeRates[priceCurrency] || FALLBACK_RATES[priceCurrency])) * 100) / 100}&euro;
              </p>
            )}
          </div>
        </Section>

        {/* ════════ 3. TITEL ════════ */}
        <Section icon={Info} title="Название">
          <FormInput
            type="text"
            name="title"
            label="Название товара"
            required
            value={form.title}
            onChange={handleChange}
            placeholder={
              isShop
                ? 'Название магазина'
                : isVintage
                  ? 'Например: Кожаный портфель 1960-х'
                  : 'Название'
            }
          />
        </Section>

        {/* ════════ 4. KATEGORIE ════════ */}
        <Section icon={Tag} title="Категория">
          <FormSelect
            label="Категория товара"
            required
            value={form.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categoryGroups.map((group) => {
              const groupCats = getActiveCategoryList().filter((c) => c.group === group.id)
              if (groupCats.length === 0) return null
              return (
                <optgroup key={group.id} label={group.name}>
                  {groupCats.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </optgroup>
              )
            })}
          </FormSelect>
        </Section>

        {/* ════════ 5. UNTERKATEGORIE ════════ */}
        {currentSubcats.length > 0 && (
          <Section icon={Tag} title="Подкатегория">
            <FormSelect
              label="Подкатегория"
              value={form.subcategory}
              onChange={(e) => setForm(prev => ({ ...prev, subcategory: e.target.value }))}
            >
              <option value="">— Не выбрана —</option>
              {currentSubcats.map((sc) => (
                <option key={sc.id} value={sc.id}>{sc.name}</option>
              ))}
            </FormSelect>
          </Section>
        )}

        {/* ════════ 6. MARKE ════════ */}
        {isVintage && (
          <Section icon={Tag} title="Бренд / Марка">
            <div>
              <Label>Бренд</Label>
              <select
                value={knownBrands.some(b => b.name === form.brand) ? form.brand : (form.brand ? '__custom__' : '')}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '__custom__') {
                    setForm(prev => ({ ...prev, brand: prev.brand && !knownBrands.some(b => b.name === prev.brand) ? prev.brand : '' }))
                  } else {
                    setForm(prev => ({ ...prev, brand: val }))
                  }
                }}
                className="w-full px-4 py-3 font-body text-sm rounded transition-all duration-300 focus:outline-none appearance-none cursor-pointer"
                style={{
                  backgroundColor: 'rgba(247, 242, 235, 0.8)',
                  border: '1px solid rgba(176, 141, 87, 0.15)',
                  color: '#2C2420',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23B08D57' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '36px',
                }}
              >
                <option value="">— Без бренда —</option>
                {knownBrands
                  .filter(b => b.categories.includes(form.category))
                  .map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))
                }
                <option value="__custom__">Другой бренд...</option>
              </select>
              {(form.brand && !knownBrands.some(b => b.name === form.brand)) && (
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Введите название бренда"
                  className="w-full px-4 py-2.5 font-body text-sm rounded mt-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(247, 242, 235, 0.8)',
                    border: '1px solid rgba(176, 141, 87, 0.15)',
                    color: '#2C2420',
                  }}
                />
              )}
            </div>
          </Section>
        )}

        {/* ════════ 7. GRÖßE — Category-Specific Fields ════════ */}
        {currentCatFields.length > 0 && (
          <Section icon={Settings2} title={`Параметры: ${currentCategory?.name}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentCatFields.map((field) => (
                <div
                  key={field.key}
                  className={field.type === 'textarea' ? 'sm:col-span-2' : ''}
                >
                  <DetailField
                    field={field}
                    value={details[field.key] || ''}
                    onChange={handleDetailChange}
                  />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ════════ 8. ZUSTAND + STATUS ════════ */}
        {isVintage && (
          <Section icon={Sparkles} title="Состояние">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                name="condition"
                label="Состояние"
                value={form.condition}
                onChange={handleChange}
              >
                {conditions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </FormSelect>

              <FormSelect
                name="status"
                label="Статус"
                value={form.status}
                onChange={handleChange}
              >
                <option value="active">В наличии</option>
                <option value="sold">Продано</option>
              </FormSelect>
            </div>
          </Section>
        )}

        {/* ════════ 9. BESCHREIBUNG ════════ */}
        <Section icon={Info} title="Описание">
          <FormTextarea
            name="description"
            label="Описание товара"
            required
            value={form.description}
            onChange={handleChange}
            placeholder="Подробное описание товара..."
          />
        </Section>

        {/* ════════ 10. KONTAKT ════════ */}
        <Section icon={MessageCircle} title="Контактные данные">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#25D366' }}>
                <MessageCircle size={14} color="#fff" />
              </div>
              <FormInput
                type="text"
                name="contact_whatsapp"
                label="WhatsApp"
                value={form.contact_whatsapp}
                onChange={handleChange}
                placeholder="+7 777 123 4567"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#26A3EE' }}>
                <SendIcon size={14} color="#fff" />
              </div>
              <FormInput
                type="text"
                name="contact_telegram"
                label="Telegram"
                value={form.contact_telegram}
                onChange={handleChange}
                placeholder="@username или ссылка"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                <Instagram size={14} color="#fff" />
              </div>
              <FormInput
                type="text"
                name="contact_instagram"
                label="Instagram"
                value={form.contact_instagram}
                onChange={handleChange}
                placeholder="@username"
              />
            </div>
          </div>
        </Section>

        {/* ════════ 11. VERSAND ════════ */}
        <Section icon={Truck} title="Доставка">
          <ShippingSection shipping={shipping} onChange={setShipping} />
        </Section>

        {/* ════════ 12. MENGE ════════ */}
        <Section icon={Package} title="Количество">
          <FormInput
            type="number"
            name="quantity"
            label="В наличии (шт.)"
            value={form.quantity}
            onChange={handleChange}
            min="1"
            placeholder="1"
          />
        </Section>

        {/* ════════ 13. PRODUKT-VERLINKUNG ════════ */}
        <Section icon={Link2} title="Связанные товары">
          <ProductLinker
            linkedIds={form.linked_product_ids}
            onChange={(ids) => setForm(prev => ({ ...prev, linked_product_ids: ids }))}
            currentProductId={isEditing ? id : undefined}
          />
        </Section>

        {/* ════════ 14. HASHTAGS ════════ */}
        <Section icon={Hash} title="Хэштеги">
          <HashtagInput
            tags={form.hashtags}
            onChange={(tags) => setForm(prev => ({ ...prev, hashtags: tags }))}
          />
        </Section>

        {/* ════════ 15. QR-CODE ════════ */}
        {isEditing && (
          <Section icon={QrCode} title="QR-код">
            <QRCodePreview productId={id} />
          </Section>
        )}

        {/* ════════ SPEZIAL-ATTRIBUTE (Vintage) ════════ */}
        {isVintage && (
          <Section icon={Award} title="Особые характеристики">
            <p className="font-body text-xs mb-4" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
              Отметьте характеристики, которые повышают ценность товара
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {specialAttributes.map((attr) => {
                const isChecked = form.special_attributes?.includes(attr.id)
                return (
                  <label
                    key={attr.id}
                    className="flex items-center gap-3 p-3 rounded cursor-pointer transition-all duration-300"
                    style={{
                      backgroundColor: isChecked ? 'rgba(176, 141, 87, 0.08)' : 'rgba(247, 242, 235, 0.5)',
                      border: `1px solid ${isChecked ? 'rgba(176, 141, 87, 0.3)' : 'rgba(176, 141, 87, 0.08)'}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setForm(prev => ({
                          ...prev,
                          special_attributes: isChecked
                            ? prev.special_attributes.filter(a => a !== attr.id)
                            : [...(prev.special_attributes || []), attr.id],
                        }))
                      }}
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-300"
                      style={{
                        backgroundColor: isChecked ? attr.color : 'transparent',
                        border: `1.5px solid ${isChecked ? attr.color : 'rgba(44, 36, 32, 0.15)'}`,
                      }}
                    >
                      {isChecked && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="font-body text-sm" style={{ color: isChecked ? attr.color : 'rgba(44, 36, 32, 0.6)' }}>
                      {attr.icon} {attr.label}
                    </span>
                  </label>
                )
              })}
            </div>
          </Section>
        )}

        {/* ════════ EPOCHE / ZEITRAUM ════════ */}
        <Section icon={Settings2} title="Эпоха / Период">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              type="number"
              name="era_start"
              label="Начало (год)"
              value={form.era_start}
              onChange={handleChange}
              placeholder="1890"
            />
            <FormInput
              type="number"
              name="era_end"
              label="Конец (год)"
              value={form.era_end}
              onChange={handleChange}
              placeholder="1920"
            />
          </div>
        </Section>

        {/* ════════ SUBMIT ════════ */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 font-body text-sm rounded transition-all duration-300"
            style={{
              color: 'rgba(44, 36, 32, 0.5)',
              border: '1px solid rgba(44, 36, 32, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(44, 36, 32, 0.25)'
              e.target.style.color = '#2C2420'
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(44, 36, 32, 0.1)'
              e.target.style.color = 'rgba(44, 36, 32, 0.5)'
            }}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 font-body text-sm font-medium tracking-wide rounded transition-all duration-300 disabled:opacity-50"
            style={{
              backgroundColor: '#B08D57',
              color: '#FFFFFF',
              boxShadow: '0 2px 12px rgba(176, 141, 87, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#C9A96E'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(176, 141, 87, 0.4)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#B08D57'
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(176, 141, 87, 0.3)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {loading ? (
              <div
                className="w-4 h-4 rounded-full animate-spin"
                style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF' }}
              />
            ) : (
              <Save size={16} />
            )}
            {isEditing ? 'Сохранить' : 'Добавить товар'}
          </button>
        </div>
      </form>
    </div>
  )
}
