import { useState, useEffect, useCallback } from 'react'
import { Users, Plus, Search, X, Edit, Trash2, Phone, AtSign, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUsers, createUser, updateUser, deleteUser } from '../../lib/api'

const ROLES = [
  { id: 'admin', label: 'Админ', color: '#8B6E9E' },
  { id: 'seller', label: 'Продавец', color: '#B08D57' },
  { id: 'agent', label: 'Агент', color: '#4A8B6E' },
]

const EMPTY_USER = {
  name: '',
  email: '',
  role: 'seller',
  contact_whatsapp: '',
  contact_telegram: '',
  contact_instagram: '',
  status: 'active',
}

const panelStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(176, 141, 87, 0.12)',
  borderRadius: '2px',
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState(EMPTY_USER)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const { data } = await getUsers({ search: search || undefined })
    setUsers(data || [])
    setLoading(false)
  }, [search])

  useEffect(() => { loadUsers() }, [loadUsers])

  const openCreate = () => {
    setEditingUser(null)
    setForm(EMPTY_USER)
    setModalOpen(true)
  }

  const openEdit = (user) => {
    setEditingUser(user)
    setForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'seller',
      contact_whatsapp: user.contact_whatsapp || '',
      contact_telegram: user.contact_telegram || '',
      contact_instagram: user.contact_instagram || '',
      status: user.status || 'active',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Введите имя')
    if (!form.email.trim()) return toast.error('Введите email')

    if (editingUser) {
      const { error } = await updateUser(editingUser.id, form)
      if (error) return toast.error('Ошибка: ' + error.message)
      toast.success('Пользователь обновлён')
    } else {
      const { error } = await createUser(form)
      if (error) return toast.error('Ошибка: ' + error.message)
      toast.success('Пользователь создан')
    }
    setModalOpen(false)
    loadUsers()
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Удалить ${user.name}?`)) return
    const { error } = await deleteUser(user.id)
    if (error) return toast.error('Ошибка')
    toast.success('Удалён')
    loadUsers()
  }

  const stats = {
    total: users.length,
    sellers: users.filter((u) => u.role === 'seller').length,
    agents: users.filter((u) => u.role === 'agent').length,
    active: users.filter((u) => u.status === 'active').length,
  }

  const roleInfo = (roleId) => ROLES.find((r) => r.id === roleId) || ROLES[1]

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-lg"
            style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)' }}
          >
            <Users size={20} style={{ color: '#B08D57' }} />
          </div>
          <div>
            <h1 className="font-display text-2xl italic" style={{ color: '#2C2420' }}>
              Пользователи
            </h1>
            <p className="font-body text-sm mt-0.5" style={{ color: 'rgba(44, 36, 32, 0.5)' }}>
              {stats.total} пользователей
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 font-body text-xs tracking-wider uppercase transition-all duration-300"
          style={{
            backgroundColor: '#B08D57',
            color: '#FFFFFF',
            border: '1px solid #B08D57',
            borderRadius: '2px',
          }}
        >
          <Plus size={14} /> Добавить
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Всего', value: stats.total, color: '#2C2420' },
          { label: 'Продавцы', value: stats.sellers, color: '#B08D57' },
          { label: 'Агенты', value: stats.agents, color: '#4A8B6E' },
          { label: 'Активных', value: stats.active, color: '#7A8B6F' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p
              className="font-body text-[10px] tracking-[0.2em] uppercase"
              style={{ color: 'rgba(44, 36, 32, 0.4)' }}
            >
              {s.label}
            </p>
            <p className="font-display text-2xl italic mt-1" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'rgba(44, 36, 32, 0.3)' }}
        />
        <input
          type="text"
          placeholder="Поиск по имени или email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 font-body text-sm transition-all duration-300"
          style={{
            ...panelStyle,
            outline: 'none',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X size={14} style={{ color: 'rgba(44, 36, 32, 0.3)' }} />
          </button>
        )}
      </div>

      {/* Table */}
      <div style={panelStyle} className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div
              className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(176, 141, 87, 0.2)', borderTopColor: '#B08D57' }}
            />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <Users size={32} className="mx-auto mb-3" style={{ color: 'rgba(44, 36, 32, 0.15)' }} />
            <p className="font-body text-sm" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
              {search ? 'Ничего не найдено' : 'Нет пользователей'}
            </p>
            {!search && (
              <button
                onClick={openCreate}
                className="mt-3 font-body text-xs underline"
                style={{ color: '#B08D57' }}
              >
                Добавить первого
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(176, 141, 87, 0.1)' }}>
                  {['Имя', 'Email', 'Роль', 'WhatsApp', 'Telegram', 'Статус', ''].map((h) => (
                    <th
                      key={h || 'actions'}
                      className="text-left px-4 py-3 font-body text-[10px] tracking-[0.2em] uppercase"
                      style={{ color: 'rgba(44, 36, 32, 0.4)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const role = roleInfo(user.role)
                  return (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-[rgba(176,141,87,0.03)]"
                      style={{ borderBottom: '1px solid rgba(44, 36, 32, 0.05)' }}
                    >
                      <td className="px-4 py-3">
                        <span className="font-body text-sm font-medium" style={{ color: '#2C2420' }}>
                          {user.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-body text-sm" style={{ color: 'rgba(44, 36, 32, 0.6)' }}>
                          {user.email}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2.5 py-1 font-body text-[10px] tracking-wider uppercase rounded-sm"
                          style={{
                            backgroundColor: `${role.color}15`,
                            color: role.color,
                            border: `1px solid ${role.color}30`,
                          }}
                        >
                          {role.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.contact_whatsapp ? (
                          <span className="font-body text-xs flex items-center gap-1" style={{ color: 'rgba(44, 36, 32, 0.5)' }}>
                            <Phone size={10} /> {user.contact_whatsapp}
                          </span>
                        ) : (
                          <span className="font-body text-xs" style={{ color: 'rgba(44, 36, 32, 0.2)' }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {user.contact_telegram ? (
                          <span className="font-body text-xs flex items-center gap-1" style={{ color: 'rgba(44, 36, 32, 0.5)' }}>
                            <AtSign size={10} /> {user.contact_telegram}
                          </span>
                        ) : (
                          <span className="font-body text-xs" style={{ color: 'rgba(44, 36, 32, 0.2)' }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 font-body text-[10px] rounded-sm"
                          style={{
                            backgroundColor: user.status === 'active' ? 'rgba(122, 139, 111, 0.1)' : 'rgba(44, 36, 32, 0.05)',
                            color: user.status === 'active' ? '#7A8B6F' : 'rgba(44, 36, 32, 0.35)',
                          }}
                        >
                          {user.status === 'active' ? <Check size={9} /> : null}
                          {user.status === 'active' ? 'Активный' : 'Неактивный'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(user)}
                            className="p-1.5 rounded transition-colors hover:bg-[rgba(176,141,87,0.1)]"
                            title="Редактировать"
                          >
                            <Edit size={13} style={{ color: '#B08D57' }} />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 rounded transition-colors hover:bg-[rgba(180,60,60,0.08)]"
                            title="Удалить"
                          >
                            <Trash2 size={13} style={{ color: 'rgba(180, 60, 60, 0.5)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md p-6"
            style={{ ...panelStyle, backgroundColor: '#FFFFFF' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl italic" style={{ color: '#2C2420' }}>
                {editingUser ? 'Редактировать' : 'Новый пользователь'}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X size={18} style={{ color: 'rgba(44, 36, 32, 0.3)' }} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
                  Имя <span style={{ color: '#B08D57' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Имя и фамилия"
                  className="gdt-input"
                />
              </div>

              {/* Email */}
              <div>
                <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
                  Email <span style={{ color: '#B08D57' }}>*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  className="gdt-input"
                />
              </div>

              {/* Role */}
              <div>
                <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
                  Роль
                </label>
                <div className="flex gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setForm({ ...form, role: r.id })}
                      className="flex-1 px-3 py-2 font-body text-xs tracking-wider uppercase transition-all duration-200"
                      style={{
                        borderRadius: '2px',
                        border: form.role === r.id ? `1px solid ${r.color}` : '1px solid rgba(44, 36, 32, 0.1)',
                        backgroundColor: form.role === r.id ? `${r.color}12` : 'transparent',
                        color: form.role === r.id ? r.color : 'rgba(44, 36, 32, 0.4)',
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={form.contact_whatsapp}
                  onChange={(e) => setForm({ ...form, contact_whatsapp: e.target.value })}
                  placeholder="+436781228875"
                  className="gdt-input"
                />
              </div>

              {/* Telegram */}
              <div>
                <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
                  Telegram
                </label>
                <input
                  type="text"
                  value={form.contact_telegram}
                  onChange={(e) => setForm({ ...form, contact_telegram: e.target.value })}
                  placeholder="@username"
                  className="gdt-input"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
                  Instagram
                </label>
                <input
                  type="text"
                  value={form.contact_instagram}
                  onChange={(e) => setForm({ ...form, contact_instagram: e.target.value })}
                  placeholder="@username"
                  className="gdt-input"
                />
              </div>

              {/* Status */}
              <div>
                <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
                  Статус
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'active', label: 'Активный', color: '#7A8B6F' },
                    { id: 'inactive', label: 'Неактивный', color: 'rgba(44, 36, 32, 0.4)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setForm({ ...form, status: s.id })}
                      className="flex-1 px-3 py-2 font-body text-xs tracking-wider uppercase transition-all duration-200"
                      style={{
                        borderRadius: '2px',
                        border: form.status === s.id ? `1px solid ${s.color}` : '1px solid rgba(44, 36, 32, 0.1)',
                        backgroundColor: form.status === s.id ? `${s.color}12` : 'transparent',
                        color: form.status === s.id ? s.color : 'rgba(44, 36, 32, 0.3)',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 font-body text-xs tracking-wider uppercase transition-all duration-300"
                style={{
                  backgroundColor: '#B08D57',
                  color: '#FFFFFF',
                  border: '1px solid #B08D57',
                  borderRadius: '2px',
                }}
              >
                {editingUser ? 'Сохранить' : 'Создать'}
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2.5 font-body text-xs tracking-wider uppercase transition-all duration-300"
                style={{
                  border: '1px solid rgba(44, 36, 32, 0.15)',
                  color: 'rgba(44, 36, 32, 0.5)',
                  borderRadius: '2px',
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
