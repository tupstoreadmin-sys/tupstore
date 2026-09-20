// JSDoc-only model definition — no runtime code. This is the app-facing
// Product shape every ProductRepository implementation must return,
// regardless of which backend (mock, Supabase, ...) it reads from.

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

export {}
