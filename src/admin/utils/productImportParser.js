import * as XLSX from 'xlsx'

// Client-side-only Excel parsing for the future Product Catalogue Bulk
// Import system (Step 1). Turns an uploaded .xlsx File into a plain,
// normalized in-memory structure — no Supabase call, no Storage access,
// no product/category logic beyond field-shape normalization. Validation
// against categories/existing products happens separately in
// productImportValidator.js, which this module has no knowledge of.
//
// Sheet names are matched case-insensitively/trimmed against the four
// known data sheets from the approved template (Products, Images,
// Features, Specifications) — everything else (an Instructions sheet, a
// hidden Lists sheet used for Excel dropdown validation, etc.) is safely
// ignored and reported back in `ignoredSheets` for transparency, never
// treated as an error.

export class ProductImportParseError extends Error {}

const KNOWN_SHEETS = {
  products: 'Products',
  images: 'Images',
  features: 'Features',
  specifications: 'Specifications',
}

// Required columns per data sheet — checked against the sheet's own header
// row before any row is turned into data, so a genuinely malformed
// template (wrong columns entirely) fails once with one clear message
// instead of producing dozens of confusing per-row "missing" errors.
//
// Products needs ONLY name and product_code. Every other Products column
// (category, price, main_image, sku, description, ...) is optional and may
// be absent from the sheet entirely — a missing optional column must never
// reject an import. Imported products are always Drafts, so anything left
// out is completed later in the Admin before publishing.
const REQUIRED_COLUMNS = {
  products: ['product_code', 'name'],
  images: ['product_code', 'image_file'],
  features: ['product_code', 'label'],
  specifications: ['product_code', 'spec_key', 'spec_value'],
}

function normalizeHeaderKey(header) {
  return String(header ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

// Alternative header spellings real client spreadsheets use, mapped onto the
// canonical column names. An alias never overrides a canonical column that
// is present and non-blank in the same row.
const HEADER_ALIASES = {
  product_name: 'name',
  item_name: 'name',
  product: 'name',
  code: 'product_code',
  item_code: 'product_code',
  item_no: 'product_code',
  item_number: 'product_code',
  productcode: 'product_code',
  categories: 'category',
  image: 'main_image',
  main_image_file: 'main_image',
  mrp: 'original_price',
  stock: 'availability',
}

// Every raw row from XLSX.utils.sheet_to_json is keyed by its literal
// header cell text — this re-keys each row by the normalized column name
// (trim + lowercase + spaces-to-underscores) so "Product Code", "
// product_code ", and "PRODUCT_CODE" all resolve identically, without
// guessing at entirely different header spellings.
function normalizeRowKeys(row) {
  const normalized = {}
  const aliased = []
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = normalizeHeaderKey(key)
    // Blank-header columns come back from sheet_to_json as "__EMPTY",
    // "__EMPTY_1", ... — unused columns, safely ignored.
    if (!normalizedKey || key.startsWith('__EMPTY')) continue
    if (HEADER_ALIASES[normalizedKey]) aliased.push([HEADER_ALIASES[normalizedKey], value])
    else normalized[normalizedKey] = value
  }
  for (const [canonical, value] of aliased) {
    const existing = normalized[canonical]
    const hasExisting = existing !== undefined && existing !== null && String(existing).trim() !== ''
    if (!hasExisting) normalized[canonical] = value
  }
  return normalized
}

function isRowEntirelyBlank(row) {
  return Object.values(row).every(
    (value) => value === undefined || value === null || String(value).trim() === ''
  )
}

function normalizeString(value) {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

// Accepts a real number, a numeric string (with optional thousands
// commas / ₹ sign), or a blank cell. Returns `undefined` for blank (meaning "not
// provided" — the validator decides whether that's an error), or `NaN`
// for present-but-unparseable (the validator reports this as invalid,
// never silently drops it).
function normalizeNumber(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return undefined
  }
  if (typeof value === 'number') return value
  const cleaned = String(value).trim().replace(/[₹,\s]/g, '')
  const parsed = Number(cleaned)
  return cleaned === '' ? undefined : parsed
}

// Accepts a real boolean, or common spreadsheet spellings
// (TRUE/FALSE/Yes/No/1/0), case-insensitively. Blank cells fall back to
// `defaultValue` — matching the existing Admin form's own defaults
// (`featured` defaults to false; `is_primary` defaults to false).
function normalizeBoolean(value, defaultValue = false) {
  if (typeof value === 'boolean') return value
  const text = normalizeString(value).toLowerCase()
  if (text === '') return defaultValue
  if (['true', 'yes', '1'].includes(text)) return true
  if (['false', 'no', '0'].includes(text)) return false
  return defaultValue
}

// Same comma-separated-text → trimmed-array-or-null algorithm as
// AdminProductFormPage.jsx's own parseColors() — copied verbatim (not
// imported) to match this project's existing precedent of duplicating
// small pure helpers (see that file's own comment on slugify()) rather
// than reaching into an Admin form component from a utils module.
function parseColors(value) {
  const text = normalizeString(value)
  if (!text) return null
  const items = text
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
  return items.length > 0 ? items : null
}

function ensureRequiredColumns(sheetLabel, rows, requiredKeys) {
  if (rows.length === 0) return
  const presentKeys = new Set(Object.keys(rows[0]))
  const missing = requiredKeys.filter((key) => !presentKeys.has(key))
  if (missing.length > 0) {
    throw new ProductImportParseError(
      `The "${sheetLabel}" sheet is missing required column(s): ${missing.join(', ')}.`
    )
  }
}

// `file` is a browser File object (from an <input type="file"> change
// event) — read entirely in-memory via arrayBuffer(), never uploaded
// anywhere. Throws ProductImportParseError with an admin-readable message
// for every anticipated failure mode; any other unexpected parse failure
// is wrapped the same way so the caller never has to show a raw JS error.
export async function parseProductImportWorkbook(file) {
  let buffer
  try {
    buffer = await file.arrayBuffer()
  } catch {
    throw new ProductImportParseError('This file could not be read. Please try again.')
  }

  let workbook
  try {
    workbook = XLSX.read(buffer, { type: 'array' })
  } catch {
    throw new ProductImportParseError(
      'This file could not be read as a valid Excel workbook. Please check the file and try again.'
    )
  }

  const sheetsByKind = {}
  const ignoredSheets = []

  for (const sheetName of workbook.SheetNames) {
    const normalizedName = sheetName.trim().toLowerCase()
    const kind = Object.keys(KNOWN_SHEETS).find(
      (key) => KNOWN_SHEETS[key].toLowerCase() === normalizedName
    )
    if (kind) {
      sheetsByKind[kind] = workbook.Sheets[sheetName]
    } else {
      ignoredSheets.push(sheetName)
    }
  }

  if (!sheetsByKind.products) {
    throw new ProductImportParseError(
      `This workbook is missing a "${KNOWN_SHEETS.products}" sheet. Please use the approved catalogue template.`
    )
  }

  function readSheetRows(kind) {
    const sheet = sheetsByKind[kind]
    if (!sheet) return []
    // blankrows: true keeps fully empty rows in the array so the array
    // index still maps 1:1 to the sheet row; they are dropped below.
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true, blankrows: true })
    // `rowNumber` mirrors what the admin sees in Excel (the header is the
    // sheet's first used row, so the first data row is one below it). It is
    // assigned BEFORE blank rows are dropped, so it stays correct when blank
    // rows sit between data rows.
    const headerRow = sheet['!ref'] ? XLSX.utils.decode_range(sheet['!ref']).s.r + 1 : 1
    const numbered = rawRows.map((row, index) => ({
      rowNumber: headerRow + 1 + index,
      data: normalizeRowKeys(row),
    }))
    const dataRows = numbered.filter(({ data }) => !isRowEntirelyBlank(data))
    ensureRequiredColumns(
      KNOWN_SHEETS[kind],
      dataRows.map(({ data }) => data),
      REQUIRED_COLUMNS[kind]
    )
    return dataRows.map(({ rowNumber, data }) => ({ ...data, __rowNumber: rowNumber }))
  }

  const rawProducts = readSheetRows('products')
  const rawImages = readSheetRows('images')
  const rawFeatures = readSheetRows('features')
  const rawSpecifications = readSheetRows('specifications')

  const products = rawProducts.map((row) => ({
    rowNumber: row.__rowNumber,
    product_code: normalizeString(row.product_code),
    sku: normalizeString(row.sku),
    name: normalizeString(row.name),
    category: normalizeString(row.category),
    price: normalizeNumber(row.price),
    original_price: normalizeNumber(row.original_price),
    availability: normalizeString(row.availability),
    featured: normalizeBoolean(row.featured, false),
    badge: normalizeString(row.badge),
    capacity: normalizeString(row.capacity),
    rating: normalizeNumber(row.rating),
    colors: parseColors(row.colors),
    description: normalizeString(row.description),
    main_image: normalizeString(row.main_image),
  }))

  const images = rawImages.map((row) => ({
    rowNumber: row.__rowNumber,
    product_code: normalizeString(row.product_code),
    image_file: normalizeString(row.image_file),
    alt_text: normalizeString(row.alt_text),
    sort_order: normalizeNumber(row.sort_order),
    is_primary: normalizeBoolean(row.is_primary, false),
  }))

  const features = rawFeatures.map((row) => ({
    rowNumber: row.__rowNumber,
    product_code: normalizeString(row.product_code),
    label: normalizeString(row.label),
    sort_order: normalizeNumber(row.sort_order),
  }))

  const specifications = rawSpecifications.map((row) => ({
    rowNumber: row.__rowNumber,
    product_code: normalizeString(row.product_code),
    spec_key: normalizeString(row.spec_key),
    spec_value: normalizeString(row.spec_value),
    sort_order: normalizeNumber(row.sort_order),
  }))

  return {
    products,
    images,
    features,
    specifications,
    ignoredSheets,
  }
}
