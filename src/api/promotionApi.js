import { supabase } from '../lib/supabase'
import { handleApiError } from '../utils/handleApiError'

// Customer-facing Promotions read path — isolated from
// src/admin/api/adminPromotionApi.js exactly like every other customer/
// admin split in this project (productApi.js vs adminProductApi.js,
// socialVideoApi.js vs adminSocialVideoApi.js): this always reads as
// `anon` (or a signed-in customer, which this app doesn't have — there is
// no customer login), relying entirely on the RLS already applied in
// db/migrations/0012_promotions.sql, never the admin API's is_admin()-gated
// queries. No service-role key is used or referenced anywhere in this file.
//
// Only fields actually needed by the current Featured Highlights UI/
// enquiry flow are selected — no admin-only columns, no service-role
// reads.
const ACTIVE_PROMOTIONS_SELECT = `
  id, title, description, image, badge, button_text, whatsapp_text,
  is_active, sort_order,
  promotion_products (
    sort_order,
    products ( id, name, price, image, slug, capacity, colors, availability, product_code )
  )
`

// Matches src/features/home/PromotionStrip.jsx's existing hard limit of 4
// cards (see its own visibleCards/maxIndex logic) — this is the same
// capacity productRepository.getFeaturedProducts() already used, not a new
// or increased limit.
const FEATURED_HIGHLIGHTS_LIMIT = 4

/**
 * Active promotions only, ordered for the Home Featured Highlights section.
 * `sort_order` is the primary, admin-controlled order; `created_at` is a
 * stable tiebreaker for equal sort_order values, matching
 * adminPromotionApi.js's own admin-list ordering convention.
 */
export async function getActivePromotions() {
  const { data, error } = await supabase
    .from('promotions')
    .select(ACTIVE_PROMOTIONS_SELECT)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(FEATURED_HIGHLIGHTS_LIMIT)

  handleApiError(error, 'getActivePromotions')
  return data ?? []
}
