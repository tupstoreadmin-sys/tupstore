import { supabase } from '../lib/supabase'
import { handleApiError } from '../utils/handleApiError'

// Writes only — same shape as enquiryApi.js (no repository layer, since
// there is no client-side read need for this table either: anon can only
// INSERT, never SELECT, matching db/migrations/0018_newsletter_subscribers.sql).

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Postgres unique_violation — raised by the case-insensitive unique index
// on lower(email) (0018). Not a failure from the caller's point of view:
// the visitor is already subscribed, so this is surfaced as a distinct
// status rather than a thrown error.
const UNIQUE_VIOLATION = '23505'

/**
 * @param {object} params
 * @param {string} params.name
 * @param {string} params.email
 * @returns {Promise<{ status: 'subscribed' | 'already_subscribed' }>}
 */
export async function subscribeToNewsletter({ name, email }) {
  const trimmedName = (name ?? '').trim()
  const trimmedEmail = (email ?? '').trim()

  if (!trimmedName) {
    throw new Error('Please enter your name.')
  }
  if (!trimmedEmail || !EMAIL_PATTERN.test(trimmedEmail)) {
    throw new Error('Please enter a valid email address.')
  }

  if (import.meta.env.VITE_DATA_SOURCE !== 'supabase') {
    // Mock mode: no Supabase project to write to — simulate success so the
    // demo/dev workflow keeps working, matching createEnquiry's mock
    // branch in enquiryApi.js.
    return { status: 'subscribed' }
  }

  const { error } = await supabase.from('newsletter_subscribers').insert({
    name: trimmedName,
    email: trimmedEmail,
  })

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { status: 'already_subscribed' }
    }
    handleApiError(error, 'subscribeToNewsletter')
  }

  return { status: 'subscribed' }
}
