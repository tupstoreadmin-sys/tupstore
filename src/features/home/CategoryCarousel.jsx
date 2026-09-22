import { useRef, useState, useEffect, useCallback } from 'react'
import { cn } from '../../utils/cn'

// .home-category-cards-grid — DESIGN_SYSTEM.md §18.
// Mobile (<768px): Horizontal swipeable carousel track with scroll snap
// Desktop (>=768px): 6 cards visible per row; scrollable with arrows if categories.length > 6

/**
 * @param {object} props
 * @param {{id:string, name:string, tagline?:string, image:string}[]} props.categories
 * @param {(category: object) => void} [props.onSelect]
 * @param {boolean} [props.showHeader]
 * @param {string} [props.eyebrow]
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {string} [props.className]
 */
export function CategoryCarousel({
  categories = [],
  onSelect,
  showHeader = false,
  eyebrow = 'Explore Collections',
  title = 'Shop By Category',
  description = 'Browse our full range of product categories.',
  className,
}) {
  const scrollerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const tolerance = 6
    setCanScrollLeft(scrollLeft > tolerance)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - tolerance)
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    checkScroll()

    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)

    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [categories, checkScroll])

  const handlePrev = () => {
    const el = scrollerRef.current
    if (!el) return
    const firstCard = el.firstElementChild
    const gap = 16
    const step = firstCard ? firstCard.offsetWidth + gap : el.clientWidth / 6
    el.scrollBy({ left: -step, behavior: 'smooth' })
  }

  const handleNext = () => {
    const el = scrollerRef.current
    if (!el) return
    const firstCard = el.firstElementChild
    const gap = 16
    const step = firstCard ? firstCard.offsetWidth + gap : el.clientWidth / 6
    el.scrollBy({ left: step, behavior: 'smooth' })
  }

  const showArrows = categories.length > 6

  const renderArrowControls = () => (
    <div className="hidden md:flex lg:hidden items-center gap-2 self-start sm:self-end shrink-0">
      <button
        type="button"
        aria-label="Previous categories"
        onClick={handlePrev}
        disabled={!canScrollLeft}
        className={cn(
          'flex h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center rounded-full border shadow-sm transition-all duration-fast ease-brand cursor-pointer',
          !canScrollLeft
            ? 'border-hairline bg-white text-neutral-300 cursor-not-allowed opacity-60'
            : 'border-hairline bg-white text-ink hover:border-black hover:bg-black hover:text-white hover:shadow-md active:scale-95'
        )}
      >
        <svg
          className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next categories"
        onClick={handleNext}
        disabled={!canScrollRight}
        className={cn(
          'flex h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center rounded-full border shadow-sm transition-all duration-fast ease-brand cursor-pointer',
          !canScrollRight
            ? 'border-hairline bg-white text-neutral-300 cursor-not-allowed opacity-60'
            : 'border-hairline bg-white text-ink hover:border-black hover:bg-black hover:text-white hover:shadow-md active:scale-95'
        )}
      >
        <svg
          className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )

  return (
    <div className={cn('relative w-full', className)}>
      {showHeader && (
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-left">
            {eyebrow && (
              <span className="mb-1.5 block text-xs sm:text-[13px] font-semibold uppercase tracking-widest text-ink-secondary">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="mb-2 font-heading text-2xl font-bold leading-[1.15] text-ink sm:text-3xl md:text-[38px]">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm leading-relaxed sm:text-[16px] md:text-[17px] font-normal text-ink-secondary max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {showArrows && renderArrowControls()}
        </div>
      )}

      {!showHeader && showArrows && (
        <div className="mb-4 flex justify-end">{renderArrowControls()}</div>
      )}

      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-none md:gap-3 lg:grid lg:grid-cols-6 lg:gap-5 lg:overflow-visible lg:pb-0 lg:snap-none scroll-smooth"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            aria-label={`Browse ${category.name}`}
            onClick={() => onSelect?.(category)}
            className="group shrink-0 w-[155px] sm:w-[165px] md:w-[calc((100%-60px)/6)] lg:w-full snap-start overflow-hidden rounded-lg border border-hairline bg-white text-left transition-all duration-fast ease-brand hover:shadow-subtle cursor-pointer"
          >
            <div className="h-[120px] md:h-[170px] lg:h-auto lg:aspect-[4/5] overflow-hidden bg-surface-subtle">
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-smooth ease-brand group-hover:scale-105"
              />
            </div>
            <div className="p-2 md:p-4">
              <div className="text-[13px] md:text-[13.5px] font-bold text-ink truncate">
                {category.name}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
