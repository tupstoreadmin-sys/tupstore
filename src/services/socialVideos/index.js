import { MockSocialVideosRepository } from './MockSocialVideosRepository'
import { SupabaseSocialVideosRepository } from './SupabaseSocialVideosRepository'

// Single source of Reel data for the application. Every consumer
// (HomePage) imports `socialVideosRepository` from here rather than
// choosing a concrete implementation itself. Which implementation is
// active is decided once, in this switch, based on VITE_DATA_SOURCE —
// mirrors services/products/index.js exactly.
function createSocialVideosRepository() {
  switch (import.meta.env.VITE_DATA_SOURCE) {
    case 'supabase':
      return new SupabaseSocialVideosRepository()
    case 'mock':
    default:
      return new MockSocialVideosRepository()
  }
}

export const socialVideosRepository = createSocialVideosRepository()

export { SocialVideosRepository } from './SocialVideosRepository'
export { MockSocialVideosRepository } from './MockSocialVideosRepository'
export { SupabaseSocialVideosRepository } from './SupabaseSocialVideosRepository'
