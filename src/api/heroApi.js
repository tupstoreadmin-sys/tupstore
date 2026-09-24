import { supabase } from '../lib/supabase'
import { handleApiError } from '../utils/handleApiError'

// Customer-facing Hero read path — isolated from
// src/admin/api/adminHeroApi.js exactly like every other customer/admin
// split in this project (productApi.js vs adminProductApi.js,
// promotionApi.js vs adminPromotionApi.js): this always reads as `anon`,
// relying entirely on the RLS already applied in
// db/migrations/0019_admin_hero_slides.sql, never the admin API's
// is_admin()-gated queries. No service-role key is used or referenced
// anywhere in this file.

const ACTIVE_HERO_SLIDES_SELECT = `
  id, badge, title, image, mobile_image, alt_text,
  button1_text, button1_type, button1_target,
  button2_text, button2_type, button2_target,
  sort_order,
  hero_slide_features ( text, sort_order )
`

/**
 * Active hero slides only, ordered for the Home hero carousel. `sort_order`
 * is the primary, admin-controlled order; `created_at` is a stable
 * tiebreaker for equal sort_order values, matching getActivePromotions()'s
 * own ordering convention.
 */
export async function getActiveHeroSlides() {
  const { data, error } = await supabase
    .from('hero_slides')
    .select(ACTIVE_HERO_SLIDES_SELECT)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  handleApiError(error, 'getActiveHeroSlides')
  return data ?? []
}

// button1_target/button2_target are plain text, not a real FK (see
// 0019_admin_hero_slides.sql's own comment on why — a single column can't
// point at both categories and products), so PostgREST can't embed the
// referenced product the way ACTIVE_PROMOTIONS_SELECT embeds
// promotion_products' own real FK. This is the one extra query needed:
// batch-resolve every product-type button target's id to its slug (product
// navigation is by slug, e.g. /product/:slug — see ProductDetailPage),
// so SupabaseHeroRepository never needs to look up products one at a time.
export async function getProductSlugsByIds(ids) {
  if (!ids || ids.length === 0) return []
  const { data, error } = await supabase.from('products').select('id, slug').in('id', ids)
  handleApiError(error, 'getProductSlugsByIds')
  return data ?? []
}
