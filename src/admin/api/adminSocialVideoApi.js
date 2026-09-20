import { supabase } from '../../lib/supabase'

// Admin-only Social Videos ("Watch Us In Action" Reels) data-access layer.
// Isolated from the customer-facing read path exactly like
// adminCategoryApi.js/adminProductApi.js — this always operates as the
// signed-in admin's own `authenticated` Supabase session, relying entirely
// on RLS (via public.is_admin(), see db/migrations/0008_social_videos.sql
// and 0009_social_video_storage.sql) rather than any elevated key. No
// service-role key is used or referenced anywhere in this file.
//
// Only fields that already exist on social_videos/social_video_products
// (db/migrations/0008_social_videos.sql) are used — nothing here invents a
// column. No mock data is used for this admin section.

const SOCIAL_VIDEO_SELECT = `
  id, title, image, video_url, reel_url, account, views, duration,
  sort_order, is_published, created_at, updated_at,
  social_video_products(count)
`

const SOCIAL_VIDEO_BASE_FIELDS = [
  'title',
  'image',
  'video_url',
  'reel_url',
  'account',
  'views',
  'duration',
  'sort_order',
  'is_published',
]

// Only copies keys the caller actually provided — matches
// adminProductApi.js's pickProductFields() convention, so a partial update
// (e.g. only toggling is_published) never clobbers other columns with
// `undefined`.
function pickSocialVideoFields(input) {
  const row = {}
  for (const key of SOCIAL_VIDEO_BASE_FIELDS) {
    if (input[key] !== undefined) row[key] = input[key]
  }
  return row
}

// ── Social Videos ──────────────────────────────────────────────────────────

// Admin list is deliberately NOT limited to 15 and NOT filtered by
// is_published — that "latest 15 published" windowing belongs only to the
// future customer-facing read query (see 0008's own comments), never to
// this admin view. Newest first, matching the task's requested default
// sort; sort_order is a separate, purely storefront-facing concern.
export async function getSocialVideos() {
  const { data, error } = await supabase
    .from('social_videos')
    .select(SOCIAL_VIDEO_SELECT)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getSocialVideoById(videoId) {
  const { data, error } = await supabase
    .from('social_videos')
    .select(SOCIAL_VIDEO_SELECT)
    .eq('id', videoId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createSocialVideo(videoData) {
  const row = pickSocialVideoFields(videoData)
  const { data, error } = await supabase
    .from('social_videos')
    .insert(row)
    .select(SOCIAL_VIDEO_SELECT)
    .single()
  if (error) throw error
  return data
}

export async function updateSocialVideo(videoId, videoData) {
  const row = pickSocialVideoFields(videoData)
  const { data, error } = await supabase
    .from('social_videos')
    .update(row)
    .eq('id', videoId)
    .select(SOCIAL_VIDEO_SELECT)
    .single()
  if (error) throw error
  return data
}

// social_video_products references video_id on delete cascade (see 0008),
// so its rows disappear automatically — no manual child-table cleanup
// needed here. Storage files (thumbnail/video) are deliberately NOT
// deleted by this call, matching the project's existing precedent of never
// auto-deleting Storage objects on record delete for category/product main
// images, and 0009's explicit "no automatic deletion" documentation.
export async function deleteSocialVideo(videoId) {
  const { error } = await supabase.from('social_videos').delete().eq('id', videoId)
  if (error) throw error
}

// ── Storage uploads ─────────────────────────────────────────────────────────

const THUMBNAIL_BUCKET = 'social-video-thumbnails'
const THUMBNAIL_MAX_BYTES = 5 * 1024 * 1024
const THUMBNAIL_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const VIDEO_BUCKET = 'social-videos'
const VIDEO_MAX_BYTES = 50 * 1024 * 1024
const VIDEO_ALLOWED_TYPES = ['video/mp4', 'video/webm']

export function validateSocialVideoThumbnailFile(file) {
  if (!THUMBNAIL_ALLOWED_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG, or WebP image.'
  }
  if (file.size > THUMBNAIL_MAX_BYTES) {
    return 'Thumbnail must be 5 MB or smaller.'
  }
  return null
}

export function validateSocialVideoFile(file) {
  if (!VIDEO_ALLOWED_TYPES.includes(file.type)) {
    return 'Please choose an MP4 or WebM video.'
  }
  if (file.size > VIDEO_MAX_BYTES) {
    return 'Video must be 50 MB or smaller.'
  }
  return null
}

// Flat `${crypto.randomUUID()}.${extension}` naming, matching
// category-images' convention and 0009's own documented rationale — each
// social_videos row has exactly one thumbnail, so no per-record folder is
// needed, and the upload can happen before any row exists (see
// SocialVideoFormModal, which mirrors CategoryImageUpload's eager-upload
// flow rather than the product-image flow's row-id namespacing).
export async function uploadSocialVideoThumbnail(file) {
  const validationError = validateSocialVideoThumbnailFile(file)
  if (validationError) throw new Error(validationError)

  const extension = file.name.split('.').pop().toLowerCase()
  const objectPath = `${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(objectPath, file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(THUMBNAIL_BUCKET).getPublicUrl(objectPath)
  return data.publicUrl
}

export async function uploadSocialVideo(file) {
  const validationError = validateSocialVideoFile(file)
  if (validationError) throw new Error(validationError)

  const extension = file.name.split('.').pop().toLowerCase()
  const objectPath = `${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(VIDEO_BUCKET)
    .upload(objectPath, file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(objectPath)
  return data.publicUrl
}

// ── Tagged products ─────────────────────────────────────────────────────────

// Lightweight product list for the tagging picker — deliberately its own
// minimal query rather than adminProductApi.js's getAdminProducts(), which
// also joins product_images/product_features/product_specifications that
// this picker never needs. Reads the same `products` table directly, so
// there is no second product representation anywhere.
export async function getProductsForTagging() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, image, price')
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

// Full tagged-product list for one video, joined with the real product row
// (name/image/price read live from `products`, never duplicated onto
// social_video_products) — ordered for display/reordering.
export async function getTaggedProducts(videoId) {
  const { data, error } = await supabase
    .from('social_video_products')
    .select('id, video_id, product_id, sort_order, products(id, name, image, price)')
    .eq('video_id', videoId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

// Replace-all semantics, matching adminProductApi.js's
// saveProductFeatures()/saveProductSpecifications() convention: deletes
// whatever tagged products currently exist for this video and re-inserts
// the given ordered list of product ids with sequential sort_order. The
// simplest correct way to persist an edited selection without diffing old
// vs. new rows; social_video_products' own unique(video_id, product_id)
// constraint (0008) still guards against accidental duplicates within the
// given list.
export async function replaceTaggedProducts(videoId, productIds) {
  const { error: deleteError } = await supabase
    .from('social_video_products')
    .delete()
    .eq('video_id', videoId)
  if (deleteError) throw deleteError

  const ids = (productIds ?? []).filter(Boolean)
  if (ids.length === 0) return []

  const rows = ids.map((productId, index) => ({
    video_id: videoId,
    product_id: productId,
    sort_order: index,
  }))

  const { data, error } = await supabase
    .from('social_video_products')
    .insert(rows)
    .select('id, video_id, product_id, sort_order, products(id, name, image, price)')
  if (error) throw error
  return data
}
