import { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'
import { IconWhatsApp } from '../../components/layout/icons'
import { STORE_WHATSAPP_NUMBER } from '../../utils/whatsapp'
import { MOCK_FEATURED_HIGHLIGHTS } from '../../data'

/**
 * @param {object} props
 * @param {string} [props.eyebrow]
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {Array} [props.promotions]
 * @param {(promotion: object) => void} [props.onSelect]
 * @param {boolean} [props.showHeader]
 * @param {string} [props.className]
 */
export function PromotionStrip({
  eyebrow = 'SPECIAL BANNERS',
  title = 'Featured Highlights',
  description = 'Ongoing limited combos and curated kit promotions for Kerala customers.',
  promotions = [],
  onSelect,
  showHeader = true,
  className,
}) {
  const items = promotions.length > 0 ? promotions : MOCK_FEATURED_HIGHLIGHTS
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleCards, setVisibleCards] = useState(1)

  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleCards(1)
      } else {
        setVisibleCards(2)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, items.length - visibleCards)
  const isPrevDisabled = currentIndex <= 0
  const isNextDisabled = currentIndex >= maxIndex

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

  const minSwipeDistance = 50

  const handleTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && !isNextDisabled) {
      handleNext()
    } else if (isRightSwipe && !isPrevDisabled) {
      handlePrev()
    }
  }

  return (
    <div className={cn('w-full', className)}>
      {/* 1. Section Header & 2. Navigation Arrows */}
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
              aria-label="Previous slide"
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
              aria-label="Next slide"
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

      {/* 3. Slider Track */}
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out md:gap-5"
          style={{
            transform:
              visibleCards === 1
                ? `translateX(-${currentIndex * 100}%)`
                : `translateX(-${currentIndex * 50}%)`,
          }}
        >
          {items.map((promo, idx) => {
            const badgeText = promo.badge || promo.tag
            const subtitleText = promo.description || promo.subtitle
            const buttonLabel = promo.buttonText || promo.cta || 'View Offer'

            return (
              <div
                key={promo.id || idx}
                className="group relative min-h-[260px] sm:min-h-[290px] w-full md:w-[calc(50%-10px)] shrink-0 overflow-hidden rounded-2xl md:rounded-3xl border border-hairline bg-[#F8F9FA] p-6 sm:p-8 transition-all duration-smooth hover:shadow-md"
              >
                {/* Card Right: Product image */}
                <img
                  src={promo.image}
                  alt={promo.title || ''}
                  className="absolute top-0 right-0 h-full w-[54%] sm:w-[58%] object-cover transition-transform duration-smooth ease-brand group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(90deg, #F8F9FA 0%, #F8F9FA 35%, rgba(248, 249, 250, 0.88) 52%, rgba(248, 249, 250, 0) 75%)',
                  }}
                />

                {/* Card Left: Text content area */}
                <div className="relative z-10 flex h-full flex-col justify-between max-w-[62%] sm:max-w-[58%]">
                  <div>
                    {badgeText && (
                      <span className="mb-3 sm:mb-4 inline-block rounded-full bg-black px-3.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                        {badgeText}
                      </span>
                    )}
                    <h3 className="mb-2 sm:mb-2.5 font-heading text-xl sm:text-2xl md:text-[25px] font-bold leading-[1.22] text-ink">
                      {promo.title}
                    </h3>
                    {subtitleText && (
                      <p className="mb-6 text-xs sm:text-sm leading-relaxed text-ink-secondary">
                        {subtitleText}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => onSelect?.(promo)}
                      className="inline-flex items-center justify-center rounded-full bg-black px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all duration-smooth ease-brand hover:bg-neutral-800 hover:scale-[1.02] hover:shadow-md active:scale-95"
                    >
                      {buttonLabel}
                    </button>
                    <a
                      href={`https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        promo.whatsappMessage ||
                          `Hi! I want to enquire about the ${promo.title || 'featured'} offer.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all duration-smooth ease-brand hover:bg-[#20ba5a] hover:scale-[1.02] hover:shadow-md active:scale-95"
                    >
                      <IconWhatsApp className="h-4 w-4" />
                      <span>WhatsApp Enquiry</span>
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

