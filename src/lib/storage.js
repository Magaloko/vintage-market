import { supabase, isSupabaseConfigured } from './supabase'

const BUCKET = 'product-images'

/**
 * Upload an image file to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} productId - Product ID for folder organization
 * @returns {{ url: string, path: string, error: object|null }}
 */
export async function uploadImage(file, productId = 'temp') {
  if (!isSupabaseConfigured) {
    // Demo mode: create a local object URL
    const url = URL.createObjectURL(file)
    return { url, path: null, error: null }
  }

  // Generate unique filename
  const ext = file.name.split('.').pop()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const path = `${productId}/${timestamp}-${random}.${ext}`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) return { url: null, path: null, error }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path)

  return { url: publicUrl, path: data.path, error: null }
}

/**
 * Upload multiple image files
 * @param {File[]} files - Array of image files
 * @param {string} productId - Product ID
 * @returns {{ images: Array<{url, path}>, errors: object[] }}
 */
export async function uploadMultipleImages(files, productId = 'temp') {
  const images = []
  const errors = []

  for (const file of files) {
    const result = await uploadImage(file, productId)
    if (result.error) {
      errors.push(result.error)
    } else {
      images.push({ url: result.url, path: result.path })
    }
  }

  return { images, errors }
}

/**
 * Delete an image from Supabase Storage
 * @param {string} storagePath - The storage path to delete
 */
export async function deleteImage(storagePath) {
  if (!isSupabaseConfigured || !storagePath) return { error: null }

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath])

  return { error }
}

/**
 * Validate image file before upload
 * @param {File} file
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateImageFile(file) {
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, message: `Неподдерживаемый формат: ${file.type}. Разрешены: JPG, PNG, WebP, GIF` }
  }

  if (file.size > MAX_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return { valid: false, message: `Файл слишком большой (${sizeMB}MB). Максимум: 5MB` }
  }

  return { valid: true }
}

/**
 * Create a thumbnail preview from a File object
 * @param {File} file
 * @returns {Promise<string>} Data URL for preview
 */
export function createPreview(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}
