import { cn } from '../../utils/cn'
import { getDiscountPercent } from '../../utils/discount'
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
 * @param {'default'|'detail'|'offer'} [props.size] - 'detail' is the larger price
 *   used only on the Product Details page; 'offer' is the larger price row used
 *   only on the Promotion Detail page (offer price > original price > discount
 *   badge, wrapping cleanly when narrow). Every other use keeps the default.
 */
export function ProductPrice({ price, originalPrice, className, size = 'default' }) {
  const discountPct = getDiscountPercent(price, originalPrice)
  const hasDiscount = discountPct !== null
  const isOffer = size === 'offer'

  // Product Details page, discounted product: labelled "Offer Price:" / "MRP:" pairs
  // plus the discount badge. Each label+amount stays together and the row wraps
  // between groups on narrow screens. The MRP uses the secondary text colour (not
  // the lighter muted one) so the struck-through amount stays readable. Without a
  // discount there is no MRP, so the plain price is shown (below).
  if (size === 'detail' && hasDiscount) {
    return (
      <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2', className)}>
        <span className="inline-flex items-baseline gap-1.5">
          <span className="text-sm font-medium text-ink-secondary">Offer Price:</span>
          <span className="text-2xl font-bold leading-none text-ink">{formatInr(price)}</span>
        </span>
        <span className="inline-flex items-baseline gap-1.5">
          <span className="text-sm font-medium text-ink-secondary">MRP:</span>
          <span className="text-base leading-none text-ink-secondary line-through">
            {formatInr(originalPrice)}
          </span>
        </span>
        <Badge variant="discount">{discountPct}% off</Badge>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center',
        isOffer ? 'flex-wrap gap-x-2.5 gap-y-1.5' : 'gap-1.5',
        className
      )}
    >
      <span
        className={cn(
          'leading-none text-ink',
          size === 'detail' && 'text-2xl font-bold',
          isOffer && 'text-2xl font-extrabold',
          !isOffer && size !== 'detail' && 'text-[13.5px] font-extrabold'
        )}
      >
        {formatInr(price)}
      </span>
      {hasDiscount && (
        <span
          className={cn(
            'leading-none text-ink-muted line-through',
            isOffer ? 'text-base' : 'text-xs'
          )}
        >
          {formatInr(originalPrice)}
        </span>
      )}
      {hasDiscount &&
        (isOffer ? (
          <span className="rounded bg-discount-bg px-2 py-1 text-xs font-bold leading-none text-discount">
            {discountPct}% off
          </span>
        ) : (
          <Badge variant="discount">{discountPct}% off</Badge>
        ))}
    </div>
  )
}
