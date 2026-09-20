import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../../data'
import { ProductRepository } from './ProductRepository'

// Implements ProductRepository against src/data. No network calls, no
// WooCommerce, no Supabase — this is the only implementation in use today,
// selected in index.js.

// ── Collection ("Best Sellers" / "New Arrivals") ───────────────────────────
// Reuses the product's existing `badge` field — the same one ProductCard/
// Product Detail already display — rather than inventing a second grouping
// concept. Matches src/data/products.js's MOCK_FILTER_OPTIONS.collections
// ids to the real badge text products already carry. A product whose badge
// is something else (or none) simply doesn't match either collection —
// same graceful "no match" behavior as capacity/discounts below, not a bug.
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

export class MockProductRepository extends ProductRepository {
  /**
   * @param {import('./ProductRepository').ProductFilters} [filters]
   * @returns {Promise<import('./ProductRepository').Product[]>}
   */
  async getProducts(filters = {}) {
    let results = [...MOCK_PRODUCTS]

    if (filters.search) {
      const query = filters.search.toLowerCase()
      results = results.filter((product) =>
        product.name.toLowerCase().includes(query)
      )
    }

    if (filters.category && filters.category !== 'all') {
      results = results.filter(
        (product) => product.category === filters.category
      )
    }

    if (typeof filters.priceMax === 'number') {
      results = results.filter((product) => product.price <= filters.priceMax)
    }

    if (filters.inStockOnly) {
      results = results.filter((product) => product.availability === 'In Stock')
    }

    if (filters.capacity && filters.capacity !== 'all') {
      results = results.filter((product) => matchesCapacity(product, filters.capacity))
    }

    if (filters.collection && filters.collection !== 'all') {
      results = results.filter((product) => matchesCollection(product, filters.collection))
    }

    if (filters.discounts && filters.discounts.length > 0) {
      results = results.filter((product) => matchesDiscount(product, filters.discounts))
    }

    return results
  }

  /**
   * @param {number} [limit]
   * @returns {Promise<import('./ProductRepository').Product[]>}
   */
  async getFeaturedProducts(limit = 4) {
    return MOCK_PRODUCTS.filter((product) => product.featured).slice(0, limit)
  }

  /** @returns {Promise<import('./ProductRepository').Category[]>} */
  async getCategories() {
    return MOCK_CATEGORIES
  }

  /**
   * @param {string|number} id
   * @returns {Promise<import('./ProductRepository').Product|null>}
   */
  async getProductById(id) {
    return (
      MOCK_PRODUCTS.find((product) => String(product.id) === String(id)) ?? null
    )
  }

  /**
   * @param {string|number} productId
   * @param {number} [limit]
   * @returns {Promise<import('./ProductRepository').Product[]>}
   */
  async getRelatedProducts(productId, limit = 4) {
    const source = MOCK_PRODUCTS.find(
      (product) => String(product.id) === String(productId)
    )
    if (!source) return []

    return MOCK_PRODUCTS.filter(
      (product) =>
        product.category === source.category &&
        String(product.id) !== String(productId)
    ).slice(0, limit)
  }

  /**
   * @param {string} slug
   * @returns {Promise<import('./ProductRepository').Product|null>}
   */
  async getProductBySlug(slug) {
    return MOCK_PRODUCTS.find((product) => product.slug === slug) ?? null
  }

  /**
   * @param {string} query
   * @returns {Promise<import('./ProductRepository').Product[]>}
   */
  async searchProducts(query) {
    if (!query) return []
    const normalized = query.toLowerCase()
    return MOCK_PRODUCTS.filter((product) =>
      product.name.toLowerCase().includes(normalized)
    )
  }
}
