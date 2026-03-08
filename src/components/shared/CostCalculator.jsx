import { useState, useMemo } from 'react'
import { Calculator, RotateCcw, TrendingUp, TrendingDown, Minus } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Colors & Styles                                                    */
/* ------------------------------------------------------------------ */

const COLORS = {
  gold: '#B08D57',
  goldMuted: 'rgba(176, 141, 87, 0.4)',
  cream: '#F0E6D6',
  creamDim: 'rgba(240, 230, 214, 0.5)',
  creamFaint: 'rgba(240, 230, 214, 0.3)',
  panelBg: '#1A1410',
  panelBorder: 'rgba(176, 141, 87, 0.08)',
  profit: '#B08D57',
  loss: '#B5736A',
  neutral: 'rgba(240, 230, 214, 0.4)',
}

const panelStyle = {
  backgroundColor: COLORS.panelBg,
  border: `1px solid ${COLORS.panelBorder}`,
  borderRadius: '2px',
}

/* ------------------------------------------------------------------ */
/*  Cost fields config                                                 */
/* ------------------------------------------------------------------ */

const COST_FIELDS = [
  { key: 'purchasePrice', label: 'Цена закупки', placeholder: '0', required: true },
  { key: 'transport',     label: 'Транспорт / доставка', placeholder: '0' },
  { key: 'customs',       label: 'Таможня / пошлины', placeholder: '0' },
  { key: 'restoration',   label: 'Реставрация', placeholder: '0' },
  { key: 'marketing',     label: 'Маркетинг / реклама', placeholder: '0' },
  { key: 'other',         label: 'Прочие расходы', placeholder: '0' },
]

const INITIAL_VALUES = {
  purchasePrice: '',
  transport: '',
  customs: '',
  restoration: '',
  marketing: '',
  other: '',
  salePrice: '',
  deductionPercent: '15',
}

/* ------------------------------------------------------------------ */
/*  Calculation                                                        */
/* ------------------------------------------------------------------ */

function calculate(v) {
  const num = (key) => parseFloat(v[key]) || 0

  const totalCost = num('purchasePrice') + num('transport') + num('customs') +
                    num('restoration') + num('marketing') + num('other')
  const salePrice = num('salePrice')
  const grossProfit = salePrice - totalCost
  const deductions = salePrice * (num('deductionPercent') / 100)
  const netProfit = grossProfit - deductions
  const margin = salePrice > 0 ? (netProfit / salePrice) * 100 : 0
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0

  return { totalCost, grossProfit, deductions, netProfit, margin, roi }
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionTitle({ children }) {
  return (
    <h3 className="font-display text-lg mb-4" style={{ color: COLORS.gold }}>
      {children}
    </h3>
  )
}

function NumberField({ label, value, onChange, placeholder, required, suffix = '€' }) {
  return (
    <div>
      <label className="block font-body text-xs mb-1.5 tracking-wider uppercase" style={{ color: COLORS.creamFaint }}>
        {label} {required && <span style={{ color: COLORS.gold }}>*</span>}
      </label>
      <div className="relative">
        <input
          type="number"
          min="0"
          step="any"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="gdt-input-dark pr-8"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-body text-sm" style={{ color: COLORS.creamFaint }}>
          {suffix}
        </span>
      </div>
    </div>
  )
}

function StatCard({ label, value, suffix, color, Icon }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2">
        <span className="font-body text-[11px] tracking-wider uppercase" style={{ color: COLORS.creamFaint }}>
          {label}
        </span>
        {Icon && <Icon size={14} style={{ color }} />}
      </div>
      <p className="font-display text-2xl" style={{ color }}>
        {typeof value === 'number' ? value.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : value}
        {suffix && <span className="text-base ml-1" style={{ color: COLORS.creamDim }}>{suffix}</span>}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function CostCalculator({ currencySymbol = '€' }) {
  const [values, setValues] = useState(INITIAL_VALUES)

  const updateField = (key) => (e) => {
    setValues(prev => ({ ...prev, [key]: e.target.value }))
  }

  const results = useMemo(() => calculate(values), [values])
  const hasSale = parseFloat(values.salePrice) > 0
  const hasCost = results.totalCost > 0

  const profitColor = results.netProfit > 0 ? COLORS.profit : results.netProfit < 0 ? COLORS.loss : COLORS.neutral
  const ProfitIcon = results.netProfit > 0 ? TrendingUp : results.netProfit < 0 ? TrendingDown : Minus

  return (
    <div className="page-enter max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl" style={{ color: COLORS.cream }}>
            Калькулятор себестоимости
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: COLORS.creamFaint }}>
            Рассчитайте рентабельность товара
          </p>
        </div>
        <button
          onClick={() => setValues(INITIAL_VALUES)}
          className="flex items-center gap-2 font-body text-xs px-3 py-2 rounded transition-colors hover:bg-white/5"
          style={{ color: COLORS.creamDim, border: `1px solid ${COLORS.panelBorder}` }}
        >
          <RotateCcw size={14} />
          Сбросить
        </button>
      </div>

      {/* Cost inputs */}
      <div className="p-6" style={panelStyle}>
        <SectionTitle>Затраты</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COST_FIELDS.map(f => (
            <NumberField
              key={f.key}
              label={f.label}
              value={values[f.key]}
              onChange={updateField(f.key)}
              placeholder={f.placeholder}
              required={f.required}
              suffix={currencySymbol}
            />
          ))}
        </div>

        {hasCost && (
          <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${COLORS.panelBorder}` }}>
            <span className="font-body text-sm" style={{ color: COLORS.creamDim }}>
              Итого себестоимость:
            </span>
            <span className="font-display text-xl" style={{ color: COLORS.cream }}>
              {results.totalCost.toLocaleString('ru-RU')}{currencySymbol}
            </span>
          </div>
        )}
      </div>

      {/* Sale inputs */}
      <div className="p-6" style={panelStyle}>
        <SectionTitle>Продажа</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberField
            label="Цена продажи"
            value={values.salePrice}
            onChange={updateField('salePrice')}
            placeholder="0"
            required
            suffix={currencySymbol}
          />
          <div>
            <label className="block font-body text-xs mb-1.5 tracking-wider uppercase" style={{ color: COLORS.creamFaint }}>
              Вычеты / комиссия
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={values.deductionPercent}
                onChange={updateField('deductionPercent')}
                className="gdt-input-dark pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-body text-sm" style={{ color: COLORS.creamFaint }}>
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {hasSale && hasCost && (
        <div className="p-6" style={panelStyle}>
          <SectionTitle>Результаты</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard
              label="Валовая прибыль"
              value={results.grossProfit}
              suffix={currencySymbol}
              color={results.grossProfit >= 0 ? COLORS.profit : COLORS.loss}
              Icon={results.grossProfit >= 0 ? TrendingUp : TrendingDown}
            />
            <StatCard
              label="Вычеты компании"
              value={results.deductions}
              suffix={currencySymbol}
              color={COLORS.neutral}
            />
            <StatCard
              label="Чистая прибыль"
              value={results.netProfit}
              suffix={currencySymbol}
              color={profitColor}
              Icon={ProfitIcon}
            />
            <StatCard
              label="Маржа"
              value={results.margin}
              suffix="%"
              color={profitColor}
            />
            <StatCard
              label="ROI"
              value={results.roi}
              suffix="%"
              color={profitColor}
            />
            <StatCard
              label="Себестоимость"
              value={results.totalCost}
              suffix={currencySymbol}
              color={COLORS.cream}
              Icon={Calculator}
            />
          </div>
        </div>
      )}
    </div>
  )
}
