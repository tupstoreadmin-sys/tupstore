import { useState } from 'react'
import { cn } from '../../utils/cn'
import { Input, Textarea, Button } from '../../components/ui'

// Milestone 8 — the "customer details" step of the enquiry drawer's
// cart → details → success flow (see EnquiryDrawer.jsx). Purely prop-driven
// like every other file in this folder (no Context/service imports, per
// ARCHITECTURE.md §1) — owns only its own field values and validation,
// exactly like ProductInfo.jsx already owns local qty/color state.

const MIN_PHONE_DIGITS = 10
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate({ customerName, customerPhone, customerEmail }) {
  const errors = {}
  if (!customerName.trim()) errors.customerName = 'Name is required.'

  const digitCount = customerPhone.replace(/\D/g, '').length
  if (!customerPhone.trim()) {
    errors.customerPhone = 'Phone number is required.'
  } else if (digitCount < MIN_PHONE_DIGITS) {
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
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerMessage, setCustomerMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    const details = {
      customerName,
      customerPhone,
      customerEmail,
      customerMessage,
    }
    const errors = validate(details)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    onSubmit(details)
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
        placeholder="e.g. Anjali Nair"
        disabled={submitting}
      />
      <Input
        label="WhatsApp / Phone Number *"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        error={fieldErrors.customerPhone}
        placeholder="e.g. 98470 12345"
        disabled={submitting}
      />
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
