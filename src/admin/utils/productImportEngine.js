import {
  getAdminProductCategories,
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  uploadProductImage,
  deleteProductImage,
  createProductImageRecord,
  saveProductFeatures,
  saveProductSpecifications,
} from '../api/adminProductApi'
import { validateProductImport } from './productImportValidator'
import { buildImportReview } from './productImportReview'

// STEP 3 — the actual Supabase-writing import engine. Every write here
// goes through the SAME functions AdminProductFormPage.jsx/
// ProductImageManager.jsx already use (createAdminProduct,
// uploadProductImage, createProductImageRecord, updateAdminProduct,
// saveProductFeatures, saveProductSpecifications, deleteAdminProduct,
// deleteProductImage) — no new Supabase call is introduced, no service-
// role key, no RLS change. Processing is strictly sequential (never
// Promise.all across products), per this step's explicit "prioritize
// reliability over maximum speed" instruction.

// Same algorithm as AdminProductFormPage.jsx's own slugify() and
// productImportValidator.js's/productImportReview.js's own copies —
// duplicated a fourth time here per this project's existing precedent
// (see productImportValidator.js's own comment on this). The Excel
// workbook's slug column, if any, is never read — see productImportParser.js,
// which never even parses a "slug" column from the Products sheet.
function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizedKey(value) {
  return (value ?? '').trim().toLowerCase()
}

// Same rules as adminProductApi.js's own (private) validateProductImageFile
// — duplicated here for the same reason as slugify() above rather than
// exporting a private helper out of an already-approved file.
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG, or WebP image.'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image must be 5 MB or smaller.'
  }
  return null
}

// Strips any path prefix a spreadsheet cell might contain — the actual
// match key is always just the filename, matching the selected image
// asset's own `File.name` (which never carries a path).
function basename(value) {
  return (value ?? '').trim().split(/[\\/]/).pop()
}

// Same matching shape as productImportValidator.js's buildCategoryLookup()
// — duplicated rather than imported (that function is private to that
// file). Every product being imported already passed this exact check
// during validation; re-resolving here (against a freshly-fetched
// categories list, per this step's "categories still exist" preflight
// requirement) uses the identical rule, never a looser one.
function buildCategoryLookup(categories) {
  const map = new Map()
  for (const category of categories) {
    map.set(normalizedKey(category.name), category)
    if (category.slug) map.set(normalizedKey(category.slug), category)
  }
  return map
}

function resolveCategoryId(categoryText, categoryLookup) {
  return categoryLookup.get(normalizedKey(categoryText))?.id ?? null
}

// The exact string adminProductApi.js's createAdminProduct() throws for a
// Postgres 23505 (unique violation) on products.slug or
// products.product_code — that function deliberately re-throws a friendly
// message-only Error rather than exposing the raw Postgres code, so this
// is the only reliable way to detect "this was actually a duplicate-key
// race" from here without changing that already-approved file. See
// "Duplicate Import Protection" in this step's task — a race that lands
// here must be reported as EXISTS/SKIPPED, never a generic FAILED.
const EXISTING_PRODUCT_RACE_MESSAGE = 'A product with this slug or product code already exists.'

/**
 * Preflight — re-validates the ENTIRE workbook against a freshly-fetched
 * snapshot of categories/products (never the possibly-stale snapshot from
 * Step 2's own review screen), then re-derives the review so any row that
 * was READY/WARNING minutes ago but has since become EXISTS/ERROR (another
 * admin created a colliding product_code/slug, or — extremely unlikely —
 * a category was removed) is caught before any write, not after.
 *
 * Also confirms the admin session itself is still valid: getAdminProducts/
 * getAdminProductCategories are the same RLS-gated admin reads used
 * everywhere else in this admin — if the session has expired or the
 * account is no longer an admin, these fail here, before any write is
 * attempted, with the same permission-error shape the rest of this admin
 * already handles.
 *
 * @param {object} parsed - parseProductImportWorkbook() output
 * @param {Set<number>} importableRowNumbers - rowNumbers the admin selected
 *   for this run (READY, plus WARNING rows only if warnings were
 *   explicitly acknowledged) — computed by the page from the Step 2 review
 * @param {Map<string, File>} imageAssetsByFilename
 */
export async function preflightProductImport(parsed, importableRowNumbers, imageAssetsByFilename) {
  let categories
  let existingProducts
  try {
    ;[categories, existingProducts] = await Promise.all([
      getAdminProductCategories(),
      getAdminProducts(),
    ])
  } catch (error) {
    return {
      ok: false,
      reason:
        error?.code === '42501'
          ? 'Your admin session no longer has permission to import products. Please refresh and sign in again.'
          : `Could not verify current categories/products before importing: ${error.message}`,
    }
  }

  const freshValidation = validateProductImport(parsed, { categories, existingProducts })
  const freshReview = buildImportReview(parsed, freshValidation, existingProducts)

  const selectedRows = freshReview.rows.filter((row) => importableRowNumbers.has(row.product.rowNumber))
  const nowReady = selectedRows.filter((row) => row.status === 'ready')
  const nowWarning = selectedRows.filter((row) => row.status === 'warning')
  const nowExists = selectedRows.filter((row) => row.status === 'exists')
  const nowError = selectedRows.filter((row) => row.status === 'error')

  const attemptRows = [...nowReady, ...nowWarning]
  const categoryLookup = buildCategoryLookup(categories)

  const imageFailures = []
  const readyToWriteRows = []
  for (const row of attemptRows) {
    const filename = basename(row.product.main_image)
    const file = filename ? imageAssetsByFilename.get(filename) : null
    if (!file) {
      imageFailures.push({
        row,
        reason: `Main image "${row.product.main_image || '(none)'}" was not found among the selected image files.`,
      })
      continue
    }
    const typeOrSizeError = validateImageFile(file)
    if (typeOrSizeError) {
      imageFailures.push({ row, reason: typeOrSizeError })
      continue
    }
    readyToWriteRows.push(row)
  }

  return {
    ok: true,
    categories,
    categoryLookup,
    readyToWriteRows,
    imageFailures,
    reclassifiedExisting: nowExists,
    reclassifiedError: nowError,
  }
}

// One product, start to finish, per the task's lettered sequence
// (A. create row → B. upload primary → C. upload gallery → D. image
// records → E. set products.image → F. features → G. specifications →
// H. verify). ANY failure after the product row is created triggers full
// cleanup: every Storage object this function itself uploaded is removed,
// then the product row is deleted (its product_images/product_features/
// product_specifications rows disappear via the existing ON DELETE CASCADE
// foreign keys — see db/schema.sql — no manual child-row cleanup needed).
// Cleanup outcomes are always recorded on the returned failure, never
// swallowed.
async function importOneProduct(row, { categoryLookup, imageAssetsByFilename, onStage }) {
  const { product, images, features, specifications } = row
  const uploadedUrls = []
  let productId = null
  let stage = 'Category Resolution'

  function fail(reason, extra = {}) {
    return {
      status: 'failed',
      productCode: product.product_code,
      productName: product.name,
      stage,
      reason,
      productRowCreated: Boolean(productId),
      imagesUploadedCount: uploadedUrls.length,
      featuresWritten: false,
      specificationsWritten: false,
      cleanup: null,
      ...extra,
    }
  }

  try {
    onStage?.('Resolving category')
    const categoryId = resolveCategoryId(product.category, categoryLookup)
    if (!categoryId) return fail(`Category "${product.category}" could not be resolved.`)

    stage = 'Product Creation'
    onStage?.('Creating product')
    let created
    try {
      created = await createAdminProduct({
        slug: slugify(product.name),
        name: product.name,
        product_code: product.product_code,
        category_id: categoryId,
        price: product.price,
        original_price: product.original_price ?? null,
        availability: product.availability || 'in_stock',
        featured: Boolean(product.featured),
        badge: product.badge || null,
        capacity: product.capacity || null,
        rating: product.rating ?? null,
        colors: product.colors ?? null,
        description: product.description || null,
        image: '',
      })
    } catch (error) {
      if (error.message === EXISTING_PRODUCT_RACE_MESSAGE) {
        return {
          status: 'skipped-existing',
          productCode: product.product_code,
          productName: product.name,
          reason: 'Another session created a product with this code/slug during this import (race condition).',
        }
      }
      throw error
    }
    productId = created.id

    stage = 'Primary Image Upload'
    onStage?.('Uploading main image')
    const mainImageFile = imageAssetsByFilename.get(basename(product.main_image))
    const primaryUrl = await uploadProductImage(mainImageFile, productId)
    uploadedUrls.push(primaryUrl)

    stage = 'Primary Image Record'
    await createProductImageRecord({
      productId,
      url: primaryUrl,
      altText: '',
      sortOrder: 0,
      isPrimary: true,
    })

    stage = 'Gallery Images'
    onStage?.('Uploading gallery images')
    const mainImageBasename = basename(product.main_image)
    const galleryRows = images.filter((img) => basename(img.image_file) !== mainImageBasename)
    let gallerySortOrder = 1
    for (const imgRow of galleryRows) {
      const file = imageAssetsByFilename.get(basename(imgRow.image_file))
      // A missing or invalid gallery image is non-fatal — the main image
      // is the only image this step requires (see Step 3's own "IMAGE
      // VALIDATION BEFORE WRITING" section, which only names the main
      // image); a gallery row that can't be fulfilled is simply skipped.
      if (!file || validateImageFile(file)) continue
      const url = await uploadProductImage(file, productId)
      uploadedUrls.push(url)
      await createProductImageRecord({
        productId,
        url,
        altText: imgRow.alt_text || '',
        sortOrder: imgRow.sort_order ?? gallerySortOrder,
        isPrimary: false,
      })
      gallerySortOrder++
    }

    stage = 'Set Primary Image'
    await updateAdminProduct(productId, { image: primaryUrl })

    stage = 'Features'
    onStage?.('Saving features')
    const featureLabels = features.map((f) => f.label).filter(Boolean)
    await saveProductFeatures(productId, featureLabels)

    stage = 'Specifications'
    onStage?.('Saving specifications')
    const specEntries = specifications
      .filter((s) => s.spec_key && s.spec_value)
      .map((s) => ({ key: s.spec_key, value: s.spec_value }))
    await saveProductSpecifications(productId, specEntries)

    stage = 'Verification'
    onStage?.('Verifying')
    const verified = await getAdminProductById(productId)
    if (!verified) throw new Error('Product could not be verified after creation.')

    return {
      status: 'created',
      productCode: product.product_code,
      productName: product.name,
      productId,
      imagesUploaded: uploadedUrls.length,
      featuresCreated: featureLabels.length,
      specificationsCreated: specEntries.length,
    }
  } catch (error) {
    // KNOWN LIMITATION (found during Step 3 QA, see
    // db/migrations/0011_product_image_storage_select.sql, not yet
    // applied as of this writing): the `product-images` Storage bucket
    // has no admin SELECT policy on storage.objects, so
    // deleteProductImage()'s underlying remove() call resolves zero
    // matching rows and returns success without actually deleting
    // anything — and does NOT throw. Until 0011 is applied, this loop
    // cannot distinguish "genuinely deleted" from "silently no-op'd", so
    // `storageDeletionUnverifiable` is set whenever any URL was deleted
    // without a thrown error, and the UI must not claim "Cleanup:
    // Completed" for that case.
    const cleanup = {
      attempted: Boolean(productId) || uploadedUrls.length > 0,
      storageDeleted: [],
      storageFailed: [],
      storageDeletionUnverifiable: false,
      productRowDeleted: false,
    }
    for (const url of uploadedUrls) {
      try {
        await deleteProductImage(url)
        cleanup.storageDeleted.push(url)
        cleanup.storageDeletionUnverifiable = true
      } catch {
        cleanup.storageFailed.push(url)
      }
    }
    if (productId) {
      try {
        await deleteAdminProduct(productId)
        cleanup.productRowDeleted = true
      } catch {
        cleanup.productRowDeleted = false
      }
    }
    return fail(error.message || 'Unknown error', { cleanup })
  }
}

/**
 * Runs the full import: preflight, then strictly sequential per-product
 * writes. Never called with an empty/unvalidated workbook — the caller
 * (AdminProductImportPage.jsx) only invokes this after its own Step 2
 * review and an explicit admin confirmation.
 *
 * @param {object} parsed
 * @param {Set<number>} importableRowNumbers
 * @param {Map<string, File>} imageAssetsByFilename
 * @param {(progress: object) => void} [onProgress]
 * @param {object} [originalReview] - the Step 2 review computed BEFORE this
 *   call (buildImportReview() output) — its EXISTS/ERROR rows were never
 *   included in `importableRowNumbers` to begin with, so they'd otherwise
 *   be invisible in the final report; merged into skippedExisting/
 *   skippedErrors here purely for a complete, honest tally (they are never
 *   re-attempted or re-validated — only the fresh preflight's OWN
 *   reclassified rows go through actual re-validation).
 */
export async function runProductImport(
  parsed,
  importableRowNumbers,
  imageAssetsByFilename,
  onProgress,
  originalReview
) {
  onProgress?.({ phase: 'preflight' })
  const preflight = await preflightProductImport(parsed, importableRowNumbers, imageAssetsByFilename)
  if (!preflight.ok) {
    return { aborted: true, reason: preflight.reason }
  }

  const { categoryLookup, readyToWriteRows, imageFailures, reclassifiedExisting, reclassifiedError } = preflight

  const created = []
  const failed = imageFailures.map(({ row, reason }) => ({
    status: 'failed',
    productCode: row.product.product_code,
    productName: row.product.name,
    stage: 'Preflight — Main Image',
    reason,
    productRowCreated: false,
    imagesUploadedCount: 0,
    cleanup: null,
  }))
  const skippedExisting = [
    ...(originalReview?.rows.filter((r) => r.status === 'exists') ?? []).map((row) => ({
      productCode: row.product.product_code,
      productName: row.product.name,
      reason: 'Product code already exists in Supabase.',
    })),
    ...reclassifiedExisting.map((row) => ({
      productCode: row.product.product_code,
      productName: row.product.name,
      reason: 'Product code already exists in Supabase (detected during import preflight).',
    })),
  ]
  const skippedErrors = [
    ...(originalReview?.rows.filter((r) => r.status === 'error') ?? []).map((row) => ({
      productCode: row.product.product_code,
      productName: row.product.name,
      reason: 'Row has validation errors and was never attempted.',
    })),
    ...reclassifiedError.map((row) => ({
      productCode: row.product.product_code,
      productName: row.product.name,
      reason: 'Row failed re-validation during import preflight.',
    })),
  ]

  const total = readyToWriteRows.length
  for (let i = 0; i < total; i++) {
    const row = readyToWriteRows[i]
    onProgress?.({
      phase: 'importing',
      current: i + 1,
      total,
      productCode: row.product.product_code,
      productName: row.product.name,
      stage: 'Starting',
      counts: { created: created.length, failed: failed.length, skippedExisting: skippedExisting.length },
    })

    const outcome = await importOneProduct(row, {
      categoryLookup,
      imageAssetsByFilename,
      onStage: (stageLabel) => {
        onProgress?.({
          phase: 'importing',
          current: i + 1,
          total,
          productCode: row.product.product_code,
          productName: row.product.name,
          stage: stageLabel,
          counts: { created: created.length, failed: failed.length, skippedExisting: skippedExisting.length },
        })
      },
    })

    if (outcome.status === 'created') created.push(outcome)
    else if (outcome.status === 'skipped-existing') skippedExisting.push(outcome)
    else failed.push(outcome)
  }

  return {
    aborted: false,
    created,
    failed,
    skippedExisting,
    skippedErrors,
    totals: {
      imagesUploaded: created.reduce((sum, r) => sum + r.imagesUploaded, 0),
      featuresCreated: created.reduce((sum, r) => sum + r.featuresCreated, 0),
      specificationsCreated: created.reduce((sum, r) => sum + r.specificationsCreated, 0),
    },
  }
}
