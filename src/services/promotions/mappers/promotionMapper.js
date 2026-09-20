// The only place that knows the Supabase `promotions` row shape —
// including its embedded `promotion_products`/`products` rows (see
// api/promotionApi.js's ACTIVE_PROMOTIONS_SELECT). Everything above
// SupabasePromotionsRepository only ever sees the flat shape defined in
// PromotionsRepository.js's own JSDoc typedefs. Mirrors
// services/products/mappers/productMapper.js's role for this feature.

function sortByPromotionProductOrder(rows) {
  return [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

/**
 * @param {object} row - a raw `promotion_products` row with its embedded
 *   `products` row (see api/promotionApi.js)
 * @returns {import('../PromotionsRepository').PromotionProduct | null}
 *   null when the referenced product row itself is missing (should not
 *   happen given the FK, but guarded rather than assumed)
 */
function mapPromotionProduct(row) {
  const product = row.products
  if (!product) return null
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    slug: product.slug,
    capacity: product.capacity ?? undefined,
    colors: product.colors ?? undefined,
    availability: product.availability ?? undefined,
    productCode: product.product_code ?? undefined,
  }
}

/**
 * @param {object} row - raw Supabase `promotions` row (with
 *   `promotion_products` embedded, each carrying its own `products` row)
 * @returns {import('../PromotionsRepository').Promotion}
 */
export function mapPromotion(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    image: row.image,
    badge: row.badge ?? undefined,
    buttonText: row.button_text,
    whatsappText: row.whatsapp_text ?? undefined,
    sortOrder: row.sort_order,
    products: sortByPromotionProductOrder(row.promotion_products ?? [])
      .map(mapPromotionProduct)
      .filter(Boolean),
  }
}
