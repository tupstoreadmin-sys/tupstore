import { useState } from 'react'
import { useEnquiry } from '../contexts/EnquiryContext'
import { createEnquiry } from '../api/enquiryApi'
import { buildEnquiryMessage } from '../utils/buildEnquiryMessage'
import { buildWhatsAppUrl } from '../utils/whatsapp'

// Orchestration layer — combines EnquiryContext, the enquiry API, and the
// WhatsApp message builder, the same role useAddToEnquiry plays for
// EnquiryContext + UIContext. Only opens WhatsApp and clears the enquiry
// after a successful database write (or a successful Mock-mode simulation)
// — a thrown error leaves items and the caller's form values untouched so
// the customer can retry.

export function useSubmitEnquiry() {
  const { items, clearItems } = useEnquiry()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  /**
   * @param {import('../models/Enquiry').CustomerDetails} customerDetails
   * @returns {Promise<{id: string|null, persisted: boolean}>}
   */
  const submit = async (customerDetails) => {
    setSubmitting(true)
    setError(null)

    try {
      const outcome = await createEnquiry({ ...customerDetails, items })

      const message = buildEnquiryMessage({ items, customerDetails })
      const opened = window.open(
        buildWhatsAppUrl(message),
        '_blank',
        'noopener'
      )

      clearItems()
      return { ...outcome, whatsappOpened: Boolean(opened) }
    } catch (err) {
      // Never surface a raw Supabase/Postgres error to the customer (table
      // names, RLS/permission messages, etc.) — the real message still goes
      // to the console for debugging, exactly like every other api/*.js
      // failure path already logs via console.error elsewhere in this app.
      console.error('[useSubmitEnquiry] submit failed:', err.message)
      setError("We couldn't submit your enquiry right now. Please try again in a moment.")
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  return { submit, submitting, error }
}
