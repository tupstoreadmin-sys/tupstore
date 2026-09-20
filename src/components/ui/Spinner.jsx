import { cn } from '../../utils/cn'

// .skeleton / @keyframes loadingSkeleton — DESIGN_SYSTEM.md §15. This is
// the *only* loading-state pattern that exists in the reference design — a
// shimmering placeholder block, not a rotating circular spinner (no
// spin/rotate keyframe exists anywhere in reference/src/style.css, confirmed
// by search). Named "Spinner" per your component list, but built to match
// what's actually in the approved design rather than inventing a rotating
// loader with no source precedent.

/**
 * @param {object} props
 * @param {string} [props.className] - controls size, e.g. "h-4 w-24" or "h-[320px] w-full"
 */
export function Spinner({ className }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('animate-loadingSkeleton rounded-md', className)}
      style={{
        // Multi-value arbitrary Tailwind classes (background-size's two
        // values, the gradient's comma-separated stops) hit the same
        // arbitrary-value bug noted in tailwind.config.js — inline style
        // sidesteps it entirely for this multi-value case.
        backgroundImage:
          'linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 50%, #f2f2f2 75%)',
        backgroundSize: '200% 100%',
      }}
    />
  )
}
