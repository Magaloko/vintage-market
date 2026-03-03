import { useState, useRef } from 'react'
import { Upload, X, GripVertical, Plus, Link as LinkIcon, Image } from 'lucide-react'
import { uploadImage, validateImageFile, createPreview } from '../../lib/storage'
import toast from 'react-hot-toast'

/**
 * Multi-image uploader with drag-and-drop, URL input, and reordering
 * 
 * @param {{ images: Array<{url, path?, alt_text?, preview?}>, onChange: Function }} props
 */
export default function ImageUploader({ images = [], onChange, productId }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [dragIndex, setDragIndex] = useState(null)
  const fileInputRef = useRef(null)

  // Handle file selection (from input or drop)
  const handleFiles = async (fileList) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'))
    if (!files.length) return

    // Validate all files
    for (const file of files) {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        toast.error(validation.message)
        return
      }
    }

    setUploading(true)

    const newImages = [...images]

    for (const file of files) {
      // Create local preview immediately
      const preview = await createPreview(file)

      // Upload to Supabase Storage
      const { url, path, error } = await uploadImage(file, productId || 'new')

      if (error) {
        toast.error(`Ошибка загрузки: ${file.name}`)
        continue
      }

      newImages.push({
        url: url || preview,
        path: path,
        alt_text: file.name.replace(/\.[^.]+$/, ''),
        preview,
      })
    }

    onChange(newImages)
    setUploading(false)
    toast.success(`${files.length === 1 ? 'Изображение загружено' : `${files.length} изображений загружено`}`)
  }

  // Handle URL input
  const handleAddUrl = () => {
    if (!urlValue.trim()) return

    const newImages = [...images, {
      url: urlValue.trim(),
      path: null,
      alt_text: '',
    }]
    onChange(newImages)
    setUrlValue('')
    setShowUrlInput(false)
    toast.success('Ссылка добавлена')
  }

  // Remove image
  const handleRemove = (index) => {
    const updated = images.filter((_, i) => i !== index)
    onChange(updated)
  }

  // Set as main image (move to position 0)
  const handleSetMain = (index) => {
    if (index === 0) return
    const updated = [...images]
    const [item] = updated.splice(index, 1)
    updated.unshift(item)
    onChange(updated)
    toast.success('Главное изображение изменено')
  }

  // Drag reorder
  const handleDragStart = (index) => setDragIndex(index)

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const updated = [...images]
    const [dragged] = updated.splice(dragIndex, 1)
    updated.splice(index, 0, dragged)
    onChange(updated)
    setDragIndex(index)
  }

  const handleDragEnd = () => setDragIndex(null)

  // Drop zone events
  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-4">
      {/* Existing images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`relative group rounded-lg overflow-hidden border-2 aspect-square
                ${idx === 0 ? 'border-vintage-gold' : 'border-gray-100'}
                ${dragIndex === idx ? 'opacity-50 scale-95' : 'opacity-100'}
                transition-all cursor-grab active:cursor-grabbing`}
            >
              <img
                src={img.preview || img.url}
                alt={img.alt_text || `Фото ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Main badge */}
              {idx === 0 && (
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-vintage-gold text-white
                  font-sans text-[10px] tracking-wider uppercase rounded">
                  Главное
                </div>
              )}

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors
                flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {/* Drag handle */}
                <div className="p-1.5 bg-white/80 rounded">
                  <GripVertical size={14} className="text-gray-600" />
                </div>

                {/* Set as main */}
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetMain(idx)}
                    className="p-1.5 bg-white/80 rounded hover:bg-white text-gray-600 hover:text-vintage-dark"
                    title="Сделать главным"
                  >
                    <Image size={14} />
                  </button>
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 bg-red-500/80 rounded hover:bg-red-500 text-white"
                  title="Удалить"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${dragOver
            ? 'border-vintage-brown bg-vintage-beige/30 scale-[1.01]'
            : 'border-gray-200 hover:border-vintage-brown/40 hover:bg-gray-50'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-vintage-brown/20 border-t-vintage-brown rounded-full animate-spin mb-3" />
            <p className="font-sans text-sm text-vintage-brown/60">Загрузка...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload size={24} className="text-vintage-brown/30 mb-3" />
            <p className="font-sans text-sm text-vintage-dark mb-1">
              Перетащите изображения сюда
            </p>
            <p className="font-sans text-xs text-gray-400">
              или нажмите для выбора • JPG, PNG, WebP, GIF • до 5MB
            </p>
          </div>
        )}
      </div>

      {/* Add by URL */}
      <div>
        {showUrlInput ? (
          <div className="flex gap-2">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://... ссылка на изображение"
              className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg font-sans text-sm
                focus:outline-none focus:ring-2 focus:ring-vintage-brown/20 focus:border-vintage-brown"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
              autoFocus
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-4 py-2 bg-vintage-dark text-white font-sans text-sm rounded-lg hover:bg-vintage-brown transition-colors"
            >
              Добавить
            </button>
            <button
              type="button"
              onClick={() => { setShowUrlInput(false); setUrlValue('') }}
              className="px-3 py-2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 font-sans text-xs text-vintage-brown/60
                hover:text-vintage-dark transition-colors"
            >
              <Plus size={14} />
              Загрузить ещё
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="inline-flex items-center gap-2 px-4 py-2 font-sans text-xs text-vintage-brown/60
                hover:text-vintage-dark transition-colors"
            >
              <LinkIcon size={14} />
              Добавить по ссылке
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
