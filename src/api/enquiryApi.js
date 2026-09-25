import { supabase } from '../lib/supabase'
import { handleApiError } from '../utils/handleApiError'

// Writes only — mirrors productApi.js's role (raw Supabase calls), but also
// owns the mock/Supabase branch and the client-generated id, since there is
// no repository layer for enquiries (no read-side exists yet to justify
// one — see the Milestone 8 plan in conversation).
//
// `enquiries`/`enquiry_items` grant `anon` INSERT only, no SELECT (see
// DATABASE_DESIGN.md §13) — so every insert here generates its own id
// client-side and uses plain `.insert()`, never `.insert().select()`.

async function insertEnquiry({
  id,
  customerName,
  customerPhone,
  customerEmail,
  customerMessage,
  promotionId,
}) {
  const { error } = await supabase.from('enquiries').insert({
    id,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail || null,
    customer_message: customerMessage || null,
    promotion_id: promotionId ?? null,
    status: 'new',
  })

  handleApiError(error, 'insertEnquiry')
}

async function insertEnquiryItems(enquiryId, items) {
  const rows = items.map((item) => ({
    enquiry_id: enquiryId,
    product_id: item.id,
    quantity: item.qty,
    selected_color: item.selectedColor ?? null,
    price_at_enquiry: item.price,
  }))

  const { error } = await supabase.from('enquiry_items').insert(rows)
  handleApiError(error, 'insertEnquiryItems')
}

// Fire-and-forget-but-awaited: sends the internal notification email via
// the notify-enquiry Edge Function (see supabase/functions/notify-enquiry).
// Only the id is sent — no secrets, no customer data — the function
// re-fetches everything itself using the service-role key. Any failure
// here (function down, Resend outage, etc.) is only logged; it must never
// surface to the caller, since the enquiry has already been saved
// successfully by this point.
async function notifyEnquiryCreated(enquiryId) {
  try {
    const { error } = await supabase.functions.invoke('notify-enquiry', {
      body: { enquiryId },
    })
    if (error) {
      console.error('[Supabase] notify-enquiry:', error.message)
    }
  } catch (error) {
    console.error('[Supabase] notify-enquiry:', error.message)
  }
}

/**
 * @param {object} params
 * @param {string} params.customerName
 * @param {string} params.customerPhone
 * @param {string} [params.customerEmail]
 * @param {string} [params.customerMessage]
 * @param {import('../models/Enquiry').EnquiryItem[]} params.items
 * @param {string} [params.promotionId] - set when this enquiry is "about" a
 *   promotion (see useAddPromotionToEnquiry.js); null/undefined for every
 *   ordinary product enquiry, unchanged from today.
 * @returns {Promise<{id: string|null, persisted: boolean}>}
 */
export async function createEnquiry({
  customerName,
  customerPhone,
  customerEmail,
  customerMessage,
  items = [],
  promotionId,
}) {
  if (import.meta.env.VITE_DATA_SOURCE !== 'supabase') {
    // Mock mode: MockProductRepository's product ids ('p-1', ...) are not
    // valid uuids and there is no Supabase project to write to in this
    // mode anyway — simulate success so the demo/dev workflow keeps
    // working (WhatsApp still opens, list still clears), just without a
    // database row. See Milestone 8 plan for the reasoning.
    return { id: null, persisted: false }
  }

  const enquiryId = crypto.randomUUID()

  try {
    await insertEnquiry({
      id: enquiryId,
      customerName,
      customerPhone,
      customerEmail,
      customerMessage,
      promotionId,
    })
  } catch (error) {
    throw new Error(
      `Could not save your enquiry. Please try again. (${error.message})`,
      { cause: error }
    )
  }

  // A general (product-less) enquiry — e.g. the Contact page — has no line
  // items to attach. `items` defaults to `[]` for that case; the Product
  // Enquiry flow always passes a non-empty cart (EnquiryDrawer only shows
  // its submit action once items.length > 0), so this guard changes
  // nothing for that existing, verified path.
  if (items.length > 0) {
    try {
      await insertEnquiryItems(enquiryId, items)
    } catch (error) {
      throw new Error(
        `Your details were saved, but we couldn't save your product list. Please try again or contact us directly. (${error.message})`,
        { cause: error }
      )
    }
  }

  await notifyEnquiryCreated(enquiryId)

  return { id: enquiryId, persisted: true }
}
