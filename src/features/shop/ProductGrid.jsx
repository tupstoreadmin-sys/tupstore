import { cn } from '../../utils/cn'
import { ProductCard, EmptyState } from '../../components/ui'

// .product-grid — DESIGN_SYSTEM.md §18 (5→3→2 responsive columns).

/**
 * @param {object} props
 * @param {object[]} props.products
 * @param {(string|number)[]} [props.enquiryIds] - ids currently in the enquiry list
 * @param {(product: object) => void} [props.onAddToEnquiry]
 * @param {(product: object) => void} [props.onQuickView]
 * @param {(product: object) => void} [props.onSelect]
 * @param {'grid'|'list'} [props.layout]
 * @param {string} [props.emptyMessage]
 * @param {string} [props.className]
 */
export function ProductGrid({
  products = [],
  enquiryIds = [],
  onAddToEnquiry,
  onQuickView,
  onSelect,
  layout = 'grid',
  emptyMessage = 'No products found',
  className,
}) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title={emptyMessage}
        description="Try adjusting your filters or search keywords."
        className={className}
      />
    )
  }

  return (
    <div
      className={cn(
        layout === 'list'
          ? 'flex flex-col gap-4 w-full min-w-0'
          : 'grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-2.5 w-full min-w-0',
        className
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isInEnquiry={enquiryIds.includes(product.id)}
          onAddToEnquiry={onAddToEnquiry}
          onQuickView={onQuickView}
          onClick={onSelect}
        />
      ))}
    </div>
  )
}
