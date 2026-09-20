import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

// DESIGN_SYSTEM.md §8 — Button Variants
const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold ' +
  'transition-all duration-fast ease-brand ' +
  'focus-visible:outline-none focus-visible:shadow-focus ' +
  'disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0'

const VARIANTS = {
  primary:
    'bg-ink text-ink-inverse shadow-btn-primary ' +
    'hover:bg-hairline-dark hover:-translate-y-0.5 hover:shadow-btn-primary-hover',
  secondary:
    'bg-white text-ink border border-hairline ' +
    'hover:bg-surface-subtle hover:border-hairline-strong hover:-translate-y-0.5',
  wa:
    'bg-wa text-white ' +
    'hover:bg-wa-hover hover:-translate-y-0.5 hover:shadow-btn-wa-hover',
  // .add-enquiry-btn (§16, ProductCard footer) — no lift, no shadow, unlike
  // the three variants above. Added in Milestone 1B for ProductCard reuse.
  subtle: 'bg-surface-subtle text-ink hover:bg-ink hover:text-ink-inverse',
}

const SIZES = {
  md: 'px-6 py-3 text-[15px] rounded-md',
  sm: 'px-4 py-2 text-[13px] rounded-md',
}

/**
 * @param {object} props
 * @param {'primary'|'secondary'|'wa'|'subtle'} [props.variant]
 * @param {'md'|'sm'} [props.size]
 * @param {boolean} [props.fullWidth]
 * @param {string} [props.href] - if given, renders an <a> instead of a <button>
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    href,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref
) {
  const classes = cn(
    BASE,
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className
  )

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button ref={ref} type={type} className={classes} {...rest}>
      {children}
    </button>
  )
})
