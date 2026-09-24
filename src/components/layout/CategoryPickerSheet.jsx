import { cn } from '../../utils/cn'
import { IconClose, IconGrid } from './icons'

// Mobile-only bottom sheet listing every category as a plain link, opened
// by MobileBottomNav's "Categories" tab. Not a new page/route — tapping a
// category navigates to the existing `/shop?category=<id>` destination
// (the same one HomePage's CategoryCarousel and Header's mega menu already
// use), then closes itself. Visual pattern (overlay + panel, shadow-drawer,
// border-hairline, IconClose header) matches EnquiryDrawer.jsx/SearchOverlay.jsx
// — the only existing overlay precedents in this codebase — just anchored
// to the bottom edge instead of the side, per "clean mobile list/sheet".

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {{id: string, name: string}[]} [props.categories]
 * @param {(category: {id: string, name: string}) => void} props.onSelect
 * @param {string} [props.className]
 */
export function CategoryPickerSheet({
  isOpen,
  onClose,
  categories = [],
  onSelect,
  className,
}) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[290] bg-overlay md:hidden" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shop by category"
        className={cn(
          'fixed inset-x-0 bottom-0 z-[300] flex max-h-[75vh] flex-col rounded-t-xl bg-white shadow-drawer md:hidden',
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-hairline p-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
            <IconGrid className="h-5 w-5" />
            Shop by Category
          </h3>
          <button
            type="button"
            aria-label="Close category list"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary transition-colors duration-fast ease-brand hover:text-ink"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <nav
          aria-label="Categories"
          className="flex flex-col overflow-y-auto p-2"
          style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect?.(category)}
              className="flex items-center rounded-md px-4 py-3.5 text-left text-[15px] font-medium text-ink transition-colors duration-fast ease-brand hover:bg-surface-subtle"
            >
              {category.name}
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}
