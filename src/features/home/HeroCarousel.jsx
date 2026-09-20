import { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'
import { Container } from '../../components/layout'
import { HeroBanner } from './HeroBanner'

/**
 * @param {object} props
 * @param {Array} props.slides - HeroBanner `slide` shape
 * @param {string} [props.className]
 */
export function HeroCarousel({ slides = [], className }) {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goTo = (i) => setIndex((i + slides.length) % slides.length)

  // Auto-play timer — auto advances every 5.5 seconds with infinite loop
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % slides.length)
    }, 5500)

    return () => clearInterval(timer)
  }, [slides.length, isPaused])

  if (slides.length === 0) return null

  return (
    <div
      className={cn(
        'relative overflow-hidden group min-h-[460px] md:min-h-[580px]',
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* In-place stacked slides with pure GPU cross-fade (no layout shift) */}
      <div className="relative w-full min-h-[460px] md:min-h-[580px]">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000 ease-in-out',
              i === index
                ? 'z-10 opacity-100 pointer-events-auto'
                : 'z-0 opacity-0 pointer-events-none'
            )}
          >
            <HeroBanner slide={slide} isActive={i === index} />
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          {/* Circular side navigation buttons — visible on hover */}
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(index - 1)}
            className="absolute left-2.5 sm:left-5 top-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-white/95 text-ink shadow-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-fast ease-brand hover:scale-105 hover:bg-white hover:shadow-lg"
          >
            <svg
              className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(index + 1)}
            className="absolute right-2.5 sm:right-5 top-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-white/95 text-ink shadow-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-fast ease-brand hover:scale-105 hover:bg-white hover:shadow-lg"
          >
            <svg
              className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Bottom controls container — aligned with site-wide Container */}
          <div className="absolute inset-x-0 bottom-5 z-20 pointer-events-none">
            <Container className="relative flex items-center justify-between">
              {/* Bottom Left: Numeric slide counter (01 / 04) */}
              <div className="text-xs font-semibold tabular-nums text-ink pointer-events-auto">
                <span className="text-sm font-bold text-ink">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-ink/40">
                  {' '}
                  / {String(slides.length).padStart(2, '0')}
                </span>
              </div>

              {/* Bottom Center: Slide indicator dots */}
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 pointer-events-auto">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => goTo(i)}
                    className={cn(
                      'h-2 rounded-full transition-all duration-smooth ease-brand',
                      i === index
                        ? 'w-7 bg-ink'
                        : 'w-2 bg-ink/25 hover:bg-ink/50'
                    )}
                  />
                ))}
              </div>

              {/* Bottom Right: Green accent line indicator */}
              <div className="flex items-center pointer-events-auto">
                <div className="h-[3.5px] w-12 sm:w-14 rounded-full bg-[#25D366]" />
              </div>
            </Container>
          </div>
        </>
      )}
    </div>
  )
}
