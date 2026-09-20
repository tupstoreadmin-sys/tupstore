import { cn } from '../../utils/cn'

// .section / .section-grey — DESIGN_SYSTEM.md §5 (80px vertical rhythm,
// the primary spacing unit between page sections)

/**
 * @param {object} props
 * @param {boolean} [props.grey] - .section-grey background
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Section({ grey = false, className, children, ...rest }) {
  return (
    <section
      className={cn('py-12 md:py-20', grey && 'bg-surface-subtle', className)}
      {...rest}
    >
      {children}
    </section>
  )
}
