/**
 * @typedef {object} PromotionProduct
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {string} image
 * @property {string} slug
 * @property {string} [capacity]
 * @property {string[]} [colors]
 * @property {string} [availability]
 * @property {string} [productCode]
 */

/**
 * @typedef {object} Promotion
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {string} image
 * @property {string} [badge]
 * @property {string} buttonText
 * @property {string} [whatsappText] - admin-supplied WhatsApp message, if any
 * @property {string} slug - unique, URL-safe identifier for /promotion/:slug
 * @property {number} [price] - offer/combo price; undefined until an admin sets one
 * @property {number} [originalPrice] - comparison price; only meaningful when > price
 * @property {number} sortOrder
 * @property {PromotionProduct[]} products - tagged catalogue products, may be empty
 */

/**
 * Abstract contract every promotions data source must implement — the
 * mock data source today, Supabase for real data — mirrors
 * services/products/ProductRepository.js's/
 * services/socialVideos/SocialVideosRepository.js's own shape and
 * precedent exactly.
 *
 * Do not instantiate this class directly — extend it (see
 * MockPromotionsRepository.js/SupabasePromotionsRepository.js).
 */
export class PromotionsRepository {
  /** @returns {Promise<Promotion[]>} */
  async getActivePromotions() {
    throw new Error('PromotionsRepository.getActivePromotions() not implemented')
  }

  /**
   * One active promotion by slug, for the Promotion Detail page.
   * @param {string} slug
   * @returns {Promise<Promotion | null>}
   */
  // eslint-disable-next-line no-unused-vars
  async getPromotionBySlug(slug) {
    throw new Error('PromotionsRepository.getPromotionBySlug() not implemented')
  }
}
