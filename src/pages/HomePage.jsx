import { useNavigate } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'
import { useAsync } from '../hooks/useAsync'
import { productRepository } from '../services/products'
import { socialVideosRepository } from '../services/socialVideos'
import { promotionsRepository } from '../services/promotions'
import { heroRepository } from '../services/hero'
import { STORE_WHATSAPP_NUMBER } from '../utils/whatsapp'
import { buildDefaultPromotionWhatsappMessage } from '../utils/buildPromotionWhatsappMessage'
import { Container, Section, SectionHeader } from '../components/layout'
import { Spinner } from '../components/ui'
import {
  HeroCarousel,
  CategoryCarousel,
  PromotionStrip,
  WhyChooseUs,
  TestimonialCarousel,
  InstagramReels,
  TrustedDestination,
  SpecialistCTA,
} from '../features/home'
import { MOCK_WHY_US, MOCK_TESTIMONIALS } from '../data'

// Categories come from ProductRepository (real product-catalog data);
// Reels now come from SocialVideosRepository (see
// src/services/socialVideos) — real Supabase-backed "Watch Us In Action"
// content as of Step 3 (db/migrations/0008_social_videos.sql +
// 0009/0010's Storage policies). Hero now comes from HeroRepository (see
// src/services/hero) — real Supabase-backed content as of
// db/migrations/0019_admin_hero_slides.sql/0020_hero_slide_storage.sql,
// replacing the previous MOCK_HERO_SLIDES import (still used by
// MockHeroRepository itself, so `VITE_DATA_SOURCE=mock` dev/demo usage is
// unchanged). promotions/why-us/testimonials still have no repository — no
// backend covers that marketing content, so it's still read directly from
// src/data, same as every feature-component demo so far.
//
// TRENDING NOW and MUST HAVES are now real rows in the categories table
// (see db/migrations/0007_trending_must_haves_categories.sql) — official
// customer-facing categories like DRY STORAGES or BOTTLES, not a Home-only
// concept. They arrive from productRepository.getCategories() already in
// the correct sort_order, so no client-side splicing is needed any more.
//
// SERVING and SPARE PARTS still have a NULL `image` column in Supabase (no
// photo uploaded via Admin yet) — this only swaps the locally-displayed
// `image` for the client-approved photo; their id/name/tagline/sort_order
// still come from productRepository.getCategories() untouched, and nothing
// is written back to Supabase. TRENDING NOW and MUST HAVES need no entry
// here — their approved images are set directly on the category row by
// db/migrations/0007_trending_must_haves_categories.sql, the same way
// every other populated category's image already works.
const LOCAL_IMAGE_OVERRIDES = {
  SERVING: '/images/category_serving.webp',
  'SPARE PARTS': '/images/category_spare_parts.webp',
}

function withLocalImageOverrides(categories) {
  return categories.map((c) =>
    LOCAL_IMAGE_OVERRIDES[c.name]
      ? { ...c, image: LOCAL_IMAGE_OVERRIDES[c.name] }
      : c
  )
}

// Featured Highlights now reads real is_active=true promotions from
// promotionsRepository (see db/migrations/0012_promotions.sql,
// src/admin/pages/AdminPromotionsPage.jsx for how they're managed) instead
// of products.featured/getFeaturedProducts() — that function is left
// completely alone in ProductRepository, it's simply no longer called from
// here. PromotionStrip.jsx itself is untouched except one additive line
// (an optional `whatsappMessage` field it now honors when present): this
// only adapts each Promotion's existing fields to the plain {id, title,
// description, image, badge, buttonText} shape it already expects, using
// real promotion data only (title/description/badge/button_text as
// entered in Admin, no invented marketing copy).
//
// PROMOTION IMAGE ≠ PRODUCT IMAGE — `image` below is always
// `promotion.image`, never a tagged product's own image, and promotions.
// image is `not null` (enforced by both the DB constraint and the Admin
// form), so no fallback is needed or added here.
//
// A promotion is now an independent combo/offer entity with its own detail
// page (`/promotion/:slug`, see PromotionDetailPage.jsx) — "View Offer"
// routes there unconditionally, never to a single tagged product's own
// Product Detail page (that previous single-tagged-product shortcut is
// removed; see this page's own onSelect below). `products` is kept on the
// mapped object purely so buildDefaultPromotionWhatsappMessage() can still
// list tagged product names in the default WhatsApp message when relevant.
function toFeaturedHighlight(promotion) {
  return {
    id: promotion.id,
    slug: promotion.slug,
    title: promotion.title,
    description: promotion.description,
    image: promotion.image,
    badge: promotion.badge,
    buttonText: promotion.buttonText,
    whatsappMessage: promotion.whatsappText || buildDefaultPromotionWhatsappMessage(promotion),
    products: promotion.products,
  }
}

// Turns a HeroRepository CTA (see services/hero/HeroRepository.js's own
// typedef — {label, type, href?}) into the {label, onClick} shape
// HeroBanner.jsx already expects, exactly reproducing this page's previous
// hardcoded behavior: `category`/`product` hrefs are pre-resolved,
// same-origin routes (`/shop?category=...`, `/product/:slug`) — real
// in-app navigation via `navigate()`, matching how every other card/link
// on this page already navigates. `whatsapp` always opens the site-wide
// STORE_WHATSAPP_NUMBER, matching the previous secondaryCta's own hardcoded
// behavior exactly — never a per-slide number. `url` opens `navigate()` for
// a relative path (e.g. the previous mock content's own '/shop' — genuine
// in-app navigation, not a new tab) or `window.open` for a real external
// URL, so an admin-entered external link behaves like a normal external
// link while an internal path keeps working exactly as it always has.
// Returns undefined (button omitted) when the CTA has no resolvable
// destination — never a guessed fallback destination.
function buildHeroCta(cta, navigate) {
  if (!cta) return undefined
  if (cta.type === 'whatsapp') {
    return {
      label: cta.label,
      onClick: () =>
        window.open(`https://wa.me/${STORE_WHATSAPP_NUMBER}`, '_blank', 'noopener'),
    }
  }
  if (!cta.href) return undefined
  if (cta.type === 'url' && !cta.href.startsWith('/')) {
    return { label: cta.label, onClick: () => window.open(cta.href, '_blank', 'noopener') }
  }
  return { label: cta.label, onClick: () => navigate(cta.href) }
}

export default function HomePage() {
  const navigate = useNavigate()

  useSEO({
    title: 'Tupperware Exclusive Store Kerala | Home',
    description:
      'Browse genuine Tupperware kitchen storage, bottles, lunch boxes, thermal flasks and home essentials from an official Tupperware exclusive store in Kerala. Send direct WhatsApp enquiries.',
  })

  const { data: heroSlides, loading: heroLoading } = useAsync(
    () => heroRepository.getActiveHeroSlides(),
    []
  )

  const { data: categories, loading: categoriesLoading } = useAsync(
    () => productRepository.getCategories(),
    []
  )

  const { data: promotions, loading: featuredLoading } = useAsync(
    () => promotionsRepository.getActivePromotions(),
    []
  )
  const featuredHighlights = (promotions ?? []).map(toFeaturedHighlight)

  // On error, `reels` stays null and `reels ?? []` becomes `[]` below —
  // same as categories/featuredProducts above, this treats a Supabase
  // failure identically to "no published Reels yet" rather than crashing
  // or surfacing a raw error to the customer. Never falls back to
  // MOCK_REELS: with 0 published rows (or a failed fetch), the section
  // hides entirely, exactly like Featured Highlights does for 0 featured
  // products.
  const { data: reels, loading: reelsLoading } = useAsync(
    () => socialVideosRepository.getPublishedReels(),
    []
  )

  return (
    <>
      {heroLoading ? (
        // Same min-height as HeroCarousel's own outer div (see
        // HeroCarousel.jsx) — reserves the exact same space while loading
        // so nothing shifts once the real slides arrive, matching this
        // task's "no visible layout jumping" requirement. HeroCarousel
        // itself renders nothing (returns null) for zero slides, so an
        // empty result after loading is a deliberate empty state, not a
        // bug — see db/migrations/0021_seed_initial_hero_slides.sql for
        // why production should never actually reach that state.
        <div className="flex min-h-[460px] items-center justify-center bg-surface-subtle md:min-h-[580px]">
          <Spinner className="h-10 w-10" />
        </div>
      ) : (
        <HeroCarousel
          slides={(heroSlides ?? []).map((slide) => ({
            ...slide,
            primaryCta: buildHeroCta(slide.primaryCta, navigate),
            secondaryCta: buildHeroCta(slide.secondaryCta, navigate),
          }))}
        />
      )}

      <Section>
        <Container>
          {categoriesLoading ? (
            <Spinner className="h-40 w-full" />
          ) : (
            <CategoryCarousel
              showHeader
              eyebrow="Explore Collections"
              title="Shop By Category"
              description="Browse our full range of product categories."
              categories={withLocalImageOverrides(categories ?? [])}
              onSelect={(category) => navigate(`/shop?category=${category.id}`)}
            />
          )}
        </Container>
      </Section>

      {(featuredLoading || featuredHighlights.length > 0) && (
        <Section id="featured-offers" className="scroll-mt-24">
          <Container>
            {featuredLoading ? (
              <Spinner className="h-40 w-full" />
            ) : (
              <PromotionStrip
                eyebrow="SPECIAL BANNERS"
                title="Featured Highlights"
                description="Ongoing limited combos and curated kit promotions for Kerala customers."
                promotions={featuredHighlights}
                onSelect={(promo) => navigate(`/promotion/${promo.slug}`)}
              />
            )}
          </Container>
        </Section>
      )}

      <Section grey>
        <Container>
          <SectionHeader
            eyebrow="The Difference"
            title="Why Choose Us"
            description="Discover why thousands of homes trust our genuine Tupperware products, lifetime quality, and dedicated service."
          />
          <WhyChooseUs items={MOCK_WHY_US} />
        </Container>
      </Section>

      {(reelsLoading || (reels ?? []).length > 0) && (
        <Section>
          <Container>
            <SectionHeader
              eyebrow="As Seen On Instagram"
              title="Watch Us In Action"
              description="Explore practical organization tips, product demonstrations, and kitchen ideas from our Instagram feed."
            />
            {reelsLoading ? (
              <Spinner className="h-40 w-full" />
            ) : (
              <InstagramReels reels={reels ?? []} />
            )}
          </Container>
        </Section>
      )}

      <Section grey>
        <Container>
          <TrustedDestination
            onLearnMore={() => {
              const el = document.getElementById('featured-offers')
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' })
              } else {
                navigate('/promotions')
              }
            }}
          />
        </Container>
      </Section>

      <Section>
        <Container>
          <TestimonialCarousel testimonials={MOCK_TESTIMONIALS} />
        </Container>
      </Section>

      <Section className="pt-0 pb-12 md:pb-20">
        <Container>
          <SpecialistCTA
            onChatWhatsApp={() =>
              window.open(
                `https://wa.me/${STORE_WHATSAPP_NUMBER}`,
                '_blank',
                'noopener'
              )
            }
          />
        </Container>
      </Section>
    </>
  )
}
