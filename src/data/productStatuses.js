// =============================================================================
// Product Status Definitions — Single Source of Truth
// =============================================================================

export const PRODUCT_STATUS_GROUPS = [
  { id: 'procurement', label: 'Закупка',   icon: '📦', color: '#B08D57' },
  { id: 'logistics',   label: 'Логистика', icon: '🚚', color: '#7A8B6F' },
  { id: 'sales',       label: 'Продажа',   icon: '🏷️', color: '#5A6B3C' },
  { id: 'issues',      label: 'Проблемы',  icon: '⚠️', color: '#B5736A' },
]

export const PRODUCT_STATUSES = [
  // Закупка
  { key: 'ordered',              label: 'Заказано',            emoji: '📋', color: '#C9A96E', bg: 'rgba(201,169,110,0.12)', group: 'procurement', sort: 10 },
  { key: 'paid_supplier',        label: 'Оплачено поставщику', emoji: '💳', color: '#B08D57', bg: 'rgba(176,141,87,0.12)',  group: 'procurement', sort: 20 },
  // Логистика
  { key: 'in_transit_warehouse', label: 'В пути на склад',     emoji: '🚢', color: '#6E8B5A', bg: 'rgba(110,139,90,0.12)',  group: 'logistics', sort: 30 },
  { key: 'at_warehouse',         label: 'На складе',           emoji: '🏭', color: '#7A8B6F', bg: 'rgba(122,139,111,0.12)', group: 'logistics', sort: 40 },
  { key: 'in_transit_kz',        label: 'В пути в Казахстан',  emoji: '✈️', color: '#5A7A8B', bg: 'rgba(90,122,139,0.12)',  group: 'logistics', sort: 50 },
  { key: 'at_kz_warehouse',      label: 'Склад Казахстан',     emoji: '📍', color: '#4A7A5C', bg: 'rgba(74,122,92,0.12)',   group: 'logistics', sort: 60 },
  // Продажа
  { key: 'active',               label: 'В наличии',           emoji: '✅', color: '#5A6B3C', bg: 'rgba(122,139,111,0.12)', group: 'sales', sort: 70 },
  { key: 'reserved',             label: 'Забронировано',       emoji: '🔒', color: '#9B7CB8', bg: 'rgba(155,124,184,0.12)', group: 'sales', sort: 80 },
  { key: 'in_transit_customer',  label: 'В пути к клиенту',    emoji: '🛵', color: '#C17F3E', bg: 'rgba(193,127,62,0.12)',  group: 'sales', sort: 90 },
  { key: 'sold',                 label: 'Продано',             emoji: '🏷️', color: '#8B7355', bg: 'rgba(44,36,32,0.08)',    group: 'sales', sort: 100 },
  // Проблемы
  { key: 'defective',            label: 'Брак',                emoji: '⚠️', color: '#B5736A', bg: 'rgba(181,115,106,0.12)', group: 'issues', sort: 110 },
  { key: 'returned',             label: 'Возврат',             emoji: '↩️', color: '#C9736A', bg: 'rgba(201,115,106,0.12)', group: 'issues', sort: 120 },
]

// Lookup helpers
export const getStatusDef       = (key) => PRODUCT_STATUSES.find(s => s.key === key)
export const getStatusLabel     = (key) => getStatusDef(key)?.label || key
export const getStatusesByGroup = (groupId) => PRODUCT_STATUSES.filter(s => s.group === groupId)

// Public site: only these statuses visible
export const PUBLIC_VISIBLE_STATUSES = ['active', 'reserved']

// Revenue calculations
export const REVENUE_STATUSES = ['sold']

// Final statuses (out of pipeline)
export const FINAL_STATUSES = ['sold', 'defective', 'returned']
