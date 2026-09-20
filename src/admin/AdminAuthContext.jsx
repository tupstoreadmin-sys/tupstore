import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Admin-only auth/session state — completely separate from EnquiryContext
// and UIContext (neither of which know anything about Supabase Auth or
// admin roles, and this never imports them). Reuses the same Supabase
// client the rest of the app already has: Auth is independent of
// VITE_DATA_SOURCE, which only controls where catalog/enquiry data comes
// from, never login.
//
// "Signed in" and "admin" are different things. A signed-in user is only
// treated as admin once their own `profiles.role` row (read under their
// own RLS-scoped SELECT — see db/migrations/0001_admin_foundation.sql)
// says so. There is no self-service way for a user to grant themselves
// that role.

const AdminAuthContext = createContext(null)

async function fetchIsAdmin(userId) {
  if (!userId) return false
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.error('[AdminAuth] profile lookup failed:', error.message)
    return false
  }
  return data?.role === 'admin'
}

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function syncSession(nextSession) {
      const admin = await fetchIsAdmin(nextSession?.user?.id)
      if (cancelled) return
      setSession(nextSession)
      setIsAdmin(admin)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => syncSession(data.session))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // A TOKEN_REFRESHED event fires automatically in the background
      // (Supabase proactively renews the JWT before it expires) and never
      // changes WHO is signed in — nextSession.user.id is unchanged, and
      // the already-known `isAdmin` value stays correct throughout. Only
      // forcing `loading` back to true for a genuine identity transition
      // (sign-in/sign-out/etc.) avoids re-triggering AdminProtectedRoute's/
      // AdminLoginPage's "Checking session…"/"Loading…" gate for a token
      // refresh — that gate briefly renders in place of the entire
      // protected admin tree, which unmounts and remounts everything
      // under it (wiping any in-progress admin work, e.g. a Product
      // Import mid-review) purely because of a routine background refresh
      // that never actually changed the admin's signed-in identity.
      if (event !== 'TOKEN_REFRESHED') {
        setLoading(true)
      }
      syncSession(nextSession)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user: session?.user ?? null,
    isAdmin,
    loading,
    signIn,
    signOut,
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
