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
      <div className="bg-vintage-dark text-vintage-cream py-20">
        <div className="max-w-7xl mx-auto px-6">
          <span className="font-sans text-xs tracking-[0.3em] uppercase text-vintage-cream/40">Связаться</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold mt-3">Контакты</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h2 className="font-display text-2xl font-bold text-vintage-dark mb-8">
              Мы всегда рады вашим вопросам
            </h2>
            <p className="font-body text-lg text-vintage-brown/60 mb-12 leading-relaxed">
              Свяжитесь с нами любым удобным способом. Мы отвечаем в течение 24 часов.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-vintage-beige/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-vintage-brown" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-medium text-vintage-dark">Email</h3>
                  <a href="mailto:info@vintage-epoha.com" className="font-body text-vintage-brown/60 hover:text-vintage-dark transition-colors">
                    info@vintage-epoha.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-vintage-beige/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-vintage-brown" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-medium text-vintage-dark">Телефон</h3>
                  <a href="tel:+43123456789" className="font-body text-vintage-brown/60 hover:text-vintage-dark transition-colors">
                    +43 123 456 789
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-vintage-beige/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-vintage-brown" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-medium text-vintage-dark">Адрес</h3>
                  <p className="font-body text-vintage-brown/60">Вена, Австрия</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="vintage-card p-8">
            <h3 className="font-display text-xl font-semibold text-vintage-dark mb-6">
              Написать нам
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-sans text-xs tracking-wider uppercase text-vintage-brown/50 mb-2">
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
                <label className="block font-sans text-xs tracking-wider uppercase text-vintage-brown/50 mb-2">
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
                <label className="block font-sans text-xs tracking-wider uppercase text-vintage-brown/50 mb-2">
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
              <button type="submit" className="vintage-btn w-full">
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
