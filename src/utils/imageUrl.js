import { supabase } from '../lib/supabase'

// Abstracts "given a stored image reference, what URL does the browser load
// it from" — the only place that needs to change once product images move
// into Supabase Storage. Today's `image` values are already absolute paths
// (/images/...) or full URLs, so this is a pass-through for those; anything
// else is treated as a Storage object key.
const STORAGE_BUCKET = 'product-images'

// Neutral placeholder for products created without an image yet (bulk
// import, then images added later in Admin). products.image is NOT NULL, so
// "no image" is stored as '' — see getProductImageUrl().
export const PRODUCT_PLACEHOLDER_IMAGE = '/images/product-placeholder.svg'

/**
 * Product-specific variant of getImageUrl(): an empty/missing image resolves
 * to the shared placeholder so every <img src> that renders a product (card,
 * gallery, enquiry list, quick view) keeps its existing layout instead of
 * collapsing into a broken-image box.
 *
 * @param {string} path
 * @returns {string}
 */
export function getProductImageUrl(path) {
  return getImageUrl(path) || PRODUCT_PLACEHOLDER_IMAGE
}

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
