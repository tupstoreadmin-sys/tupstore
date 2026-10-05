// Pure, local validation for the future Product Catalogue Bulk Import
// system (Step 1). Takes the already-parsed workbook (productImportParser.js)
// plus two read-only reference lists the caller fetched from Supabase
// (existing categories, existing products) and returns a structured report.
// This module makes no Supabase calls itself and performs no writes of any
// kind — it only reads the two arrays it's given.

// Same algorithm as AdminProductFormPage.jsx's own slugify() — copied
// verbatim (not imported) per this project's existing precedent of
// duplicating small pure helpers across admin files rather than reaching
// into a form component from a utils module. Keep this in sync with that
// file if its algorithm ever changes.
function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Same three values as AdminProductFormPage.jsx's AVAILABILITY_OPTIONS.
const VALID_AVAILABILITY = ['in_stock', 'out_of_stock', 'preorder']

// Same two named values as AdminProductFormPage.jsx's BADGE_OPTIONS (the
// third option there, '', is "no badge" — represented here as simply not
// being in this list, matching the blank-is-allowed check below rather
// than a literal '' entry).
const VALID_BADGES = ['Best Seller', 'New Arrival']

// Shared with productImportReview.js, which classifies rows by these exact
// messages.
export const EXISTING_CODE_MESSAGE =
  'Duplicate Product Code - a product with this code already exists. Skipped, not modified.'
export const DUPLICATE_CODE_IN_FILE_MESSAGE = 'Duplicate Product Code in this file'
export const EXISTING_SLUG_MESSAGE = 'A product with this generated slug already exists'

function normalizedKey(value) {
  return (value ?? '').trim().toLowerCase()
}

function addFinding(list, { severity, sheet, rowNumber, productCode, message }) {
  list.push({ severity, sheet, rowNumber, productCode: productCode || '', message })
}

function buildCategoryLookup(categories) {
  const map = new Map()
  for (const category of categories) {
    map.set(normalizedKey(category.name), category)
    if (category.slug) map.set(normalizedKey(category.slug), category)
  }
  return map
}

// Category cell -> matched existing categories + unmatched names. Categories
// are NEVER created by the import: a name/slug that matches nothing is
// reported back as "unmapped" and the product is imported without it. The
// whole cell is tried first (so a category whose own name contains a comma
// still matches); only if that fails is it split into several categories on
// `|`, `;` or `,`.
export function resolveCategoryText(text, categoryLookup) {
  const result = { categoryIds: [], categoryNames: [], unmapped: [] }
  const value = (text ?? '').trim()
  if (!value) return result

  const whole = categoryLookup.get(normalizedKey(value))
  if (whole) {
    result.categoryIds.push(whole.id)
    result.categoryNames.push(whole.name)
    return result
  }

  for (const part of value.split(/[|;,]/).map((p) => p.trim()).filter(Boolean)) {
    const match = categoryLookup.get(normalizedKey(part))
    if (!match) result.unmapped.push(part)
    else if (!result.categoryIds.includes(match.id)) {
      result.categoryIds.push(match.id)
      result.categoryNames.push(match.name)
    }
  }
  return result
}

function groupByKey(rows, keyFn) {
  const groups = new Map()
  for (const row of rows) {
    const key = keyFn(row)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  }
  return groups
}

/**
 * @param {object} parsed - the object returned by parseProductImportWorkbook()
 * @param {object} reference
 * @param {{id: string, name: string, slug: string}[]} reference.categories
 * @param {{id: string, slug: string, product_code: string|null, sku: string|null}[]} reference.existingProducts
 */
export function validateProductImport(parsed, { categories, existingProducts }) {
  const errors = []
  const warnings = []
  // Informational findings (currently: unmapped categories). They never
  // block a row and never need acknowledging.
  const info = []

  const categoryLookup = buildCategoryLookup(categories)
  const existingProductCodes = new Set(
    existingProducts
      .map((p) => p.product_code)
      .filter(Boolean)
      .map(normalizedKey)
  )
  const existingSkus = new Set(
    existingProducts
      .map((p) => p.sku)
      .filter(Boolean)
      .map(normalizedKey)
  )
  const existingSlugs = new Set(existingProducts.map((p) => normalizedKey(p.slug)))

  const productCodesInFile = new Set(
    parsed.products.filter((p) => p.product_code).map((p) => normalizedKey(p.product_code))
  )

  // ── Products sheet ────────────────────────────────────────────────────
  const productCodeGroups = groupByKey(
    parsed.products.filter((p) => p.product_code),
    (p) => normalizedKey(p.product_code)
  )
  const skuGroups = groupByKey(
    parsed.products.filter((p) => p.sku),
    (p) => normalizedKey(p.sku)
  )
  const slugGroups = groupByKey(
    parsed.products.filter((p) => p.name),
    (p) => slugify(p.name)
  )

  // Per-row derived data the review/engine need: the slug the product will
  // be created with, and its resolved/unmapped categories.
  const rowInfo = new Map()
  const takenSlugs = new Set(existingSlugs)

  for (const product of parsed.products) {
    const ctx = { sheet: 'Products', rowNumber: product.rowNumber, productCode: product.product_code }
    let duplicateCodeInFile = false

    // Only Name and Product Code are mandatory.
    if (!product.product_code) {
      addFinding(errors, { ...ctx, severity: 'error', message: 'Missing product_code' })
    } else {
      if (productCodeGroups.get(normalizedKey(product.product_code)).length > 1) {
        duplicateCodeInFile = true
        addFinding(errors, { ...ctx, severity: 'error', message: DUPLICATE_CODE_IN_FILE_MESSAGE })
      }
      if (existingProductCodes.has(normalizedKey(product.product_code))) {
        addFinding(errors, { ...ctx, severity: 'error', message: EXISTING_CODE_MESSAGE })
      }
    }

    if (product.sku) {
      if (skuGroups.get(normalizedKey(product.sku)).length > 1) {
        addFinding(errors, { ...ctx, severity: 'error', message: 'Duplicate SKU in this file' })
      }
      if (existingSkus.has(normalizedKey(product.sku))) {
        addFinding(errors, {
          ...ctx,
          severity: 'error',
          message: 'A product with this SKU already exists',
        })
      }
    }

    // Slug: from the name; when that is already used (by an existing product
    // or another row in this file) the product code is appended so products
    // that share a name but have different codes can all be imported.
    // Only an unresolvable collision is an error.
    let slug = ''
    if (!product.name) {
      addFinding(errors, { ...ctx, severity: 'error', message: 'Missing product name' })
    } else {
      const base = slugify(product.name)
      const sharedInFile = base ? slugGroups.get(base).length > 1 : false
      if (base && !sharedInFile && !existingSlugs.has(base)) {
        slug = base
      } else if (product.product_code && !duplicateCodeInFile) {
        const withCode = slugify(`${product.name} ${product.product_code}`)
        if (withCode && withCode !== base && !takenSlugs.has(withCode)) {
          slug = withCode
        } else {
          addFinding(errors, {
            ...ctx,
            severity: 'error',
            message: EXISTING_SLUG_MESSAGE,
          })
        }
      }
      if (slug) takenSlugs.add(slug)
    }

    // Category is optional. A value that matches no existing category is
    // reported as unmapped (never created, never an error): the product is
    // still imported - as a Draft without that category.
    const categoryMatch = resolveCategoryText(product.category, categoryLookup)
    if (categoryMatch.unmapped.length > 0) {
      addFinding(info, {
        ...ctx,
        severity: 'info',
        message: `Unmapped category: ${categoryMatch.unmapped.map((n) => `"${n}"`).join(', ')}`,
      })
    }

    rowInfo.set(product.rowNumber, {
      slug,
      categoryIds: categoryMatch.categoryIds,
      categoryNames: categoryMatch.categoryNames,
      unmappedCategories: categoryMatch.unmapped,
    })

    // Price is optional (blank / 0 = not priced yet - the product stays a
    // Draft until an admin sets one). A present value must still be a
    // valid, non-negative number.
    if (product.price !== undefined) {
      if (Number.isNaN(product.price)) {
        addFinding(errors, { ...ctx, severity: 'error', message: 'Price is not a valid number' })
      } else if (product.price < 0) {
        addFinding(errors, { ...ctx, severity: 'error', message: 'Price cannot be negative' })
      }
    }

    if (product.original_price !== undefined) {
      if (Number.isNaN(product.original_price)) {
        addFinding(errors, {
          ...ctx,
          severity: 'error',
          message: 'Original price is not a valid number',
        })
      } else if (product.original_price < 0) {
        addFinding(errors, {
          ...ctx,
          severity: 'error',
          message: 'Original price cannot be negative',
        })
      } else if (
        typeof product.price === 'number' &&
        !Number.isNaN(product.price) &&
        product.price > 0 &&
        product.original_price > 0 &&
        product.original_price < product.price
      ) {
        addFinding(warnings, {
          ...ctx,
          severity: 'warning',
          message: 'Original price is lower than price',
        })
      }
    }

    if (product.availability && !VALID_AVAILABILITY.includes(product.availability)) {
      addFinding(errors, {
        ...ctx,
        severity: 'error',
        message: `Invalid availability: "${product.availability}"`,
      })
    }

    // Same case-sensitive exact-match convention as VALID_AVAILABILITY
    // above (product.badge is already trimmed by normalizeString() in
    // productImportParser.js) - a blank badge is allowed (no badge), but a
    // non-blank value must match one of the two canonical strings exactly.
    // Never silently coerced/lowercased into a valid value - a near-miss
    // like "Best seller" is rejected, not corrected.
    if (product.badge && !VALID_BADGES.includes(product.badge)) {
      addFinding(errors, {
        ...ctx,
        severity: 'error',
        message: 'Badge must be Best Seller, New Arrival, or blank.',
      })
    }

    if (product.rating !== undefined) {
      if (Number.isNaN(product.rating)) {
        addFinding(errors, { ...ctx, severity: 'error', message: 'Rating is not a valid number' })
      } else if (product.rating < 0 || product.rating > 5) {
        addFinding(errors, {
          ...ctx,
          severity: 'error',
          message: 'Rating must be between 0 and 5',
        })
      }
    }
  }

  // ── Images sheet ──────────────────────────────────────────────────────
  const imageDuplicateGroups = groupByKey(
    parsed.images.filter((row) => row.product_code && row.image_file),
    (row) => `${normalizedKey(row.product_code)}::${normalizedKey(row.image_file)}`
  )
  const seenImageGroupKeys = new Set()

  for (const image of parsed.images) {
    const ctx = { sheet: 'Images', rowNumber: image.rowNumber, productCode: image.product_code }

    if (!productCodesInFile.has(normalizedKey(image.product_code))) {
      addFinding(errors, {
        ...ctx,
        severity: 'error',
        message: 'References a product_code that does not exist in the Products sheet',
      })
      continue
    }

    if (image.image_file) {
      const groupKey = `${normalizedKey(image.product_code)}::${normalizedKey(image.image_file)}`
      const group = imageDuplicateGroups.get(groupKey)
      if (group.length > 1) {
        if (seenImageGroupKeys.has(groupKey)) {
          addFinding(warnings, {
            ...ctx,
            severity: 'warning',
            message: 'Duplicate image_file reference for this product',
          })
        }
        seenImageGroupKeys.add(groupKey)
      }
    }
  }

  // ── Features sheet ────────────────────────────────────────────────────
  const featureLabelGroups = groupByKey(
    parsed.features.filter((row) => row.product_code && row.label),
    (row) => `${normalizedKey(row.product_code)}::${normalizedKey(row.label)}`
  )
  const seenFeatureGroupKeys = new Set()

  for (const feature of parsed.features) {
    const ctx = { sheet: 'Features', rowNumber: feature.rowNumber, productCode: feature.product_code }

    if (!productCodesInFile.has(normalizedKey(feature.product_code))) {
      addFinding(errors, {
        ...ctx,
        severity: 'error',
        message: 'References a product_code that does not exist in the Products sheet',
      })
      continue
    }

    if (feature.label) {
      const groupKey = `${normalizedKey(feature.product_code)}::${normalizedKey(feature.label)}`
      const group = featureLabelGroups.get(groupKey)
      if (group.length > 1) {
        if (seenFeatureGroupKeys.has(groupKey)) {
          addFinding(warnings, {
            ...ctx,
            severity: 'warning',
            message: 'Duplicate feature label for this product',
          })
        }
        seenFeatureGroupKeys.add(groupKey)
      }
    }
  }

  // ── Specifications sheet ──────────────────────────────────────────────
  const specKeyGroups = groupByKey(
    parsed.specifications.filter((row) => row.product_code && row.spec_key),
    (row) => `${normalizedKey(row.product_code)}::${normalizedKey(row.spec_key)}`
  )
  const seenSpecGroupKeys = new Set()

  for (const spec of parsed.specifications) {
    const ctx = {
      sheet: 'Specifications',
      rowNumber: spec.rowNumber,
      productCode: spec.product_code,
    }

    if (!productCodesInFile.has(normalizedKey(spec.product_code))) {
      addFinding(errors, {
        ...ctx,
        severity: 'error',
        message: 'References a product_code that does not exist in the Products sheet',
      })
      continue
    }

    if (!spec.spec_key) {
      addFinding(errors, { ...ctx, severity: 'error', message: 'Specification key is blank' })
    }
    if (!spec.spec_value) {
      addFinding(errors, { ...ctx, severity: 'error', message: 'Specification value is blank' })
    }

    if (spec.spec_key) {
      const groupKey = `${normalizedKey(spec.product_code)}::${normalizedKey(spec.spec_key)}`
      const group = specKeyGroups.get(groupKey)
      if (group.length > 1) {
        if (seenSpecGroupKeys.has(groupKey)) {
          addFinding(errors, {
            ...ctx,
            severity: 'error',
            message: 'Duplicate specification key for this product',
          })
        }
        seenSpecGroupKeys.add(groupKey)
      }
    }
  }

  // A product "would import cleanly" if it has a product_code and no error
  // anywhere in the file is attributed to that code — including errors
  // raised from the Images/Features/Specifications sheets, since those
  // would also block a real import of that product's full data.
  const codesWithErrors = new Set(
    errors.filter((finding) => finding.productCode).map((finding) => normalizedKey(finding.productCode))
  )
  const validProductCodes = new Set(
    parsed.products
      .filter((p) => p.product_code && !codesWithErrors.has(normalizedKey(p.product_code)))
      .map((p) => normalizedKey(p.product_code))
  )

  const summary = {
    totalProducts: parsed.products.length,
    validProducts: validProductCodes.size,
    errorCount: errors.length,
    warningCount: warnings.length,
  }

  return { errors, warnings, info, rowInfo, validProductCodes: [...validProductCodes], summary }
}
