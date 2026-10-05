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
  product_category_links:product_categories ( category_id ),
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
// A product can belong to several categories (product_categories). Filtering
// by category therefore uses an inner-joined embed under its own alias —
// separate from the always-present `product_category_links` embed in
// PRODUCT_SELECT, which must keep returning ALL of a product's categories,
// not just the filtered one. `!inner` drops products with no matching link,
// and each product still comes back exactly once (the unique
// (product_id, category_id) constraint makes duplicate links impossible).
const CATEGORY_FILTER_EMBED = 'category_filter:product_categories!inner ( category_id )'

// Draft products (bulk-imported / still being completed in Admin) must never
// reach customers. RLS already limits `anon` to published products
// (db/migrations/0026), but a signed-in admin browsing the storefront in the
// same browser uses the admin read policy and WOULD see drafts — so every
// public product query also filters explicitly. Two layers on purpose.
const PUBLISHED = 'published'

export async function getProducts({ search, category, priceMax, inStockOnly } = {}) {
  const filterByCategory = Boolean(category) && category !== 'all'
  let query = supabase
    .from('products')
    .select(
      filterByCategory ? `${PRODUCT_SELECT}, ${CATEGORY_FILTER_EMBED}` : PRODUCT_SELECT
    )
    .eq('status', PUBLISHED)

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
      // Products are listed under a category via product_categories, so
      // resolve the matching categories to their linked product ids.
      const { data: links, error: linkError } = await supabase
        .from('product_categories')
        .select('product_id')
        .in('category_id', matchingCategories.map((c) => c.id))
      handleApiError(linkError, 'getProducts (category name search links)')

      const productIds = [...new Set((links ?? []).map((l) => l.product_id))]
      if (productIds.length > 0) orParts.push(`id.in.(${productIds.join(',')})`)
    }

    query = query.or(orParts.join(','))
  }
  if (filterByCategory) query = query.eq('category_filter.category_id', category)
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
    .eq('status', PUBLISHED)
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
    // Stable tiebreaker only; the admin-defined sort_order decides the order.
    .order('name', { ascending: true })
  handleApiError(error, 'getCategories')
  return data
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .eq('status', PUBLISHED)
    .maybeSingle()

  handleApiError(error, 'getProductById')
  return data
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('status', PUBLISHED)
    .maybeSingle()

  handleApiError(error, 'getProductBySlug')
  return data
}

// Related = shares at least one category with the source product.
export async function getRelatedProducts(categoryIds, excludeId, limit = 4) {
  if (!categoryIds || categoryIds.length === 0) return []
  const { data, error } = await supabase
    .from('products')
    .select(`${PRODUCT_SELECT}, ${CATEGORY_FILTER_EMBED}`)
    .in('category_filter.category_id', categoryIds)
    .eq('status', PUBLISHED)
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
    .eq('status', PUBLISHED)

  handleApiError(error, 'searchProducts')
  return data
}
