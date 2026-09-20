import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../AdminAuthContext'

// Deliberately plain, self-contained markup — no imports from
// src/components/ui (the customer design system). This page is not part
// of the approved storefront and isn't meant to look like it.
export default function AdminLoginPage() {
  const { session, isAdmin, loading, signIn, signOut } = useAdminAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-sm text-slate-400">
        Loading…
      </div>
    )
  }

  if (session && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  // Signed in, but the profiles row for this account isn't role='admin' —
  // don't silently bounce back to a login form they'll just resubmit.
  if (session && !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-900 px-4 text-center text-slate-200">
        <p className="max-w-xs text-sm">
          This account is signed in but is not authorized for admin access.
        </p>
        <button
          type="button"
          onClick={signOut}
          className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
        >
          Sign out
        </button>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-800 p-8">
        <h1 className="mb-1 text-center text-xl font-bold text-white">
          Tupstore Admin
        </h1>
        <p className="mb-6 text-center text-xs text-slate-400">
          Sign in to manage the store
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-1 block text-xs font-medium text-slate-300"
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-slate-400 disabled:opacity-50"
            />
          </div>
          <div>
            <label
              htmlFor="admin-password"
              className="mb-1 block text-xs font-medium text-slate-300"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-slate-400 disabled:opacity-50"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200 disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
