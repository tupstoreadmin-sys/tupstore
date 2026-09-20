// Step 2 — Import Review derivation. Consumes the already-computed output
// of productImportParser.js/productImportValidator.js (Step 1, untouched)
// and re-organizes it into a per-row view model for the review screen: one
// row per parsed product, its single status badge, its own images/
// features/specifications, its matched existing Supabase product (if any),
// slug-collision detail, and errors grouped by sheet then message for the
// improved Error Panel.
//
// This file adds NO new validation rules — it only reads the findings
// productImportValidator.js already produced and re-shapes them for
// display. No Supabase call, no write of any kind.

// Same algorithm as AdminProductFormPage.jsx's own slugify() and
// productImportValidator.js's own copy — duplicated a third time here per
// this project's existing precedent (see productImportValidator.js's own
// comment on this) rather than exporting/importing across files. Needed
// here only to *display* the slug a collision refers to, not to
// re-validate anything.
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

function groupByKey(items, keyFn) {
  const groups = new Map()
  for (const item of items) {
    const key = keyFn(item)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(item)
  }
  return groups
}

const EXISTING_CODE_MESSAGE = 'Existing product code — import mode not implemented yet.'
const EXISTING_SLUG_MESSAGE = 'A product with this generated slug already exists'
const DUPLICATE_SLUG_PREFIX = 'Duplicate slug generated from name'

// Status priority, per spec: ERROR > EXISTS > WARNING > READY. A product
// whose ONLY problem is "its product_code already exists" is EXISTS, not
// ERROR — that is a distinct, non-blocking-in-the-same-way condition with
// its own panel (see buildImportReview's existingMatch). Any other error
// (including a slug collision) still takes priority over EXISTS.
function computeStatus({ hasNonExistingError, isExisting, hasWarning }) {
  if (hasNonExistingError) return 'error'
  if (isExisting) return 'exists'
  if (hasWarning) return 'warning'
  return 'ready'
}

/**
 * @param {object} parsed - result of parseProductImportWorkbook()
 * @param {object} validation - result of validateProductImport()
 * @param {{id: string, slug: string, product_code: string|null, name?: string}[]} existingProducts
 */
export function buildImportReview(parsed, validation, existingProducts) {
  const imagesByCode = groupByKey(parsed.images, (row) => normalizedKey(row.product_code))
  const featuresByCode = groupByKey(parsed.features, (row) => normalizedKey(row.product_code))
  const specsByCode = groupByKey(parsed.specifications, (row) => normalizedKey(row.product_code))
  const existingByCode = new Map(
    existingProducts.filter((p) => p.product_code).map((p) => [normalizedKey(p.product_code), p])
  )
  // Findings tied to a product come from two distinct places: the
  // Products sheet's OWN row (matched by exact rowNumber — this is the
  // only reliable key when product_code itself is blank, since "Missing
  // product_code" necessarily has an empty productCode and would
  // otherwise never attach to any row), and child-sheet findings
  // (Images/Features/Specifications), which can only ever reference a
  // product via a non-blank product_code.
  const productsSheetErrorsByRow = groupByKey(
    validation.errors.filter((f) => f.sheet === 'Products'),
    (f) => f.rowNumber
  )
  const productsSheetWarningsByRow = groupByKey(
    validation.warnings.filter((f) => f.sheet === 'Products'),
    (f) => f.rowNumber
  )
  const childErrorsByCode = groupByKey(
    validation.errors.filter((f) => f.sheet !== 'Products' && f.productCode),
    (f) => normalizedKey(f.productCode)
  )
  const childWarningsByCode = groupByKey(
    validation.warnings.filter((f) => f.sheet !== 'Products' && f.productCode),
    (f) => normalizedKey(f.productCode)
  )

  const rows = parsed.products.map((product) => {
    const code = normalizedKey(product.product_code)
    const productErrors = [
      ...(productsSheetErrorsByRow.get(product.rowNumber) ?? []),
      ...(code ? childErrorsByCode.get(code) ?? [] : []),
    ]
    const productWarnings = [
      ...(productsSheetWarningsByRow.get(product.rowNumber) ?? []),
      ...(code ? childWarningsByCode.get(code) ?? [] : []),
    ]
    const nonExistingErrors = productErrors.filter((f) => f.message !== EXISTING_CODE_MESSAGE)
    const existingMatch = existingByCode.get(code) ?? null

    return {
      product,
      status: computeStatus({
        hasNonExistingError: nonExistingErrors.length > 0,
        isExisting: Boolean(existingMatch),
        hasWarning: productWarnings.length > 0,
      }),
      errors: productErrors,
      warnings: productWarnings,
      existingMatch,
      images: [...(imagesByCode.get(code) ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
      features: [...(featuresByCode.get(code) ?? [])].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      ),
      specifications: [...(specsByCode.get(code) ?? [])].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      ),
    }
  })

  const summary = {
    totalProducts: rows.length,
    readyCount: rows.filter((r) => r.status === 'ready').length,
    errorCount: rows.filter((r) => r.status === 'error').length,
    warningCount: rows.filter((r) => r.status === 'warning').length,
    existingCodeCount: rows.filter((r) => r.status === 'exists').length,
    existingSlugCount: validation.errors.filter((f) => f.message === EXISTING_SLUG_MESSAGE).length,
  }

  // ── Slug collisions — both within-file duplicates and against Supabase ──
  const slugCollisions = []
  for (const row of rows) {
    if (!row.product.name) continue
    const slug = slugify(row.product.name)
    if (row.errors.some((f) => f.message.startsWith(DUPLICATE_SLUG_PREFIX))) {
      slugCollisions.push({
        productCode: row.product.product_code,
        productName: row.product.name,
        slug,
        type: 'duplicate-in-file',
      })
    }
    if (row.errors.some((f) => f.message === EXISTING_SLUG_MESSAGE)) {
      slugCollisions.push({
        productCode: row.product.product_code,
        productName: row.product.name,
        slug,
        type: 'existing-in-supabase',
      })
    }
  }

  // ── Errors grouped by sheet, then by exact message ──────────────────────
  // Two different ways to resolve "which product does this finding belong
  // to, for display purposes": a Products-sheet finding always has an
  // exact row of its own (by rowNumber) — used here instead of a
  // product_code lookup specifically because product_code can be
  // duplicated (that's one of the very things being flagged), which would
  // make a code→name map ambiguous. A child-sheet finding (Images/
  // Features/Specifications) has no row of its own to fall back to, so it
  // still resolves by product_code — accepting that a duplicate code there
  // is an inherent, already-separately-flagged ambiguity.
  const productNameByRow = new Map(parsed.products.map((p) => [p.rowNumber, p.name]))
  const productNameByCode = new Map(
    parsed.products.filter((p) => p.product_code).map((p) => [normalizedKey(p.product_code), p.name])
  )
  function resolveProductName(finding) {
    if (finding.sheet === 'Products') return productNameByRow.get(finding.rowNumber) ?? ''
    return productNameByCode.get(normalizedKey(finding.productCode)) ?? ''
  }
  const warningsWithNames = validation.warnings.map((f) => ({
    ...f,
    productName: resolveProductName(f),
  }))
  const bySheet = groupByKey(validation.errors, (f) => f.sheet)
  const errorGroups = [...bySheet.entries()].map(([sheet, findings]) => {
    const byMessage = groupByKey(findings, (f) => f.message)
    return {
      sheet,
      messageGroups: [...byMessage.entries()].map(([message, items]) => ({
        message,
        findings: items.map((f) => ({
          ...f,
          productName: resolveProductName(f),
        })),
      })),
    }
  })

  return { rows, summary, slugCollisions, errorGroups, warningsWithNames }
}
