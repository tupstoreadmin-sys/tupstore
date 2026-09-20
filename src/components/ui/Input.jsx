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
 * @param {string} [props.className] - applied to the <input> itself
 */
export const Input = forwardRef(function Input(
  { label, error, id, className, type = 'text', ...rest },
  ref
) {
  const generatedId = useId()
  const inputId = id || generatedId

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className={FIELD_LABEL}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={cn(FIELD_BASE, error && FIELD_ERROR, className)}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      />
      {error && <p className={FIELD_ERROR_TEXT}>{error}</p>}
    </div>
  )
})
