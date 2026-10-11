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
 * @param {'default'|'detail'|'offer'} [props.size] - 'detail' (Product Details page)
 *   and 'offer' (Promotion Detail page) are the two detail-page layouts. Both share
 *   one labelled layout for a genuinely discounted item ("Offer Price:", "MRP:",
 *   discount badge); they differ only in the badge size and price weight. Every
 *   other use (cards, quick view, enquiry list) keeps the compact default.
 */
export function ProductPrice({ price, originalPrice, className, size = 'default' }) {
  const discountPct = getDiscountPercent(price, originalPrice)
  const hasDiscount = discountPct !== null
  const isOffer = size === 'offer'
  const isDetailLayout = size === 'detail' || isOffer

  // Detail pages, genuinely discounted item: labelled "Offer Price:" / "MRP:" pairs
  // plus the discount badge. Each label+amount stays together and the row wraps
  // between groups on narrow screens. The MRP uses the secondary text colour (not
  // the lighter muted one) so the struck-through amount stays readable. Without a
  // genuine discount there is no MRP, so only the plain price is shown (below).
  if (isDetailLayout && hasDiscount) {
    return (
      <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2', className)}>
        <span className="inline-flex items-baseline gap-1.5">
          <span className="text-sm font-medium text-ink-secondary">Offer Price:</span>
          <span
            className={cn(
              'text-2xl leading-none text-ink',
              isOffer ? 'font-extrabold' : 'font-bold'
            )}
          >
            {formatInr(price)}
          </span>
        </span>
        <span className="inline-flex items-baseline gap-1.5">
          <span className="text-sm font-medium text-ink-secondary">MRP:</span>
          <span className="text-base leading-none text-ink-secondary line-through">
            {formatInr(originalPrice)}
          </span>
        </span>
        {isOffer ? (
          <span className="rounded bg-discount-bg px-2 py-1 text-xs font-bold leading-none text-discount">
            {discountPct}% off
          </span>
        ) : (
          <Badge variant="discount">{discountPct}% off</Badge>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'leading-none text-ink',
          isDetailLayout ? 'text-2xl' : 'text-[13.5px] font-extrabold',
          size === 'detail' && 'font-bold',
          isOffer && 'font-extrabold'
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
