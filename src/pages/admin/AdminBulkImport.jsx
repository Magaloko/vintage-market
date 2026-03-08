import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload, FileSpreadsheet, Plus, Trash2, Download,
  CheckCircle2, XCircle, AlertTriangle, ArrowRight, Table2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { categories, conditions } from '../../data/demoProducts'
import { bulkCreateProducts } from '../../lib/api'
import {
  validateAll, rowToProduct, downloadTemplate,
  parseFile, mapRows, autoMapColumns, FIELD_OPTIONS,
} from '../../lib/bulkImport'

// =============================================================================
// Style tokens (matching AdminProducts.jsx light theme)
// =============================================================================

const colors = { ink: '#2C2420', gold: '#B08D57', white: '#FFFFFF', rose: '#B5736A', sage: '#7A8B6F' }
const alpha = {
  ink05: 'rgba(44, 36, 32, 0.05)', ink10: 'rgba(44, 36, 32, 0.1)', ink30: 'rgba(44, 36, 32, 0.3)',
  ink50: 'rgba(44, 36, 32, 0.5)', gold08: 'rgba(176, 141, 87, 0.08)', gold12: 'rgba(176, 141, 87, 0.12)',
  gold15: 'rgba(176, 141, 87, 0.15)', gold25: 'rgba(176, 141, 87, 0.25)',
}
const panelStyle = { backgroundColor: 'rgba(255, 255, 255, 0.85)', border: `1px solid rgba(176, 141, 87, 0.1)`, borderRadius: '8px' }
const inputStyle = {
  backgroundColor: 'rgba(247, 242, 235, 0.8)', border: `1px solid ${alpha.gold12}`,
  borderRadius: '4px', color: colors.ink, fontSize: '13px', outline: 'none',
}

// =============================================================================
// Empty row factory
// =============================================================================

let rowKey = 0
function createEmptyRow(prevCategory = 'clothing') {
  return {
    _key: ++rowKey,
    category: prevCategory,
    title: '',
    price: '',
    cost_price: '',
    purchase_date: '',
    customer: '',
    condition: 'good',
  }
}

// =============================================================================
// Main component
// =============================================================================

export default function AdminBulkImport() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('manual')

  // Manual entry state
  const [rows, setRows] = useState([createEmptyRow()])
  const [touched, setTouched] = useState(false)

  // File upload state
  const [fileData, setFileData] = useState(null)      // { rows, headers, mapping }
  const [mappedRows, setMappedRows] = useState(null)
  const fileRef = useRef(null)

  // Import state
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState(null)

  // ── Manual entry handlers ──

  const updateRow = useCallback((key, field, value) => {
    setRows(prev => prev.map(r => r._key === key ? { ...r, [field]: value } : r))
  }, [])

  const removeRow = useCallback((key) => {
    setRows(prev => prev.length <= 1 ? [createEmptyRow()] : prev.filter(r => r._key !== key))
  }, [])

  const addRows = useCallback((count = 1) => {
    setRows(prev => {
      const lastCat = prev[prev.length - 1]?.category || 'clothing'
      const newRows = Array.from({ length: count }, () => createEmptyRow(lastCat))
      return [...prev, ...newRows]
    })
  }, [])

  const clearAll = useCallback(() => {
    setRows([createEmptyRow()])
    setTouched(false)
    setResults(null)
  }, [])

  // ── Import handler ──

  const handleImport = async (productRows) => {
    const validations = validateAll(productRows)
    const validRows = productRows.filter((_, i) => validations[i].valid)
    const invalidCount = productRows.length - validRows.length

    if (validRows.length === 0) {
      toast.error('Нет валидных строк для импорта')
      return
    }

    if (invalidCount > 0) {
      toast(`${invalidCount} строк с ошибками пропущено`, { icon: '⚠️' })
    }

    setImporting(true)
    const products = validRows.map(rowToProduct)

    const { data, error } = await bulkCreateProducts(products)
    setImporting(false)

    if (error) {
      toast.error(error.message || 'Ошибка импорта')
      return
    }

    setResults(data)
    if (data.created > 0) {
      toast.success(`${data.created} товаров добавлено!`)
    }
  }

  const handleManualImport = () => {
    setTouched(true)
    handleImport(rows)
  }

  const handleFileImport = () => {
    if (!mappedRows) return
    handleImport(mappedRows)
  }

  // ── File upload handler ──

  const handleFile = async (file) => {
    if (!file) return
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Файл слишком большой (макс. 5 МБ)')
      return
    }

    try {
      const parsed = await parseFile(file)
      setFileData(parsed)
      const mapped = mapRows(parsed.rows, parsed.mapping)
      setMappedRows(mapped)
      setResults(null)
      toast.success(`Загружено ${parsed.rows.length} строк`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    if (file) handleFile(file)
  }

  const updateMapping = (header, field) => {
    if (!fileData) return
    const newMapping = { ...fileData.mapping }
    if (field === '') {
      delete newMapping[header]
    } else {
      newMapping[header] = field
    }
    setFileData({ ...fileData, mapping: newMapping })
    setMappedRows(mapRows(fileData.rows, newMapping))
  }

  // ── Validations for display ──

  const manualValidations = touched ? validateAll(rows) : null
  const manualErrorCount = manualValidations ? manualValidations.filter(v => !v.valid).length : 0
  const manualValidCount = rows.filter(r => r.title?.trim() && r.category?.trim() && Number(r.price) > 0).length

  const fileValidations = mappedRows ? validateAll(mappedRows) : null
  const fileValidCount = fileValidations ? fileValidations.filter(v => v.valid).length : 0
  const fileErrorCount = fileValidations ? fileValidations.filter(v => !v.valid).length : 0

  // ── Render ──

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg" style={{ backgroundColor: alpha.gold08 }}>
            <Upload size={20} style={{ color: colors.gold }} />
          </div>
          <div>
            <h1 className="font-display text-2xl italic" style={{ color: colors.ink }}>Массовый импорт</h1>
            <p className="font-body text-sm mt-0.5" style={{ color: alpha.ink50 }}>
              Быстрое добавление нескольких товаров
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: alpha.ink05 }}>
        {[
          { id: 'manual', icon: Table2, label: 'Ручной ввод' },
          { id: 'upload', icon: FileSpreadsheet, label: 'Загрузка файла' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResults(null) }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-body text-sm transition-all duration-200"
            style={{
              backgroundColor: activeTab === tab.id ? colors.white : 'transparent',
              color: activeTab === tab.id ? colors.gold : alpha.ink50,
              boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              fontWeight: activeTab === tab.id ? '500' : '400',
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results banner */}
      {results && <ResultsBanner results={results} onGoToProducts={() => navigate('/admin/products')} />}

      {/* Tab content */}
      {activeTab === 'manual' && !results && (
        <ManualEntry
          rows={rows}
          validations={manualValidations}
          updateRow={updateRow}
          removeRow={removeRow}
          addRows={addRows}
          clearAll={clearAll}
          onImport={handleManualImport}
          importing={importing}
          validCount={manualValidCount}
          errorCount={manualErrorCount}
          touched={touched}
        />
      )}

      {activeTab === 'upload' && !results && (
        <FileUpload
          fileRef={fileRef}
          fileData={fileData}
          mappedRows={mappedRows}
          validations={fileValidations}
          validCount={fileValidCount}
          errorCount={fileErrorCount}
          onFile={handleFile}
          onDrop={handleDrop}
          updateMapping={updateMapping}
          onImport={handleFileImport}
          importing={importing}
        />
      )}
    </div>
  )
}

// =============================================================================
// Results Banner
// =============================================================================

function ResultsBanner({ results, onGoToProducts }) {
  return (
    <div className="p-6 rounded-lg" style={panelStyle}>
      <div className="flex items-center gap-4 mb-4">
        <CheckCircle2 size={28} style={{ color: colors.sage }} />
        <h2 className="font-display text-xl italic" style={{ color: colors.ink }}>Импорт завершён</h2>
      </div>

      <div className="flex gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.sage }} />
          <span className="font-body text-sm" style={{ color: colors.ink }}>
            Создано: <strong>{results.created}</strong>
          </span>
        </div>
        {results.errors?.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.rose }} />
            <span className="font-body text-sm" style={{ color: colors.ink }}>
              Ошибки: <strong>{results.errors.length}</strong>
            </span>
          </div>
        )}
      </div>

      {results.errors?.length > 0 && (
        <div className="mb-4 p-3 rounded" style={{ backgroundColor: 'rgba(181, 115, 106, 0.06)', border: '1px solid rgba(181, 115, 106, 0.15)' }}>
          <p className="font-body text-xs font-medium mb-2" style={{ color: colors.rose }}>Строки с ошибками:</p>
          {results.errors.slice(0, 10).map((err, i) => (
            <p key={i} className="font-body text-xs" style={{ color: alpha.ink50 }}>
              Строка {err.index + 1}: {err.message}
            </p>
          ))}
        </div>
      )}

      <button
        onClick={onGoToProducts}
        className="flex items-center gap-2 px-5 py-2.5 rounded font-body text-sm transition-all duration-200"
        style={{ backgroundColor: colors.gold, color: colors.white }}
      >
        Перейти к товарам <ArrowRight size={14} />
      </button>
    </div>
  )
}

// =============================================================================
// Manual Entry
// =============================================================================

function ManualEntry({ rows, validations, updateRow, removeRow, addRows, clearAll, onImport, importing, validCount, errorCount, touched }) {
  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={panelStyle}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: '900px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${alpha.gold12}` }}>
                {['#', 'Категория *', 'Название *', 'Цена продажи *', 'Цена закупки', 'Дата закупки', 'Клиент', 'Состояние', ''].map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-3 text-left font-body text-[10px] tracking-wider uppercase"
                    style={{ color: alpha.ink30 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const v = validations?.[idx]
                const fieldErrors = v?.errors?.reduce((m, e) => ({ ...m, [e.field]: true }), {}) || {}

                return (
                  <tr key={row._key} style={{ borderBottom: `1px solid ${alpha.ink05}` }}>
                    <td className="px-3 py-2">
                      <span className="font-body text-xs" style={{ color: alpha.ink30 }}>{idx + 1}</span>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={row.category}
                        onChange={e => updateRow(row._key, 'category', e.target.value)}
                        className="w-full px-2 py-1.5 font-body text-xs"
                        style={{ ...inputStyle, borderColor: touched && fieldErrors.category ? colors.rose : alpha.gold12 }}
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={row.title}
                        onChange={e => updateRow(row._key, 'title', e.target.value)}
                        placeholder="Название товара"
                        className="w-full px-2 py-1.5 font-body text-xs"
                        style={{ ...inputStyle, minWidth: '180px', borderColor: touched && fieldErrors.title ? colors.rose : alpha.gold12 }}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={row.price}
                        onChange={e => updateRow(row._key, 'price', e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full px-2 py-1.5 font-body text-xs"
                        style={{ ...inputStyle, width: '100px', borderColor: touched && fieldErrors.price ? colors.rose : alpha.gold12 }}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={row.cost_price}
                        onChange={e => updateRow(row._key, 'cost_price', e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full px-2 py-1.5 font-body text-xs"
                        style={{ ...inputStyle, width: '100px' }}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="date"
                        value={row.purchase_date}
                        onChange={e => updateRow(row._key, 'purchase_date', e.target.value)}
                        className="w-full px-2 py-1.5 font-body text-xs"
                        style={{ ...inputStyle, width: '130px' }}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={row.customer}
                        onChange={e => updateRow(row._key, 'customer', e.target.value)}
                        placeholder="Имя клиента"
                        className="w-full px-2 py-1.5 font-body text-xs"
                        style={{ ...inputStyle, width: '130px' }}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={row.condition}
                        onChange={e => updateRow(row._key, 'condition', e.target.value)}
                        className="w-full px-2 py-1.5 font-body text-xs"
                        style={inputStyle}
                      >
                        {conditions.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => removeRow(row._key)}
                        className="p-1.5 rounded transition-colors duration-200"
                        style={{ color: alpha.ink30 }}
                        onMouseEnter={e => e.currentTarget.style.color = colors.rose}
                        onMouseLeave={e => e.currentTarget.style.color = alpha.ink30}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <AddButton label="+ Строка" onClick={() => addRows(1)} />
          <AddButton label="+ 5" onClick={() => addRows(5)} />
          <AddButton label="+ 10" onClick={() => addRows(10)} />
          <button
            onClick={clearAll}
            className="px-3 py-2 font-body text-xs rounded transition-colors duration-200"
            style={{ color: alpha.ink30, border: `1px solid ${alpha.ink10}` }}
            onMouseEnter={e => e.currentTarget.style.borderColor = alpha.ink30}
            onMouseLeave={e => e.currentTarget.style.borderColor = alpha.ink10}
          >
            Очистить
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-body text-xs" style={{ color: alpha.ink30 }}>
            {rows.length} строк · {validCount} готово
          </span>
          {touched && errorCount > 0 && (
            <span className="px-2 py-0.5 rounded-full font-body text-[10px]" style={{ backgroundColor: 'rgba(181, 115, 106, 0.1)', color: colors.rose }}>
              {errorCount} ошибок
            </span>
          )}
          <button
            onClick={onImport}
            disabled={importing || validCount === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded font-body text-sm transition-all duration-200"
            style={{
              backgroundColor: importing || validCount === 0 ? alpha.ink10 : colors.gold,
              color: importing || validCount === 0 ? alpha.ink30 : colors.white,
              cursor: importing || validCount === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {importing ? (
              <><span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Импорт...</>
            ) : (
              <><Upload size={14} /> Импортировать</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 font-body text-xs rounded transition-all duration-200"
      style={{ border: `1px solid ${alpha.gold25}`, color: colors.gold }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = alpha.gold08}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {label}
    </button>
  )
}

// =============================================================================
// File Upload
// =============================================================================

function FileUpload({ fileRef, fileData, mappedRows, validations, validCount, errorCount, onFile, onDrop, updateMapping, onImport, importing }) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      {!fileData && (
        <div
          className="p-12 rounded-lg text-center transition-all duration-200"
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { setDragOver(false); onDrop(e) }}
          style={{
            ...panelStyle,
            borderStyle: 'dashed',
            borderWidth: '2px',
            borderColor: dragOver ? colors.gold : alpha.gold25,
            backgroundColor: dragOver ? alpha.gold08 : 'rgba(255, 255, 255, 0.85)',
          }}
        >
          <FileSpreadsheet size={40} style={{ color: alpha.gold25, margin: '0 auto 16px' }} />
          <p className="font-display text-lg italic mb-2" style={{ color: colors.ink }}>
            Перетащите файл сюда
          </p>
          <p className="font-body text-sm mb-6" style={{ color: alpha.ink50 }}>
            Поддерживаются .xlsx, .xls и .csv
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="px-5 py-2.5 rounded font-body text-sm transition-all duration-200"
              style={{ backgroundColor: colors.gold, color: colors.white }}
            >
              Выбрать файл
            </button>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-5 py-2.5 rounded font-body text-sm transition-all duration-200"
              style={{ border: `1px solid ${alpha.gold25}`, color: colors.gold }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = alpha.gold08}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Download size={14} /> Скачать шаблон
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={e => onFile(e.target.files?.[0])}
          />
        </div>
      )}

      {/* Column mapping */}
      {fileData && !mappedRows && null}

      {fileData && mappedRows && (
        <>
          {/* Mapping display */}
          <div className="p-5 rounded-lg" style={panelStyle}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base italic" style={{ color: colors.ink }}>Сопоставление столбцов</h3>
              <button
                onClick={() => { setFileData(null); setMappedRows(null) }}
                className="font-body text-xs px-3 py-1.5 rounded"
                style={{ color: alpha.ink50, border: `1px solid ${alpha.ink10}` }}
              >
                Другой файл
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {fileData.headers.map(header => (
                <div key={header} className="flex flex-col gap-1">
                  <span className="font-body text-[10px] tracking-wider uppercase" style={{ color: alpha.ink30 }}>
                    {header}
                  </span>
                  <select
                    value={fileData.mapping[header] || ''}
                    onChange={e => updateMapping(header, e.target.value)}
                    className="px-2 py-1.5 font-body text-xs rounded"
                    style={inputStyle}
                  >
                    <option value="">— Пропустить —</option>
                    {FIELD_OPTIONS.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview table */}
          <div className="rounded-lg overflow-hidden" style={panelStyle}>
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${alpha.gold12}` }}>
              <span className="font-body text-sm" style={{ color: colors.ink }}>
                Предпросмотр ({mappedRows.length} строк)
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-body text-xs" style={{ color: colors.sage }}>
                  <CheckCircle2 size={12} /> {validCount} валидных
                </span>
                {errorCount > 0 && (
                  <span className="flex items-center gap-1 font-body text-xs" style={{ color: colors.rose }}>
                    <XCircle size={12} /> {errorCount} ошибок
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="w-full" style={{ minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${alpha.gold12}` }}>
                    <th className="px-3 py-2 text-left font-body text-[10px] tracking-wider uppercase" style={{ color: alpha.ink30, width: '40px' }}></th>
                    <th className="px-3 py-2 text-left font-body text-[10px] tracking-wider uppercase" style={{ color: alpha.ink30 }}>Категория</th>
                    <th className="px-3 py-2 text-left font-body text-[10px] tracking-wider uppercase" style={{ color: alpha.ink30 }}>Название</th>
                    <th className="px-3 py-2 text-left font-body text-[10px] tracking-wider uppercase" style={{ color: alpha.ink30 }}>Цена</th>
                    <th className="px-3 py-2 text-left font-body text-[10px] tracking-wider uppercase" style={{ color: alpha.ink30 }}>Закупка</th>
                    <th className="px-3 py-2 text-left font-body text-[10px] tracking-wider uppercase" style={{ color: alpha.ink30 }}>Клиент</th>
                  </tr>
                </thead>
                <tbody>
                  {mappedRows.slice(0, 50).map((row, i) => {
                    const v = validations?.[i]
                    return (
                      <tr
                        key={i}
                        style={{
                          borderBottom: `1px solid ${alpha.ink05}`,
                          borderLeft: v && !v.valid ? `3px solid ${colors.rose}` : '3px solid transparent',
                        }}
                      >
                        <td className="px-3 py-2">
                          {v?.valid
                            ? <CheckCircle2 size={14} style={{ color: colors.sage }} />
                            : <AlertTriangle size={14} style={{ color: colors.rose }} />
                          }
                        </td>
                        <td className="px-3 py-2 font-body text-xs" style={{ color: colors.ink }}>{row.category || '—'}</td>
                        <td className="px-3 py-2 font-body text-xs" style={{ color: colors.ink }}>{row.title || '—'}</td>
                        <td className="px-3 py-2 font-body text-xs" style={{ color: colors.gold }}>{row.price || '—'}</td>
                        <td className="px-3 py-2 font-body text-xs" style={{ color: alpha.ink50 }}>{row.cost_price || '—'}</td>
                        <td className="px-3 py-2 font-body text-xs" style={{ color: alpha.ink50 }}>{row.customer || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import button */}
          <div className="flex items-center justify-end gap-3">
            <span className="font-body text-xs" style={{ color: alpha.ink30 }}>
              {validCount} из {mappedRows.length} строк будет импортировано
            </span>
            <button
              onClick={onImport}
              disabled={importing || validCount === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded font-body text-sm transition-all duration-200"
              style={{
                backgroundColor: importing || validCount === 0 ? alpha.ink10 : colors.gold,
                color: importing || validCount === 0 ? alpha.ink30 : colors.white,
                cursor: importing || validCount === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {importing ? (
                <><span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Импорт...</>
              ) : (
                <><Upload size={14} /> Импортировать валидные</>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
