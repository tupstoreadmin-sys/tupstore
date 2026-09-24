import { MockHeroRepository } from './MockHeroRepository'
import { SupabaseHeroRepository } from './SupabaseHeroRepository'

// Single source of Hero slide data for the application. Every consumer
// (HomePage) imports `heroRepository` from here rather than choosing a
// concrete implementation itself. Which implementation is active is
// decided once, in this switch, based on VITE_DATA_SOURCE — mirrors
// services/promotions/index.js/services/products/index.js exactly.
function createHeroRepository() {
  switch (import.meta.env.VITE_DATA_SOURCE) {
    case 'supabase':
      return new SupabaseHeroRepository()
    case 'mock':
    default:
      return new MockHeroRepository()
  }
}

export const heroRepository = createHeroRepository()

export { HeroRepository } from './HeroRepository'
export { MockHeroRepository } from './MockHeroRepository'
export { SupabaseHeroRepository } from './SupabaseHeroRepository'
