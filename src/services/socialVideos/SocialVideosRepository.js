/**
 * @typedef {object} TaggedProduct
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {string} image - the real product's own image, never the
 *   Reel's thumbnail
 */

/**
 * @typedef {object} Reel
 * @property {string} id
 * @property {string} title
 * @property {string} [views]
 * @property {string} [duration]
 * @property {string} image - the Reel's own thumbnail
 * @property {string} [account]
 * @property {string|null} [videoUrl]
 * @property {string} [reelUrl]
 * @property {TaggedProduct[]} products
 */

/**
 * Abstract contract for the customer-facing "Watch Us In Action" Reel data
 * source — the Mock data source (src/data/reels.js) today, Supabase from
 * Step 3 onward (see index.js). Mirrors
 * services/products/ProductRepository.js's shape/conventions exactly, so a
 * future backend swap here means adding a case in index.js, not touching
 * any call site (HomePage.jsx).
 *
 * Do not instantiate this class directly — extend it (see
 * MockSocialVideosRepository.js / SupabaseSocialVideosRepository.js).
 */
export class SocialVideosRepository {
  /**
   * @param {number} [limit]
   * @returns {Promise<Reel[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async getPublishedReels(limit) {
    throw new Error(
      'SocialVideosRepository.getPublishedReels() not implemented'
    )
  }
}
