import { useEnquiry } from '../contexts/EnquiryContext'
import { useUI } from '../contexts/UIContext'

// Orchestration layer — see ARCHITECTURE.md §5/§6. The only place allowed
// to know both EnquiryContext and UIContext exist. Combines a pure
// EnquiryContext state change with a pure UIContext side effect (opening
// the drawer) without coupling the two contexts to each other.

/**
 * @returns {(product: object, qty?: number, color?: string) => void}
 */
export function useAddToEnquiry() {
  const { addItem } = useEnquiry()
  const { openEnquiryDrawer } = useUI()

  return (product, qty = 1, color) => {
    addItem(product, qty, color)
    openEnquiryDrawer()
  }
}
