import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co')

let _supabase = null
if (isSupabaseConfigured) {
  try {
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (e) {
    console.error('Supabase client creation failed:', e)
  }
}

export const supabase = _supabase
export default supabase
