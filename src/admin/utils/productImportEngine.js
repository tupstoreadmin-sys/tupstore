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
  saveProductCategories,
  saveProductFeatures,
  saveProductSpecifications,
} from '../api/adminProductApi'
import {
  validateProductImport,
  EXISTING_CODE_MESSAGE,
  DUPLICATE_CODE_IN_FILE_MESSAGE,
} from './productImportValidator'
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

// Same rules as adminProductApi.js's own (private) validateProductImageFile
// — duplicated here rather than
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

// The exact string adminProductApi.js's createAdminProduct() throws for a
// Postgres 23505 (unique violation) on products.slug, products.product_code,
// or products.sku — that function deliberately re-throws a friendly
// message-only Error rather than exposing the raw Postgres code, so this
// is the only reliable way to detect "this was actually a duplicate-key
// race" from here without changing that already-approved file. See
// "Duplicate Import Protection" in this step's task — a race that lands
// here must be reported as EXISTS/SKIPPED, never a generic FAILED.
const EXISTING_PRODUCT_RACE_MESSAGE = 'A product with this slug, product code, or SKU already exists.'

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
 */
export async function preflightProductImport(parsed, importableRowNumbers) {
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

  return {
    ok: true,
    // Images are optional: a product whose image file was not selected (or
    // is unusable) is still created as a Draft - see importOneProduct().
    readyToWriteRows: [...nowReady, ...nowWarning],
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
async function importOneProduct(row, { imageAssetsByFilename, onStage }) {
  const { product, images, features, specifications } = row
  const uploadedUrls = []
  const notes = []
  let productId = null
  let stage = 'Product Creation'

  function fail(reason, extra = {}) {
    return {
      status: 'failed',
      rowNumber: product.rowNumber,
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
    // Categories were already matched by the validator against the freshly
    // fetched list - an unmapped name is never created, only reported.
    const categoryIds = row.categoryIds

    stage = 'Product Creation'
    onStage?.('Creating product')
    let created
    try {
      created = await createAdminProduct({
        slug: row.slug,
        name: product.name,
        product_code: product.product_code,
        sku: product.sku || null,
        category_id: categoryIds[0] ?? null,
        // A blank price imports as 0 ("not priced yet"); publishing is
        // blocked in the Admin form until a price above 0 is set.
        price: product.price ?? 0,
        original_price: product.original_price ?? null,
        availability: product.availability || 'in_stock',
        featured: Boolean(product.featured),
        badge: product.badge || null,
        capacity: product.capacity || null,
        rating: product.rating ?? null,
        colors: product.colors ?? null,
        description: product.description || null,
        image: '',
        // EVERY imported product starts as a Draft - never visible to
        // customers until an admin completes it and publishes it from
        // Admin Products (image, price > 0 and a category are enforced
        // there at publish time).
        status: 'draft',
      })
    } catch (error) {
      if (error.message === EXISTING_PRODUCT_RACE_MESSAGE) {
        return {
          status: 'skipped-existing',
          rowNumber: product.rowNumber,
          productCode: product.product_code,
          productName: product.name,
          reason: 'Another session created a product with this code/slug during this import (race condition).',
        }
      }
      throw error
    }
    productId = created.id

    // Storefront category listings read product_categories (migration
    // 0026), not products.category_id. Skipped entirely for a product with
    // no matched category (it stays an uncategorised Draft).
    if (categoryIds.length > 0) {
      stage = 'Category Link'
      await saveProductCategories(productId, categoryIds)
    }

    // Images are optional. Work out which of the referenced files were
    // actually selected and usable; the first becomes the primary image.
    const mainImageBasename = basename(product.main_image)
    const wanted = []
    if (mainImageBasename) {
      const file = imageAssetsByFilename.get(mainImageBasename)
      if (!file) notes.push(`Main image "${mainImageBasename}" was not among the selected image files.`)
      else if (validateImageFile(file)) notes.push(`Main image "${mainImageBasename}": ${validateImageFile(file)}`)
      else wanted.push({ file, altText: '' })
    }
    for (const imgRow of images) {
      const name = basename(imgRow.image_file)
      if (!name || name === mainImageBasename) continue
      const file = imageAssetsByFilename.get(name)
      if (!file || validateImageFile(file)) {
        notes.push(`Gallery image "${name}" was skipped (not selected or not a valid image).`)
        continue
      }
      wanted.push({ file, altText: imgRow.alt_text || '', sortOrder: imgRow.sort_order })
    }

    if (wanted.length > 0) {
      stage = 'Primary Image Upload'
      onStage?.('Uploading images')
      const primaryUrl = await uploadProductImage(wanted[0].file, productId)
      uploadedUrls.push(primaryUrl)

      stage = 'Primary Image Record'
      await createProductImageRecord({
        productId,
        url: primaryUrl,
        altText: wanted[0].altText,
        sortOrder: 0,
        isPrimary: true,
      })

      stage = 'Gallery Images'
      let gallerySortOrder = 1
      for (const item of wanted.slice(1)) {
        const url = await uploadProductImage(item.file, productId)
        uploadedUrls.push(url)
        await createProductImageRecord({
          productId,
          url,
          altText: item.altText,
          sortOrder: item.sortOrder ?? gallerySortOrder,
          isPrimary: false,
        })
        gallerySortOrder++
      }

      stage = 'Set Primary Image'
      await updateAdminProduct(productId, { image: primaryUrl })
    }

    stage = 'Features'
    onStage?.('Saving features')
    const featureLabels = features.map((f) => f.label).filter(Boolean)
    if (featureLabels.length > 0) await saveProductFeatures(productId, featureLabels)

    stage = 'Specifications'
    onStage?.('Saving specifications')
    const specEntries = specifications
      .filter((s) => s.spec_key && s.spec_value)
      .map((s) => ({ key: s.spec_key, value: s.spec_value }))
    if (specEntries.length > 0) await saveProductSpecifications(productId, specEntries)

    stage = 'Verification'
    onStage?.('Verifying')
    const verified = await getAdminProductById(productId)
    if (!verified) throw new Error('Product could not be verified after creation.')

    return {
      status: 'created',
      rowNumber: product.rowNumber,
      productCode: product.product_code,
      productName: product.name,
      productId,
      imagesUploaded: uploadedUrls.length,
      featuresCreated: featureLabels.length,
      specificationsCreated: specEntries.length,
      categoryNames: row.categoryNames,
      unmappedCategories: row.unmappedCategories,
      hasPrice: (product.price ?? 0) > 0,
      hasImage: uploadedUrls.length > 0,
      notes,
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

function describeSkippedRow(row) {
  const reasons = row.errors.map((f) => f.message)
  const missing = reasons.some((m) => m === 'Missing product_code' || m === 'Missing product name')
  const duplicate = reasons.some(
    (m) => m === DUPLICATE_CODE_IN_FILE_MESSAGE || m === EXISTING_CODE_MESSAGE
  )
  return {
    rowNumber: row.product.rowNumber,
    productCode: row.product.product_code,
    productName: row.product.name,
    reasons,
    reason: reasons.length > 0 ? reasons.join('; ') : 'Row has validation errors and was never attempted.',
    // missing > duplicate > other, so a row is counted under one heading.
    kind: missing ? 'missing' : duplicate ? 'duplicate' : 'other',
  }
}

/**
 * Runs the full import: preflight, then strictly sequential per-product
 * writes. Never called with an empty/unvalidated workbook — the caller
 * (AdminProductImportPage.jsx) only invokes this after its own Step 2
 * review and an explicit admin confirmation.
 *
 * Every created product is a Draft. Rows missing Name or Product Code,
 * rows whose Product Code already exists (in Supabase or repeated in the
 * file) and any other invalid row are skipped and reported with their
 * Excel row number; the remaining valid rows are still imported.
 *
 * @param {object} parsed
 * @param {Set<number>} importableRowNumbers
 * @param {Map<string, File>} imageAssetsByFilename - optional; may be empty
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
  const preflight = await preflightProductImport(parsed, importableRowNumbers)
  if (!preflight.ok) {
    return { aborted: true, reason: preflight.reason }
  }

  const { readyToWriteRows, reclassifiedExisting, reclassifiedError } = preflight

  const created = []
  const failed = []
  const skippedExisting = [
    ...(originalReview?.rows.filter((r) => r.status === 'exists') ?? []).map((row) => ({
      rowNumber: row.product.rowNumber,
      productCode: row.product.product_code,
      productName: row.product.name,
      reason: 'Duplicate Product Code — already exists in the catalogue. Skipped, not modified.',
    })),
    ...reclassifiedExisting.map((row) => ({
      rowNumber: row.product.rowNumber,
      productCode: row.product.product_code,
      productName: row.product.name,
      reason:
        'Duplicate Product Code — already exists in the catalogue (detected during import preflight). Skipped, not modified.',
    })),
  ]
  const skippedErrors = [
    ...(originalReview?.rows.filter((r) => r.status === 'error') ?? []).map(describeSkippedRow),
    ...reclassifiedError.map(describeSkippedRow),
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

  // Report-friendly breakdown (the headline numbers on the result screen).
  const duplicateProductCodes = [
    ...skippedExisting,
    ...skippedErrors.filter((item) => item.kind === 'duplicate'),
  ]
  const missingRequired = skippedErrors.filter((item) => item.kind === 'missing')
  const unmappedCategories = created
    .filter((item) => item.unmappedCategories.length > 0)
    .map((item) => ({
      rowNumber: item.rowNumber,
      productCode: item.productCode,
      productName: item.productName,
      unmapped: item.unmappedCategories,
    }))

  return {
    aborted: false,
    created,
    failed,
    skippedExisting,
    skippedErrors,
    duplicateProductCodes,
    missingRequired,
    unmappedCategories,
    totals: {
      imagesUploaded: created.reduce((sum, r) => sum + r.imagesUploaded, 0),
      featuresCreated: created.reduce((sum, r) => sum + r.featuresCreated, 0),
      specificationsCreated: created.reduce((sum, r) => sum + r.specificationsCreated, 0),
    },
  }
}
