import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { lazy, Suspense } from 'react'
import ErrorBoundary from './components/ErrorBoundary'

import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductPage from './pages/ProductPage'
import NotFound from './pages/NotFound'

const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Compare = lazy(() => import('./pages/Compare'))
const ShopPage = lazy(() => import('./pages/ShopPage'))
const ShopsList = lazy(() => import('./pages/ShopsList'))

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'))
const AdminInquiries = lazy(() => import('./pages/admin/AdminInquiries'))

const SellerRegister = lazy(() => import('./pages/seller/SellerRegister'))
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'))
const SellerProducts = lazy(() => import('./pages/seller/SellerProducts'))
const SellerProductForm = lazy(() => import('./pages/seller/SellerProductForm'))
const SellerInquiries = lazy(() => import('./pages/seller/SellerInquiries'))
const SellerProfile = lazy(() => import('./pages/seller/SellerProfile'))

import PublicLayout from './components/public/PublicLayout'
import AdminLayout from './components/admin/AdminLayout'
const SellerLayout = lazy(() => import('./components/seller/SellerLayout'))

import { AuthProvider, useAuth } from './lib/AuthContext'
import { FavoritesProvider } from './lib/FavoritesContext'
import { CompareProvider } from './lib/CompareContext'
import { ThemeProvider } from './lib/ThemeContext'
import { CurrencyProvider } from './lib/CurrencyContext'
import CompareBar from './components/public/CompareBar'

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0C0A08' }}>
      <div
        className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: 'rgba(176, 141, 87, 0.2)', borderTopColor: '#B08D57' }}
      />
    </div>
  )
}

function AdminRoute({ children }) {
  const { session, loading, role, isAdmin, isSeller } = useAuth()

  if (loading) return <PageLoader />
  if (!session) return <Navigate to="/admin/login" replace />
  if (isAdmin || role === null) return children
  if (isSeller) return <Navigate to="/seller" replace />
  return children
}

function SellerRoute({ children }) {
  const { session, loading, role, isSeller, isAdmin } = useAuth()

  if (loading) return <PageLoader />
  if (!session) return <Navigate to="/admin/login" replace />
  if (isSeller) return children
  if (isAdmin) return <Navigate to="/admin" replace />
  if (role === null) return <PageLoader />
  return <Navigate to="/admin/login" replace />
}

function AuthRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) return <PageLoader />
  if (!session) return <Navigate to="/admin/login" replace />
  return children
}

const TOAST_OPTIONS = {
  style: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '14px',
    background: '#1A1410',
    color: '#F0E6D6',
    border: '1px solid rgba(176, 141, 87, 0.15)',
  },
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
      <CurrencyProvider>
      <AuthProvider>
        <FavoritesProvider>
          <CompareProvider>
            <Toaster position="top-right" toastOptions={TOAST_OPTIONS} />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<><PublicLayout /><CompareBar /></>}>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/catalog/:category" element={<Catalog />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/shop/:slug" element={<ShopPage />} />
                  <Route path="/shops" element={<ShopsList />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                </Route>

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/seller/register" element={<SellerRegister />} />

                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/new" element={<AdminProductForm />} />
                  <Route path="products/edit/:id" element={<AdminProductForm />} />
                  <Route path="inquiries" element={<AdminInquiries />} />
                </Route>

                <Route path="/seller" element={<SellerRoute><SellerLayout /></SellerRoute>}>
                  <Route index element={<SellerDashboard />} />
                  <Route path="products" element={<SellerProducts />} />
                  <Route path="products/new" element={<SellerProductForm />} />
                  <Route path="products/edit/:id" element={<SellerProductForm />} />
                  <Route path="inquiries" element={<SellerInquiries />} />
                  <Route path="profile" element={<SellerProfile />} />
                </Route>

                <Route element={<PublicLayout />}>
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </CompareProvider>
        </FavoritesProvider>
      </AuthProvider>
      </CurrencyProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
