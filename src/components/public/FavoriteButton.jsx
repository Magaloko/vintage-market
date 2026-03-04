import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useFavorites } from '../../lib/FavoritesContext'

const SIZES = {
  sm: { icon: 16, button: 'w-8 h-8' },
  md: { icon: 18, button: 'w-10 h-10' },
  lg: { icon: 22, button: 'w-12 h-12' },
}

export default function FavoriteButton({ product, productId, size = 'md', className = '' }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const [animating, setAnimating] = useState(false)

  const id = productId || product?.id
  if (!id) return null

  const active = isFavorite(id)
  const { icon, button } = SIZES[size] || SIZES.md

  const handleClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setAnimating(true)
    await toggleFavorite(id)
    setTimeout(() => setAnimating(false), 400)
  }

  return (
    <button
      onClick={handleClick}
      title={active ? 'Убрать из избранного' : 'Добавить в избранное'}
      className={`
        ${button} rounded-full flex items-center justify-center transition-all duration-200
        shadow-sm hover:shadow-md
        ${active
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-white/80 backdrop-blur-sm hover:text-red-400 hover:bg-white'
        }
        ${animating ? 'scale-125' : 'scale-100'}
        ${className}
      `}
      style={active ? undefined : { color: 'rgba(44, 36, 32, 0.4)' }}
    >
      <Heart
        size={icon}
        fill={active ? 'currentColor' : 'none'}
        strokeWidth={active ? 0 : 1.5}
        className={`transition-all duration-200 ${animating ? 'scale-110' : ''}`}
      />
    </button>
  )
}
