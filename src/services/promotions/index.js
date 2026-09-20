import { MockPromotionsRepository } from './MockPromotionsRepository'
import { SupabasePromotionsRepository } from './SupabasePromotionsRepository'

// Single source of Promotion data for the application. Every consumer
// (HomePage) imports `promotionsRepository` from here rather than
// choosing a concrete implementation itself. Which implementation is
// active is decided once, in this switch, based on VITE_DATA_SOURCE —
// mirrors services/products/index.js/services/socialVideos/index.js
// exactly.
function createPromotionsRepository() {
  switch (import.meta.env.VITE_DATA_SOURCE) {
    case 'supabase':
      return new SupabasePromotionsRepository()
    case 'mock':
    default:
      return new MockPromotionsRepository()
  }
}

export const promotionsRepository = createPromotionsRepository()

export { PromotionsRepository } from './PromotionsRepository'
export { MockPromotionsRepository } from './MockPromotionsRepository'
export { SupabasePromotionsRepository } from './SupabasePromotionsRepository'
