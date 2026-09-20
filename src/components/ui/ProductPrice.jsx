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
 */
export function ProductPrice({ price, originalPrice, className }) {
  const hasDiscount = originalPrice && originalPrice > price
  const discountPct = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className="text-[13.5px] font-extrabold leading-none text-ink">
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
