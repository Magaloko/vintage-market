import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { lazy, Suspense } from 'react'
import ErrorBoundary from './components/ErrorBoundary'

// Public pages (eager — critical path)
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductPage from './pages/ProductPage'
import NotFound from './pages/NotFound'

// Lazy-loaded public pages
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Compare = lazy(() => import('./pages/Compare'))

// Admin pages (lazy — only loaded for admins)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'))

// Layouts
import PublicLayout from './components/public/PublicLayout'
import AdminLayout from './components/admin/AdminLayout'

// Context & Components
import { AuthProvider, useAuth } from './lib/AuthContext'
import { FavoritesProvider } from './lib/FavoritesContext'
import { CompareProvider } from './lib/CompareContext'
import CompareBar from './components/public/CompareBar'

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!session) return <Navigate to="/admin/login" replace />
  return children
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-vintage-paper">
      <div className="w-8 h-8 border-2 border-vintage-brown border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <FavoritesProvider>
        <CompareProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Outfit, sans-serif',
              fontSize: '14px',
              background: '#3A2A1D',
              color: '#F5F0E8',
            },
          }}
        />
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<><PublicLayout /><CompareBar /></>}>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/catalog/:category" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/edit/:id" element={<AdminProductForm />} />
          </Route>

          {/* 404 */}
          <Route element={<PublicLayout />}>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        </Suspense>
        </CompareProvider>
      </FavoritesProvider>
    </AuthProvider>
    </ErrorBoundary>
  )
}
