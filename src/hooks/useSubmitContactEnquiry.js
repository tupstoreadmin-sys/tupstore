import { useState } from 'react'
import { createEnquiry } from '../api/enquiryApi'

// Orchestrates a general Contact-page enquiry. Deliberately separate from
// useSubmitEnquiry.js: that hook reads/clears the product cart via
// EnquiryContext, which a Contact submission has no business touching (a
// customer using the Contact form has no cart, and submitting it must
// never clear someone else's in-progress product enquiry). Both hooks
// still funnel through the same createEnquiry (src/api/enquiryApi.js) —
// the same table, the same insert logic, the same Mock/Supabase branching
// — so this is one enquiry system with two thin, purpose-specific
// orchestration hooks, not a second system.

/**
 * @returns {{
 *   submit: (details: import('../models/Enquiry').CustomerDetails) => Promise<{id: string|null, persisted: boolean}>,
 *   submitting: boolean,
 *   error: string|null,
 * }}
 */
export function useSubmitContactEnquiry() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (customerDetails) => {
    setSubmitting(true)
    setError(null)

    try {
      return await createEnquiry({ ...customerDetails, items: [] })
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  return { submit, submitting, error }
}
