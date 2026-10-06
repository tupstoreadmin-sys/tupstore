import { cn } from '../../utils/cn'
import { Badge } from './Badge'

// .product-price / .reel-price-original / .reel-discount-badge — DESIGN_SYSTEM.md §16
// Pure display formatting (currency grouping, discount %) — not business
// logic: no data fetching, no state, just arithmetic on the numbers it's given.

function formatInr(amount) {
  return `₹${amount.toLocaleString('en-IN')}`
}

/**
 * @param {object} props
 * @param {number} props.price
 * @param {number} [props.originalPrice]
 * @param {string} [props.className] - applied to the wrapping row
 * @param {'default'|'detail'} [props.size] - 'detail' is the larger price used
 *   only on the Product Details page; every other use keeps the default.
 */
export function ProductPrice({ price, originalPrice, className, size = 'default' }) {
  const hasDiscount = originalPrice && originalPrice > price
  const discountPct = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'leading-none text-ink',
          size === 'detail' ? 'text-2xl font-bold' : 'text-[13.5px] font-extrabold'
        )}
      >
        {formatInr(price)}
      </span>
      {hasDiscount && (
        <span className="text-xs leading-none text-ink-muted line-through">
          {formatInr(originalPrice)}
        </span>
      )}
      {hasDiscount && <Badge variant="discount">{discountPct}% off</Badge>}
    </div>
  )
}
