/**
 * @typedef {object} Product
 * @property {string|number} id
 * @property {string} slug - unique, URL-safe identifier
 * @property {string} name
 * @property {string} image
 * @property {string[]} [images] - full gallery including the primary image,
 *   ordered primary-first then by sort_order; falls back to `[image]` when
 *   no gallery rows exist
 * @property {string} [badge] - display-only label (e.g. "Best Seller"); not
 *   the source of truth for featured status, see `featured`
 * @property {boolean} featured
 * @property {string} category - references a Category's `id`
 * @property {number} price
 * @property {number} [originalPrice]
 * @property {number} rating
 * @property {string} [capacity]
 * @property {string} [categoryName]
 * @property {string} [categorySlug] - the Category's stable `slug`; only
 *   populated when the backend's query actually joins categories (see
 *   productMapper.js) — mock mode leaves this undefined
 * @property {string} [availability]
 * @property {string} [description]
 * @property {string[]} [colors]
 * @property {string[]} [features]
 * @property {Record<string, string>} [specs]
 */

/**
 * @typedef {object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} [tagline]
 * @property {string} image
 */

/**
 * @typedef {object} ProductFilters
 * @property {string} [search]
 * @property {string} [category]
 * @property {number} [priceMax]
 * @property {boolean} [inStockOnly] - when true, excludes any product whose
 *   availability is not exactly "in stock" (out_of_stock/preorder excluded)
 * @property {string} [capacity] - 'small'|'medium'|'large'|'all'; matched
 *   against the product's existing free-text `capacity` field, see
 *   MockProductRepository.js/SupabaseProductRepository.js for the exact
 *   bucketing rule
 * @property {string} [collection] - 'best'|'new'|'all'; matched against the
 *   product's existing `badge` field (no separate collection field exists)
 * @property {string[]} [discounts] - any of '20-30'|'10-20'|'under-10';
 *   matched against the product's existing price/originalPrice, never a
 *   separate discount field — empty array means no discount filter applied
 */

/**
 * Abstract contract every product data source must implement — the mock
 * data source today, WooCommerce or Supabase later (see index.js). Every
 * method returns a Promise even though today's implementation is
 * synchronous, so a real network-backed implementation can replace it later
 * without any call site changing from a plain value to `.then()`/`await`.
 *
 * Do not instantiate this class directly — extend it (see
 * MockProductRepository.js).
 */
export class ProductRepository {
  /**
   * @param {ProductFilters} [filters]
   * @returns {Promise<Product[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async getProducts(filters = {}) {
    throw new Error('ProductRepository.getProducts() not implemented')
  }

  /**
   * @param {number} [limit]
   * @returns {Promise<Product[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async getFeaturedProducts(limit) {
    throw new Error('ProductRepository.getFeaturedProducts() not implemented')
  }

  /** @returns {Promise<Category[]>} */
  async getCategories() {
    throw new Error('ProductRepository.getCategories() not implemented')
  }

  /**
   * @param {string|number} id
   * @returns {Promise<Product|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async getProductById(id) {
    throw new Error('ProductRepository.getProductById() not implemented')
  }

  /**
   * @param {string|number} productId
   * @param {number} [limit]
   * @returns {Promise<Product[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async getRelatedProducts(productId, limit) {
    throw new Error('ProductRepository.getRelatedProducts() not implemented')
  }

  /**
   * Added in Milestone 4 — product detail routes use the URL-safe `slug`
   * rather than the internal `id`.
   * @param {string} slug
   * @returns {Promise<Product|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async getProductBySlug(slug) {
    throw new Error('ProductRepository.getProductBySlug() not implemented')
  }

  /**
   * @param {string} query
   * @returns {Promise<Product[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async searchProducts(query) {
    throw new Error('ProductRepository.searchProducts() not implemented')
  }
}
