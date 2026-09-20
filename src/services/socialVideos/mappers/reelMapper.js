import { getImageUrl } from '../../../utils/imageUrl'

// The only place that knows the Supabase social_videos row shape —
// including its embedded social_video_products/products rows (see
// api/socialVideoApi.js's PUBLISHED_REEL_SELECT). Everything above
// SupabaseSocialVideosRepository only ever sees the flat Reel shape
// InstagramReels.jsx/InstagramReelModal.jsx already expect (see
// SocialVideosRepository.js's Reel typedef).

function sortBySortOrder(rows) {
  return [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

// Tagged products always come from the real `products` table via the
// social_video_products join row's embedded `products` — never duplicated
// onto social_videos. `row.products.image` is resolved through the same
// getImageUrl() the real Product model uses (productMapper.js), since it
// lives in the same `product-images` bucket — this is deliberately NOT the
// Reel's own thumbnail (`social_videos.image`), which is a different
// column entirely and is never used here.
//
// `.filter((row) => row.products)` guards a null-product edge case only —
// in practice social_video_products.product_id references products(id) on
// delete cascade (0008), so an orphaned tagged row referencing a deleted
// product cannot exist; this is defensive, not load-bearing.
function mapTaggedProducts(rows) {
  if (!rows || rows.length === 0) return []
  return sortBySortOrder(rows)
    .filter((row) => row.products)
    .map((row) => ({
      id: row.products.id,
      name: row.products.name,
      price: row.products.price,
      image: getImageUrl(row.products.image),
    }))
}

/**
 * @param {object} row - raw Supabase `social_videos` row (with
 *   `social_video_products` embedded, each carrying its own `products`)
 * @returns {import('../SocialVideosRepository').Reel}
 */
export function mapReel(row) {
  return {
    id: row.id,
    title: row.title,
    views: row.views ?? undefined,
    duration: row.duration ?? undefined,
    // Always a full public Storage URL by construction — every upload
    // through the Admin Social Videos page stores getPublicUrl()'s result
    // directly (see adminSocialVideoApi.js), never a bare object key, so
    // no getImageUrl()-style resolution is needed or applied here. This is
    // deliberately kept separate from the tagged products' own images
    // above — the Reel thumbnail is never reused as a product image.
    image: row.image,
    account: row.account ?? undefined,
    videoUrl: row.video_url ?? null,
    reelUrl: row.reel_url ?? undefined,
    products: mapTaggedProducts(row.social_video_products),
  }
}
