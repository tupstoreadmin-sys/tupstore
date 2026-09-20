import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

// Generic elevated surface — base for Why/Testimonial/Category cards
// (COMPONENT_INVENTORY.md §1) and, via className overrides, ProductCard.
// Deliberately unopinionated about padding/hover — different consumers
// need different treatments (e.g. why-card hovers with a -4px lift +
// shadow-subtle, ProductCard hovers with -6px + shadow-hover), so those
// are supplied by the consumer via className rather than baked in here.

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export const Card = forwardRef(function Card(
  { className, children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-hairline bg-white transition-all duration-fast ease-brand',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
})
