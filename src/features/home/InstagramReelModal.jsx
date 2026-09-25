import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../utils/cn'
import {
  IconClose,
  IconInstagram,
  IconWhatsApp,
  IconShare,
  IconLink,
  IconCheck,
  IconPlay,
  IconExternalLink,
} from '../../components/layout/icons'
import { useAddToEnquiry } from '../../hooks/useAddToEnquiry'
import { ProductQuickViewModal } from './ProductQuickViewModal'

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {number} props.selectedIndex
 * @param {Array} props.reels
 * @param {() => void} props.onClose
 * @param {(index: number) => void} props.onSelectIndex
 */
export function InstagramReelModal({
  isOpen,
  selectedIndex = 0,
  reels = [],
  onClose,
  onSelectIndex,
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const videoRef = useRef(null)
  const navigate = useNavigate()

  const addToEnquiry = useAddToEnquiry()

  const resetPlaybackAndShare = () => {
    setIsPlaying(false)
    setIsShareOpen(false)
    setCopied(false)
    setQuickViewProduct(null)
  }

  // Prevent background scrolling while modal is open & add keyboard controls
  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Quick View is a secondary modal layered on top — Escape closes
        // it first and leaves the Reel modal open, matching how it closes
        // via its own backdrop click/close button.
        if (quickViewProduct) {
          setQuickViewProduct(null)
        } else {
          onClose?.()
        }
        return
      }
      // Reel navigation is intentionally disabled while Quick View is open
      // so it can't change the tagged products out from under it.
      if (quickViewProduct) return
      if (e.key === 'ArrowLeft' && reels.length > 1) {
        resetPlaybackAndShare()
        onSelectIndex?.((selectedIndex - 1 + reels.length) % reels.length)
      }
      if (e.key === 'ArrowRight' && reels.length > 1) {
        resetPlaybackAndShare()
        onSelectIndex?.((selectedIndex + 1) % reels.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, selectedIndex, reels.length, onClose, onSelectIndex, quickViewProduct])

  if (!isOpen || !reels.length) return null

  const currentReel = reels[selectedIndex] || reels[0]
  const prevIndex = (selectedIndex - 1 + reels.length) % reels.length
  const nextIndex = (selectedIndex + 1) % reels.length
  const prevReel = reels[prevIndex]
  const nextReel = reels[nextIndex]

  const videoSource = currentReel.videoUrl || currentReel.video

  const togglePlay = (e) => {
    e?.stopPropagation()
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play().catch(() => {})
        setIsPlaying(true)
      }
    } else {
      setIsPlaying((prev) => !prev)
    }
  }

  const handlePrev = (e) => {
    e?.stopPropagation()
    resetPlaybackAndShare()
    onSelectIndex?.(prevIndex)
  }

  const handleNext = (e) => {
    e?.stopPropagation()
    resetPlaybackAndShare()
    onSelectIndex?.(nextIndex)
  }

  // Native Web Share API first (opens the OS/browser's own share sheet —
  // no custom UI to build or maintain here). Falls back to the existing
  // WhatsApp/Copy Link popup only when navigator.share isn't available, so
  // the pre-existing fallback behavior (including its "Link Copied!"
  // feedback in handleCopyLink) is fully preserved rather than duplicated.
  // A user cancelling the native share sheet rejects with AbortError —
  // that's a normal, silent outcome, not an application error.
  const handleShareClick = (e) => {
    e.stopPropagation()
    if (navigator.share) {
      navigator
        .share({
          title: currentReel.title,
          url: currentReel.reelUrl || window.location.href,
        })
        .catch((error) => {
          if (error?.name !== 'AbortError') {
            console.error('[InstagramReelModal] share failed:', error)
          }
        })
    } else {
      setIsShareOpen((prev) => !prev)
    }
  }

  const handleShareWhatsApp = (e) => {
    e.stopPropagation()
    const reelUrl = currentReel.reelUrl || window.location.href
    const message = `Watch this Instagram Reel by ${currentReel.account || '@TUPPERWARE_KERALA'}: ${currentReel.title}\n${reelUrl}`
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
      '_blank'
    )
    setIsShareOpen(false)
  }

  const handleCopyLink = (e) => {
    e.stopPropagation()
    const reelUrl = currentReel.reelUrl || window.location.href
    navigator.clipboard.writeText(reelUrl).then(() => {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setIsShareOpen(false)
      }, 1800)
    })
  }

  // Tagged products list for current active reel
  const products = currentReel.products || [
    {
      id: currentReel.id,
      name: currentReel.productName || currentReel.title,
      price: currentReel.price || 1250,
      image: currentReel.image,
    },
  ]

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-hidden select-none"
      onClick={onClose}
    >
      {/* Top Right Close Button */}
      <button
        type="button"
        aria-label="Close reel viewer"
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[330] flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white border border-white/20 shadow-2xl transition-all duration-fast hover:bg-black/90 hover:scale-105 cursor-pointer"
      >
        <IconClose className="h-5 w-5" />
      </button>

      {/* Prev / Next Carousel Arrow Buttons */}
      {reels.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous reel"
            onClick={handlePrev}
            className="absolute left-3 sm:left-8 lg:left-12 top-1/2 z-[330] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-2xl transition-all duration-fast hover:bg-surface-subtle hover:scale-105 cursor-pointer"
          >
            <svg
              className="h-5 w-5"
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
            aria-label="Next reel"
            onClick={handleNext}
            className="absolute right-3 sm:right-8 lg:right-12 top-1/2 z-[330] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-2xl transition-all duration-fast hover:bg-surface-subtle hover:scale-105 cursor-pointer"
          >
            <svg
              className="h-5 w-5"
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

      {/* Main Reels Carousel Container */}
      <div
        className="relative flex items-center justify-center gap-4 sm:gap-6 lg:gap-8 w-full max-w-6xl h-full max-h-[760px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Reel Card Preview (Desktop) */}
        {reels.length > 1 && (
          <div
            onClick={handlePrev}
            className="hidden md:flex relative w-[220px] lg:w-[260px] h-[480px] lg:h-[540px] shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl opacity-40 hover:opacity-75 transition-all duration-smooth cursor-pointer transform scale-95 hover:scale-100 flex-col justify-end p-4"
          >
            <img
              src={prevReel.image}
              alt={prevReel.title}
              className="absolute inset-0 h-full w-full object-cover filter brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold tracking-wider uppercase text-white/70 block mb-1">
                PREVIOUS REEL
              </span>
              <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                {prevReel.title}
              </h4>
            </div>
          </div>
        )}

        {/* Center Active Reel Video Card */}
        <div className="relative w-full max-w-[360px] sm:max-w-[390px] h-[88vh] max-h-[720px] shrink-0 rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/20 flex flex-col justify-between z-[310]">
          {/* Top Story Progress Bar */}
          <div className="absolute top-2 inset-x-3 z-30 flex gap-1">
            {reels.map((_, idx) => (
              <div
                key={idx}
                className="h-0.5 flex-1 rounded-full overflow-hidden bg-white/30"
              >
                <div
                  className={cn(
                    'h-full transition-all duration-smooth bg-white',
                    idx === selectedIndex
                      ? 'w-full'
                      : idx < selectedIndex
                      ? 'w-full opacity-60'
                      : 'w-0'
                  )}
                />
              </div>
            ))}
          </div>

          {/* Top Reel Info Header */}
          <div className="absolute top-4 inset-x-3.5 z-30 flex items-center justify-between pointer-events-auto">
            {/* Account Pill */}
            <div className="flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md px-3 py-1 border border-white/20 text-white text-xs font-semibold shadow-md">
              <IconInstagram className="h-3.5 w-3.5 text-white" />
              <span>{currentReel.account || '@TUPPERWARE_KERALA'}</span>
            </div>

            {/* View Count Badge */}
            <div className="flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-md px-3 py-1 border border-white/20 text-white text-xs font-semibold shadow-md">
              <span>▶ {currentReel.views}</span>
            </div>
          </div>

          {/* Reel Video Media Player & Poster Fallback */}
          <div
            className="relative h-full w-full overflow-hidden cursor-pointer"
            onClick={togglePlay}
          >
            {videoSource ? (
              <video
                ref={videoRef}
                src={videoSource}
                poster={currentReel.image}
                className="h-full w-full object-cover"
                loop
                playsInline
                autoPlay
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <img
                src={currentReel.image}
                alt={currentReel.title}
                className="h-full w-full object-cover"
              />
            )}

            {/* Dark Gradient Overlay for Header & Footer Legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

            {/* Center Play Button Control */}
            {!isPlaying && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-ink shadow-2xl backdrop-blur-sm transition-transform duration-fast hover:scale-110">
                <IconPlay className="ml-0.5 h-6 w-6 fill-current" />
              </div>
            )}

            {/* Share Button (Positioned on top-right of bottom cards) */}
            <div className="absolute right-5 bottom-[215px] z-40">
              <button
                type="button"
                aria-label="Share reel"
                onClick={handleShareClick}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-black/80 border border-white/20 text-white shadow-2xl transition-all duration-fast hover:bg-black hover:scale-105 cursor-pointer"
              >
                <IconShare className="h-5 w-5 text-white" />
              </button>

              {/* Share Menu Popup */}
              {isShareOpen && (
                <div
                  className="absolute right-0 bottom-14 z-50 w-52 rounded-xl bg-zinc-900/95 border border-white/20 p-2 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-fast"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-wa hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <IconWhatsApp className="h-4 w-4 fill-current" />
                    <span>Share to WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <IconCheck className="h-4 w-4 text-wa" />
                    ) : (
                      <IconLink className="h-4 w-4" />
                    )}
                    <span>{copied ? 'Link Copied!' : 'Copy Product Link'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tagged Product Cards at Bottom of Active Reel */}
            <div className="absolute inset-x-3 bottom-3 z-30 flex gap-2.5">
              {products.map((product) => (
                <div
                  key={product.id || product.name}
                  className="relative w-[calc(50%-5px)] shrink-0 rounded-xl bg-[#18181b]/90 backdrop-blur-md border border-white/15 p-2.5 text-white flex flex-col justify-between shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Opens the Quick View modal — wraps only the
                      image/name/price area (never the button below) so
                      this stays valid, non-nested interactive HTML. A real
                      product-detail navigation only happens from inside
                      Quick View's "View Product Details" action. */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setQuickViewProduct(product)
                    }}
                    aria-label={`Quick view ${product.name}`}
                    className="flex w-full flex-col border-0 bg-transparent p-0 text-left cursor-pointer"
                  >
                    {/* Square Image Thumbnail */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-800 mb-2">
                      <img
                        src={product.image || currentReel.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Title & External Link Icon */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h5 className="text-[11px] font-bold text-white line-clamp-1 leading-tight">
                        {product.name}
                      </h5>
                      <IconExternalLink className="h-3 w-3 shrink-0 text-white/70" />
                    </div>

                    {/* Price in Green */}
                    <div className="text-xs font-black text-wa mb-2">
                      ₹{product.price?.toLocaleString()}
                    </div>
                  </button>

                  {/* ADD TO ENQUIRY Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      addToEnquiry(product)
                    }}
                    className="w-full rounded-lg border border-white/20 bg-white/10 hover:bg-white/25 active:scale-95 text-white text-[10px] font-extrabold tracking-wider py-1.5 uppercase transition-all duration-fast flex items-center justify-center cursor-pointer"
                  >
                    ADD TO ENQUIRY
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Reel Card Preview (Desktop) */}
        {reels.length > 1 && (
          <div
            onClick={handleNext}
            className="hidden md:flex relative w-[220px] lg:w-[260px] h-[480px] lg:h-[540px] shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl opacity-40 hover:opacity-75 transition-all duration-smooth cursor-pointer transform scale-95 hover:scale-100 flex-col justify-end p-4"
          >
            <img
              src={nextReel.image}
              alt={nextReel.title}
              className="absolute inset-0 h-full w-full object-cover filter brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold tracking-wider uppercase text-white/70 block mb-1">
                NEXT REEL
              </span>
              <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                {nextReel.title}
              </h4>
            </div>
          </div>
        )}
      </div>

      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToEnquiry={(product) => {
            setQuickViewProduct(null)
            addToEnquiry(product)
          }}
          onViewDetails={(product) => {
            setQuickViewProduct(null)
            onClose?.()
            navigate(`/product/${product.slug}`)
          }}
        />
      )}
    </div>
  )
}
