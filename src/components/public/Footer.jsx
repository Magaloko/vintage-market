import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0E1A2B' }}>
      {/* Gold separator at top */}
      <div className="section-gold-line" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold mb-4" style={{ color: '#F2EDE3' }}>ЭПОХА</h3>
            <div className="w-12 h-px mb-6" style={{ backgroundColor: '#B89A5A' }} />
            <p className="font-body leading-relaxed max-w-md" style={{ color: 'rgba(242, 237, 227, 0.4)' }}>
              Мы находим уникальные вещи с историей и даём им вторую жизнь.
              Каждый предмет — это часть прошлого, которая украсит ваше настоящее.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.2em] uppercase mb-4"
              style={{ color: 'rgba(184, 154, 90, 0.6)' }}>
              Навигация
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { to: '/catalog', label: 'Каталог' },
                { to: '/about', label: 'О нас' },
                { to: '/contact', label: 'Контакты' },
              ].map(link => (
                <Link key={link.to} to={link.to}
                  className="font-body text-sm transition-colors duration-200"
                  style={{ color: 'rgba(242, 237, 227, 0.4)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#F2EDE3'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(242, 237, 227, 0.4)'}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.2em] uppercase mb-4"
              style={{ color: 'rgba(184, 154, 90, 0.6)' }}>
              Категории
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { to: '/catalog/clothing', label: 'Одежда' },
                { to: '/catalog/accessories', label: 'Аксессуары' },
                { to: '/catalog/furniture', label: 'Мебель' },
                { to: '/catalog/collectibles', label: 'Коллекционное' },
              ].map(link => (
                <Link key={link.to} to={link.to}
                  className="font-body text-sm transition-colors duration-200"
                  style={{ color: 'rgba(242, 237, 227, 0.4)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#F2EDE3'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(242, 237, 227, 0.4)'}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar with thin gold separator */}
        <div className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(184, 154, 90, 0.15)' }}>
          <p className="font-sans text-xs" style={{ color: 'rgba(242, 237, 227, 0.25)' }}>
            &copy; {new Date().getFullYear()} ЭПОХА. Все права защищены.
          </p>
          <p className="font-sans text-xs italic" style={{ color: 'rgba(184, 154, 90, 0.3)' }}>
            Винтаж — это не старое. Это вечное.
          </p>
        </div>
      </div>
    </footer>
  )
}
