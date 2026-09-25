import { supabase } from '../lib/supabase'
import { handleApiError } from '../utils/handleApiError'

// Raw Supabase queries only — no mapping, no shaping, no knowledge of the
// InstagramReels/InstagramReelModal Reel shape. SupabaseSocialVideosRepository
// is responsible for turning what this returns into that shape. Mirrors
// api/productApi.js's convention exactly.
//
// Customer-facing reads only. This file never inserts/updates/deletes —
// the Admin Social Videos page (src/admin/api/adminSocialVideoApi.js) owns
// all writes, as its own already-signed-in-admin-only, RLS-gated module.
// This module runs as `anon` (or a signed-in-but-non-admin customer), and
// relies entirely on social_videos'/social_video_products' existing public
// read policies (db/migrations/0008_social_videos.sql) — no service-role
// key is used or referenced anywhere in this file.
//
// Tagged products are embedded via a single query (one round trip, not
// N+1) and are ordered by sort_order client-side in the mapper, matching
// productMapper.js's existing sortBySortOrder() convention for
// product_images/product_features/product_specifications rather than
// introducing a new PostgREST embedded-order query parameter.
const PUBLISHED_REEL_SELECT = `
  id, title, image, video_url, reel_url, account, views, duration, created_at,
  social_video_products (
    sort_order,
    products ( id, name, slug, image, price, original_price, badge, rating, capacity, description )
  )
`

// The customer-facing "latest 15 published Reels" rule (see
// db/migrations/0008_social_videos.sql's own comments): a pure query-level
// window, re-evaluated fresh on every call — is_published rows beyond the
// 15 most recent are simply not selected, never deleted or unpublished.
// `.limit()` here applies only to social_videos (the top-level resource);
// each returned Reel's embedded social_video_products are NOT limited, so
// every tagged product for a returned Reel is always included.
export async function getPublishedReels(limit = 15) {
  const { data, error } = await supabase
    .from('social_videos')
    .select(PUBLISHED_REEL_SELECT)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit)

  handleApiError(error, 'getPublishedReels')
  return data
}
