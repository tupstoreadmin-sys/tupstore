import { supabase } from '../../lib/supabase'

// Admin-only product data-access layer. Isolated from src/api/productApi.js
// (the customer read path, gated by VITE_DATA_SOURCE) and from
// src/services/products/* (the customer repository pattern) — this always
// operates as the signed-in admin's own `authenticated` Supabase session,
// relying entirely on RLS (via public.is_admin(), see
// db/migrations/0005_admin_products.sql) rather than any elevated key. No
// service-role key is used or referenced anywhere in this file.
//
// Only fields that already exist in db/schema.sql (plus product_code from
// 0005, and sku from 0023) are used — nothing here invents a column, and
// neither product_code nor sku is ever auto-generated: each stays NULL
// unless the caller explicitly provides one, per the client's requirement.
//
// This file is the data layer only, per this task's scope — no
// Product Management UI (forms/tables/modals) is built here.

const PRODUCT_SELECT = `
  id, slug, name, image, badge, featured, category_id, price, original_price,
  rating, capacity, availability, description, colors, product_code, sku,
  created_at, updated_at,
  categories ( name ),
  product_images ( id, url, alt_text, sort_order, is_primary, created_at ),
  product_features ( id, label, sort_order ),
  product_specifications ( id, spec_key, spec_value, sort_order )
`

const PRODUCT_BASE_FIELDS = [
  'slug',
  'name',
  'image',
  'badge',
  'featured',
  'category_id',
  'price',
  'original_price',
  'rating',
  'capacity',
  'availability',
  'description',
  'colors',
  'product_code',
  'sku',
]

// Only copies keys the caller actually provided (partial-safe for
// updateAdminProduct; create still works since Postgres applies the
// column defaults from db/schema.sql for anything omitted). Uses the
// same column names as the database — no camelCase/snake_case mapping
// layer, matching adminCategoryApi.js's convention of accepting the
// column names directly.
function pickProductFields(input) {
  const row = {}
  for (const key of PRODUCT_BASE_FIELDS) {
    if (input[key] !== undefined) row[key] = input[key]
  }
  return row
}

function throwFriendlyProductWriteError(error) {
  if (error.code === '23505') {
    throw new Error('A product with this slug, product code, or SKU already exists.')
  }
  throw error
}

// ── Products ────────────────────────────────────────────────────────────

export async function getAdminProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getAdminProductById(productId) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', productId)
    .maybeSingle()
  if (error) throw error
  return data
}

// `productData` uses raw db column names (slug, category_id,
// original_price, product_code, ...) — see PRODUCT_BASE_FIELDS. Does not
// touch product_images/product_features/product_specifications; those are
// separate calls below, same as how Category image upload is a separate
// step from saving the category row itself.
export async function createAdminProduct(productData) {
  const row = pickProductFields(productData)
  const { data, error } = await supabase
    .from('products')
    .insert(row)
    .select(PRODUCT_SELECT)
    .single()
  if (error) throwFriendlyProductWriteError(error)
  return data
}

export async function updateAdminProduct(productId, productData) {
  const row = pickProductFields(productData)
  const { data, error } = await supabase
    .from('products')
    .update(row)
    .eq('id', productId)
    .select(PRODUCT_SELECT)
    .single()
  if (error) throwFriendlyProductWriteError(error)
  return data
}

// db/schema.sql defines enquiry_items.product_id references products(id)
// on delete restrict — Postgres refuses this delete at the constraint
// level if the product was ever added to a customer enquiry (error
// 23503), before any row is touched. product_images/product_features/
// product_specifications reference products(id) on delete cascade, so a
// successful delete correctly removes those child rows too — that
// cascade is intentional, they only exist to describe this one product,
// unlike an enquiry_items row which is historical customer data.
export async function deleteAdminProduct(productId) {
  const { error } = await supabase.from('products').delete().eq('id', productId)
  if (error) {
    if (error.code === '23503') {
      throw new Error(
        'This product cannot be deleted because it is referenced by an existing customer enquiry.'
      )
    }
    throw error
  }
}

// ── Categories (for a product form's category picker) ────────────────────

// Deliberately its own query rather than re-exporting
// adminCategoryApi.getCategories() — that one orders alphabetically by
// name (right for the Category admin list), while a product form should
// show categories in the business's canonical sort_order (DRY STORAGES,
// FRIDGE STORAGES, ... SPARE PARTS), matching db/migrations/
// 0004_canonical_categories.sql and the storefront's own ordering.
export async function getAdminProductCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, sort_order')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

// ── Images ──────────────────────────────────────────────────────────────

const PRODUCT_IMAGE_BUCKET = 'product-images'
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function validateProductImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG, or WebP image.'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image must be 5 MB or smaller.'
  }
  return null
}

// Storage upload only — does not touch product_images. Returns the full
// public URL (matching uploadCategoryImage()'s pattern, see
// adminStorageApi.js), which the caller then saves via
// createProductImageRecord/updateProductImageRecord, and — if this is
// meant to be the primary image — also into products.image directly,
// since the customer storefront's productMapper.js still reads that
// column as the fallback/primary image. Keeping products.image in sync
// with the "is_primary" gallery row is the caller's responsibility (a
// future UI concern), not this function's.
//
// Object paths are namespaced per product (`${productId}/...`) since a
// product can have many images, unlike categories which have exactly one.
export async function uploadProductImage(file, productId) {
  const validationError = validateProductImageFile(file)
  if (validationError) throw new Error(validationError)

  const extension = file.name.split('.').pop().toLowerCase()
  const objectPath = `${productId}/${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(objectPath, file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(objectPath)
  return data.publicUrl
}

// Storage's remove() needs the bare object path, not a URL — but
// product_images.url (like categories.image) stores the full public URL,
// so callers may reasonably have only that. Accepts either form.
function toProductImageObjectPath(imagePathOrUrl) {
  const marker = `/object/public/${PRODUCT_IMAGE_BUCKET}/`
  const markerIndex = imagePathOrUrl.indexOf(marker)
  if (markerIndex === -1) return imagePathOrUrl
  return imagePathOrUrl.slice(markerIndex + marker.length)
}

// Deletes the Storage object only — does not touch the product_images
// row. Kept independent from deleteProductImageRecord() so either can
// safely run without the other having already succeeded, same reasoning
// as Category image "Remove" only clearing the reference (see
// CategoryImageUpload.jsx) rather than forcing a combined operation.
export async function deleteProductImage(imagePathOrUrl) {
  const objectPath = toProductImageObjectPath(imagePathOrUrl)
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .remove([objectPath])
  if (error) throw error
}

const PRODUCT_IMAGE_RECORD_FIELDS =
  'id, product_id, url, alt_text, sort_order, is_primary, created_at'

/**
 * @param {object} params
 * @param {string} params.productId
 * @param {string} params.url
 * @param {string} [params.altText]
 * @param {number} [params.sortOrder]
 * @param {boolean} [params.isPrimary]
 */
export async function createProductImageRecord({
  productId,
  url,
  altText,
  sortOrder,
  isPrimary,
}) {
  const { data, error } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      url,
      alt_text: altText || null,
      sort_order: sortOrder ?? 0,
      is_primary: Boolean(isPrimary),
    })
    .select(PRODUCT_IMAGE_RECORD_FIELDS)
    .single()
  if (error) throw error
  return data
}

export async function updateProductImageRecord(
  imageId,
  { url, altText, sortOrder, isPrimary }
) {
  const row = {}
  if (url !== undefined) row.url = url
  if (altText !== undefined) row.alt_text = altText || null
  if (sortOrder !== undefined) row.sort_order = sortOrder
  if (isPrimary !== undefined) row.is_primary = Boolean(isPrimary)

  const { data, error } = await supabase
    .from('product_images')
    .update(row)
    .eq('id', imageId)
    .select(PRODUCT_IMAGE_RECORD_FIELDS)
    .single()
  if (error) throw error
  return data
}

export async function deleteProductImageRecord(imageId) {
  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId)
  if (error) throw error
}

// Takes gallery image ids in their new desired order and writes
// sequential sort_order values (0, 1, 2, ...) — the caller (a future
// drag-and-drop UI) decides the order, this just persists it.
export async function reorderProductImages(imageIds) {
  const results = await Promise.all(
    imageIds.map((imageId, index) =>
      supabase
        .from('product_images')
        .update({ sort_order: index })
        .eq('id', imageId)
    )
  )
  const failed = results.find((result) => result.error)
  if (failed) throw failed.error
}

// ── Features ────────────────────────────────────────────────────────────

// Replace-all semantics: deletes whatever features currently exist for
// this product and re-inserts the given ordered list with sequential
// sort_order — the simplest correct way to persist an edited list without
// diffing old vs. new rows. Empty/blank labels are dropped.
// deleteProductFeature() is provided separately for a future UI that
// wants to remove a single row without resaving the whole list.
export async function saveProductFeatures(productId, features) {
  const { error: deleteError } = await supabase
    .from('product_features')
    .delete()
    .eq('product_id', productId)
  if (deleteError) throw deleteError

  const labels = (features ?? [])
    .map((label) => (label ?? '').trim())
    .filter(Boolean)
  if (labels.length === 0) return []

  const rows = labels.map((label, index) => ({
    product_id: productId,
    label,
    sort_order: index,
  }))

  const { data, error } = await supabase
    .from('product_features')
    .insert(rows)
    .select('id, product_id, label, sort_order')
  if (error) throw error
  return data
}

export async function deleteProductFeature(featureId) {
  const { error } = await supabase
    .from('product_features')
    .delete()
    .eq('id', featureId)
  if (error) throw error
}

// ── Specifications ──────────────────────────────────────────────────────

// Same replace-all semantics as saveProductFeatures(). `specifications` is
// an ordered array of {key, value} pairs (not a plain object) so an
// editable form has a stable, orderable shape to work with — this is the
// inverse of productMapper.js's mapSpecs(), which flattens rows into a
// {key: value} object for the customer-facing read side only.
// db/schema.sql's unique(product_id, spec_key) constraint still applies —
// duplicate keys in the input surface as a clear error, not a silent
// overwrite.
export async function saveProductSpecifications(productId, specifications) {
  const { error: deleteError } = await supabase
    .from('product_specifications')
    .delete()
    .eq('product_id', productId)
  if (deleteError) throw deleteError

  const entries = (specifications ?? []).filter(
    (spec) => spec?.key?.trim() && spec?.value?.trim()
  )
  if (entries.length === 0) return []

  const rows = entries.map((spec, index) => ({
    product_id: productId,
    spec_key: spec.key.trim(),
    spec_value: spec.value.trim(),
    sort_order: index,
  }))

  const { data, error } = await supabase
    .from('product_specifications')
    .insert(rows)
    .select('id, product_id, spec_key, spec_value, sort_order')
  if (error) {
    if (error.code === '23505') {
      throw new Error('Specification keys must be unique for a product.')
    }
    throw error
  }
  return data
}

export async function deleteProductSpecification(specificationId) {
  const { error } = await supabase
    .from('product_specifications')
    .delete()
    .eq('id', specificationId)
  if (error) throw error
}
