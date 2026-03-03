import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Store, Mail, Lock, MapPin, Phone, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../lib/AuthContext'

export default function SellerRegister() {
  const { registerSeller } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '', password: '', passwordConfirm: '',
    shopName: '', shopDescription: '', address: '', phone: '',
  })

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleStep1 = (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Пароль минимум 6 символов'); return }
    if (form.password !== form.passwordConfirm) { toast.error('Пароли не совпадают'); return }
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.shopName.trim()) { toast.error('Введите название магазина'); return }
    setLoading(true)
    const { error } = await registerSeller(form)
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Магазин создан!')
    navigate('/seller')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0C0A08' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/">
            <h1 className="font-display text-2xl tracking-[0.15em] uppercase" style={{ color: '#B08D57' }}>Galerie</h1>
            <p className="font-display text-xs italic" style={{ color: 'rgba(176, 141, 87, 0.4)' }}>du Temps</p>
          </Link>
          <p className="font-body text-sm mt-6" style={{ color: 'rgba(240, 230, 214, 0.4)' }}>
            Создайте магазин и начните продавать
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-body text-xs"
                style={{
                  backgroundColor: step >= s ? 'rgba(176, 141, 87, 0.2)' : 'rgba(240, 230, 214, 0.05)',
                  color: step >= s ? '#B08D57' : 'rgba(240, 230, 214, 0.2)',
                  border: `1px solid ${step >= s ? 'rgba(176, 141, 87, 0.3)' : 'rgba(240, 230, 214, 0.08)'}`,
                }}>
                {s}
              </div>
              {s < 2 && <div className="w-12 h-px" style={{ backgroundColor: step > 1 ? 'rgba(176, 141, 87, 0.3)' : 'rgba(240, 230, 214, 0.08)' }} />}
            </div>
          ))}
        </div>

        <div className="p-8" style={{ backgroundColor: 'rgba(240, 230, 214, 0.02)', border: '1px solid rgba(176, 141, 87, 0.1)', borderRadius: '2px' }}>
          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-5">
              <h2 className="font-display text-xl italic mb-2" style={{ color: '#F0E6D6' }}>Аккаунт</h2>
              <div className="w-8 h-px mb-4" style={{ backgroundColor: 'rgba(176, 141, 87, 0.3)' }} />

              <div>
                <label className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(240, 230, 214, 0.35)' }}>Email *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(240, 230, 214, 0.15)' }} />
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required className="gdt-input-dark pl-10" placeholder="email@example.com" />
                </div>
              </div>
              <div>
                <label className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(240, 230, 214, 0.35)' }}>Пароль *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(240, 230, 214, 0.15)' }} />
                  <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required className="gdt-input-dark pl-10" placeholder="Минимум 6 символов" />
                </div>
              </div>
              <div>
                <label className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(240, 230, 214, 0.35)' }}>Повторите пароль *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(240, 230, 214, 0.15)' }} />
                  <input type="password" value={form.passwordConfirm} onChange={e => set('passwordConfirm', e.target.value)} required className="gdt-input-dark pl-10" placeholder="Ещё раз" />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full justify-center">
                Далее <ArrowRight size={14} className="ml-2" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="font-display text-xl italic mb-2" style={{ color: '#F0E6D6' }}>О магазине</h2>
              <div className="w-8 h-px mb-4" style={{ backgroundColor: 'rgba(176, 141, 87, 0.3)' }} />

              <div>
                <label className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(240, 230, 214, 0.35)' }}>Название магазина *</label>
                <div className="relative">
                  <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(240, 230, 214, 0.15)' }} />
                  <input type="text" value={form.shopName} onChange={e => set('shopName', e.target.value)} required className="gdt-input-dark pl-10" placeholder="Vintage Corner" />
                </div>
              </div>
              <div>
                <label className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(240, 230, 214, 0.35)' }}>Адрес</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(240, 230, 214, 0.15)' }} />
                  <input type="text" value={form.address} onChange={e => set('address', e.target.value)} className="gdt-input-dark pl-10" placeholder="Нашмаркт, 1060 Вена" />
                </div>
              </div>
              <div>
                <label className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(240, 230, 214, 0.35)' }}>Телефон</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(240, 230, 214, 0.15)' }} />
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="gdt-input-dark pl-10" placeholder="+43 660 ..." />
                </div>
              </div>
              <div>
                <label className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(240, 230, 214, 0.35)' }}>Описание</label>
                <textarea value={form.shopDescription} onChange={e => set('shopDescription', e.target.value)} rows={3} className="gdt-input-dark resize-none" placeholder="Расскажите о вашем магазине..." />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">Назад</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center disabled:opacity-50">
                  {loading ? 'Создание...' : 'Создать магазин'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center mt-6 font-body text-sm" style={{ color: 'rgba(240, 230, 214, 0.3)' }}>
          Уже есть аккаунт?{' '}
          <Link to="/admin/login" className="transition-colors" style={{ color: '#B08D57' }}>Войти</Link>
        </p>
      </div>
    </div>
  )
}
