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
}
