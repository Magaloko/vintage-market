import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'

// Public pages
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductPage from './pages/ProductPage'
import About from './pages/About'
import Contact from './pages/Contact'
import Favorites from './pages/Favorites'
import Compare from './pages/Compare'
import AuthCallback from './pages/AuthCallback'

// Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'

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
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-vintage-paper">
      <div className="w-8 h-8 border-2 border-vintage-brown border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!session) return <Navigate to="/admin/login" replace />
  return children
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
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/catalog/:category" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Auth Callback (OAuth redirect) */}
          <Route path="/auth/callback" element={<AuthCallback />} />

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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <CompareBar />
        </CompareProvider>
      </FavoritesProvider>
    </AuthProvider>
    </ErrorBoundary>
  )
}
