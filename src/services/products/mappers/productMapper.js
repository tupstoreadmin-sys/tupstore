import { getImageUrl } from '../../../utils/imageUrl'

/** @typedef {import('../../../models/Product').Product} Product */

// The only place that knows the Supabase `products` row shape — including
// its embedded `categories`/`product_features`/`product_specifications`
// rows (see api/productApi.js's PRODUCT_SELECT). Everything above
// SupabaseProductRepository only ever sees the flat shape defined in
// models/Product.js.

function sortBySortOrder(rows) {
  return [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

function mapFeatures(rows) {
  if (!rows || rows.length === 0) return undefined
  return sortBySortOrder(rows).map((row) => row.label)
}

function mapSpecs(rows) {
  if (!rows || rows.length === 0) return undefined
  return Object.fromEntries(
    sortBySortOrder(rows).map((row) => [row.spec_key, row.spec_value])
  )
}

function mapImages(rows, fallbackImage) {
  if (!rows || rows.length === 0) return [fallbackImage]
  const sorted = [...rows].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1
    return (a.sort_order ?? 0) - (b.sort_order ?? 0)
  })
  return sorted.map((row) => getImageUrl(row.url))
}

// Supabase stores availability as the snake_case enum ProductInfo.jsx never
// sees ('in_stock' | 'out_of_stock' | 'preorder') — this is the single
// boundary that normalizes it to the Title Case strings the rest of the
// app (including ProductInfo's 'In Stock' comparison) already expects.
const AVAILABILITY_LABELS = {
  in_stock: 'In Stock',
  out_of_stock: 'Out of Stock',
  preorder: 'Preorder',
}

function mapAvailability(value) {
  if (value == null) return undefined
  return AVAILABILITY_LABELS[value] ?? value
}

/**
 * @param {object} row - raw Supabase `products` row (with `categories`,
 *   `product_features`, `product_specifications`, `product_images` embedded)
 * @returns {Product}
 */
export function mapProduct(row) {
  const image = getImageUrl(row.image)

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    image,
    images: mapImages(row.product_images, image),
    badge: row.badge ?? undefined,
    featured: Boolean(row.featured),
    category: row.category_id,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    rating: row.rating,
    capacity: row.capacity ?? undefined,
    categoryName: row.categories?.name ?? undefined,
    categorySlug: row.categories?.slug ?? undefined,
    availability: mapAvailability(row.availability),
    description: row.description ?? undefined,
    colors: row.colors ?? undefined,
    features: mapFeatures(row.product_features),
    specs: mapSpecs(row.product_specifications),
  }
}
