import { SocialVideosRepository } from './SocialVideosRepository'
import * as socialVideoApi from '../../api/socialVideoApi'
import { mapReel } from './mappers/reelMapper'

// Implements SocialVideosRepository against Supabase. Only this file and
// api/socialVideoApi.js know Supabase exists — every consumer above
// services/socialVideos still only ever sees the SocialVideosRepository
// contract. Mirrors SupabaseProductRepository.js's shape exactly.

export class SupabaseSocialVideosRepository extends SocialVideosRepository {
  /**
   * @param {number} [limit]
   * @returns {Promise<import('./SocialVideosRepository').Reel[]>}
   */
  async getPublishedReels(limit = 15) {
    const rows = await socialVideoApi.getPublishedReels(limit)
    return (rows ?? []).map(mapReel)
  }
}
