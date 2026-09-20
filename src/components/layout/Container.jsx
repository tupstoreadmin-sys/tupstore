import { cn } from '../../utils/cn'

// .container — DESIGN_SYSTEM.md §12 (max-w-container token defined in
// tailwind.config.js: 1440px, matching --container-max-width in the source)

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Container({ className, children, ...rest }) {
  return (
    <div className={cn('mx-auto max-w-container px-4', className)} {...rest}>
      {children}
    </div>
  )
}
