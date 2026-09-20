import { cn } from '../../utils/cn'

// .shop-sidebar — DESIGN_SYSTEM.md §18. Plain layout shell; accepts any
// content as children (typically ProductFilters), kept separate so the
// sidebar chrome and the filter controls stay independently reusable.

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export function FilterSidebar({ children, className }) {
  return (
    <aside
      className={cn(
        'hidden md:block w-full md:w-[200px] md:shrink-0',
        className
      )}
    >
      {children}
    </aside>
  )
}
