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
 * @param {{id: string, slug: string, product_code: string|null}[]} reference.existingProducts
 */
export function validateProductImport(parsed, { categories, existingProducts }) {
  const errors = []
  const warnings = []

  const categoryLookup = buildCategoryLookup(categories)
  const existingProductCodes = new Set(
    existingProducts
      .map((p) => p.product_code)
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
  const slugGroups = groupByKey(
    parsed.products.filter((p) => p.name),
    (p) => slugify(p.name)
  )

  for (const product of parsed.products) {
    const ctx = { sheet: 'Products', rowNumber: product.rowNumber, productCode: product.product_code }

    if (!product.product_code) {
      addFinding(errors, { ...ctx, severity: 'error', message: 'Missing product_code' })
    } else {
      if (productCodeGroups.get(normalizedKey(product.product_code)).length > 1) {
        addFinding(errors, { ...ctx, severity: 'error', message: 'Duplicate product_code in this file' })
      }
      if (existingProductCodes.has(normalizedKey(product.product_code))) {
        addFinding(errors, {
          ...ctx,
          severity: 'error',
          message: 'Existing product code — import mode not implemented yet.',
        })
      }
    }

    if (!product.name) {
      addFinding(errors, { ...ctx, severity: 'error', message: 'Missing product name' })
    } else {
      const slug = slugify(product.name)
      if (slugGroups.get(slug).length > 1) {
        addFinding(errors, {
          ...ctx,
          severity: 'error',
          message: 'Duplicate slug generated from name (already used by another row in this file)',
        })
      } else if (existingSlugs.has(slug)) {
        addFinding(errors, {
          ...ctx,
          severity: 'error',
          message: 'A product with this generated slug already exists',
        })
      }
    }

    if (!product.category) {
      addFinding(errors, { ...ctx, severity: 'error', message: 'Missing category' })
    } else if (!categoryLookup.has(normalizedKey(product.category))) {
      addFinding(errors, {
        ...ctx,
        severity: 'error',
        message: `Invalid category: "${product.category}"`,
      })
    }

    if (product.price === undefined) {
      addFinding(errors, { ...ctx, severity: 'error', message: 'Missing price' })
    } else if (Number.isNaN(product.price)) {
      addFinding(errors, { ...ctx, severity: 'error', message: 'Price is not a valid number' })
    } else if (product.price < 0) {
      addFinding(errors, { ...ctx, severity: 'error', message: 'Price cannot be negative' })
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

    if (!product.main_image) {
      addFinding(errors, { ...ctx, severity: 'error', message: 'Missing main_image' })
    }

    const blankOptionalFields = []
    if (!product.badge) blankOptionalFields.push('badge')
    if (!product.capacity) blankOptionalFields.push('capacity')
    if (product.rating === undefined) blankOptionalFields.push('rating')
    if (!product.colors) blankOptionalFields.push('colors')
    if (!product.description) blankOptionalFields.push('description')
    if (!product.availability) blankOptionalFields.push('availability')
    if (blankOptionalFields.length > 0) {
      addFinding(warnings, {
        ...ctx,
        severity: 'warning',
        message: `Optional fields left blank: ${blankOptionalFields.join(', ')}`,
      })
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

  // ── Per-product "nothing beyond the basics" warnings ─────────────────
  for (const product of parsed.products) {
    if (!product.product_code) continue
    const code = normalizedKey(product.product_code)
    const ctx = { sheet: 'Products', rowNumber: product.rowNumber, productCode: product.product_code }

    const imageCount = parsed.images.filter((row) => normalizedKey(row.product_code) === code).length
    const featureCount = parsed.features.filter((row) => normalizedKey(row.product_code) === code).length
    const specCount = parsed.specifications.filter(
      (row) => normalizedKey(row.product_code) === code
    ).length

    if (imageCount === 0) {
      addFinding(warnings, {
        ...ctx,
        severity: 'warning',
        message: 'No gallery images beyond the main image',
      })
    }
    if (featureCount === 0) {
      addFinding(warnings, { ...ctx, severity: 'warning', message: 'No features listed' })
    }
    if (specCount === 0) {
      addFinding(warnings, { ...ctx, severity: 'warning', message: 'No specifications listed' })
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

  return { errors, warnings, validProductCodes: [...validProductCodes], summary }
}
