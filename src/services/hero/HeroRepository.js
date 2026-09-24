/**
 * @typedef {object} HeroCta
 * @property {string} label
 * @property {'category'|'product'|'whatsapp'|'url'} [type]
 * @property {string} [href] - present for category/product/url types once
 *   resolved; absent for whatsapp (which always uses the site-wide
 *   STORE_WHATSAPP_NUMBER, never a per-slide value) or when the stored
 *   target could not be resolved (e.g. a deleted category/product)
 */

/**
 * @typedef {object} HeroSlide
 * @property {string} [id]
 * @property {string} [tag] - the slide's badge text
 * @property {string} title
 * @property {string} [image] - desktop hero image
 * @property {string} [mobileImage] - mobile hero image; falls back to
 *   `image` when absent, matching the current single-image responsive
 *   behavior
 * @property {string} [altText]
 * @property {HeroCta} [primaryCta]
 * @property {HeroCta} [secondaryCta]
 * @property {string[]} trustBadges - feature bullets
 */

/**
 * Abstract contract every Hero data source must implement — the mock data
 * source today, Supabase for real data — mirrors
 * services/promotions/PromotionsRepository.js's own shape and precedent
 * exactly.
 *
 * Do not instantiate this class directly — extend it (see
 * MockHeroRepository.js/SupabaseHeroRepository.js).
 */
export class HeroRepository {
  /** @returns {Promise<HeroSlide[]>} */
  async getActiveHeroSlides() {
    throw new Error('HeroRepository.getActiveHeroSlides() not implemented')
  }
}
