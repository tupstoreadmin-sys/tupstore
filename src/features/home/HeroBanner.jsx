import { cn } from '../../utils/cn'
import { Container } from '../../components/layout'
import { IconWhatsApp } from '../../components/layout/icons'

// .hero-tag / .hero-title / .hero-ctas / .hero-trust-badges — DESIGN_SYSTEM.md
// §18. Single-slide content; HeroCarousel composes multiple of these.
// CTAs are callback props (onClick), not hrefs — no routing logic here.

/**
 * @param {object} props
 * @param {{tag?:string, title:string, image?:string,
 *   primaryCta?:{label:string, onClick?:Function},
 *   secondaryCta?:{label:string, onClick?:Function},
 *   trustBadges?:string[]}} props.slide
 * @param {boolean} [props.isActive]
 * @param {string} [props.className]
 */
export function HeroBanner({ slide, isActive = true, className }) {
  const {
    tag,
    title,
    image,
    primaryCta,
    secondaryCta,
    trustBadges = [],
  } = slide

  return (
    <div
      className={cn(
        'relative flex min-h-[460px] items-center overflow-hidden bg-surface-subtle md:min-h-[580px]',
        className
      )}
    >
      {image && (
        <img
          src={image}
          alt=""
          className={cn(
            'absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[7000ms] ease-out',
            isActive ? 'scale-105' : 'scale-100'
          )}
        />
      )}

      {/* Smooth left-to-right white gradient overlay for ultra-crisp text contrast */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(90deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.82) 25%, rgba(255, 255, 255, 0.45) 38%, rgba(255, 255, 255, 0.12) 48%, rgba(255, 255, 255, 0) 58%)',
        }}
      />

      <Container className="relative z-10 w-full py-12 md:py-16">
        <div
          className={cn(
            // Text fades independently of the slide's own 1000ms crossfade
            // (see HeroCarousel.jsx) — deliberately fast with no overlap
            // window: outgoing text disappears in `duration-fast` (200ms)
            // with no delay, incoming text only starts appearing after
            // `delay-300` (300ms), i.e. once the outgoing text is already
            // fully gone. This prevents two headings ever being partially
            // visible at once while the background image keeps crossfading
            // smoothly underneath via the unchanged outer opacity
            // transition. End states (opacity-100/0, translate-y-0/3) are
            // unchanged — only how fast/when they're reached changed.
            'max-w-xl text-left transition-all ease-out duration-fast',
            isActive
              ? 'opacity-100 translate-y-0 delay-300'
              : 'opacity-0 translate-y-3'
          )}
        >
          {tag && (
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-white/90 backdrop-blur-sm px-3.5 py-1.5 text-xs font-semibold text-ink-secondary shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[#25D366]" />
              {tag}
            </span>
          )}

          <h1 className="mb-6 font-heading text-3xl font-black leading-[1.1] tracking-tight text-ink sm:text-4xl md:text-5xl lg:text-[52px]">
            {title}
          </h1>

          <div className="flex items-center gap-3 sm:gap-3.5">
            {primaryCta && (
              <button
                type="button"
                onClick={primaryCta.onClick}
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-md bg-ink px-5 sm:px-6 text-xs sm:text-sm font-semibold text-white whitespace-nowrap shrink-0 shadow-sm transition-all duration-fast ease-brand hover:bg-black hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{primaryCta.label}</span>
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            )}

            {secondaryCta && (
              <button
                type="button"
                aria-label={secondaryCta.label}
                onClick={secondaryCta.onClick}
                className="inline-flex h-12 w-12 sm:w-auto items-center justify-center gap-2 rounded-full sm:rounded-md bg-[#25D366] px-0 sm:px-6 text-sm font-semibold text-white whitespace-nowrap shrink-0 shadow-sm transition-all duration-fast ease-brand hover:bg-[#20ba5a] hover:scale-[1.02] active:scale-[0.98]"
              >
                <IconWhatsApp className="h-5 w-5 sm:h-4 sm:w-4 shrink-0 text-white fill-current" />
                <span className="hidden sm:inline">{secondaryCta.label}</span>
              </button>
            )}
          </div>

          {trustBadges.length > 0 && (
            <div className="mt-8 hidden sm:flex flex-col gap-2.5">
              {trustBadges.map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-2.5 text-sm font-semibold text-ink"
                >
                  <svg
                    className="h-4 w-4 shrink-0 text-[#25D366]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
