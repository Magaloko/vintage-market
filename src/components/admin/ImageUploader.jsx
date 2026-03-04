import { useState, useRef, useCallback } from 'react'
import { Upload, X, GripVertical, Plus, Link as LinkIcon, Image } from 'lucide-react'
import { uploadImage, validateImageFile, createPreview } from '../../lib/storage'
import toast from 'react-hot-toast'

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif'

function Spinner() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 border-2 border-vintage-brown/20 border-t-vintage-brown rounded-full animate-spin mb-3" />
      <p className="font-sans text-sm text-vintage-brown/60">Загрузка...</p>
    </div>
  )
}

function DropHint() {
  return (
    <div className="flex flex-col items-center">
      <Upload size={24} className="text-vintage-brown/30 mb-3" />
      <p className="font-sans text-sm text-vintage-dark mb-1">
        Перетащите изображения сюда
      </p>
      <p className="font-sans text-xs text-gray-400">
        или нажмите для выбора &bull; JPG, PNG, WebP, GIF &bull; до 5MB
      </p>
    </div>
  )
}

function ImageCard({ image, index, isMain, isDragging, onSetMain, onRemove, onDragStart, onDragOver, onDragEnd }) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`relative group rounded-lg overflow-hidden border-2 aspect-square
        ${isMain ? 'border-vintage-gold' : 'border-gray-100'}
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
        transition-all cursor-grab active:cursor-grabbing`}
    >
      <img
        src={image.preview || image.url}
        alt={image.alt_text || `Фото ${index + 1}`}
        className="w-full h-full object-cover"
      />

      {isMain && (
        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-vintage-gold text-white font-sans text-[10px] tracking-wider uppercase rounded">
          Главное
        </div>
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <div className="p-1.5 bg-white/80 rounded">
          <GripVertical size={14} className="text-gray-600" />
        </div>

        {!isMain && (
          <button
            type="button"
            onClick={() => onSetMain(index)}
            className="p-1.5 bg-white/80 rounded hover:bg-white text-gray-600 hover:text-vintage-dark"
            title="Сделать главным"
          >
            <Image size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1.5 bg-red-500/80 rounded hover:bg-red-500 text-white"
          title="Удалить"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

function UrlInput({ onAdd, onCancel }) {
  const [value, setValue] = useState('')

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setValue('')
  }

  return (
    <div className="flex gap-2">
      <input
        type="url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://... ссылка на изображение"
        className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg font-sans text-sm
          focus:outline-none focus:ring-2 focus:ring-vintage-brown/20 focus:border-vintage-brown"
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), submit())}
        autoFocus
      />
      <button
        type="button"
        onClick={submit}
        className="px-4 py-2 bg-vintage-dark text-white font-sans text-sm rounded-lg hover:bg-vintage-brown transition-colors"
      >
        Добавить
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-3 py-2 text-gray-400 hover:text-gray-600"
      >
        <X size={16} />
      </button>
    </div>
  )
}

function ActionButtons({ onUploadClick, onShowUrl }) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onUploadClick}
        className="inline-flex items-center gap-2 px-4 py-2 font-sans text-xs text-vintage-brown/60 hover:text-vintage-dark transition-colors"
      >
        <Plus size={14} />
        Загрузить ещё
      </button>
      <button
        type="button"
        onClick={onShowUrl}
        className="inline-flex items-center gap-2 px-4 py-2 font-sans text-xs text-vintage-brown/60 hover:text-vintage-dark transition-colors"
      >
        <LinkIcon size={14} />
        Добавить по ссылке
      </button>
    </div>
  )
}

/**
 * Multi-image uploader with drag-and-drop, URL input, and reordering
 *
 * @param {{ images: Array<{url, path?, alt_text?, preview?}>, onChange: Function, productId?: string }} props
 */
export default function ImageUploader({ images = [], onChange, productId }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [dragIndex, setDragIndex] = useState(null)
  const fileInputRef = useRef(null)

  const openFilePicker = () => fileInputRef.current?.click()

  const handleFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    if (!files.length) return

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
      const preview = await createPreview(file)
      const { url, path, error } = await uploadImage(file, productId || 'new')

      if (error) {
        toast.error(`Ошибка загрузки: ${file.name}`)
        continue
      }

      newImages.push({
        url: url || preview,
        path,
        alt_text: file.name.replace(/\.[^.]+$/, ''),
        preview,
      })
    }

    onChange(newImages)
    setUploading(false)
    toast.success(files.length === 1 ? 'Изображение загружено' : `${files.length} изображений загружено`)
  }, [images, onChange, productId])

  const handleAddUrl = useCallback((url) => {
    onChange([...images, { url, path: null, alt_text: '' }])
    setShowUrlInput(false)
    toast.success('Ссылка добавлена')
  }, [images, onChange])

  const handleRemove = useCallback((index) => {
    onChange(images.filter((_, i) => i !== index))
  }, [images, onChange])

  const handleSetMain = useCallback((index) => {
    if (index === 0) return
    const updated = [...images]
    const [item] = updated.splice(index, 1)
    updated.unshift(item)
    onChange(updated)
    toast.success('Главное изображение изменено')
  }, [images, onChange])

  const handleDragStart = useCallback((index) => setDragIndex(index), [])

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const updated = [...images]
    const [dragged] = updated.splice(dragIndex, 1)
    updated.splice(index, 0, dragged)
    onChange(updated)
    setDragIndex(index)
  }, [dragIndex, images, onChange])

  const handleDragEnd = useCallback(() => setDragIndex(null), [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const dropZoneClass = [
    'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
    dragOver
      ? 'border-vintage-brown bg-vintage-beige/30 scale-[1.01]'
      : 'border-gray-200 hover:border-vintage-brown/40 hover:bg-gray-50',
    uploading ? 'pointer-events-none opacity-50' : '',
  ].join(' ')

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <ImageCard
              key={idx}
              image={img}
              index={idx}
              isMain={idx === 0}
              isDragging={dragIndex === idx}
              onSetMain={handleSetMain}
              onRemove={handleRemove}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={openFilePicker}
        className={dropZoneClass}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? <Spinner /> : <DropHint />}
      </div>

      <div>
        {showUrlInput ? (
          <UrlInput
            onAdd={handleAddUrl}
            onCancel={() => setShowUrlInput(false)}
          />
        ) : (
          <ActionButtons
            onUploadClick={openFilePicker}
            onShowUrl={() => setShowUrlInput(true)}
          />
        )}
      </div>
    </div>
  )
}
