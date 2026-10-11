import { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'

// Google "G" mark (official four-colour logo paths) used to attribute reviews taken from Google.
function GoogleMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

/**
 * @param {object} props
 * @param {string} [props.eyebrow]
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {{id:string, name:string, role?:string, location?:string,
 *   avatar?:string, text:string, rating?:number, details?:string, date?:string,
 *   href?:string, source?:'google'}[]} props.testimonials
 *   - no `avatar`: a neutral initials circle is shown instead
 *   - `details` (e.g. a Google reviewer line) replaces the `role • location` line
 *   - `href`: the whole card becomes a link opening in a new tab
 *   - `source: 'google'`: shows the Google mark on the card
 * @param {boolean} [props.showHeader]
 * @param {import('react').ReactNode} [props.action] - rendered under the header description
 * @param {import('react').ReactNode} [props.footerNote] - small note rendered under the track
 * @param {string} [props.className]
 */
export function TestimonialCarousel({
  eyebrow = 'Customer Reviews',
  title = 'Loved By Our Customers',
  description = 'Read genuine feedback from families across Kerala who rely on our authentic Tupperware products daily.',
  testimonials = [],
  showHeader = true,
  action,
  footerNote,
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
        <div className="mb-6 sm:mb-8 flex items-end justify-between gap-3 sm:gap-4">
          <div className="min-w-0 text-left">
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
            {action && <div className="mt-4 sm:mt-5">{action}</div>}
          </div>

          {/* Top Right Navigation Arrow Buttons */}
          <div className="flex items-center gap-2 shrink-0">
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
          {testimonials.map((testimonial) => {
            const cardClass =
              'flex w-full md:w-[calc(50%-10px)] lg:w-[calc(25%-15px)] shrink-0 flex-col justify-between rounded-lg border border-hairline bg-white p-6 sm:p-8 transition-all duration-fast ease-brand hover:shadow-testimonial-hover'
            const rating = testimonial.rating ?? 5
            const detailLine =
              testimonial.details ??
              [testimonial.role, testimonial.location].filter(Boolean).join(' • ')

            const content = (
              <>
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-[15px] font-bold text-ink-secondary"
                        aria-hidden="true"
                      >
                        {getInitials(testimonial.name)}
                      </div>
                    )}
                    <div className="min-w-0 text-left text-[15px] font-bold leading-[1.3] text-ink">
                      {testimonial.name}
                    </div>
                  </div>
                  <div className="mb-4 flex items-center gap-2.5">
                    {testimonial.source === 'google' && (
                      <GoogleMark className="h-5 w-5 shrink-0" />
                    )}
                    <div
                      className="text-base text-star"
                      style={{ letterSpacing: '2px' }}
                      role="img"
                      aria-label={`${rating} out of 5 stars`}
                    >
                      {'★'.repeat(rating)}
                    </div>
                  </div>
                  <p className="line-clamp-4 text-left text-[15px] italic leading-[1.65] text-ink">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                </div>
                {(detailLine || testimonial.date) && (
                  <div className="mt-5">
                    {detailLine && (
                      <div className="text-left text-[12.5px] leading-[1.4] text-ink-secondary">
                        {detailLine}
                      </div>
                    )}
                    {testimonial.date && (
                      <div className="text-left text-[12.5px] leading-[1.4] text-ink-muted">
                        {testimonial.date}
                      </div>
                    )}
                  </div>
                )}
              </>
            )

            return testimonial.href ? (
              <a
                key={testimonial.id}
                href={testimonial.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${testimonial.name}'s review on Google (opens in a new tab)`}
                className={cardClass}
              >
                {content}
              </a>
            ) : (
              <div key={testimonial.id} className={cardClass}>
                {content}
              </div>
            )
          })}
        </div>
      </div>

      {footerNote && (
        <p className="mt-5 text-left text-xs leading-relaxed text-ink-muted sm:text-[13px]">
          {footerNote}
        </p>
      )}
    </div>
  )
}
