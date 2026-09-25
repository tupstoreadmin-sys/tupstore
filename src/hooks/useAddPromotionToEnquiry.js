import { useEnquiry } from '../contexts/EnquiryContext'
import { useUI } from '../contexts/UIContext'

// Orchestration layer for "Add to Enquiry" on the Promotion Detail page —
// the promotion-side counterpart to useAddToEnquiry.js, same role (the
// only place allowed to know both EnquiryContext and UIContext exist).
//
// A promotion is an independent enquiry subject; its tagged products (zero,
// one, or many) are supporting content, never priced independently here
// (see buildEnquiryMessage.js). An enquiry holds at most one promotion —
// see useAddToEnquiry.js's own mirror-image check for the reverse
// direction (adding a normal product while a promotion is staged).

/**
 * @returns {(promotion: import('../services/promotions/PromotionsRepository').Promotion) => void}
 */
export function useAddPromotionToEnquiry() {
  const { items, addItem, promotion: staged, setPromotion, clearItems } = useEnquiry()
  const { openEnquiryDrawer } = useUI()

  return (promotion) => {
    const hasConflict =
      (items.length > 0 && staged == null) || // Case C — unrelated product(s) already present
      (staged != null && staged.id !== promotion.id) // Case D — a different promotion already staged

    if (hasConflict) {
      const previousLabel = staged ? `"${staged.title}" offer` : 'other items'
      const confirmed = window.confirm(
        `Your enquiry list currently has ${previousLabel}. Adding "${promotion.title}" will replace it with this offer. Continue?`
      )
      if (!confirmed) return
      clearItems()
    }

    const products = promotion.products ?? []
    products.forEach((product) => addItem(product, 1))

    setPromotion({
      id: promotion.id,
      title: promotion.title,
      price: promotion.price,
      originalPrice: promotion.originalPrice,
      productIds: products.map((p) => p.id),
    })
    openEnquiryDrawer()
  }
}
