import { SectionHeader } from '../../components/layout'
import { ProductGrid } from '../shop/ProductGrid'

// Recently Viewed section — DESIGN_SYSTEM.md §16 (product detail page).
// Presentation only — receiving the actual "recently viewed" history
// (localStorage, etc.) is the caller's responsibility, not this component's.

/**
 * @param {object} props
 * @param {object[]} props.products
 * @param {(string|number)[]} [props.enquiryIds]
 * @param {(product: object) => void} [props.onAddToEnquiry]
 * @param {(product: object) => void} [props.onQuickView]
 * @param {(product: object) => void} [props.onSelect]
 * @param {string} [props.className]
 */
export function RecentlyViewed({
  products = [],
  enquiryIds,
  onAddToEnquiry,
  onQuickView,
  onSelect,
  className,
}) {
  if (products.length === 0) return null

  return (
    <div className={className}>
      <SectionHeader
        align="left"
        eyebrow="Your Browsing History"
        title="Recently Viewed"
        description="Products you have reviewed in your session."
        className="mb-8"
      />
      <ProductGrid
        products={products}
        enquiryIds={enquiryIds}
        onAddToEnquiry={onAddToEnquiry}
        onQuickView={onQuickView}
        onSelect={onSelect}
      />
    </div>
  )
}
