import { cn } from '../../utils/cn'
import { ProductCard, EmptyState } from '../../components/ui'

// #search-results-list — DESIGN_SYSTEM.md §5. Renders whatever `results`
// it's given; the actual search/filter logic lives outside this component
// (a hook or page, in a later milestone) — this is presentation only.

/**
 * @param {object} props
 * @param {object[]} props.results
 * @param {string} [props.query]
 * @param {(string|number)[]} [props.enquiryIds]
 * @param {(product: object) => void} [props.onAddToEnquiry]
 * @param {(product: object) => void} [props.onQuickView]
 * @param {(product: object) => void} [props.onSelect]
 * @param {string} [props.className]
 */
export function SearchResults({
  results = [],
  query = '',
  enquiryIds = [],
  onAddToEnquiry,
  onQuickView,
  onSelect,
  className,
}) {
  if (results.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title={query ? 'No results found' : 'Start typing to search'}
        description={
          query
            ? `No products matched "${query}".`
            : 'Search by product name or category.'
        }
        className={className}
      />
    )
  }

  return (
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      {results.map((product) => (
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
