import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ChatWidget from './ChatWidget'
import { trackEvent } from '../../lib/analytics'

export default function PublicLayout() {
  const location = useLocation()

  useEffect(() => {
    trackEvent('page_view')
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
