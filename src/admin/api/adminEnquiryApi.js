import { supabase } from '../../lib/supabase'

// Admin-only Enquiry data-access layer. Isolated from src/api/enquiryApi.js
// (the customer-facing write-only path) exactly like adminCategoryApi.js/
// adminProductApi.js/adminSocialVideoApi.js/adminPromotionApi.js — this
// always operates as the signed-in admin's own `authenticated` Supabase
// session, relying entirely on RLS (via public.is_admin(), see
// db/migrations/0014_admin_enquiries.sql for the one piece this project
// was missing — UPDATE) rather than any elevated key. No service-role key
// is used or referenced anywhere in this file.
//
// Only fields that already exist on enquiries/enquiry_items (db/schema.sql)
// are used — nothing here invents a column.

const ADMIN_ENQUIRY_SELECT = `
  id, customer_name, customer_phone, customer_email, customer_message,
  status, created_at,
  enquiry_items(count)
`

export async function getAdminEnquiries() {
  const { data, error } = await supabase
    .from('enquiries')
    .select(ADMIN_ENQUIRY_SELECT)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// Embeds each enquiry_items row + its real product fields (id, name,
// image, slug) for the detail view's "Requested Products" section — never
// a duplicated copy of product data, always read live through the FK,
// exactly like getAdminPromotionById()'s equivalent embed.
// quantity/selected_color/price_at_enquiry are NOT product duplication —
// they are enquiry-specific historical facts (what was actually requested,
// at what price, at the time of the enquiry), preserved intentionally even
// if the product's current price/name later changes.
// `promotions(id, title, price, original_price, promotion_products(...))` is
// present only when this enquiry is "about" a promotion (promotion_id set)
// — see AdminEnquiryDetailModal.jsx. `promotion_products` here is the same
// existing tagging relation PromotionFormModal/PromotionDetailPage already
// read (0012_promotions.sql) — it is the promotion's own "Included
// Products" reference list, read live through the FK, never duplicated.
// `enquiry_items` is a fully separate concept now: a promotion and
// independently-added products coexist in one enquiry (client decision),
// so `enquiry_items` only ever holds products the customer added directly
// — the promotion's own tagged products are never inserted there (see
// api/enquiryApi.js/useAddPromotionToEnquiry.js).
export async function getAdminEnquiryById(enquiryId) {
  const { data, error } = await supabase
    .from('enquiries')
    .select(
      `id, customer_name, customer_phone, customer_email, customer_message, status, created_at,
       promotion_id, promotions ( id, title, price, original_price, promotion_products ( products ( name ) ) ),
       enquiry_items ( id, quantity, selected_color, price_at_enquiry, products ( id, name, image, slug, product_code ) )`
    )
    .eq('id', enquiryId)
    .maybeSingle()
  if (error) throw error
  return data
}

// `status` must be one of the three values enquiries.status's own check
// constraint already allows ('new' | 'contacted' | 'closed') — this
// function does not validate that itself, trusting the database constraint
// as the single source of truth, matching this project's existing
// convention of not re-implementing a check the database already enforces
// (e.g. products.availability).
export async function updateEnquiryStatus(enquiryId, status) {
  const { data, error } = await supabase
    .from('enquiries')
    .update({ status })
    .eq('id', enquiryId)
    .select(
      `id, customer_name, customer_phone, customer_email, customer_message, status, created_at`
    )
    .single()
  if (error) throw error
  return data
}

// enquiry_items references enquiry_id on delete cascade (db/schema.sql),
// so its rows disappear automatically — no manual child-table cleanup
// needed here, same reasoning as deletePromotion()/deleteHeroSlide().
// Requires db/migrations/0022_admin_enquiry_delete.sql's DELETE
// policy/grant on enquiries; fails with a Postgres permission error until
// that migration is applied, handled by the calling page like every other
// admin write in this project.
export async function deleteEnquiry(enquiryId) {
  const { error } = await supabase.from('enquiries').delete().eq('id', enquiryId)
  if (error) throw error
}
