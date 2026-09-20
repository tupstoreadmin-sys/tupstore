import { Navigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'

// Guards everything under /admin except /admin/login. Unauthenticated and
// authenticated-but-non-admin users both land back on the login page — the
// login page itself is what explains *why* to a non-admin account (see
// AdminLoginPage), so this component only needs to decide allow/deny.
export function AdminProtectedRoute({ children }) {
  const { session, isAdmin, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-sm text-slate-400">
        Checking session…
      </div>
    )
  }

  if (!session || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
