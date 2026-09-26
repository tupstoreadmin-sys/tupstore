import { useEnquiry } from '../contexts/EnquiryContext'
import { useUI } from '../contexts/UIContext'

// Orchestration layer for "Add to Enquiry" on the Promotion Detail page —
// the promotion-side counterpart to useAddToEnquiry.js, same role (the
// only place allowed to know both EnquiryContext and UIContext exist).
//
// A promotion is an independent enquiry subject that coexists with any
// independently-added products (client decision) — staging a promotion
// never touches `items`, never clears existing products, and never needs a
// confirmation. Only ONE promotion at a time is supported (matching the
// single `enquiries.promotion_id` column) — adding a different promotion
// while one is already staged simply replaces it.
//
// The promotion's own tagged products are deliberately NOT added to
// `items` — they are supporting/reference content (see
// EnquiryDrawer.jsx's "Included:" list), never independent line items, and
// must never be inserted into enquiry_items unless the customer separately
// adds that exact product via the normal product Add-to-Enquiry flow.

/**
 * @returns {(promotion: import('../services/promotions/PromotionsRepository').Promotion) => void}
 */
export function useAddPromotionToEnquiry() {
  const { setPromotion } = useEnquiry()
  const { openEnquiryDrawer } = useUI()

  return (promotion) => {
    setPromotion({
      id: promotion.id,
      title: promotion.title,
      price: promotion.price,
      originalPrice: promotion.originalPrice,
      includedProductNames: (promotion.products ?? []).map((p) => p.name),
    })
    openEnquiryDrawer()
  }
}
