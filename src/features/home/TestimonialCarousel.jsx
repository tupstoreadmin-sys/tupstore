import { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'

/**
 * @param {object} props
 * @param {string} [props.eyebrow]
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {{id:string, name:string, role?:string, location?:string,
 *   avatar:string, text:string}[]} props.testimonials
 * @param {boolean} [props.showHeader]
 * @param {string} [props.className]
 */
export function TestimonialCarousel({
  eyebrow = 'Customer Reviews',
  title = 'Loved By Our Customers',
  description = 'Read genuine feedback from families across Kerala who rely on our authentic Tupperware products daily.',
  testimonials = [],
  showHeader = true,
  className,
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleCards, setVisibleCards] = useState(4)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w < 768) {
        setVisibleCards(1)
      } else if (w < 1024) {
        setVisibleCards(2)
      } else {
        setVisibleCards(4)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, testimonials.length - visibleCards)
  const safeIndex = Math.min(currentIndex, maxIndex)

  const isPrevDisabled = safeIndex <= 0
  const isNextDisabled = safeIndex >= maxIndex

  const handlePrev = () => {
    if (!isPrevDisabled) {
      setCurrentIndex((prev) => Math.max(0, prev - 1))
    }
  }

  const handleNext = () => {
    if (!isNextDisabled) {
      setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
    }
  }

  // Calculate percentage and gap offset for responsive step calculation:
  // Mobile (1 visible): 100% per card, 20px gap -> calc(-N * (100% + 20px))
  // Tablet (2 visible): 50% per card, 10px gap -> calc(-N * (50% + 10px))
  // Desktop (4 visible): 25% per card, 5px gap -> calc(-N * (25% + 5px))
  const stepPercentage = visibleCards === 1 ? 100 : visibleCards === 2 ? 50 : 25
  const gapPx = visibleCards === 1 ? 20 : visibleCards === 2 ? 10 : 5

  return (
    <div className={cn('w-full', className)}>
      {/* 1. Section Header & Navigation Controls */}
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

          {/* Top Right Navigation Arrow Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-end shrink-0">
            <button
              type="button"
              aria-label="Previous testimonials"
              onClick={handlePrev}
              disabled={isPrevDisabled}
              className={cn(
                'flex h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center rounded-full border shadow-sm transition-all duration-fast ease-brand',
                isPrevDisabled
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
              aria-label="Next testimonials"
              onClick={handleNext}
              disabled={isNextDisabled}
              className={cn(
                'flex h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center rounded-full border shadow-sm transition-all duration-fast ease-brand',
                isNextDisabled
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
        </div>
      )}

      {/* 2. Testimonial Carousel Track */}
      <div className="relative overflow-hidden w-full">
        <div
          className="flex gap-5 transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(calc(-${safeIndex} * (${stepPercentage}% + ${gapPx}px)))`,
          }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex w-full md:w-[calc(50%-10px)] lg:w-[calc(25%-15px)] shrink-0 flex-col justify-between rounded-lg border border-hairline bg-white p-6 sm:p-8 transition-all duration-fast ease-brand hover:shadow-testimonial-hover"
            >
              <div>
                <div
                  className="mb-4 text-base text-star"
                  style={{ letterSpacing: '2px' }}
                >
                  ★★★★★
                </div>
                <p className="mb-6 text-left text-[15px] italic leading-[1.65] text-ink">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <div className="text-left text-[15px] font-bold leading-[1.3] text-ink">
                    {testimonial.name}
                  </div>
                  <div className="text-left text-[12.5px] leading-[1.4] text-ink-secondary">
                    {[testimonial.role, testimonial.location]
                      .filter(Boolean)
                      .join(' • ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
