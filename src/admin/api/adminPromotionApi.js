import { supabase } from '../../lib/supabase'

// Admin-only Promotions data-access layer. Isolated from the customer-facing
// read path exactly like adminCategoryApi.js/adminProductApi.js/
// adminSocialVideoApi.js — this always operates as the signed-in admin's own
// `authenticated` Supabase session, relying entirely on RLS (via
// public.is_admin(), see db/migrations/0012_promotions.sql and
// 0013_promotion_storage.sql) rather than any elevated key. No service-role
// key is used or referenced anywhere in this file.
//
// Only fields that already exist on promotions/promotion_products (0012)
// are used — nothing here invents a column. This is Step 2 (admin CRUD
// only) — nothing here is imported by, or wired into,
// HomePage.jsx/PromotionStrip.jsx/getFeaturedProducts(), which remain
// completely untouched.

const PROMOTION_COLUMNS = `
  id, title, description, image, badge, button_text, whatsapp_text,
  is_active, sort_order, created_at, updated_at
`

// List-page select: embeds only a promotion_products COUNT (for the
// "Tagged" column). getAdminPromotionById() below needs the FULL tagged
// row list instead — it deliberately does NOT reuse this constant, because
// PostgREST/Postgres rejects embedding the same relation twice with two
// different shapes (a `count` aggregate and a full row list) in one query
// ("aggregate functions are not allowed in FROM clause of their own query
// level") — found and fixed during this step's own QA.
const PROMOTION_SELECT = `${PROMOTION_COLUMNS}, promotion_products(count)`

const PROMOTION_BASE_FIELDS = [
  'title',
  'description',
  'image',
  'badge',
  'button_text',
  'whatsapp_text',
  'is_active',
  'sort_order',
]

// Only copies keys the caller actually provided — matches
// adminProductApi.js's pickProductFields()/adminSocialVideoApi.js's
// pickSocialVideoFields() convention, so a partial update never clobbers
// other columns with `undefined`.
function pickPromotionFields(input) {
  const row = {}
  for (const key of PROMOTION_BASE_FIELDS) {
    if (input[key] !== undefined) row[key] = input[key]
  }
  return row
}

// ── Promotions ──────────────────────────────────────────────────────────

// Ordered by sort_order (the same field the future customer-facing query
// will use), then created_at as a stable tiebreaker — this lets the admin
// list itself double as a preview of the real future display order, rather
// than an arbitrary listing order unrelated to what sort_order controls.
export async function getAdminPromotions() {
  const { data, error } = await supabase
    .from('promotions')
    .select(PROMOTION_SELECT)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// Embeds tagged promotion_products + each one's real product fields (id,
// name, image, price) for the edit form's "Products in this Promotion"
// section — never a duplicated copy of product data, always read live
// through the FK, exactly like getSocialVideoById()'s equivalent embed.
export async function getAdminPromotionById(promotionId) {
  const { data, error } = await supabase
    .from('promotions')
    .select(
      `${PROMOTION_COLUMNS}, promotion_products(id, product_id, sort_order, products(id, name, image, price))`
    )
    .eq('id', promotionId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createPromotion(promotionData) {
  const row = pickPromotionFields(promotionData)
  const { data, error } = await supabase
    .from('promotions')
    .insert(row)
    .select(PROMOTION_SELECT)
    .single()
  if (error) throw error
  return data
}

export async function updatePromotion(promotionId, promotionData) {
  const row = pickPromotionFields(promotionData)
  const { data, error } = await supabase
    .from('promotions')
    .update(row)
    .eq('id', promotionId)
    .select(PROMOTION_SELECT)
    .single()
  if (error) throw error
  return data
}

// promotion_products references promotion_id on delete cascade (0012), so
// its rows disappear automatically — no manual child-table cleanup needed
// here, same reasoning as deleteSocialVideo(). Storage's promotion image is
// deliberately NOT deleted by this call — see deletePromotionImage()'s own
// comment below for why, matching this project's existing precedent of
// never auto-deleting a Storage object on record delete (deleteCategory()/
// deleteAdminProduct()/deleteSocialVideo() all behave the same way).
export async function deletePromotion(promotionId) {
  const { error } = await supabase.from('promotions').delete().eq('id', promotionId)
  if (error) throw error
}

// ── Storage ─────────────────────────────────────────────────────────────

const PROMOTION_IMAGE_BUCKET = 'promotion-images'
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validatePromotionImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG, or WebP image.'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image must be 5 MB or smaller.'
  }
  return null
}

// Flat `${crypto.randomUUID()}.${extension}` naming, matching
// category-images'/social-video-thumbnails' convention (never
// product-images' per-record-folder convention) — a promotion has exactly
// one image, not a multi-image gallery, so there is no per-record
// collection to namespace by folder. This also means the upload never
// needs a promotion id to exist first: a new promotion's image can be
// uploaded before the promotions row is created, then the resulting public
// URL is included directly in the single insert — the same "upload first,
// then use the known URL" shape CategoryFormModal/CategoryImageUpload
// already use, and simpler than AdminProductFormPage's own create-then-
// upload-then-update dance, which is only necessary there because
// product-images' object paths are namespaced by the product's own id.
export async function uploadPromotionImage(file) {
  const validationError = validatePromotionImageFile(file)
  if (validationError) throw new Error(validationError)

  const extension = file.name.split('.').pop().toLowerCase()
  const objectPath = `${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(PROMOTION_IMAGE_BUCKET)
    .upload(objectPath, file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(PROMOTION_IMAGE_BUCKET).getPublicUrl(objectPath)
  return data.publicUrl
}

// Storage's remove() needs the bare object path, not a URL — but
// promotions.image (like categories.image/products.image) stores the full
// public URL, so callers may reasonably have only that. Accepts either
// form. Matches adminProductApi.js's toProductImageObjectPath() exactly,
// adapted to this bucket's flat (non-folder) naming.
function toPromotionImageObjectPath(imagePathOrUrl) {
  const marker = `/object/public/${PROMOTION_IMAGE_BUCKET}/`
  const markerIndex = imagePathOrUrl.indexOf(marker)
  if (markerIndex === -1) return imagePathOrUrl
  return imagePathOrUrl.slice(markerIndex + marker.length)
}

// Deletes the Storage object only — does not touch the promotions row.
// Exposed for a future/explicit admin action (per this task's own explicit
// requirement to provide this function), but deliberately NOT called
// automatically by updatePromotion() when an image is replaced, or by
// deletePromotion() when a promotion is removed — matching this project's
// existing, repeatedly-established convention that a record's own
// update/delete never auto-deletes its Storage image (categories/products/
// social videos all behave the same way; see updatePromotion()'s replace
// path and deletePromotion()'s own comment above). Safe to call precisely
// because promotions.image always stores this exact promotion's own
// unique UUID-named object URL — never a path guessed or shared with any
// other promotion.
export async function deletePromotionImage(imagePathOrUrl) {
  const objectPath = toPromotionImageObjectPath(imagePathOrUrl)
  const { error } = await supabase.storage
    .from(PROMOTION_IMAGE_BUCKET)
    .remove([objectPath])
  if (error) throw error
}

// ── Tagged products ─────────────────────────────────────────────────────

// Lightweight product list for the tagging picker — its own minimal query
// rather than adminProductApi.js's getAdminProducts(), which also joins
// product_images/product_features/product_specifications that this picker
// never needs. Reads the same `products` table directly, so there is no
// second product representation anywhere. Duplicated from
// adminSocialVideoApi.js's own getProductsForTagging() rather than shared
// via import, matching this project's established "duplicate small pure
// helpers across files" convention.
export async function getProductsForPromotionTagging() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, image, price')
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

// Full tagged-product list for one promotion, joined with the real product
// row (name/image/price read live from `products`, never duplicated onto
// promotion_products) — ordered for display/reordering.
export async function getTaggedPromotionProducts(promotionId) {
  const { data, error } = await supabase
    .from('promotion_products')
    .select('id, promotion_id, product_id, sort_order, products(id, name, image, price)')
    .eq('promotion_id', promotionId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

// Replace-all semantics, matching adminSocialVideoApi.js's
// replaceTaggedProducts()/adminProductApi.js's saveProductFeatures()
// convention: deletes whatever tagged products currently exist for this
// promotion and re-inserts the given ordered list of product ids with
// sequential sort_order. The simplest correct way to persist an edited
// selection without diffing old vs. new rows; promotion_products' own
// unique(promotion_id, product_id) constraint (0012) still guards against
// accidental duplicates within the given list. Called only after the
// promotion row itself has already been successfully created/updated, per
// this task's own explicit save-workflow ordering.
export async function replaceTaggedPromotionProducts(promotionId, productIds) {
  const { error: deleteError } = await supabase
    .from('promotion_products')
    .delete()
    .eq('promotion_id', promotionId)
  if (deleteError) throw deleteError

  const ids = (productIds ?? []).filter(Boolean)
  if (ids.length === 0) return []

  const rows = ids.map((productId, index) => ({
    promotion_id: promotionId,
    product_id: productId,
    sort_order: index,
  }))

  const { data, error } = await supabase
    .from('promotion_products')
    .insert(rows)
    .select('id, promotion_id, product_id, sort_order, products(id, name, image, price)')
  if (error) throw error
  return data
}
