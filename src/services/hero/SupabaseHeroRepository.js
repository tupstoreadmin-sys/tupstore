import { HeroRepository } from './HeroRepository'
import * as heroApi from '../../api/heroApi'
import { mapHeroSlide } from './mappers/heroMapper'

// Implements HeroRepository against Supabase. Only this file and
// api/heroApi.js know Supabase exists — every consumer above
// services/hero still only ever sees the HeroRepository contract. Mirrors
// SupabasePromotionsRepository.js's own shape exactly.

export class SupabaseHeroRepository extends HeroRepository {
  /** @returns {Promise<import('./HeroRepository').HeroSlide[]>} */
  async getActiveHeroSlides() {
    const rows = await heroApi.getActiveHeroSlides()

    // Collect every product-type button target across all slides and
    // resolve them in one batch query — see heroApi.getProductSlugsByIds()'s
    // own comment on why this can't be a single PostgREST embed like every
    // other FK relationship in this project.
    const productIds = new Set()
    for (const row of rows) {
      if (row.button1_type === 'product' && row.button1_target) {
        productIds.add(row.button1_target)
      }
      if (row.button2_type === 'product' && row.button2_target) {
        productIds.add(row.button2_target)
      }
    }

    const products = await heroApi.getProductSlugsByIds([...productIds])
    const productSlugById = new Map(products.map((p) => [p.id, p.slug]))

    return rows.map((row) => mapHeroSlide(row, productSlugById))
  }
}
