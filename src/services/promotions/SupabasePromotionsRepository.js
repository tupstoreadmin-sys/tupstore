import { PromotionsRepository } from './PromotionsRepository'
import * as promotionApi from '../../api/promotionApi'
import { mapPromotion } from './mappers/promotionMapper'

// Implements PromotionsRepository against Supabase. Only this file and
// api/promotionApi.js know Supabase exists — every consumer above
// services/promotions still only ever sees the PromotionsRepository
// contract. Mirrors SupabaseProductRepository.js's/
// SupabaseSocialVideosRepository.js's own shape exactly.

export class SupabasePromotionsRepository extends PromotionsRepository {
  /** @returns {Promise<import('./PromotionsRepository').Promotion[]>} */
  async getActivePromotions() {
    const rows = await promotionApi.getActivePromotions()
    return (rows ?? []).map(mapPromotion)
  }

  /** @returns {Promise<import('./PromotionsRepository').Promotion | null>} */
  async getPromotionBySlug(slug) {
    const row = await promotionApi.getPromotionBySlug(slug)
    return row ? mapPromotion(row) : null
  }
}
