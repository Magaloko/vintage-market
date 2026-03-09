import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Mail, MapPin, Phone, Send, MessageCircle, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { createInquiry } from '../lib/api'
import { siteConfig } from '../lib/siteConfig'
import { businessHours } from '../data/demoProducts'

/* ── Business Hours Widget ────────────────────────────────────── */
function BusinessHoursWidget() {
  const isOpen = useMemo(() => {
    const now = new Date()
    // Convert to Almaty time (UTC+6)
    const utcHours = now.getUTCHours()
    const almatyHours = (utcHours + businessHours.utcOffset) % 24
    const day = now.getUTCDay() // 0=Sun, 1=Mon, ... 6=Sat

    // Mon–Fri (1–5), 09:00–17:00
    return day >= 1 && day <= 5 && almatyHours >= 9 && almatyHours < 17
  }, [])

  return (
    <div
      className="p-4 mb-10"
      style={{
        backgroundColor: isOpen ? 'rgba(74, 122, 92, 0.06)' : 'rgba(44, 36, 32, 0.03)',
        border: `1px solid ${isOpen ? 'rgba(74, 122, 92, 0.15)' : 'rgba(44, 36, 32, 0.08)'}`,
        borderRadius: '2px',
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: isOpen ? '#4A7A5C' : 'rgba(44, 36, 32, 0.2)' }}
        />
        <span
          className="font-body text-sm font-medium"
          style={{ color: isOpen ? '#4A7A5C' : 'rgba(44, 36, 32, 0.4)' }}
        >
          {isOpen ? 'Сейчас работаем' : 'Закрыто'}
        </span>
      </div>
      <div className="flex items-center gap-2 ml-5">
        <Clock size={14} style={{ color: 'rgba(44, 36, 32, 0.3)' }} />
        <div>
          {businessHours.schedule.map((s, i) => (
            <p key={i} className="font-body text-xs" style={{ color: 'rgba(44, 36, 32, 0.5)' }}>
              {s.day}: {s.hours}
            </p>
          ))}
        </div>
      </div>
      <p className="font-body text-[10px] mt-2 ml-5" style={{ color: 'rgba(44, 36, 32, 0.3)' }}>
        Ответ в течение 8 часов в рабочее время
      </p>
    </div>
  )
}

export default function Contact() {
  const [searchParams] = useSearchParams()
  const productId = searchParams.get('product')
  const productTitle = searchParams.get('title')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: productTitle ? `Здравствуйте! Меня интересует "${productTitle}". ` : '',
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  /* ---------- Handlers ---------- */

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)

    const { error } = await createInquiry({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      message: form.message,
      product_id: productId || null,
      product_title: productTitle || null,
    })

    setSending(false)

    if (error) {
      toast.error('Ошибка отправки. Попробуйте ещё раз.')
      return
    }

    setSent(true)
    toast.success('Сообщение отправлено!')
    setForm({ name: '', email: '', phone: '', message: '' })
  }

  /* ---------- Static data ---------- */

  const contactInfo = [
    { icon: Mail, title: 'Email', value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { icon: Phone, title: 'Телефон', value: siteConfig.phone, href: `tel:${siteConfig.phoneClean}` },
    { icon: MapPin, title: 'Адрес', value: siteConfig.city, href: null },
  ]

  /* ---------- Render ---------- */

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="pt-28 pb-16" style={{ backgroundColor: '#0C0A08' }}>
        <div className="max-w-7xl mx-auto px-6">
          <span
            className="font-body text-[10px] tracking-[0.5em] uppercase"
            style={{ color: 'rgba(176, 141, 87, 0.4)' }}
          >
            Связаться
          </span>
          <h1
            className="font-display text-4xl md:text-6xl italic mt-4"
            style={{ color: '#F0E6D6' }}
          >
            Контакт
          </h1>
          {productTitle && (
            <p
              className="font-display text-lg italic mt-4"
              style={{ color: 'rgba(176, 141, 87, 0.5)' }}
            >
              Запрос о: &laquo;{productTitle}&raquo;
            </p>
          )}
        </div>
        <div className="gdt-divider mt-16" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: contact info + direct channels */}
          <div>
            <h2 className="font-display text-2xl italic mb-8" style={{ color: '#0C0A08' }}>
              Свяжитесь с нами
            </h2>
            <p
              className="font-body text-lg mb-10 leading-relaxed"
              style={{ color: 'rgba(44, 36, 32, 0.5)' }}
            >
              Выберите удобный способ связи. Мы отвечаем в течение 24 часов.
            </p>

            {/* Direct channels */}
            <div className="flex flex-col gap-3 mb-10">
              {siteConfig.whatsapp && (
                <a
                  href={`https://wa.me/${siteConfig.whatsapp}${productTitle ? '?text=' + encodeURIComponent(`Здравствуйте! Интересует "${productTitle}"`) : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 transition-all duration-300 group"
                  style={{
                    backgroundColor: 'rgba(37, 211, 102, 0.06)',
                    border: '1px solid rgba(37, 211, 102, 0.15)',
                    borderRadius: '2px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.12)'
                    e.currentTarget.style.borderColor = 'rgba(37, 211, 102, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.06)'
                    e.currentTarget.style.borderColor = 'rgba(37, 211, 102, 0.15)'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    <MessageCircle size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium" style={{ color: '#0C0A08' }}>
                      WhatsApp
                    </p>
                    <p className="font-body text-xs" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
                      Быстрый ответ
                    </p>
                  </div>
                </a>
              )}

              {siteConfig.telegram && (
                <a
                  href={`https://t.me/${siteConfig.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(38, 163, 238, 0.06)',
                    border: '1px solid rgba(38, 163, 238, 0.15)',
                    borderRadius: '2px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(38, 163, 238, 0.12)'
                    e.currentTarget.style.borderColor = 'rgba(38, 163, 238, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(38, 163, 238, 0.06)'
                    e.currentTarget.style.borderColor = 'rgba(38, 163, 238, 0.15)'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#26A3EE' }}
                  >
                    <Send size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium" style={{ color: '#0C0A08' }}>
                      Telegram
                    </p>
                    <p className="font-body text-xs" style={{ color: 'rgba(44, 36, 32, 0.4)' }}>
                      @{siteConfig.telegram}
                    </p>
                  </div>
                </a>
              )}
            </div>

            {/* Business Hours Widget */}
            <BusinessHoursWidget />

            {/* Classic contact info */}
            <div className="space-y-5">
              {contactInfo.map(({ icon: Icon, title, value, href }) => (
                <div key={title} className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(176, 141, 87, 0.08)' }}
                  >
                    <Icon size={16} style={{ color: '#B08D57' }} />
                  </div>
                  <div>
                    <p
                      className="font-body text-xs tracking-wider uppercase"
                      style={{ color: 'rgba(44, 36, 32, 0.35)' }}
                    >
                      {title}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="font-body transition-colors"
                        style={{ color: '#2C2420' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#B08D57')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#2C2420')}
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-body" style={{ color: '#2C2420' }}>
                        {value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: contact form */}
          <div className="vintage-card p-8">
            {sent ? (
              <div className="text-center py-12">
                <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#B08D57' }} />
                <h3
                  className="font-display text-2xl italic mb-3"
                  style={{ color: '#0C0A08' }}
                >
                  Спасибо!
                </h3>
                <p className="font-body" style={{ color: 'rgba(44, 36, 32, 0.5)' }}>
                  Ваше сообщение получено. Мы свяжемся с вами в ближайшее время.
                </p>
                <button onClick={() => setSent(false)} className="btn-secondary mt-6">
                  Написать ещё
                </button>
              </div>
            ) : (
              <>
                <h3
                  className="font-display text-xl italic mb-2"
                  style={{ color: '#0C0A08' }}
                >
                  Написать нам
                </h3>
                <div className="w-10 h-px mb-6" style={{ backgroundColor: '#B08D57' }} />

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2"
                        style={{ color: 'rgba(44, 36, 32, 0.35)' }}
                      >
                        Имя *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        required
                        onChange={(e) => updateField('name', e.target.value)}
                        className="gdt-input"
                        placeholder="Ваше имя"
                      />
                    </div>
                    <div>
                      <label
                        className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2"
                        style={{ color: 'rgba(44, 36, 32, 0.35)' }}
                      >
                        Телефон
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className="gdt-input"
                        placeholder="+43 ..."
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2"
                      style={{ color: 'rgba(44, 36, 32, 0.35)' }}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      required
                      onChange={(e) => updateField('email', e.target.value)}
                      className="gdt-input"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label
                      className="block font-body text-[10px] tracking-[0.2em] uppercase mb-2"
                      style={{ color: 'rgba(44, 36, 32, 0.35)' }}
                    >
                      Сообщение *
                    </label>
                    <textarea
                      value={form.message}
                      required
                      rows={5}
                      onChange={(e) => updateField('message', e.target.value)}
                      className="gdt-input resize-none"
                      placeholder="Ваш вопрос или пожелание..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="btn-primary w-full justify-center disabled:opacity-50"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Send size={14} className="mr-2" />
                    )}
                    {sending ? 'Отправка...' : 'Отправить'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
