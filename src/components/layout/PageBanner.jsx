import { cn } from '../../utils/cn'

// .page-header-banner / .page-banner-title — DESIGN_SYSTEM.md §5, already
// scoped in COMPONENT_INVENTORY.md §2 (Layout) but not built in Milestone 2
// since no page needed it yet. Built now rather than duplicated across the
// 5 pages that use it identically.

/**
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.image]
 * @param {string} [props.className]
 */
export function PageBanner({ title, image, className }) {
  return (
    <section
      className={cn(
        'relative flex h-40 items-center bg-banner-dark bg-cover bg-center md:h-[220px]',
        className
      )}
      style={image ? { backgroundImage: `url(${image})` } : undefined}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.65) 100%)',
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-container px-4">
        <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-white md:text-4xl">
          {title}
        </h1>
      </div>
    </section>
  )
}
