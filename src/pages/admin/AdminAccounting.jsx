import { useState, useMemo } from 'react'
import {
  Receipt, Plus, Trash2, Edit, X, Printer, Search,
  DollarSign, TrendingDown, Users as UsersIcon, FileText,
  Check, AlertTriangle, Clock, ChevronDown, ChevronUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useLocalStorage from '../../lib/useLocalStorage'

/* ── Constants ─────────────────────────────────────────────────── */

const GOLD = '#B08D57'
const INK = '#2C2420'
const MUTED = 'rgba(44, 36, 32, 0.5)'
const FAINT = 'rgba(44, 36, 32, 0.15)'
const panelStyle = { backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid rgba(176,141,87,0.12)', borderRadius: '2px' }

const VAT_RATES = [0, 10, 13, 20]

const EXPENSE_CATEGORIES = [
  'Аренда и офис', 'Персонал', 'Софт и инструменты', 'Маркетинг', 'Командировки',
  'Связь', 'Бухгалтер', 'Обучение', 'Канцтовары', 'Прочее',
]

const INV_STATUSES = [
  { id: 'draft', label: 'Черновик', color: 'rgba(44,36,32,0.4)', bg: 'rgba(44,36,32,0.06)' },
  { id: 'open', label: 'Открыта', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { id: 'paid', label: 'Оплачена', color: '#7A8B6F', bg: 'rgba(122,139,111,0.1)' },
  { id: 'overdue', label: 'Просрочена', color: '#B5736A', bg: 'rgba(181,115,106,0.1)' },
]

const TABS = [
  { id: 'dashboard', label: 'Обзор', icon: DollarSign },
  { id: 'invoices', label: 'Счета', icon: FileText },
  { id: 'expenses', label: 'Расходы', icon: TrendingDown },
  { id: 'customers', label: 'Клиенты', icon: UsersIcon },
]

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
const today = () => new Date().toISOString().slice(0, 10)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU') : '—'
const fmtCur = (n) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n || 0)

const EMPTY_LINE = { desc: '', qty: 1, unitPrice: 0, vat: 20, productId: '' }

function readLS(key, fallback = []) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback } catch { return fallback }
}

function calcLine(l) {
  const net = (l.qty || 0) * (l.unitPrice || 0)
  const vatAmt = net * ((l.vat || 0) / 100)
  return { net, vatAmt, gross: net + vatAmt }
}

function genInvoiceNumber() {
  const y = new Date().getFullYear()
  const n = Math.floor(Math.random() * 900) + 100
  return `${y}-${n}`
}

/* ── Sub-components ────────────────────────────────────────────── */

function StatusBadge({ statusId }) {
  const s = INV_STATUSES.find((x) => x.id === statusId) || INV_STATUSES[0]
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 font-body text-[10px] tracking-wider uppercase rounded-sm"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.id === 'paid' && <Check size={9} />}
      {s.id === 'overdue' && <AlertTriangle size={9} />}
      {s.id === 'open' && <Clock size={9} />}
      {s.label}
    </span>
  )
}

/* ── Dashboard Tab ─────────────────────────────────────────────── */

function DashboardTab({ invoices, expenses }) {
  const now = new Date()
  const thisMonth = (d) => {
    const dd = new Date(d)
    return dd.getMonth() === now.getMonth() && dd.getFullYear() === now.getFullYear()
  }

  const revenue = invoices.filter((i) => i.status === 'paid' && thisMonth(i.date)).reduce((s, i) => s + (i.totalGross || 0), 0)
  const openAmt = invoices.filter((i) => i.status === 'open').reduce((s, i) => s + (i.totalGross || 0), 0)
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length
  const monthExpenses = expenses.filter((e) => thisMonth(e.date)).reduce((s, e) => s + (e.amount || 0), 0)
  const profit = revenue - monthExpenses

  const catBreakdown = EXPENSE_CATEGORIES.map((cat) => ({
    cat,
    total: expenses.filter((e) => e.category === cat && thisMonth(e.date)).reduce((s, e) => s + (e.amount || 0), 0),
  })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total)

  const stats = [
    { label: 'Выручка', value: fmtCur(revenue), color: '#7A8B6F' },
    { label: 'Открытые счета', value: fmtCur(openAmt), color: '#3b82f6', warn: overdueCount > 0 ? `${overdueCount} просрочено` : null },
    { label: 'Расходы', value: fmtCur(monthExpenses), color: '#B5736A' },
    { label: 'Прибыль', value: fmtCur(profit), color: profit >= 0 ? '#7A8B6F' : '#B5736A' },
  ]

  return (
    <div className="space-y-6">
      <p className="font-body text-[10px] tracking-[0.2em] uppercase" style={{ color: MUTED }}>
        {now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <p className="font-body text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(44,36,32,0.4)' }}>{s.label}</p>
            <p className="font-display text-xl italic mt-1" style={{ color: s.color }}>{s.value}</p>
            {s.warn && <p className="font-body text-[10px] mt-1" style={{ color: '#B5736A' }}>{s.warn}</p>}
          </div>
        ))}
      </div>

      {/* Recent invoices */}
      <div style={panelStyle} className="overflow-hidden">
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(176,141,87,0.1)' }}>
          <h3 className="font-display text-base italic" style={{ color: INK }}>Последние счета</h3>
        </div>
        {invoices.length === 0 ? (
          <p className="p-6 text-center font-body text-sm" style={{ color: FAINT }}>Нет счетов</p>
        ) : (
          <table className="w-full">
            <tbody>
              {invoices.slice(0, 5).map((inv) => (
                <tr key={inv.id} className="hover:bg-[rgba(176,141,87,0.03)]" style={{ borderBottom: '1px solid rgba(44,36,32,0.05)' }}>
                  <td className="px-4 py-2.5 font-body text-sm font-medium" style={{ color: INK }}>{inv.number}</td>
                  <td className="px-4 py-2.5 font-body text-sm" style={{ color: MUTED }}>{inv.customerName || '—'}</td>
                  <td className="px-4 py-2.5 font-body text-sm" style={{ color: MUTED }}>{fmtDate(inv.date)}</td>
                  <td className="px-4 py-2.5 font-body text-sm font-medium text-right" style={{ color: INK }}>{fmtCur(inv.totalGross)}</td>
                  <td className="px-4 py-2.5"><StatusBadge statusId={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Expense breakdown */}
      {catBreakdown.length > 0 && (
        <div style={panelStyle} className="p-4">
          <h3 className="font-display text-base italic mb-3" style={{ color: INK }}>Расходы по категориям</h3>
          <div className="space-y-2">
            {catBreakdown.map((c) => (
              <div key={c.cat} className="flex items-center justify-between">
                <span className="font-body text-sm" style={{ color: MUTED }}>{c.cat}</span>
                <span className="font-body text-sm font-medium" style={{ color: INK }}>{fmtCur(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Invoice Modal ─────────────────────────────────────────────── */

function InvoiceModal({ invoice, customers, onSave, onClose }) {
  const products = useMemo(() => readLS('vm_products', []), [])
  const [form, setForm] = useState(
    invoice || {
      id: uid(), number: genInvoiceNumber(), date: today(), dueDate: '',
      status: 'draft', customerId: '', customerName: '', lines: [{ ...EMPTY_LINE }],
      totalNet: 0, totalVat: 0, totalGross: 0, note: '',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
  )

  const totals = useMemo(() => {
    let net = 0, vat = 0
    ;(form.lines || []).forEach((l) => { const c = calcLine(l); net += c.net; vat += c.vatAmt })
    return { net, vat, gross: net + vat }
  }, [form.lines])

  const addLine = () => setForm((f) => ({ ...f, lines: [...f.lines, { ...EMPTY_LINE }] }))
  const removeLine = (i) => setForm((f) => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }))
  const updateLine = (i, key, val) => setForm((f) => ({
    ...f,
    lines: f.lines.map((l, idx) => (idx === i ? { ...l, [key]: key === 'desc' || key === 'productId' ? val : Number(val) || 0 } : l)),
  }))

  // Lookup product by ID and auto-fill line fields
  const linkProduct = (lineIdx, productId) => {
    const prod = products.find((p) => String(p.id) === String(productId))
    if (prod) {
      setForm((f) => ({
        ...f,
        lines: f.lines.map((l, idx) =>
          idx === lineIdx
            ? { ...l, productId: String(prod.id), desc: prod.title || prod.name || '', unitPrice: prod.price || 0, vat: 20 }
            : l
        ),
      }))
      toast.success(`${prod.title || prod.name}`)
    } else if (productId) {
      toast.error('Товар не найден')
    }
  }

  const handleSave = () => {
    if (!form.number.trim()) return toast.error('Введите номер счёта')
    onSave({ ...form, totalNet: totals.net, totalVat: totals.vat, totalGross: totals.gross, updatedAt: new Date().toISOString() })
  }

  const selectCustomer = (cid) => {
    const c = customers.find((x) => x.id === cid)
    setForm((f) => ({ ...f, customerId: cid, customerName: c?.name || '' }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-2xl my-8 p-6" style={{ ...panelStyle, backgroundColor: '#FFFFFF' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl italic" style={{ color: INK }}>{invoice ? 'Редактировать счёт' : 'Новый счёт'}</h2>
          <button onClick={onClose}><X size={18} style={{ color: FAINT }} /></button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44,36,32,0.4)' }}>Номер *</label>
            <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="gdt-input" />
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44,36,32,0.4)' }}>Статус</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="gdt-input">
              {INV_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44,36,32,0.4)' }}>Дата</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="gdt-input" />
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44,36,32,0.4)' }}>Срок оплаты</label>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="gdt-input" />
          </div>
          <div className="col-span-2">
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44,36,32,0.4)' }}>Клиент</label>
            {customers.length > 0 ? (
              <select value={form.customerId} onChange={(e) => selectCustomer(e.target.value)} className="gdt-input">
                <option value="">— Выбрать —</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : (
              <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Имя клиента" className="gdt-input" />
            )}
          </div>
        </div>

        {/* Lines */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="font-body text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(44,36,32,0.4)' }}>Позиции</label>
            <button onClick={addLine} className="flex items-center gap-1 font-body text-xs" style={{ color: GOLD }}><Plus size={12} /> Добавить</button>
          </div>
          <div className="space-y-3">
            {form.lines.map((line, i) => {
              const c = calcLine(line)
              return (
                <div key={i} className="p-2.5 rounded" style={{ backgroundColor: 'rgba(176,141,87,0.03)', border: `1px solid ${FAINT}` }}>
                  {/* Product picker row */}
                  <div className="flex items-center gap-2 mb-2">
                    <select
                      className="gdt-input text-xs flex-1"
                      value={line.productId || ''}
                      onChange={(e) => { updateLine(i, 'productId', e.target.value); if (e.target.value) linkProduct(i, e.target.value) }}
                    >
                      <option value="">— Товар (опционально) —</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.title || p.name} &mdash; {fmtCur(p.price)}</option>)}
                    </select>
                    <input
                      className="gdt-input text-xs w-20"
                      placeholder="ID"
                      value={line.productId || ''}
                      onChange={(e) => updateLine(i, 'productId', e.target.value)}
                      onBlur={(e) => { if (e.target.value) linkProduct(i, e.target.value) }}
                    />
                    <button onClick={() => removeLine(i)} className="p-1 shrink-0" title="Удалить"><Trash2 size={13} style={{ color: '#B5736A' }} /></button>
                  </div>
                  {/* Standard fields */}
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <input className="gdt-input col-span-5 text-xs" placeholder="Описание" value={line.desc} onChange={(e) => updateLine(i, 'desc', e.target.value)} />
                    <input className="gdt-input col-span-2 text-xs text-right" type="number" min="1" value={line.qty} onChange={(e) => updateLine(i, 'qty', e.target.value)} />
                    <input className="gdt-input col-span-2 text-xs text-right" type="number" step="0.01" value={line.unitPrice} onChange={(e) => updateLine(i, 'unitPrice', e.target.value)} />
                    <select className="gdt-input col-span-2 text-xs" value={line.vat} onChange={(e) => updateLine(i, 'vat', e.target.value)}>
                      {VAT_RATES.map((v) => <option key={v} value={v}>{v}%</option>)}
                    </select>
                    <div className="col-span-1 flex items-center justify-end">
                      <span className="font-body text-[10px] font-medium" style={{ color: INK }}>{fmtCur(c.gross)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="p-3 mb-4" style={{ backgroundColor: 'rgba(176,141,87,0.05)', borderRadius: '2px' }}>
          <div className="flex justify-between font-body text-xs" style={{ color: MUTED }}>
            <span>Нетто</span><span>{fmtCur(totals.net)}</span>
          </div>
          <div className="flex justify-between font-body text-xs mt-1" style={{ color: MUTED }}>
            <span>НДС</span><span>{fmtCur(totals.vat)}</span>
          </div>
          <div className="flex justify-between font-body text-sm font-medium mt-2 pt-2" style={{ borderTop: '1px solid rgba(176,141,87,0.15)', color: INK }}>
            <span>Итого</span><span>{fmtCur(totals.gross)}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44,36,32,0.4)' }}>Примечание</label>
          <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} className="gdt-input resize-none" />
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} className="flex-1 py-2.5 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>
            Сохранить
          </button>
          <button onClick={onClose} className="px-6 py-2.5 font-body text-xs tracking-wider uppercase" style={{ border: '1px solid rgba(44,36,32,0.15)', color: MUTED, borderRadius: '2px' }}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Invoices Tab ───────────────────────────────────────────────── */

function InvoicesTab({ invoices, setInvoices, customers }) {
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(null) // null | 'new' | invoice obj

  const filtered = filter === 'all' ? invoices : invoices.filter((i) => i.status === filter)

  const handleSave = (inv) => {
    setInvoices((prev) => {
      const exists = prev.find((x) => x.id === inv.id)
      return exists ? prev.map((x) => (x.id === inv.id ? inv : x)) : [inv, ...prev]
    })
    setModal(null)
    toast.success('Счёт сохранён')
  }

  const handleDelete = (inv) => {
    if (!window.confirm(`Удалить счёт ${inv.number}?`)) return
    setInvoices((prev) => prev.filter((x) => x.id !== inv.id))
    toast.success('Удалён')
  }

  const handlePrint = (inv) => {
    const w = window.open('', '_blank', 'width=800,height=600')
    if (!w) return
    const lines = (inv.lines || []).map((l) => {
      const c = calcLine(l)
      return `<tr><td style="padding:6px;border-bottom:1px solid #eee">${l.desc}</td><td style="text-align:right;padding:6px;border-bottom:1px solid #eee">${l.qty}</td><td style="text-align:right;padding:6px;border-bottom:1px solid #eee">${fmtCur(l.unitPrice)}</td><td style="text-align:right;padding:6px;border-bottom:1px solid #eee">${l.vat}%</td><td style="text-align:right;padding:6px;border-bottom:1px solid #eee">${fmtCur(c.gross)}</td></tr>`
    }).join('')
    w.document.write(`<!DOCTYPE html><html><head><title>Счёт ${inv.number}</title><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;color:#333}h1{font-size:24px;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:20px 0}th{text-align:left;padding:8px;border-bottom:2px solid #B08D57;font-size:12px;text-transform:uppercase;color:#666}@media print{body{margin:0}}</style></head><body><h1>Счёт ${inv.number}</h1><p style="color:#666;font-size:14px">${fmtDate(inv.date)} · ${inv.customerName || 'Клиент не указан'}</p><table><thead><tr><th>Описание</th><th style="text-align:right">Кол-во</th><th style="text-align:right">Цена</th><th style="text-align:right">НДС</th><th style="text-align:right">Сумма</th></tr></thead><tbody>${lines}</tbody></table><div style="text-align:right;margin-top:20px"><p style="font-size:14px;color:#666">Нетто: ${fmtCur(inv.totalNet)}</p><p style="font-size:14px;color:#666">НДС: ${fmtCur(inv.totalVat)}</p><p style="font-size:20px;font-weight:bold;color:#B08D57;margin-top:8px">Итого: ${fmtCur(inv.totalGross)}</p></div>${inv.note ? `<p style="margin-top:30px;padding-top:15px;border-top:1px solid #eee;font-size:13px;color:#888">${inv.note}</p>` : ''}</body></html>`)
    w.document.close()
    w.print()
  }

  const statusChange = (inv, newStatus) => {
    setInvoices((prev) => prev.map((x) => (x.id === inv.id ? { ...x, status: newStatus, updatedAt: new Date().toISOString() } : x)))
    const label = INV_STATUSES.find((s) => s.id === newStatus)?.label
    toast.success(`${inv.number}: → ${label}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5 overflow-x-auto">
          {[{ id: 'all', label: 'Все' }, ...INV_STATUSES].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className="px-3 py-1.5 font-body text-xs tracking-wider uppercase whitespace-nowrap transition-all"
              style={{
                backgroundColor: filter === s.id ? 'rgba(176,141,87,0.12)' : 'transparent',
                color: filter === s.id ? GOLD : MUTED,
                borderRadius: '2px',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button onClick={() => setModal('new')} className="flex items-center gap-2 px-4 py-2 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>
          <Plus size={14} /> Новый счёт
        </button>
      </div>

      <div style={panelStyle} className="overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-10 text-center font-body text-sm" style={{ color: FAINT }}>Нет счетов</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(176,141,87,0.1)' }}>
                  {['Номер', 'Клиент', 'Дата', 'Сумма', 'Статус', ''].map((h) => (
                    <th key={h || 'act'} className="text-left px-4 py-3 font-body text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(44,36,32,0.4)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[rgba(176,141,87,0.03)]" style={{ borderBottom: '1px solid rgba(44,36,32,0.05)' }}>
                    <td className="px-4 py-2.5 font-body text-sm font-medium" style={{ color: INK }}>{inv.number}</td>
                    <td className="px-4 py-2.5 font-body text-sm" style={{ color: MUTED }}>{inv.customerName || '—'}</td>
                    <td className="px-4 py-2.5 font-body text-sm" style={{ color: MUTED }}>{fmtDate(inv.date)}</td>
                    <td className="px-4 py-2.5 font-body text-sm font-medium" style={{ color: INK }}>{fmtCur(inv.totalGross)}</td>
                    <td className="px-4 py-2.5">
                      <select
                        value={inv.status}
                        onChange={(e) => statusChange(inv, e.target.value)}
                        className="font-body text-[10px] px-1.5 py-0.5 rounded-sm bg-transparent outline-none"
                        style={{ color: INV_STATUSES.find((s) => s.id === inv.status)?.color }}
                      >
                        {INV_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal(inv)} className="p-1.5 rounded hover:bg-[rgba(176,141,87,0.1)]" title="Редактировать"><Edit size={13} style={{ color: GOLD }} /></button>
                        <button onClick={() => handlePrint(inv)} className="p-1.5 rounded hover:bg-[rgba(176,141,87,0.1)]" title="Печать"><Printer size={13} style={{ color: MUTED }} /></button>
                        <button onClick={() => handleDelete(inv)} className="p-1.5 rounded hover:bg-[rgba(180,60,60,0.08)]" title="Удалить"><Trash2 size={13} style={{ color: 'rgba(180,60,60,0.5)' }} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <InvoiceModal
          invoice={modal === 'new' ? null : modal}
          customers={customers}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

/* ── Expenses Tab ──────────────────────────────────────────────── */

function ExpensesTab({ expenses, setExpenses }) {
  const [catFilter, setCatFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ vendor: '', amount: '', category: EXPENSE_CATEGORIES[0], date: today(), note: '' })

  const filtered = catFilter === 'all' ? expenses : expenses.filter((e) => e.category === catFilter)

  const handleAdd = () => {
    if (!form.vendor.trim()) return toast.error('Введите поставщика')
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Введите сумму')
    const expense = { id: uid(), ...form, amount: Number(form.amount), createdAt: new Date().toISOString() }
    setExpenses((prev) => [expense, ...prev])
    setForm({ vendor: '', amount: '', category: EXPENSE_CATEGORIES[0], date: today(), note: '' })
    setShowForm(false)
    toast.success('Расход добавлен')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="gdt-input max-w-xs text-xs">
          <option value="all">Все категории</option>
          {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>
          <Plus size={14} /> Расход
        </button>
      </div>

      {showForm && (
        <div style={panelStyle} className="p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="Поставщик" className="gdt-input text-xs" />
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Сумма €" step="0.01" className="gdt-input text-xs" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="gdt-input text-xs">
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="gdt-input text-xs" />
            <button onClick={handleAdd} className="py-2 font-body text-xs uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>Добавить</button>
          </div>
        </div>
      )}

      <div style={panelStyle} className="overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-10 text-center font-body text-sm" style={{ color: FAINT }}>Нет расходов</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(176,141,87,0.1)' }}>
                  {['Поставщик', 'Категория', 'Дата', 'Сумма', ''].map((h) => (
                    <th key={h || 'a'} className="text-left px-4 py-3 font-body text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(44,36,32,0.4)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-[rgba(176,141,87,0.03)]" style={{ borderBottom: '1px solid rgba(44,36,32,0.05)' }}>
                    <td className="px-4 py-2.5 font-body text-sm font-medium" style={{ color: INK }}>{e.vendor}</td>
                    <td className="px-4 py-2.5 font-body text-xs" style={{ color: MUTED }}>{e.category}</td>
                    <td className="px-4 py-2.5 font-body text-sm" style={{ color: MUTED }}>{fmtDate(e.date)}</td>
                    <td className="px-4 py-2.5 font-body text-sm font-medium" style={{ color: '#B5736A' }}>−{fmtCur(e.amount)}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => { setExpenses((prev) => prev.filter((x) => x.id !== e.id)); toast.success('Удалён') }} className="p-1.5 rounded hover:bg-[rgba(180,60,60,0.08)]">
                        <Trash2 size={13} style={{ color: 'rgba(180,60,60,0.5)' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Customers Tab ─────────────────────────────────────────────── */

function CustomersTab({ customers, setCustomers }) {
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', uid_number: '', email: '', phone: '', address: '', contact: '' })

  const openEdit = (c) => {
    setForm({ name: c.name || '', uid_number: c.uid_number || '', email: c.email || '', phone: c.phone || '', address: c.address || '', contact: c.contact || '' })
    setModal(c)
  }

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('Введите имя клиента')
    if (modal && modal !== 'new') {
      setCustomers((prev) => prev.map((x) => (x.id === modal.id ? { ...x, ...form } : x)))
      toast.success('Обновлён')
    } else {
      setCustomers((prev) => [{ id: uid(), ...form, createdAt: new Date().toISOString() }, ...prev])
      toast.success('Клиент создан')
    }
    setModal(null)
    setForm({ name: '', uid_number: '', email: '', phone: '', address: '', contact: '' })
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => { setForm({ name: '', uid_number: '', email: '', phone: '', address: '', contact: '' }); setModal('new') }} className="flex items-center gap-2 px-4 py-2 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>
          <Plus size={14} /> Новый клиент
        </button>
      </div>

      <div style={panelStyle} className="overflow-hidden">
        {customers.length === 0 ? (
          <p className="p-10 text-center font-body text-sm" style={{ color: FAINT }}>Нет клиентов</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(176,141,87,0.1)' }}>
                  {['Имя', 'UID', 'Email', 'Телефон', ''].map((h) => (
                    <th key={h || 'a'} className="text-left px-4 py-3 font-body text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(44,36,32,0.4)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[rgba(176,141,87,0.03)]" style={{ borderBottom: '1px solid rgba(44,36,32,0.05)' }}>
                    <td className="px-4 py-2.5 font-body text-sm font-medium" style={{ color: INK }}>{c.name}</td>
                    <td className="px-4 py-2.5 font-body text-xs" style={{ color: MUTED }}>{c.uid_number || '—'}</td>
                    <td className="px-4 py-2.5 font-body text-xs" style={{ color: MUTED }}>{c.email || '—'}</td>
                    <td className="px-4 py-2.5 font-body text-xs" style={{ color: MUTED }}>{c.phone || '—'}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-[rgba(176,141,87,0.1)]"><Edit size={13} style={{ color: GOLD }} /></button>
                        <button onClick={() => { if (window.confirm(`Удалить ${c.name}?`)) { setCustomers((prev) => prev.filter((x) => x.id !== c.id)); toast.success('Удалён') } }} className="p-1.5 rounded hover:bg-[rgba(180,60,60,0.08)]"><Trash2 size={13} style={{ color: 'rgba(180,60,60,0.5)' }} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setModal(null)}>
          <div className="w-full max-w-md p-6" style={{ ...panelStyle, backgroundColor: '#FFFFFF' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl italic" style={{ color: INK }}>{modal === 'new' ? 'Новый клиент' : 'Редактировать'}</h2>
              <button onClick={() => setModal(null)}><X size={18} style={{ color: FAINT }} /></button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'name', label: 'Имя *', ph: 'Название компании' },
                { key: 'uid_number', label: 'UID', ph: 'ATU12345678' },
                { key: 'email', label: 'Email', ph: 'email@example.com' },
                { key: 'phone', label: 'Телефон', ph: '+43...' },
                { key: 'address', label: 'Адрес', ph: 'Улица, город' },
                { key: 'contact', label: 'Контактное лицо', ph: 'Имя контакта' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(44,36,32,0.4)' }}>{f.label}</label>
                  <input value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.ph} className="gdt-input text-sm" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 py-2.5 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>Сохранить</button>
              <button onClick={() => setModal(null)} className="px-6 py-2.5 font-body text-xs tracking-wider uppercase" style={{ border: '1px solid rgba(44,36,32,0.15)', color: MUTED, borderRadius: '2px' }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main Component ────────────────────────────────────────────── */

export default function AdminAccounting() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [invoices, setInvoices] = useLocalStorage('invoices', [])
  const [expenses, setExpenses] = useLocalStorage('expenses', [])
  const [customers, setCustomers] = useLocalStorage('customers', [])

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)' }}>
          <Receipt size={20} style={{ color: GOLD }} />
        </div>
        <div>
          <h1 className="font-display text-2xl italic" style={{ color: INK }}>Бухгалтерия</h1>
          <p className="font-body text-sm mt-0.5" style={{ color: MUTED }}>
            {invoices.length} счетов · {expenses.length} расходов · {customers.length} клиентов
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto" style={{ borderBottom: '1px solid rgba(176,141,87,0.1)' }}>
        {TABS.map((t) => {
          const Icon = t.icon
          const isActive = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 font-body text-xs tracking-wider uppercase whitespace-nowrap transition-all -mb-px"
              style={{
                color: isActive ? GOLD : MUTED,
                borderBottom: isActive ? `2px solid ${GOLD}` : '2px solid transparent',
              }}
            >
              <Icon size={14} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && <DashboardTab invoices={invoices} expenses={expenses} />}
      {activeTab === 'invoices' && <InvoicesTab invoices={invoices} setInvoices={setInvoices} customers={customers} />}
      {activeTab === 'expenses' && <ExpensesTab expenses={expenses} setExpenses={setExpenses} />}
      {activeTab === 'customers' && <CustomersTab customers={customers} setCustomers={setCustomers} />}
    </div>
  )
}
