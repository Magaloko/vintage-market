import { useState, useEffect } from 'react'
import { Save, Store, MapPin, Phone, Mail, Globe, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../lib/AuthContext'
import { getMyShop, updateShop } from '../../lib/api'

export default function SellerProfile() {
  const { shopId } = useAuth()
  const [form, setForm] = useState({ name: '', description: '', address: '', phone: '', email: '', website: '', opening_hours: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!shopId) return
    getMyShop(shopId).then(({ data }) => {
      if (data) setForm({
        name: data.name || '', description: data.description || '', address: data.address || '',
        phone: data.phone || '', email: data.email || '', website: data.website || '',
        opening_hours: data.opening_hours || '',
      })
      setLoading(false)
    })
  }, [shopId])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const slug = form.name.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/-+$/, '')
    const { error } = await updateShop(shopId, { ...form, slug })
    setSaving(false)
    if (error) toast.error('Ошибка сохранения')
    else toast.success('Профиль обновлён')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: '#B08D57' }} />
    </div>
  )

  const fields = [
    { key: 'name', label: 'Название магазина', icon: Store, required: true },
    { key: 'address', label: 'Адрес', icon: MapPin },
    { key: 'phone', label: 'Телефон', icon: Phone },
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'website', label: 'Веб-сайт', icon: Globe },
    { key: 'opening_hours', label: 'Часы работы', icon: Clock },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl italic mb-8" style={{ color: '#F0E6D6' }}>Профиль магазина</h1>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {fields.map(({ key, label, icon: Icon, required }) => (
          <div key={key}>
            <label className="flex items-center gap-2 font-body text-[10px] tracking-[0.2em] uppercase mb-2"
              style={{ color: 'rgba(240, 230, 214, 0.35)' }}>
              <Icon size={12} /> {label} {required && '*'}
            </label>
            <input type="text" value={form[key]} required={required}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="gdt-input-dark" />
          </div>
        ))}

        <div>
          <label className="font-body text-[10px] tracking-[0.2em] uppercase mb-2 block"
            style={{ color: 'rgba(240, 230, 214, 0.35)' }}>Описание</label>
          <textarea value={form.description} rows={5}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="gdt-input-dark resize-none" placeholder="О вашем магазине..." />
        </div>

        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          <Save size={14} className="mr-2" />
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  )
}
