import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isSupabaseConfigured) {
      navigate('/', { replace: true })
      return
    }

    // Supabase handles the token exchange from the URL hash automatically
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        navigate('/', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }).catch(() => {
      navigate('/', { replace: true })
    })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F2EDE3' }}>
      <div className="text-center">
        <div className="w-10 h-10 mx-auto mb-4 rounded-full animate-spin"
          style={{ border: '2px solid rgba(91, 58, 41, 0.1)', borderTopColor: '#C2642C' }} />
        <p className="font-sans text-sm" style={{ color: 'rgba(91, 58, 41, 0.5)' }}>
          Авторизация...
        </p>
      </div>
    </div>
  )
}
