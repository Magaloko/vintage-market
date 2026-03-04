import { supabase, isSupabaseConfigured } from './supabase'

const BUCKET = 'product-images'
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function uploadImage(file, productId = 'temp') {
  if (!isSupabaseConfigured) {
    return { url: URL.createObjectURL(file), path: null, error: null }
  }

  const ext = file.name.split('.').pop()
  const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) return { url: null, path: null, error }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
  return { url: publicUrl, path: data.path, error: null }
}

export async function uploadMultipleImages(files, productId = 'temp') {
  const images = []
  const errors = []

  for (const file of files) {
    const result = await uploadImage(file, productId)
    if (result.error) errors.push(result.error)
    else images.push({ url: result.url, path: result.path })
  }

  return { images, errors }
}

export async function deleteImage(storagePath) {
  if (!isSupabaseConfigured || !storagePath) return { error: null }
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath])
  return { error }
}

export function validateImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, message: `Неподдерживаемый формат: ${file.type}. Разрешены: JPG, PNG, WebP, GIF` }
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, message: `Файл слишком большой (${(file.size / (1024 * 1024)).toFixed(1)}MB). Максимум: 5MB` }
  }
  return { valid: true }
}

export function createPreview(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}
