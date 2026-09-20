import { MockProductRepository } from './MockProductRepository'
import { SupabaseProductRepository } from './SupabaseProductRepository'

// Single source of product data for the application. Every consumer (pages,
// hooks) imports `productRepository` from here rather than choosing a
// concrete implementation itself. Which implementation is active is decided
// once, in this switch, based on VITE_DATA_SOURCE — adding a future backend
// means adding a case here, not touching any call site.
function createProductRepository() {
  switch (import.meta.env.VITE_DATA_SOURCE) {
    case 'supabase':
      return new SupabaseProductRepository()
    case 'mock':
    default:
      return new MockProductRepository()
  }
}

export const productRepository = createProductRepository()

export { ProductRepository } from './ProductRepository'
export { MockProductRepository } from './MockProductRepository'
export { SupabaseProductRepository } from './SupabaseProductRepository'
