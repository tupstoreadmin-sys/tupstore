import { supabase } from '../../lib/supabase'

// Admin-only Hero Slides data-access layer. Isolated from the customer-facing
// Hero exactly like adminPromotionApi.js/adminSocialVideoApi.js — this always
// operates as the signed-in admin's own `authenticated` Supabase session,
// relying entirely on RLS (via public.is_admin(), see
// db/migrations/0019_admin_hero_slides.sql and
// 0020_hero_slide_storage.sql) rather than any elevated key. No service-role
// key is used or referenced anywhere in this file.
//
// Only fields that already exist on hero_slides/hero_slide_features (0019)
// are used — nothing here invents a column. This is Step 1 (admin CRUD
// only) — nothing here is imported by, or wired into,
// HomePage.jsx/HeroCarousel.jsx, which remain completely untouched.

const HERO_SLIDE_COLUMNS = `
  id, badge, title, image, mobile_image, alt_text,
  button1_text, button1_type, button1_target,
  button2_text, button2_type, button2_target,
  is_active, sort_order, created_at, updated_at
`

const HERO_SLIDE_BASE_FIELDS = [
  'badge',
  'title',
  'image',
  'mobile_image',
  'alt_text',
  'button1_text',
  'button1_type',
  'button1_target',
  'button2_text',
  'button2_type',
  'button2_target',
  'is_active',
  'sort_order',
]

// Only copies keys the caller actually provided — matches
// adminPromotionApi.js's pickPromotionFields()/adminProductApi.js's
// pickProductFields() convention, so a partial update never clobbers other
// columns with `undefined`.
function pickHeroSlideFields(input) {
  const row = {}
  for (const key of HERO_SLIDE_BASE_FIELDS) {
    if (input[key] !== undefined) row[key] = input[key]
  }
  return row
}

// ── Hero Slides ─────────────────────────────────────────────────────────

// Ordered by sort_order (the same field a future customer-facing query
// would use), then created_at as a stable tiebreaker — matches
// getAdminPromotions()'s own reasoning exactly.
export async function getAdminHeroSlides() {
  const { data, error } = await supabase
    .from('hero_slides')
    .select(HERO_SLIDE_COLUMNS)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// Embeds this slide's feature bullets, ordered for the edit form's
// reorderable list — never a duplicated copy, always read live through the
// FK, exactly like getAdminPromotionById()'s tagged-products embed.
export async function getAdminHeroSlideById(heroSlideId) {
  const { data, error } = await supabase
    .from('hero_slides')
    .select(
      `${HERO_SLIDE_COLUMNS}, hero_slide_features(id, hero_slide_id, text, sort_order)`
    )
    .eq('id', heroSlideId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createHeroSlide(heroSlideData) {
  const row = pickHeroSlideFields(heroSlideData)
  const { data, error } = await supabase
    .from('hero_slides')
    .insert(row)
    .select(HERO_SLIDE_COLUMNS)
    .single()
  if (error) throw error
  return data
}

export async function updateHeroSlide(heroSlideId, heroSlideData) {
  const row = pickHeroSlideFields(heroSlideData)
  const { data, error } = await supabase
    .from('hero_slides')
    .update(row)
    .eq('id', heroSlideId)
    .select(HERO_SLIDE_COLUMNS)
    .single()
  if (error) throw error
  return data
}

// hero_slide_features references hero_slide_id on delete cascade (0019),
// so its rows disappear automatically — no manual child-table cleanup
// needed here, same reasoning as deletePromotion()/deleteSocialVideo().
// Storage's hero images are deliberately NOT deleted by this call — see
// deleteHeroImage()'s own comment below for why, matching this project's
// existing precedent of never auto-deleting a Storage object on record
// delete.
export async function deleteHeroSlide(heroSlideId) {
  const { error } = await supabase.from('hero_slides').delete().eq('id', heroSlideId)
  if (error) throw error
}

// ── Feature bullets ─────────────────────────────────────────────────────

// Replace-all semantics, matching adminProductApi.js's
// saveProductFeatures()/adminPromotionApi.js's
// replaceTaggedPromotionProducts() convention exactly: deletes whatever
// feature bullets currently exist for this slide and re-inserts the given
// ordered list of texts with sequential sort_order. Blank entries are
// silently dropped, matching saveProductFeatures()'s own behavior.
export async function replaceHeroSlideFeatures(heroSlideId, texts) {
  const { error: deleteError } = await supabase
    .from('hero_slide_features')
    .delete()
    .eq('hero_slide_id', heroSlideId)
  if (deleteError) throw deleteError

  const cleaned = (texts ?? []).map((text) => (text ?? '').trim()).filter(Boolean)
  if (cleaned.length === 0) return []

  const rows = cleaned.map((text, index) => ({
    hero_slide_id: heroSlideId,
    text,
    sort_order: index,
  }))

  const { data, error } = await supabase
    .from('hero_slide_features')
    .insert(rows)
    .select('id, hero_slide_id, text, sort_order')
  if (error) throw error
  return data
}

// ── Storage ─────────────────────────────────────────────────────────────

const HERO_IMAGE_BUCKET = 'hero-images'
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateHeroImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG, or WebP image.'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image must be 5 MB or smaller.'
  }
  return null
}

// Flat `${crypto.randomUUID()}.${extension}` naming, matching
// category-images'/social-video-thumbnails'/promotion-images' convention
// (never product-images' per-record-folder convention) — a hero slide has
// at most two images (desktop, mobile), not a multi-image gallery, so
// there is no per-record collection to namespace by folder. Shared by both
// the desktop-image and mobile-image upload fields — the caller decides
// which form field the resulting URL is stored into. This also means the
// upload never needs a hero slide id to exist first: a new slide's images
// can be uploaded before the hero_slides row is created, then the
// resulting public URL(s) are included directly in the single insert —
// the same "upload first, then use the known URL" shape
// CategoryImageUpload/PromotionImageUpload already use.
export async function uploadHeroImage(file) {
  const validationError = validateHeroImageFile(file)
  if (validationError) throw new Error(validationError)

  const extension = file.name.split('.').pop().toLowerCase()
  const objectPath = `${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(HERO_IMAGE_BUCKET)
    .upload(objectPath, file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(HERO_IMAGE_BUCKET).getPublicUrl(objectPath)
  return data.publicUrl
}

// Storage's remove() needs the bare object path, not a URL — but
// hero_slides.image/mobile_image (like promotions.image) stores the full
// public URL, so callers may reasonably have only that. Accepts either
// form. Matches adminPromotionApi.js's toPromotionImageObjectPath()
// exactly, adapted to this bucket.
function toHeroImageObjectPath(imagePathOrUrl) {
  const marker = `/object/public/${HERO_IMAGE_BUCKET}/`
  const markerIndex = imagePathOrUrl.indexOf(marker)
  if (markerIndex === -1) return imagePathOrUrl
  return imagePathOrUrl.slice(markerIndex + marker.length)
}

// Deletes the Storage object only — does not touch the hero_slides row.
// Exposed for a future/explicit admin action, but deliberately NOT called
// automatically by updateHeroSlide() when an image is replaced, or by
// deleteHeroSlide() when a slide is removed — matching this project's
// existing, repeatedly-established convention that a record's own
// update/delete never auto-deletes its Storage image (categories/products/
// social videos/promotions all behave the same way).
export async function deleteHeroImage(imagePathOrUrl) {
  const objectPath = toHeroImageObjectPath(imagePathOrUrl)
  const { error } = await supabase.storage.from(HERO_IMAGE_BUCKET).remove([objectPath])
  if (error) throw error
}

// ── CTA target pickers ──────────────────────────────────────────────────

// Lightweight category list for the "category" button-type picker — its
// own minimal query rather than adminCategoryApi.js's getCategories(),
// duplicated per this project's established "duplicate small pure helpers
// across files" convention (see adminPromotionApi.js's own
// getProductsForPromotionTagging() comment).
export async function getCategoriesForHeroTargeting() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

// Lightweight product list for the "product" button-type picker — mirrors
// adminPromotionApi.js's getProductsForPromotionTagging() exactly (same
// minimal columns, same ordering), duplicated rather than imported per the
// same convention.
export async function getProductsForHeroTargeting() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, image, price')
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}
