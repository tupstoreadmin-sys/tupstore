import { supabase } from '../lib/supabase'

// Abstracts "given a stored image reference, what URL does the browser load
// it from" — the only place that needs to change once product images move
// into Supabase Storage. Today's `image` values are already absolute paths
// (/images/...) or full URLs, so this is a pass-through for those; anything
// else is treated as a Storage object key.
const STORAGE_BUCKET = 'product-images'

/**
 * @param {string} path
 * @returns {string}
 */
export function getImageUrl(path) {
  if (!path) return ''
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('/')
  ) {
    return path
  }
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl
}
