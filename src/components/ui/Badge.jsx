import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

// DESIGN_SYSTEM.md §11/§16 — product badges, stock badges, discount badges
const VARIANTS = {
  // .detail-badge — solid dark pill, uppercase
  solid:
    'bg-ink text-ink-inverse text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm',
  // .detail-badge.stock-badge — in-stock indicator
  wa: 'bg-wa text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm',
  // .detail-badge.stock-badge.limited — limited-stock indicator
  warning:
    'bg-star text-ink text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm',
  // .reel-discount-badge — "17% off", not uppercase, smaller
  discount:
    'bg-discount-bg text-discount text-[10.5px] font-bold px-1.5 py-0.5 rounded',
  // .product-badge — translucent pill meant to sit on top of a product image;
  // positioning (absolute top/left) is the parent's concern, not this component's.
  // Uses the `badge-translucent` theme token rather than an arbitrary value —
  // see tailwind.config.js for why (comma-containing arbitrary values don't
  // generate CSS in this project's Tailwind setup).
  translucent:
    'bg-badge-translucent backdrop-blur-sm text-ink text-[11px] font-bold px-2.5 py-1 rounded-sm border border-hairline-subtle shadow-product-badge',
}

/**
 * @param {object} props
 * @param {'solid'|'wa'|'warning'|'discount'|'translucent'} [props.variant]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export const Badge = forwardRef(function Badge(
  { variant = 'solid', className, children, ...rest },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center leading-none',
        VARIANTS[variant],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  )
})
