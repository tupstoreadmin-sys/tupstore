import { cn } from '../../utils/cn'

// .detail-stars / .detail-rating-val — DESIGN_SYSTEM.md §16. The reference
// shows a single star glyph + numeric value (confirmed in
// reference/src/main.js renderProductDetailView), not a 5-star row.

/**
 * @param {object} props
 * @param {number} props.rating
 * @param {boolean} [props.showOutOfFive] - append "/ 5.0" (detail-page style)
 * @param {string} [props.className]
 */
export function ProductRating({ rating, showOutOfFive = false, className }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      <span className="text-xs leading-none tracking-[0.5px] text-star">★</span>
      <span className="text-xs font-bold leading-none text-ink">
        {rating}
        {showOutOfFive && (
          <span className="font-normal text-ink-secondary"> / 5.0</span>
        )}
      </span>
    </div>
  )
}
