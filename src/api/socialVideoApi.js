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
const reelSelect = (withExternalVideoUrl) => `
  id, title, image, video_url, ${withExternalVideoUrl ? 'external_video_url,' : ''} reel_url, account, views, duration, created_at,
  social_video_products (
    sort_order,
    products!inner ( id, name, slug, image, price, original_price, badge, rating, capacity, description )
  )
`

// Tagged products that are still drafts are dropped from the Reel (the
// `!inner` embed removes the join row; the Reel itself is unaffected). RLS
// already hides drafts from `anon`; this also covers a signed-in admin
// browsing the storefront. See db/migrations/0026.
const PUBLISHED_TAGGED_PRODUCTS = 'social_video_products.products.status'

// The customer-facing "latest 15 published Reels" rule (see
// db/migrations/0008_social_videos.sql's own comments): a pure query-level
// window, re-evaluated fresh on every call — is_published rows beyond the
// 15 most recent are simply not selected, never deleted or unpublished.
// `.limit()` here applies only to social_videos (the top-level resource);
// each returned Reel's embedded social_video_products are NOT limited, so
// every tagged product for a returned Reel is always included.
export async function getPublishedReels(limit = 15) {
  const run = (withExternalVideoUrl) =>
    supabase
      .from('social_videos')
      .select(reelSelect(withExternalVideoUrl))
      .eq('is_published', true)
      .eq(PUBLISHED_TAGGED_PRODUCTS, 'published')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit)

  let { data, error } = await run(true)
  // Column not created yet (migration 0028 not applied): still show the
  // Reels, just without external video links, instead of breaking the section.
  if (error?.code === '42703') {
    console.warn('[reels] external_video_url is missing - apply migration 0028')
    ;({ data, error } = await run(false))
  }

  handleApiError(error, 'getPublishedReels')
  return data
}
