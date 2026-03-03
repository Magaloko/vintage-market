import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-vintage-dark text-vintage-cream/70">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold text-vintage-cream mb-4">ЭПОХА</h3>
            <p className="font-body text-vintage-cream/50 leading-relaxed max-w-md">
              Мы находим уникальные вещи с историей и даём им вторую жизнь.
              Каждый предмет — это часть прошлого, которая украсит ваше настоящее.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.2em] uppercase text-vintage-cream/40 mb-4">
              Навигация
            </h4>
            <div className="flex flex-col gap-3">
              <Link to="/catalog" className="font-body text-sm hover:text-vintage-cream transition-colors">Каталог</Link>
              <Link to="/about" className="font-body text-sm hover:text-vintage-cream transition-colors">О нас</Link>
              <Link to="/contact" className="font-body text-sm hover:text-vintage-cream transition-colors">Контакты</Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.2em] uppercase text-vintage-cream/40 mb-4">
              Категории
            </h4>
            <div className="flex flex-col gap-3">
              <Link to="/catalog/clothing" className="font-body text-sm hover:text-vintage-cream transition-colors">Одежда</Link>
              <Link to="/catalog/accessories" className="font-body text-sm hover:text-vintage-cream transition-colors">Аксессуары</Link>
              <Link to="/catalog/furniture" className="font-body text-sm hover:text-vintage-cream transition-colors">Мебель</Link>
              <Link to="/catalog/collectibles" className="font-body text-sm hover:text-vintage-cream transition-colors">Коллекционное</Link>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-vintage-cream/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-xs text-vintage-cream/30">
            © {new Date().getFullYear()} ЭПОХА. Все права защищены.
          </p>
          <p className="font-sans text-xs text-vintage-cream/30">
            Винтаж — это не старое. Это вечное.
          </p>
        </div>
      </div>
    </footer>
  )
}
