import { cn } from '../../utils/cn'

// .section-header / .section-subtitle / .section-title / .section-desc —
// DESIGN_SYSTEM.md §5/§18. `align="left"` matches the left-aligned variant
// used for "Related Products"/"Recently Viewed" headers (COMPONENT_INVENTORY.md §7).

/**
 * @param {object} props
 * @param {string} [props.eyebrow]
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {'center'|'left'} [props.align]
 * @param {string} [props.className]
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}) {
  return (
    <div
      className={cn(
        'mb-6 md:mb-8',
        align === 'center' ? 'mx-auto max-w-2xl text-center' : 'text-left',
        className
      )}
    >
      {eyebrow && (
        <span className="mb-1.5 md:mb-2 block text-xs sm:text-[13px] font-semibold uppercase tracking-widest text-ink-secondary">
          {eyebrow}
        </span>
      )}
      <h2 className="mb-2 font-heading text-2xl font-bold leading-[1.15] text-ink sm:text-3xl md:text-[38px]">
        {title}
      </h2>
      {description && (
        <p className="text-sm leading-relaxed sm:text-[16px] md:text-[17px] font-normal text-ink-secondary">
          {description}
        </p>
      )}
    </div>
  )
}
