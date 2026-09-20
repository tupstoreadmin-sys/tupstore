import { forwardRef, useId } from 'react'
import { cn } from '../../utils/cn'
import {
  FIELD_BASE,
  FIELD_ERROR,
  FIELD_LABEL,
  FIELD_ERROR_TEXT,
} from './formFieldClasses'

/**
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {string} [props.id]
 * @param {string} [props.className] - applied to the <select> itself
 * @param {React.ReactNode} props.children - <option> elements
 */
export const Select = forwardRef(function Select(
  { label, error, id, className, containerClassName, children, ...rest },
  ref
) {
  const generatedId = useId()
  const selectId = id || generatedId

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={selectId} className={FIELD_LABEL}>
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            FIELD_BASE,
            'appearance-none pr-8 cursor-pointer',
            error && FIELD_ERROR,
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...rest}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-2.5 flex items-center text-ink-secondary">
          <svg
            className="h-4 w-4 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
      {error && <p className={FIELD_ERROR_TEXT}>{error}</p>}
    </div>
  )
})
