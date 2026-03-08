import * as XLSX from 'xlsx'
import { categories, conditions } from '../data/demoProducts'

// =============================================================================
// Validation
// =============================================================================

const VALID_CATEGORIES = categories.map(c => c.id)
const VALID_CONDITIONS = conditions.map(c => c.id)

export function validateRow(row, index) {
  const errors = []

  if (!row.title?.trim()) errors.push({ field: 'title', message: 'Название обязательно' })
  if (!row.category?.trim()) errors.push({ field: 'category', message: 'Категория обязательна' })
  if (!row.price || Number(row.price) <= 0) errors.push({ field: 'price', message: 'Цена должна быть > 0' })

  if (row.category && !VALID_CATEGORIES.includes(row.category.trim())) {
    errors.push({ field: 'category', message: `Неизвестная категория: ${row.category}` })
  }

  if (row.condition && !VALID_CONDITIONS.includes(row.condition.trim())) {
    errors.push({ field: 'condition', message: `Неизвестное состояние: ${row.condition}` })
  }

  if (row.cost_price && Number(row.cost_price) < 0) {
    errors.push({ field: 'cost_price', message: 'Цена закупки не может быть отрицательной' })
  }

  if (row.purchase_date && isNaN(Date.parse(row.purchase_date))) {
    errors.push({ field: 'purchase_date', message: 'Некорректная дата' })
  }

  return { index, valid: errors.length === 0, errors }
}

export function validateAll(rows) {
  return rows.map((row, i) => validateRow(row, i))
}

// =============================================================================
// Row → Product conversion
// =============================================================================

export function rowToProduct(row) {
  const details = {}
  if (row.cost_price && Number(row.cost_price) > 0) details.cost_price = Number(row.cost_price)
  if (row.purchase_date?.trim()) details.purchase_date = row.purchase_date.trim()
  if (row.customer?.trim()) details.customer = row.customer.trim()

  return {
    title: (row.title || '').trim(),
    price: Number(row.price) || 0,
    category: (row.category || 'clothing').trim(),
    condition: (row.condition || 'good').trim(),
    status: 'active',
    description: '',
    details,
  }
}

// =============================================================================
// Template download
// =============================================================================

export function downloadTemplate() {
  const wb = XLSX.utils.book_new()

  const headers = ['Категория', 'Название', 'Цена продажи', 'Цена закупки', 'Дата закупки', 'Клиент', 'Состояние']
  const example1 = ['clothing', 'Шёлковое платье 1970-х', 180, 90, '2026-01-15', '', 'excellent']
  const example2 = ['accessories', 'Кожаный портфель', 320, 150, '', 'Иван', 'good']

  const ws = XLSX.utils.aoa_to_sheet([headers, example1, example2])

  // Column widths
  ws['!cols'] = [
    { wch: 16 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 18 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Товары')

  // Reference sheet
  const refHeaders = ['ID Категории', 'Название', 'Группа']
  const refData = categories.map(c => [c.id, c.name, c.group])
  const wsRef = XLSX.utils.aoa_to_sheet([refHeaders, ...refData])
  wsRef['!cols'] = [{ wch: 18 }, { wch: 24 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, wsRef, 'Справочник категорий')

  // Conditions reference
  const condHeaders = ['ID Состояния', 'Название']
  const condData = conditions.map(c => [c.id, c.name])
  const wsCond = XLSX.utils.aoa_to_sheet([condHeaders, ...condData])
  wsCond['!cols'] = [{ wch: 20 }, { wch: 24 }]
  XLSX.utils.book_append_sheet(wb, wsCond, 'Справочник состояний')

  XLSX.writeFile(wb, 'bulk-import-template.xlsx')
}

// =============================================================================
// Column mapping
// =============================================================================

const COLUMN_ALIASES = {
  category:      ['категория', 'category', 'cat', 'kategorie'],
  title:         ['название', 'name', 'title', 'товар', 'bezeichnung'],
  price:         ['цена продажи', 'цена', 'price', 'verkaufspreis', 'vk', 'прайс'],
  cost_price:    ['цена закупки', 'закупка', 'cost', 'einkaufspreis', 'ek', 'себестоимость'],
  purchase_date: ['дата закупки', 'дата', 'date', 'einkaufsdatum', 'datum'],
  customer:      ['клиент', 'kunde', 'customer', 'покупатель', 'заказчик'],
  condition:     ['состояние', 'condition', 'zustand'],
}

export const FIELD_OPTIONS = Object.keys(COLUMN_ALIASES).map(key => ({
  value: key,
  label: {
    category: 'Категория',
    title: 'Название',
    price: 'Цена продажи',
    cost_price: 'Цена закупки',
    purchase_date: 'Дата закупки',
    customer: 'Клиент',
    condition: 'Состояние',
  }[key],
}))

export function autoMapColumns(headers) {
  const mapping = {}
  for (const header of headers) {
    const normalized = header.toLowerCase().trim()
    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (aliases.includes(normalized)) {
        mapping[header] = field
        break
      }
    }
  }
  return mapping
}

// =============================================================================
// File parsing
// =============================================================================

export function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        if (json.length === 0) {
          reject(new Error('Файл пуст'))
          return
        }

        const headers = Object.keys(json[0])
        const mapping = autoMapColumns(headers)

        resolve({ rows: json, headers, mapping })
      } catch (err) {
        reject(new Error('Ошибка чтения файла: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('Ошибка загрузки файла'))
    reader.readAsArrayBuffer(file)
  })
}

export function mapRows(rawRows, columnMapping) {
  return rawRows.map(raw => {
    const mapped = {}
    for (const [colName, fieldName] of Object.entries(columnMapping)) {
      const value = raw[colName]
      if (value === undefined || value === null || value === '') continue
      mapped[fieldName] = String(value).trim()
    }
    return mapped
  })
}
