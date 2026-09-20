// Validates required environment variables at startup (called once from
// main.jsx) so a missing/misconfigured .env fails fast with a clear message
// instead of a cryptic error surfacing later from inside the Supabase client.

const REQUIRED_BY_SOURCE = {
  supabase: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
  mock: [],
}

export function validateEnv() {
  const dataSource = import.meta.env.VITE_DATA_SOURCE || 'mock'
  const required = REQUIRED_BY_SOURCE[dataSource] ?? []
  const missing = required.filter((key) => !import.meta.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s) for VITE_DATA_SOURCE="${dataSource}": ${missing.join(', ')}. Check your .env file against .env.example.`
    )
  }

  return dataSource
}
