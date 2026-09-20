import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

// .filter-label + .filter-label input — same native-input + accent-color
// pattern as Checkbox, just type="radio". Kept as a separate component
// rather than merged with Checkbox since they're distinct form semantics
// (name/value single-select vs independent boolean).

/**
 * @param {object} props
 * @param {string} [props.className] - applied to the <input> itself
 * @param {React.ReactNode} props.children - label text
 */
export const Radio = forwardRef(function Radio(
  { className, children, ...rest },
  ref
) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-ink-secondary">
      <input
        ref={ref}
        type="radio"
        className={cn('h-[15px] w-[15px] cursor-pointer accent-ink', className)}
        {...rest}
      />
      {children}
    </label>
  )
})
