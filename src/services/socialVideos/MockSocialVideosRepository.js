import { MOCK_REELS } from '../../data'
import { SocialVideosRepository } from './SocialVideosRepository'

// Implements SocialVideosRepository against the existing static mock
// reels — used only when VITE_DATA_SOURCE=mock, matching
// MockProductRepository's precedent exactly. MOCK_REELS (src/data/reels.js)
// is already shaped exactly like the Supabase-mapped Reel object (see
// SocialVideosRepository's Reel typedef), so no adaptation is needed here.
export class MockSocialVideosRepository extends SocialVideosRepository {
  /**
   * @param {number} [limit]
   * @returns {Promise<import('./SocialVideosRepository').Reel[]>}
   */
  async getPublishedReels(limit = 15) {
    return MOCK_REELS.slice(0, limit)
  }
}
