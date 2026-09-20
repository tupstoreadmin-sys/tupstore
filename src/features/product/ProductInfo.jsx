import { useState } from 'react'
import { cn } from '../../utils/cn'
import { Badge, Button, ProductPrice, ProductRating } from '../../components/ui'

// .detail-badge-row / .detail-title / .detail-price-row / .color-options /
// .detail-qty-wrapper / .detail-features / .detail-specs-table —
// DESIGN_SYSTEM.md §16/§18. Quantity/color selection is local UI state;
// "add to enquiry" is a callback prop carrying that local selection out —
// this component doesn't touch an enquiry list itself.

/**
 * @param {object} props
 * @param {{name:string, badge?:string, availability?:string, rating:number,
 *   price:number, originalPrice?:number, description?:string,
 *   categoryName?:string, colors?:string[], features?:string[],
 *   specs?:Record<string,string>}} props.product
 * @param {boolean} [props.isInEnquiry]
 * @param {(selection: {product:object, qty:number, color?:string}) => void} [props.onAddToEnquiry]
 * @param {string} [props.className]
 */
export function ProductInfo({
  product,
  isInEnquiry = false,
  onAddToEnquiry,
  className,
}) {
  const [qty, setQty] = useState(1)
  const [color, setColor] = useState(product.colors?.[0])

  return (
    <div className={cn('flex flex-col', className)}>
      {(product.badge || product.availability) && (
        <div className="mb-4 flex gap-2">
          {product.badge && <Badge variant="solid">{product.badge}</Badge>}
          {product.availability && (
            <Badge
              variant={product.availability === 'In Stock' ? 'wa' : 'warning'}
            >
              {product.availability}
            </Badge>
          )}
        </div>
      )}

      <h1 className="mb-2 font-heading text-3xl font-bold leading-[1.15] text-ink md:text-4xl">
        {product.name}
      </h1>

      {product.categoryName && (
        <div className="mb-3 text-sm text-ink-secondary">
          Collection:{' '}
          <strong className="text-ink">{product.categoryName}</strong>
        </div>
      )}

      {product.capacity && (
        <div className="mb-3 text-sm text-ink-secondary">
          Capacity: <strong className="text-ink">{product.capacity}</strong>
        </div>
      )}

      <div className="mb-4">
        <ProductRating rating={product.rating} showOutOfFive />
      </div>

      <div className="mb-4">
        <ProductPrice
          price={product.price}
          originalPrice={product.originalPrice}
        />
      </div>

      {product.description && (
        <p className="mb-6 text-[15px] leading-relaxed text-ink-secondary">
          {product.description}
        </p>
      )}

      {product.colors?.length > 0 && (
        <div className="mb-6 border-t border-hairline pt-6">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-secondary">
            Select Color Option
          </div>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'rounded-full border px-4 py-2 text-[13px] font-medium transition-all duration-fast ease-brand',
                  c === color
                    ? 'border-ink bg-ink text-white'
                    : 'border-hairline text-ink-secondary hover:border-hairline-strong'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col items-start gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex shrink-0 items-center gap-3 rounded-md border border-hairline px-2 py-1.5">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-6 w-6 items-center justify-center rounded text-ink transition-colors duration-fast ease-brand hover:bg-surface-subtle"
          >
            −
          </button>
          <span className="w-5 text-center text-sm font-semibold text-ink">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
            className="flex h-6 w-6 items-center justify-center rounded text-ink transition-colors duration-fast ease-brand hover:bg-surface-subtle"
          >
            +
          </button>
        </div>
        <Button
          variant={isInEnquiry ? 'wa' : 'primary'}
          fullWidth
          onClick={() => onAddToEnquiry?.({ product, qty, color })}
        >
          {isInEnquiry ? '✓ Added to Enquiry list' : 'Add to Enquiry List'}
        </Button>
      </div>

      {product.features?.length > 0 && (
        <div className="mb-6 border-t border-hairline pt-6">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-secondary">
            Key Highlights
          </div>
          <ul className="flex flex-col gap-2.5">
            {product.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 text-sm text-ink"
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-wa"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {product.specs && (
        <div className="border-t border-hairline pt-6">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-secondary">
            Specifications
          </div>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(product.specs).map(([label, value]) => (
                <tr
                  key={label}
                  className="border-b border-hairline-subtle last:border-none"
                >
                  <td className="py-2.5 pr-4 text-ink-secondary">{label}</td>
                  <td className="py-2.5 font-medium text-ink">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
