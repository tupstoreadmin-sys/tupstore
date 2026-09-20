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

/**
 * @param {import('../services/products/ProductRepository').ProductFilters} [filters]
 */
export async function getProducts({ search, category, priceMax, inStockOnly } = {}) {
  let query = supabase.from('products').select(PRODUCT_SELECT)

  if (search) query = query.ilike('name', `%${search}%`)
  if (category && category !== 'all') query = query.eq('category_id', category)
  if (typeof priceMax === 'number') query = query.lte('price', priceMax)
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
