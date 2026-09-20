import { supabase } from '../../lib/supabase'

// Admin-only reads for the Dashboard's summary cards. Deliberately separate
// from src/api/productApi.js and src/api/enquiryApi.js (the customer-facing
// read/write paths, gated by VITE_DATA_SOURCE) — this always queries live
// Supabase as the signed-in admin's own `authenticated` session, since what
// an admin can see has nothing to do with the storefront's mock/live
// switch. Reuses the existing src/lib/supabase.js client; no second client
// is created here.
//
// As of db/migrations/0001_admin_foundation.sql, `authenticated` only has
// grant+RLS access to `profiles` — nothing was granted on categories,
// products, or enquiries yet (deliberately, per that migration's scope).
// Every function below can therefore fail with a Postgres 42501 permission
// error until a later "admin can read catalog/enquiries" migration exists.
// Callers must treat that as an expected, handled case (see
// AdminDashboardPage's per-card "Not available yet" state) — never as a
// crash, and this file must never work around it by weakening RLS itself.

async function getCount(table) {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

export async function getProductCount() {
  return getCount('products')
}

export async function getCategoryCount() {
  return getCount('categories')
}

export async function getTotalEnquiryCount() {
  return getCount('enquiries')
}

export async function getNewEnquiryCount() {
  const { count, error } = await supabase
    .from('enquiries')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')
  if (error) throw error
  return count ?? 0
}

export async function getRecentEnquiries(limit = 5) {
  const { data, error } = await supabase
    .from('enquiries')
    .select('id, customer_name, customer_phone, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}
