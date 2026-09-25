import { useEnquiry } from '../contexts/EnquiryContext'
import { useUI } from '../contexts/UIContext'

// Orchestration layer — see ARCHITECTURE.md §5/§6. The only place allowed
// to know both EnquiryContext and UIContext exist. Combines a pure
// EnquiryContext state change with a pure UIContext side effect (opening
// the drawer) without coupling the two contexts to each other.
//
// Mirror-image of useAddPromotionToEnquiry.js's own conflict check: an
// enquiry is either (A) one or more normal products with no promotion, or
// (B) exactly one promotion plus zero or more of *that promotion's own*
// tagged products — never an unlabeled mix. If a promotion is currently
// staged and this product is not one of its tagged products, adding it
// would create exactly that ambiguous mix, so this confirms with the
// customer first rather than silently merging. A product that IS part of
// the staged promotion is treated as an ordinary supporting addition (no
// prompt) — it already belongs to this enquiry.

/**
 * @returns {(product: object, qty?: number, color?: string) => void}
 */
export function useAddToEnquiry() {
  const { addItem, promotion, clearItems } = useEnquiry()
  const { openEnquiryDrawer } = useUI()

  return (product, qty = 1, color) => {
    if (promotion && !promotion.productIds.includes(product.id)) {
      const confirmed = window.confirm(
        `Your enquiry list currently represents the "${promotion.title}" offer. Adding "${product.name}" will replace it with a normal product enquiry. Continue?`
      )
      if (!confirmed) return
      clearItems()
    }
    addItem(product, qty, color)
    openEnquiryDrawer()
  }
}
