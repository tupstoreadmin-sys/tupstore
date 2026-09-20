// Centralizes how `{ data, error }` responses from Supabase become thrown
// errors, so every function in api/*.js handles failures the same way
// instead of repeating `if (error) throw ...` at every call site.

/**
 * @param {{ message: string } | null} error
 * @param {string} context - identifies which query failed, e.g. "getProducts"
 */
export function handleApiError(error, context) {
  if (!error) return
  throw new Error(`[Supabase] ${context}: ${error.message}`)
}
