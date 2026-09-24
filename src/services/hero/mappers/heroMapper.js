// The only place that knows the Supabase `hero_slides` row shape —
// including its embedded `hero_slide_features` rows (see
// api/heroApi.js's ACTIVE_HERO_SLIDES_SELECT). Everything above
// SupabaseHeroRepository only ever sees the flat shape defined in
// HeroRepository.js's own JSDoc typedefs. Mirrors
// services/promotions/mappers/promotionMapper.js's role for this feature.

function sortByFeatureOrder(rows) {
  return [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

/**
 * button1_target/button2_target are plain text whose meaning depends on
 * the sibling *_type column (see 0019_admin_hero_slides.sql — this is the
 * one polymorphic reference in this schema, so it can't be resolved via a
 * PostgREST embed like every other FK in this project). `productSlugById`
 * is the batch-resolved lookup from getProductSlugsByIds() for every
 * product-type target across all slides in one query.
 *
 * @param {string|null} type
 * @param {string|null} target
 * @param {Map<string, string>} productSlugById
 * @returns {string|undefined} a resolvable href, or undefined when the
 *   type has no href of its own (whatsapp) or the stored target no longer
 *   resolves (e.g. a deleted category/product) — never a guessed fallback
 */
function resolveCtaHref(type, target, productSlugById) {
  if (!target) return undefined
  if (type === 'category') return `/shop?category=${target}`
  if (type === 'product') {
    const slug = productSlugById.get(target)
    return slug ? `/product/${slug}` : undefined
  }
  if (type === 'url') return target
  return undefined
}

/**
 * @param {string|null} text
 * @param {string|null} type
 * @param {string|null} target
 * @param {Map<string, string>} productSlugById
 * @returns {import('../HeroRepository').HeroCta|undefined}
 */
function mapCta(text, type, target, productSlugById) {
  if (!text) return undefined
  // whatsapp has no href of its own — it always uses the site-wide
  // STORE_WHATSAPP_NUMBER (src/utils/whatsapp.js), applied by the caller
  // (HomePage.jsx), never a per-slide value stored here.
  if (type === 'whatsapp') return { label: text, type }
  const href = resolveCtaHref(type, target, productSlugById)
  if (!href) return undefined
  return { label: text, type, href }
}

/**
 * @param {object} row - raw Supabase `hero_slides` row (with
 *   `hero_slide_features` embedded)
 * @param {Map<string, string>} productSlugById
 * @returns {import('../HeroRepository').HeroSlide}
 */
export function mapHeroSlide(row, productSlugById) {
  return {
    id: row.id,
    tag: row.badge ?? undefined,
    title: row.title,
    image: row.image,
    mobileImage: row.mobile_image ?? undefined,
    altText: row.alt_text ?? '',
    primaryCta: mapCta(row.button1_text, row.button1_type, row.button1_target, productSlugById),
    secondaryCta: mapCta(row.button2_text, row.button2_type, row.button2_target, productSlugById),
    trustBadges: sortByFeatureOrder(row.hero_slide_features ?? []).map((f) => f.text),
  }
}
