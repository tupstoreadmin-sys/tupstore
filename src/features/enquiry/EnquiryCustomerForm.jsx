import { useId, useState } from 'react'
import { cn } from '../../utils/cn'
import { Input, Textarea, Button } from '../../components/ui'
import {
  FIELD_ERROR,
  FIELD_ERROR_TEXT,
  FIELD_LABEL,
} from '../../components/ui/formFieldClasses'

// Milestone 8 — the "customer details" step of the enquiry drawer's
// cart → details → success flow (see EnquiryDrawer.jsx). Purely prop-driven
// like every other file in this folder (no Context/service imports, per
// ARCHITECTURE.md §1) — owns only its own field values and validation,
// exactly like ProductInfo.jsx already owns local qty/color state.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Calling codes offered in the phone field. `minDigits` is the shortest national number
// accepted for that country (India keeps the form's original 10-digit minimum). USA and Canada
// share +1, so the selection is tracked by country `iso`, not by the code.
const COUNTRY_CODES = [
  { iso: 'IN', name: 'India', dial: '+91', minDigits: 10 },
  { iso: 'AE', name: 'UAE', dial: '+971', minDigits: 9 },
  { iso: 'SA', name: 'Saudi Arabia', dial: '+966', minDigits: 9 },
  { iso: 'QA', name: 'Qatar', dial: '+974', minDigits: 8 },
  { iso: 'OM', name: 'Oman', dial: '+968', minDigits: 8 },
  { iso: 'KW', name: 'Kuwait', dial: '+965', minDigits: 8 },
  { iso: 'BH', name: 'Bahrain', dial: '+973', minDigits: 8 },
  { iso: 'GB', name: 'UK', dial: '+44', minDigits: 10 },
  { iso: 'US', name: 'USA', dial: '+1', minDigits: 10 },
  { iso: 'CA', name: 'Canada', dial: '+1', minDigits: 10 },
  { iso: 'AU', name: 'Australia', dial: '+61', minDigits: 9 },
  { iso: 'SG', name: 'Singapore', dial: '+65', minDigits: 8 },
]
const DEFAULT_COUNTRY_ISO = 'IN'

// Shortest/longest full international number (digits, country code included) accepted when the
// customer types their own "+" / "00" country code.
const MIN_INTERNATIONAL_DIGITS = 8
const MAX_INTERNATIONAL_DIGITS = 15

/**
 * Turns what the customer typed plus the selected country into one international number.
 * - A number typed with its own "+" or "00" prefix is taken as is (the dropdown is ignored), so
 *   the country code is never duplicated.
 * - India: a leading 91 on a 12-digit entry is treated as an already-typed country code.
 * - A leading trunk "0" on a national number is dropped.
 * Returns { valid, full } — `full` is e.g. "+91 9847012345" or "+971501234567".
 */
function buildPhoneNumber(rawInput, country) {
  const trimmed = rawInput.trim()
  const digits = trimmed.replace(/\D/g, '')

  if (trimmed.startsWith('+') || trimmed.startsWith('00')) {
    const international = trimmed.startsWith('+') ? digits : digits.slice(2)
    const valid =
      international.length >= MIN_INTERNATIONAL_DIGITS &&
      international.length <= MAX_INTERNATIONAL_DIGITS
    const dialDigits = country.dial.slice(1)
    const full = international.startsWith(dialDigits)
      ? `${country.dial} ${international.slice(dialDigits.length)}`
      : `+${international}`
    return { valid, full }
  }

  const dialDigits = country.dial.slice(1)
  let national = digits.replace(/^0+/, '')
  if (
    country.iso === 'IN' &&
    national.length === 12 &&
    national.startsWith(dialDigits)
  ) {
    national = national.slice(dialDigits.length)
  }

  const valid =
    national.length >= country.minDigits &&
    dialDigits.length + national.length <= MAX_INTERNATIONAL_DIGITS
  return { valid, full: `${country.dial} ${national}` }
}

function validate({ customerName, customerPhone, customerEmail }, country) {
  const errors = {}
  if (!customerName.trim()) errors.customerName = 'Name is required.'

  if (!customerPhone.trim()) {
    errors.customerPhone = 'Phone number is required.'
  } else if (!buildPhoneNumber(customerPhone, country).valid) {
    errors.customerPhone = 'Enter a valid phone number.'
  }

  // Optional — only validated when the customer actually provides one.
  const trimmedEmail = customerEmail.trim()
  if (trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail)) {
    errors.customerEmail = 'Please enter a valid email address.'
  }

  return errors
}

/**
 * @param {object} props
 * @param {(details: import('../../models/Enquiry').CustomerDetails) => void} props.onSubmit
 * @param {() => void} [props.onBack]
 * @param {boolean} [props.submitting]
 * @param {string} [props.error]
 * @param {string} [props.className]
 */
export function EnquiryCustomerForm({
  onSubmit,
  onBack,
  submitting = false,
  error,
  className,
}) {
  const [customerName, setCustomerName] = useState('')
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY_ISO)
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerMessage, setCustomerMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const phoneId = useId()
  const country = COUNTRY_CODES.find((c) => c.iso === countryIso)

  const handleSubmit = (e) => {
    e.preventDefault()
    const details = {
      customerName,
      customerPhone,
      customerEmail,
      customerMessage,
    }
    const errors = validate(details, country)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    // The enquiry (WhatsApp message, database, email) gets the full international number.
    onSubmit({
      ...details,
      customerPhone: buildPhoneNumber(customerPhone, country).full,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex flex-col gap-4', className)}
    >
      <Input
        label="Full Name *"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        error={fieldErrors.customerName}
        placeholder="e.g. Anjali"
        disabled={submitting}
      />
      <div>
        <label htmlFor={phoneId} className={FIELD_LABEL}>
          WhatsApp / Phone Number *
        </label>
        <div
          className={cn(
            'flex w-full overflow-hidden rounded-md border border-hairline-strong bg-white shadow-input transition-all duration-fast ease-brand',
            'focus-within:border-ink focus-within:shadow-focus',
            fieldErrors.customerPhone && FIELD_ERROR,
            submitting && 'opacity-50'
          )}
        >
          {/* Compact visible code; the native select sits invisibly on top so the full country
              list (and mobile pickers) still work and stay keyboard/screen-reader accessible. */}
          <div className="relative flex shrink-0 items-center gap-1 border-r border-hairline-strong px-3 text-sm text-ink">
            <span>{country.dial}</span>
            <svg
              className="h-3.5 w-3.5 text-ink-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            <select
              aria-label="Country calling code"
              value={countryIso}
              onChange={(e) => setCountryIso(e.target.value)}
              disabled={submitting}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.iso} value={c.iso}>
                  {c.name} ({c.dial})
                </option>
              ))}
            </select>
          </div>
          <input
            id={phoneId}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="e.g. 98470 12345"
            disabled={submitting}
            aria-invalid={fieldErrors.customerPhone ? 'true' : undefined}
            aria-describedby={
              fieldErrors.customerPhone ? `${phoneId}-error` : undefined
            }
            className="min-w-0 flex-1 bg-transparent px-3.5 py-3 font-body text-sm text-ink placeholder:text-ink-muted focus:outline-none disabled:cursor-not-allowed"
          />
        </div>
        {fieldErrors.customerPhone && (
          <p id={`${phoneId}-error`} className={FIELD_ERROR_TEXT}>
            {fieldErrors.customerPhone}
          </p>
        )}
      </div>
      <Input
        type="email"
        label="Email Address"
        value={customerEmail}
        onChange={(e) => setCustomerEmail(e.target.value)}
        error={fieldErrors.customerEmail}
        placeholder="e.g. anjali@example.com"
        disabled={submitting}
      />
      <Textarea
        label="Message / Notes"
        rows={3}
        value={customerMessage}
        onChange={(e) => setCustomerMessage(e.target.value)}
        placeholder="Anything else we should know?"
        disabled={submitting}
      />

      {error && <p className="text-xs text-error">{error}</p>}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={submitting}
        >
          Back
        </Button>
        <Button type="submit" variant="wa" fullWidth disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Enquiry'}
        </Button>
      </div>
    </form>
  )
}
