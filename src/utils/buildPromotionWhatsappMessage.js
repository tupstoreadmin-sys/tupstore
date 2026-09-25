// Extracted from HomePage.jsx/PromotionsPage.jsx, which each previously
// defined this exact function locally (verified byte-identical before this
// extraction) — a third page (PromotionDetailPage.jsx) needing the same
// logic would otherwise be a third duplicate, so this is a straight,
// behavior-preserving move to one shared location instead.
//
// Only used when the admin left whatsapp_text blank for a promotion — the
// caller is expected to prefer `promotion.whatsappText` first and fall
// back to this.

/**
 * @param {import('../services/promotions/PromotionsRepository').Promotion} promotion
 * @returns {string}
 */
export function buildDefaultPromotionWhatsappMessage(promotion) {
  const productNames = promotion.products.map((p) => p.name)
  if (productNames.length === 0) {
    return `Hi, I am interested in the ${promotion.title} offer.`
  }
  return `Hi, I am interested in the ${promotion.title} offer (${productNames.join(', ')}).`
}
