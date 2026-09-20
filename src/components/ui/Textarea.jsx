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
 * @param {string} [props.className] - applied to the <textarea> itself
 */
export const Textarea = forwardRef(function Textarea(
  { label, error, id, className, rows = 4, ...rest },
  ref
) {
  const generatedId = useId()
  const textareaId = id || generatedId

  return (
    <div>
      {label && (
        <label htmlFor={textareaId} className={FIELD_LABEL}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(FIELD_BASE, error && FIELD_ERROR, className)}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      />
      {error && <p className={FIELD_ERROR_TEXT}>{error}</p>}
    </div>
  )
})
