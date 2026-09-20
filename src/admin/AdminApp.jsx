import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider } from './AdminAuthContext'
import { AdminProtectedRoute } from './AdminProtectedRoute'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminLayout from './layout/AdminLayout'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminProductsPage from './pages/AdminProductsPage'
import AdminProductFormPage from './pages/AdminProductFormPage'
import AdminProductImportPage from './pages/AdminProductImportPage'
import AdminCategoriesPage from './pages/AdminCategoriesPage'
import AdminSocialVideosPage from './pages/AdminSocialVideosPage'
import AdminPromotionsPage from './pages/AdminPromotionsPage'
import AdminEnquiriesPage from './pages/AdminEnquiriesPage'

// Mounted as a sibling of the customer App at the router root (see
// main.jsx: /admin/* -> AdminApp, /* -> App) — not nested inside it, so
// none of the customer Header/Footer/EnquiryDrawer/SearchOverlay/etc ever
// render here, and this file never imports from src/components, src/pages,
// or src/features.
export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/import" element={<AdminProductImportPage />} />
          <Route path="products/new" element={<AdminProductFormPage />} />
          <Route
            path="products/:productId/edit"
            element={<AdminProductFormPage />}
          />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="social-videos" element={<AdminSocialVideosPage />} />
          <Route path="promotions" element={<AdminPromotionsPage />} />
          <Route path="enquiries" element={<AdminEnquiriesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminAuthProvider>
  )
}
