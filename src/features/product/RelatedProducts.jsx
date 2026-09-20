import { SectionHeader } from '../../components/layout'
import { ProductGrid } from '../shop/ProductGrid'

// Related Products section — DESIGN_SYSTEM.md §16 (product detail page).
// Thin composition of SectionHeader + ProductGrid; owns no data or logic.

/**
 * @param {object} props
 * @param {object[]} props.products
 * @param {string} [props.categoryName]
 * @param {(string|number)[]} [props.enquiryIds]
 * @param {(product: object) => void} [props.onAddToEnquiry]
 * @param {(product: object) => void} [props.onQuickView]
 * @param {(product: object) => void} [props.onSelect]
 * @param {string} [props.className]
 */
export function RelatedProducts({
  products = [],
  categoryName,
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
        eyebrow="Similar Selection"
        title="Related Products"
        description={
          categoryName
            ? `Explore similar options from our ${categoryName} category.`
            : 'Explore similar options from our collection.'
        }
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
