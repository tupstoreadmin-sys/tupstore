import { useState, useRef } from 'react'
import { cn } from '../../utils/cn'
import { InstagramReelModal } from './InstagramReelModal'

const SCROLL_AMOUNT = 236 // one card (220px) + the row's gap-4 (16px)

/**
 * @param {object} props
 * @param {{id:string, title:string, views:string, duration:string,
 *   image:string, account?:string, videoUrl?:string, reelUrl?:string}[]} props.reels
 * @param {(reel: object) => void} [props.onSelect]
 * @param {string} [props.className]
 */
export function InstagramReels({ reels = [], onSelect, className }) {
  const scrollerRef = useRef(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const scrollBy = (delta) =>
    scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' })

  const handleCardClick = (reel, index) => {
    onSelect?.(reel)
    setSelectedIndex(index)
    setIsModalOpen(true)
  }

  return (
    <div className={cn('relative', className)}>
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {reels.map((reel, index) => (
          <button
            key={reel.id}
            type="button"
            onClick={() => handleCardClick(reel, index)}
            className="w-[220px] shrink-0 overflow-hidden rounded-lg border border-hairline bg-white text-left transition-all duration-fast ease-brand hover:shadow-subtle cursor-pointer"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="relative h-[300px] overflow-hidden bg-surface-subtle">
              <img
                src={reel.image}
                alt={reel.title}
                className="h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)',
                }}
              />
              <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-badge-translucent text-ink transition-transform hover:scale-105 shadow-md">
                <svg
                  className="ml-0.5 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <span className="absolute left-2.5 top-2.5 rounded-sm bg-badge-translucent px-2 py-1 text-[10px] font-bold text-ink">
                Reel
              </span>
              <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between text-[11px] font-semibold text-white">
                <span>{reel.views}</span>
                <span>{reel.duration}</span>
              </div>
            </div>
            <div className="p-3">
              <h4 className="mb-0.5 line-clamp-1 text-[13px] font-bold text-ink">
                {reel.title}
              </h4>
              <p className="text-[11px] font-medium text-ink-secondary">
                {reel.account || '@TUPPERWARE_KERALA'}
              </p>
            </div>
          </button>
        ))}
      </div>

      {reels.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Scroll reels left"
            onClick={() => scrollBy(-SCROLL_AMOUNT)}
            className="absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-white text-ink shadow-subtle transition-all duration-fast ease-brand hover:border-ink hover:bg-ink hover:text-white md:flex cursor-pointer"
          >
            <svg
              className="h-4 w-4"
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
            aria-label="Scroll reels right"
            onClick={() => scrollBy(SCROLL_AMOUNT)}
            className="absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-white text-ink shadow-subtle transition-all duration-fast ease-brand hover:border-ink hover:bg-ink hover:text-white md:flex cursor-pointer"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Reel Lightbox Popup Modal */}
      <InstagramReelModal
        isOpen={isModalOpen}
        selectedIndex={selectedIndex}
        reels={reels}
        onClose={() => setIsModalOpen(false)}
        onSelectIndex={setSelectedIndex}
      />
    </div>
  )
}
