import { PromotionsRepository } from './PromotionsRepository'

// Implements PromotionsRepository against... nothing. Unlike
// MockProductRepository.js/MockSocialVideosRepository.js, there is no
// MOCK_PROMOTIONS dataset in src/data, and this feature is explicitly
// required to never fall back to invented/mock content (Step 3's own
// instruction: "Do NOT fall back to mock promotions" — Promotions must be
// the single source of truth for Featured Highlights, in every data
// source mode). Returning an empty array here is the honest answer for
// VITE_DATA_SOURCE=mock: correctly makes Home's Featured Highlights
// section hide itself (see HomePage.jsx's existing
// `featuredHighlights.length > 0` guard), exactly like "0 active
// promotions" already behaves against real Supabase.
export class MockPromotionsRepository extends PromotionsRepository {
  /** @returns {Promise<import('./PromotionsRepository').Promotion[]>} */
  async getActivePromotions() {
    return []
  }
}
