import { createClient } from '@supabase/supabase-js'

// Single Supabase client instance for the whole app. Credentials come from
// Vite env vars (public anon key only — safe to expose, gated by RLS).
// Presence of these vars is verified at startup by lib/env.js.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
