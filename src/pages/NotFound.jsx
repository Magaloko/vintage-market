import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="page-enter min-h-[60vh] flex items-center justify-center px-6 pt-20">
      <div className="text-center max-w-md">
        <p
          className="font-sans text-xs tracking-[0.3em] uppercase mb-4"
          style={{ color: 'rgba(44, 36, 32, 0.4)' }}
        >
          Страница не найдена
        </p>

        <h1
          className="font-display text-6xl md:text-8xl font-bold mb-4"
          style={{ color: '#0C0A08' }}
        >
          404
        </h1>

        <div className="vintage-divider mb-6" />

        <p className="font-body text-lg mb-8" style={{ color: 'rgba(44, 36, 32, 0.5)' }}>
          Эта страница затерялась во времени. Возможно, она была перемещена или больше не
          существует.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/" className="btn-primary">
            <ArrowLeft size={16} className="mr-2" />
            На главную
          </Link>
          <Link to="/catalog" className="btn-secondary">
            В каталог
          </Link>
        </div>
      </div>
    </div>
  )
}
