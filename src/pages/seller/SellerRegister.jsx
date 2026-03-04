import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Store, Mail, Lock, MapPin, Phone, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../lib/AuthContext'

// -- Constants ----------------------------------------------------------------

const GOLD = '#B08D57'
const TEXT = '#F0E6D6'
const TEXT_DIM = 'rgba(240, 230, 214, 0.35)'
const TEXT_FAINT = 'rgba(240, 230, 214, 0.4)'
const TEXT_MUTED = 'rgba(240, 230, 214, 0.3)'
const GOLD_DIM = 'rgba(176, 141, 87, 0.4)'
const GOLD_BORDER = 'rgba(176, 141, 87, 0.3)'
const ICON_DIM = 'rgba(240, 230, 214, 0.15)'

const INITIAL_FORM = {
  email: '',
  password: '',
  passwordConfirm: '',
  shopName: '',
  shopDescription: '',
  address: '',
  phone: '',
}

// -- Helpers ------------------------------------------------------------------

function InputField({ icon: Icon, label, type = 'text', value, onChange, required, placeholder }) {
  return (
    <div>
      <label
        className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2"
        style={{ color: TEXT_DIM }}
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: ICON_DIM }}
        />
        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={onChange}
            rows={3}
            className="gdt-input-dark resize-none"
            placeholder={placeholder}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            className="gdt-input-dark pl-10"
            placeholder={placeholder}
          />
        )}
      </div>
    </div>
  )
}

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {[1, 2].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-body text-xs"
            style={{
              backgroundColor: currentStep >= s ? 'rgba(176, 141, 87, 0.2)' : 'rgba(240, 230, 214, 0.05)',
              color: currentStep >= s ? GOLD : 'rgba(240, 230, 214, 0.2)',
              border: `1px solid ${currentStep >= s ? GOLD_BORDER : 'rgba(240, 230, 214, 0.08)'}`,
            }}
          >
            {s}
          </div>
          {s < 2 && (
            <div
              className="w-12 h-px"
              style={{ backgroundColor: currentStep > 1 ? GOLD_BORDER : 'rgba(240, 230, 214, 0.08)' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// -- Component ----------------------------------------------------------------

export default function SellerRegister() {
  const { registerSeller } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleStep1 = (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Пароль минимум 6 символов')
      return
    }
    if (form.password !== form.passwordConfirm) {
      toast.error('Пароли не совпадают')
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.shopName.trim()) {
      toast.error('Введите название магазина')
      return
    }
    setLoading(true)
    const { error } = await registerSeller(form)
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Магазин создан!')
    navigate('/seller')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0C0A08' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/">
            <h1 className="font-display text-2xl tracking-[0.15em] uppercase" style={{ color: GOLD }}>
              Galerie
            </h1>
            <p className="font-display text-xs italic" style={{ color: GOLD_DIM }}>
              du Temps
            </p>
          </Link>
          <p className="font-body text-sm mt-6" style={{ color: TEXT_FAINT }}>
            Создайте магазин и начните продавать
          </p>
        </div>

        <StepIndicator currentStep={step} />

        {/* Form Card */}
        <div
          className="p-8"
          style={{
            backgroundColor: 'rgba(240, 230, 214, 0.02)',
            border: '1px solid rgba(176, 141, 87, 0.1)',
            borderRadius: '2px',
          }}
        >
          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-5">
              <h2 className="font-display text-xl italic mb-2" style={{ color: TEXT }}>
                Аккаунт
              </h2>
              <div className="w-8 h-px mb-4" style={{ backgroundColor: GOLD_BORDER }} />

              <InputField
                icon={Mail}
                label="Email *"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
                placeholder="email@example.com"
              />
              <InputField
                icon={Lock}
                label="Пароль *"
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                required
                placeholder="Минимум 6 символов"
              />
              <InputField
                icon={Lock}
                label="Повторите пароль *"
                type="password"
                value={form.passwordConfirm}
                onChange={(e) => set('passwordConfirm', e.target.value)}
                required
                placeholder="Ещё раз"
              />

              <button type="submit" className="btn-primary w-full justify-center">
                Далее <ArrowRight size={14} className="ml-2" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="font-display text-xl italic mb-2" style={{ color: TEXT }}>
                О магазине
              </h2>
              <div className="w-8 h-px mb-4" style={{ backgroundColor: GOLD_BORDER }} />

              <InputField
                icon={Store}
                label="Название магазина *"
                value={form.shopName}
                onChange={(e) => set('shopName', e.target.value)}
                required
                placeholder="Vintage Corner"
              />
              <InputField
                icon={MapPin}
                label="Адрес"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="Нашмаркт, 1060 Вена"
              />
              <InputField
                icon={Phone}
                label="Телефон"
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+43 660 ..."
              />

              <div>
                <label
                  className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2"
                  style={{ color: TEXT_DIM }}
                >
                  Описание
                </label>
                <textarea
                  value={form.shopDescription}
                  onChange={(e) => set('shopDescription', e.target.value)}
                  rows={3}
                  className="gdt-input-dark resize-none"
                  placeholder="Расскажите о вашем магазине..."
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">
                  Назад
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center disabled:opacity-50">
                  {loading ? 'Создание...' : 'Создать магазин'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center mt-6 font-body text-sm" style={{ color: TEXT_MUTED }}>
          Уже есть аккаунт?{' '}
          <Link to="/admin/login" className="transition-colors" style={{ color: GOLD }}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
