import { supabase } from '../lib/supabase'
import { handleApiError } from '../utils/handleApiError'

// Raw Supabase queries only — no mapping, no shaping, no knowledge of the
// app's Product/Category models. SupabaseProductRepository is responsible
// for turning what these functions return into that shape.
//
// Every product query embeds its category name, features, specifications,
// and gallery images via PostgREST foreign-table embedding — one query, not
// N+1 round trips. The embed is still "just a query" (declarative, no JS
// joining logic here); flattening the embedded rows into the Product
// model's shape is the mapper's job, not this file's.
const PRODUCT_SELECT = `
  *,
  categories ( name, slug ),
  product_features ( label, sort_order ),
  product_specifications ( spec_key, spec_value, sort_order ),
  product_images ( url, alt_text, sort_order, is_primary )
`

// The price slider's own max value (ProductFilters.jsx: max={3000}, label
// "₹3,000+") — ShopPage.jsx initializes priceMax to this same value, so at
// that setting "₹3,000+" means "no upper limit" (the price filter is
// skipped entirely), not "price >= 3000" — the latter would make the
// default, untouched Shop page load with zero products whenever every
// product happens to be priced under ₹3,000. Below this value it's a
// normal upper cap, unchanged.
const PRICE_SLIDER_MAX = 3000

// `.or()` filter strings use `,`/`.`/`(`/`)` as syntax — escape them out of
// a user-typed search term so a literal comma or parenthesis can't be
// misread as separating/grouping conditions. `.ilike()` calls made outside
// `.or()` don't need this; only values embedded in an `.or()` string do.
function escapeOrFilterValue(value) {
  return value.replace(/[,.()\\]/g, '\\$&')
}

/**
 * @param {import('../services/products/ProductRepository').ProductFilters} [filters]
 */
export async function getProducts({ search, category, priceMax, inStockOnly } = {}) {
  let query = supabase.from('products').select(PRODUCT_SELECT)

  if (search) {
    const escaped = escapeOrFilterValue(search)
    const orParts = [
      `name.ilike.%${escaped}%`,
      `product_code.ilike.%${escaped}%`,
      `description.ilike.%${escaped}%`,
    ]

    // Category name isn't a column on `products` — resolve it to matching
    // category ids first (categories is a small, already-fetched-elsewhere
    // reference table, so this is a cheap second query, not a full-catalog
    // scan), then fold those ids into the same OR group as an `in` clause.
    const { data: matchingCategories, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', `%${search}%`)
    handleApiError(categoryError, 'getProducts (category name search)')

    if (matchingCategories && matchingCategories.length > 0) {
      orParts.push(`category_id.in.(${matchingCategories.map((c) => c.id).join(',')})`)
    }

    query = query.or(orParts.join(','))
  }
  if (category && category !== 'all') query = query.eq('category_id', category)
  if (typeof priceMax === 'number' && priceMax < PRICE_SLIDER_MAX) {
    query = query.lte('price', priceMax)
  }
  if (inStockOnly) query = query.eq('availability', 'in_stock')

  const { data, error } = await query
  handleApiError(error, 'getProducts')
  return data
}

// Most-recently-marked-featured-first — products.updated_at already ticks
// forward on every save via trg_products_updated_at (schema.sql), so
// toggling Featured on in the Admin Product form and saving is enough to
// bring a product to the front of Featured Highlights. Without this order,
// which rows win this `limit` and in what sequence was left to Postgres's
// unspecified default order — unpredictable once more than `limit` products
// are ever marked featured at once.
export async function getFeaturedProducts(limit = 4) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('featured', true)
    .order('updated_at', { ascending: false })
    .limit(limit)

  handleApiError(error, 'getFeaturedProducts')
  return data
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
  handleApiError(error, 'getCategories')
  return data
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .maybeSingle()

  handleApiError(error, 'getProductById')
  return data
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .maybeSingle()

  handleApiError(error, 'getProductBySlug')
  return data
}

export async function getRelatedProducts(categoryId, excludeId, limit = 4) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .limit(limit)

  handleApiError(error, 'getRelatedProducts')
  return data
}

export async function searchProducts(query) {
  if (!query) return []
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .ilike('name', `%${query}%`)

  handleApiError(error, 'searchProducts')
  return data
}
