import { useState } from 'react'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('Сообщение отправлено! Мы свяжемся с вами.')
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <div className="page-enter">
      {/* Hero header — Deep Navy */}
      <div className="py-20" style={{ backgroundColor: '#0E1A2B' }}>
        <div className="max-w-7xl mx-auto px-6">
          <span className="font-sans text-xs tracking-[0.3em] uppercase"
            style={{ color: 'rgba(184, 154, 90, 0.5)' }}>Связаться</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold mt-3"
            style={{ color: '#F2EDE3' }}>Контакты</h1>
        </div>
        <div className="section-gold-line mt-16" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-8" style={{ color: '#0E1A2B' }}>
              Мы всегда рады вашим вопросам
            </h2>
            <p className="font-body text-lg mb-12 leading-relaxed" style={{ color: 'rgba(91, 58, 41, 0.5)' }}>
              Свяжитесь с нами любым удобным способом. Мы отвечаем в течение 24 часов.
            </p>

            <div className="space-y-6">
              {[
                { icon: Mail, title: 'Email', value: 'info@vintage-epoha.com', href: 'mailto:info@vintage-epoha.com' },
                { icon: Phone, title: 'Телефон', value: '+43 123 456 789', href: 'tel:+43123456789' },
                { icon: MapPin, title: 'Адрес', value: 'Вена, Австрия', href: null },
              ].map(({ icon: Icon, title, value, href }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(91, 58, 41, 0.06)' }}>
                    <Icon size={18} style={{ color: '#5B3A29' }} />
                  </div>
                  <div>
                    <h3 className="font-sans text-sm font-medium" style={{ color: '#0E1A2B' }}>{title}</h3>
                    {href ? (
                      <a href={href} className="font-body transition-colors"
                        style={{ color: 'rgba(91, 58, 41, 0.5)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#0E1A2B'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(91, 58, 41, 0.5)'}
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-body" style={{ color: 'rgba(91, 58, 41, 0.5)' }}>{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="vintage-card p-8">
            <h3 className="font-display text-xl font-semibold mb-6" style={{ color: '#0E1A2B' }}>
              Написать нам
            </h3>
            <div className="vintage-divider !mx-0 !w-10 mb-6" />
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-sans text-xs tracking-wider uppercase mb-2"
                  style={{ color: 'rgba(91, 58, 41, 0.4)' }}>
                  Имя
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  className="vintage-input"
                  placeholder="Ваше имя"
                />
              </div>
              <div>
                <label className="block font-sans text-xs tracking-wider uppercase mb-2"
                  style={{ color: 'rgba(91, 58, 41, 0.4)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  className="vintage-input"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block font-sans text-xs tracking-wider uppercase mb-2"
                  style={{ color: 'rgba(91, 58, 41, 0.4)' }}>
                  Сообщение
                </label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  required
                  rows={5}
                  className="vintage-input resize-none"
                  placeholder="Ваш вопрос или пожелание..."
                />
              </div>
              <button type="submit" className="btn-primary w-full justify-center">
                <Send size={14} className="mr-2" />
                Отправить
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
