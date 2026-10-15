import { cn } from '../../utils/cn'
import { Card } from './Card'
import { Badge } from './Badge'
import { Button } from './Button'
import { ProductPrice } from './ProductPrice'
import { ProductRating } from './ProductRating'
import { ProtectedImage } from './ProtectedImage'

// DESIGN_SYSTEM.md §16 — full spec. Presentation-only: takes a plain
// `product` object and callback props, owns no state, does no data
// fetching, does no navigation/routing. Whether "Add to Enquiry" opens a
// drawer, calls an API, or navigates anywhere is entirely the caller's
// decision — this component only renders and reports clicks.

/**
 * @param {object} props
 * @param {{ id: string|number, slug?: string, name: string, image: string, badge?: string,
 *   price: number, originalPrice?: number, rating: number }} props.product
 * @param {boolean} [props.isInEnquiry]
 * @param {(product: object) => void} [props.onAddToEnquiry]
 * @param {(product: object) => void} [props.onClick] - e.g. navigate to detail; caller's decision
 * @param {string} [props.className]
 */
export function ProductCard({
  product,
  isInEnquiry = false,
  onAddToEnquiry,
  onClick,
  className,
}) {
  const { name, image, badge, price, originalPrice, rating } = product

  // A rating is only shown when it is a real number in (0, 5]. Missing (null), blank,
  // non-numeric or zero values are treated as "no rating" - nothing is rendered, and
  // no value is ever invented.
  const ratingValue = rating === null || rating === undefined || rating === '' ? NaN : Number(rating)
  const hasRating = Number.isFinite(ratingValue) && ratingValue > 0 && ratingValue <= 5

  const hasDiscount = originalPrice && originalPrice > price
  const discountPct = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null

  const handleCardClick = () => {
    if (onClick) {
      onClick(product)
    }
  }

  const handleAddToEnquiryClick = (e) => {
    e.stopPropagation()
    onAddToEnquiry?.(product)
  }

  const formatInr = (amount) => `₹${amount.toLocaleString('en-IN')}`

  return (
    <Card
      className={cn(
        'group relative flex flex-col overflow-hidden p-0 min-w-0',
        'hover:border-hairline-hover hover:shadow-hover',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Image wrapper — 320px desktop, 160px mobile */}
      <div className="relative h-[160px] sm:h-[180px] md:h-[320px] overflow-hidden bg-surface-subtle shrink-0">
        <ProtectedImage
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-smooth ease-brand group-hover:scale-[1.04]"
        />

        {badge && (
          <Badge
            variant="translucent"
            className="absolute left-2 top-2 sm:left-2.5 sm:top-2.5 z-[15] max-w-[calc(100%-44px)] truncate text-[10px] sm:text-xs"
          >
            {badge}
          </Badge>
        )}

        {/* Mobile-only circular enquiry cart icon button (bottom right over image) */}
        <button
          type="button"
          aria-label={
            isInEnquiry
              ? `Remove ${name} from enquiry`
              : `Add ${name} to enquiry`
          }
          onClick={handleAddToEnquiryClick}
          className={cn(
            'absolute right-2 bottom-2 sm:right-2.5 sm:bottom-2.5 z-[15] flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-hairline transition-all duration-fast ease-brand md:hidden shadow-sm active:scale-95',
            isInEnquiry
              ? 'bg-[#25D366] text-white border-[#25D366]'
              : 'bg-white/95 text-ink backdrop-blur-sm hover:bg-ink hover:text-white'
          )}
        >
          {isInEnquiry ? (
            <svg
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          )}
        </button>

        {/* Desktop-only hover-reveal full-width enquiry CTA */}
        <div
          className={cn(
            'absolute inset-x-3 bottom-3 z-10 hidden md:block',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-fast'
          )}
        >
          <Button
            variant={isInEnquiry ? 'wa' : 'primary'}
            size="sm"
            fullWidth
            className="shadow-card-cta !px-4"
            onClick={handleAddToEnquiryClick}
          >
            {isInEnquiry ? 'Added to Enquiry' : 'Add to Enquiry'}
          </Button>
        </div>
      </div>

      {/* Body — 10px padding on mobile, 16px on desktop */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3 md:px-4 md:py-3 min-w-0">
        <h3 className="mb-1.5 sm:mb-2 line-clamp-2 min-h-[2.6em] text-[12.5px] sm:text-sm font-medium leading-[1.3] text-ink min-w-0">
          {name}
        </h3>

        {/* Desktop metadata layout (>=768px): the discount badge (if any) sits above; the
            bottom row holds the price on the left and the rating on the right. The price
            group wraps internally when the card is narrow, so the rating never drops to
            another line, overlaps the price, or gets clipped. */}
        <div className="mt-auto hidden md:flex md:flex-col gap-1 min-w-0">
          {hasDiscount && (
            <div>
              <Badge variant="discount">{discountPct}% off</Badge>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-2 min-w-0">
            <ProductPrice
              price={price}
              originalPrice={originalPrice}
              showBadge={false}
              className="min-w-0"
            />
            {hasRating && <ProductRating rating={ratingValue} className="shrink-0" />}
          </div>
        </div>

        {/* Mobile metadata layout (<768px): same structure at the compact sizes. */}
        <div className="mt-auto flex flex-col gap-1 md:hidden min-w-0">
          {hasDiscount && (
            <div>
              <Badge variant="discount" className="text-[9.5px] px-1.5 py-0.5">
                {discountPct}% off
              </Badge>
            </div>
          )}

          <div className="flex items-baseline justify-between gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 min-w-0">
              <span className="text-[13px] sm:text-[13.5px] font-extrabold leading-none text-ink">
                {formatInr(price)}
              </span>
              {hasDiscount && (
                <span className="text-[11px] leading-none text-ink-muted line-through">
                  {formatInr(originalPrice)}
                </span>
              )}
            </div>
            {hasRating && <ProductRating rating={ratingValue} className="shrink-0" />}
          </div>
        </div>
      </div>
    </Card>
  )
}
