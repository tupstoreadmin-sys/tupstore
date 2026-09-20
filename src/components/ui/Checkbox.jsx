import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

// .filter-label + .filter-label input — DESIGN_SYSTEM.md (native input,
// recolored via accent-color rather than a custom-built visual indicator —
// confirmed against reference/src/style.css, no custom checkmark SVG exists)

/**
 * @param {object} props
 * @param {string} [props.className] - applied to the <input> itself
 * @param {React.ReactNode} props.children - label text
 */
export const Checkbox = forwardRef(function Checkbox(
  { className, children, ...rest },
  ref
) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-ink-secondary">
      <input
        ref={ref}
        type="checkbox"
        className={cn('h-[15px] w-[15px] cursor-pointer accent-ink', className)}
        {...rest}
      />
      {children}
    </label>
  )
})
