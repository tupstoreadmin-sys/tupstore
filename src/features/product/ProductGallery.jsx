import { useState, useRef } from 'react'
import { cn } from '../../utils/cn'

// .gallery-main / .gallery-thumbs — DESIGN_SYSTEM.md §16/§18.
// Supports 1, 2, 4, 6+ dynamic images with mobile touch swipe gestures,
// thumbnail horizontal scroll track, and zero page-level horizontal overflow.

/**
 * @param {object} props
 * @param {string[]} props.images
 * @param {string} [props.alt]
 * @param {string} [props.className]
 */
export function ProductGallery({ images = [], alt = '', className }) {
  const [active, setActive] = useState(0)
  const touchStartX = useRef(null)

  if (!images || images.length === 0) return null

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || images.length <= 1) return
    const touchEndX = e.changedTouches[0].clientX
    const diffX = touchStartX.current - touchEndX

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Swipe left -> next image
        setActive((prev) => (prev < images.length - 1 ? prev + 1 : prev))
      } else {
        // Swipe right -> prev image
        setActive((prev) => (prev > 0 ? prev - 1 : prev))
      }
    }
    touchStartX.current = null
  }

  // Ensure active index is within bounds
  const safeActiveIndex = Math.min(active, images.length - 1)

  return (
    <div className={cn('flex flex-col gap-3 min-w-0 w-full', className)}>
      {/* Main Image Display */}
      <div
        className="relative aspect-square overflow-hidden rounded-lg bg-surface-subtle select-none touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[safeActiveIndex]}
          alt={alt ? `${alt} - Image ${safeActiveIndex + 1}` : `Product Image ${safeActiveIndex + 1}`}
          className="h-full w-full object-cover transition-opacity duration-fast ease-brand"
        />

        {/* Mobile image counter indicator when images > 1 */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm md:hidden select-none">
            {safeActiveIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip (only when images.length > 1) */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1.5 snap-x snap-mandatory scrollbar-none w-full min-w-0 flex-nowrap">
          {images.map((img, i) => {
            const isActive = i === safeActiveIndex
            return (
              <button
                key={`gallery-thumb-${i}`}
                type="button"
                aria-label={`View image ${i + 1} of ${images.length}`}
                aria-pressed={isActive}
                onClick={() => setActive(i)}
                className={cn(
                  'h-[68px] w-[68px] sm:h-[76px] sm:w-[76px] shrink-0 snap-start overflow-hidden rounded-md border-2 transition-all duration-fast ease-brand cursor-pointer',
                  isActive
                    ? 'border-ink ring-1 ring-ink opacity-100 scale-[1.02]'
                    : 'border-transparent opacity-60 hover:opacity-100'
                )}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
