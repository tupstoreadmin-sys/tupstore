import { supabase } from '../../lib/supabase'

// Admin-only Storage upload for category images. Isolated from
// customer-facing code — src/utils/imageUrl.js (used by the customer
// storefront's categoryMapper.js) is not touched by this file or by
// anything under src/admin/.
//
// uploadCategoryImage() always resolves to a full public https:// URL,
// never a bare Storage object key. That matters because
// src/utils/imageUrl.js already passes any value starting with "http"
// straight through unchanged (it only resolves bare keys against its own
// hardcoded 'product-images' bucket) — so storing the full URL in
// categories.image means the customer storefront can correctly display a
// category-images-bucket image with zero changes to any customer-facing
// file, today or later.
//
// Requires the `category-images` Storage bucket and its admin-only
// upload/select policies to exist in the production project — neither has
// been created yet (see the implementation report). Until they are,
// uploads here fail with a Supabase Storage error, which the calling
// component (CategoryImageUpload) surfaces as an inline error state, not
// a crash.

const BUCKET = 'category-images'
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateCategoryImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG, or WebP image.'
  }
  if (file.size > MAX_BYTES) {
    return 'Image must be 5 MB or smaller.'
  }
  return null
}

// Every upload gets a fresh random object name — this never overwrites or
// deletes anything already in the bucket, so an existing category's image
// is never at risk from a failed or concurrent upload for a different
// category (or a retry of the same one).
export async function uploadCategoryImage(file) {
  const validationError = validateCategoryImageFile(file)
  if (validationError) throw new Error(validationError)

  const extension = file.name.split('.').pop().toLowerCase()
  const objectPath = `${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath)
  return data.publicUrl
}
