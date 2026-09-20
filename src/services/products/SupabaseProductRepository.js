import { ProductRepository } from './ProductRepository'
import * as productApi from '../../api/productApi'
import { mapProduct } from './mappers/productMapper'
import { mapCategory } from './mappers/categoryMapper'

// Implements ProductRepository against Supabase. Only this file and
// api/productApi.js know Supabase exists — every consumer above
// services/products still only ever sees the ProductRepository contract.

// Capacity/collection/discounts are applied here, in JS, after the mapped
// Product array comes back — not as Supabase query filters in productApi.js
// — because none of them can be expressed as a simple PostgREST column-vs-
// literal filter without a schema change: capacity is free text (needs
// parsing, not a numeric column), collection has no column of its own (it
// reuses the existing `badge` text), and discount requires comparing two
// columns (original_price vs price), which PostgREST's simple filter
// builder can't do without a computed column or view. This still lives in
// the repository layer (not the page), matching where search/category/
// price/availability filtering already lives for this backend.

// ── Collection ("Best Sellers" / "New Arrivals") ───────────────────────────
// Reuses the product's existing `badge` field — the same one ProductCard/
// Product Detail already display — rather than inventing a second grouping
// concept. Matches src/data/products.js's MOCK_FILTER_OPTIONS.collections
// ids to the real badge text products.badge already carries (see
// db/seed.sql: 'Best Seller' / 'New Arrival'). A product whose badge is
// something else (or none) simply doesn't match either collection — same
// graceful "no match" behavior as capacity/discounts below, not a bug.
const COLLECTION_BADGE = {
  best: 'Best Seller',
  new: 'New Arrival',
}

function matchesCollection(product, collection) {
  if (!collection || collection === 'all') return true
  const requiredBadge = COLLECTION_BADGE[collection]
  if (!requiredBadge) return true
  return product.badge === requiredBadge
}

// ── Capacity (small/medium/large) ──────────────────────────────────────────
// products.capacity is free text (e.g. "1000 ml (Set of 4)", "Set of 6") —
// there is no numeric capacity column. Best-effort: extract the first ml/L
// quantity mentioned and bucket it against the same ranges
// MOCK_FILTER_OPTIONS.capacities already advertises (Under 750ml / 750ml-2L
// / Over 2L). A capacity string with no extractable quantity simply doesn't
// match any specific bucket, rather than guessing at one.
function capacityInMl(capacityText) {
  if (!capacityText) return null
  const match = capacityText.match(/([\d.]+)\s*(ml|l)\b/i)
  if (!match) return null
  const value = Number(match[1])
  if (Number.isNaN(value)) return null
  return match[2].toLowerCase() === 'l' ? value * 1000 : value
}

function matchesCapacity(product, capacity) {
  if (!capacity || capacity === 'all') return true
  const ml = capacityInMl(product.capacity)
  if (ml == null) return false
  if (capacity === 'small') return ml < 750
  if (capacity === 'medium') return ml >= 750 && ml <= 2000
  if (capacity === 'large') return ml > 2000
  return true
}

// ── Discounts (% off ranges) ────────────────────────────────────────────────
// Derived from the product's existing price/originalPrice — never a
// separate discount field. A product with no originalPrice (or
// originalPrice <= price) has 0% discount and correctly never matches any
// of these ranges.
function discountPercent(product) {
  if (!product.originalPrice || product.originalPrice <= product.price) return 0
  return ((product.originalPrice - product.price) / product.originalPrice) * 100
}

function matchesDiscount(product, selectedDiscounts) {
  if (!selectedDiscounts || selectedDiscounts.length === 0) return true
  const pct = discountPercent(product)
  if (pct <= 0) return false
  return selectedDiscounts.some((id) => {
    if (id === 'under-10') return pct < 10
    if (id === '10-20') return pct >= 10 && pct < 20
    if (id === '20-30') return pct >= 20 && pct <= 30
    return false
  })
}

export class SupabaseProductRepository extends ProductRepository {
  /**
   * @param {import('./ProductRepository').ProductFilters} [filters]
   * @returns {Promise<import('./ProductRepository').Product[]>}
   */
  async getProducts(filters = {}) {
    const rows = await productApi.getProducts(filters)
    let products = (rows ?? []).map(mapProduct)

    if (filters.capacity && filters.capacity !== 'all') {
      products = products.filter((product) => matchesCapacity(product, filters.capacity))
    }

    if (filters.collection && filters.collection !== 'all') {
      products = products.filter((product) => matchesCollection(product, filters.collection))
    }

    if (filters.discounts && filters.discounts.length > 0) {
      products = products.filter((product) => matchesDiscount(product, filters.discounts))
    }

    return products
  }

  /**
   * @param {number} [limit]
   * @returns {Promise<import('./ProductRepository').Product[]>}
   */
  async getFeaturedProducts(limit = 4) {
    const rows = await productApi.getFeaturedProducts(limit)
    return (rows ?? []).map(mapProduct)
  }

  /** @returns {Promise<import('./ProductRepository').Category[]>} */
  async getCategories() {
    const rows = await productApi.getCategories()
    return (rows ?? []).map(mapCategory)
  }

  /**
   * @param {string|number} id
   * @returns {Promise<import('./ProductRepository').Product|null>}
   */
  async getProductById(id) {
    const row = await productApi.getProductById(id)
    return row ? mapProduct(row) : null
  }

  /**
   * @param {string|number} productId
   * @param {number} [limit]
   * @returns {Promise<import('./ProductRepository').Product[]>}
   */
  async getRelatedProducts(productId, limit = 4) {
    const source = await productApi.getProductById(productId)
    if (!source) return []

    const rows = await productApi.getRelatedProducts(
      source.category_id,
      productId,
      limit
    )
    return (rows ?? []).map(mapProduct)
  }

  /**
   * @param {string} slug
   * @returns {Promise<import('./ProductRepository').Product|null>}
   */
  async getProductBySlug(slug) {
    const row = await productApi.getProductBySlug(slug)
    return row ? mapProduct(row) : null
  }

  /**
   * @param {string} query
   * @returns {Promise<import('./ProductRepository').Product[]>}
   */
  async searchProducts(query) {
    const rows = await productApi.searchProducts(query)
    return (rows ?? []).map(mapProduct)
  }
}
