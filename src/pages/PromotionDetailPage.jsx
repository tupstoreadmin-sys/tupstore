import { useNavigate, useParams } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'
import { useAsync } from '../hooks/useAsync'
import { useAddPromotionToEnquiry } from '../hooks/useAddPromotionToEnquiry'
import { useAddToEnquiry } from '../hooks/useAddToEnquiry'
import { useEnquiry } from '../contexts'
import { promotionsRepository } from '../services/promotions'
import { buildWhatsAppUrl } from '../utils/whatsapp'
import { buildDefaultPromotionWhatsappMessage } from '../utils/buildPromotionWhatsappMessage'
import {
  Container,
  Section,
  Breadcrumb,
  PageBanner,
} from '../components/layout'
import { Spinner, EmptyState, Button, ProductPrice } from '../components/ui'
import { IconWhatsApp } from '../components/layout/icons'
import { ProductGrid } from '../features/shop/ProductGrid'

// Promotion Detail — a combo/offer page, not a copy of ProductDetailPage.
// Routed by `slug` (URL-safe), matching ProductDetailPage's own convention.
// Works identically with 0, 1, or many tagged products (see the "What's
// Included" section below) — a promotion is an independent entity, its
// products are supplementary content, never the page's core subject.

export default function PromotionDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { promotion: stagedPromotion, ids: enquiryIds } = useEnquiry()
  const addPromotionToEnquiry = useAddPromotionToEnquiry()
  const addToEnquiry = useAddToEnquiry()

  const { data: promotion, loading } = useAsync(
    () => promotionsRepository.getPromotionBySlug(slug),
    [slug]
  )

  useSEO({
    title: promotion
      ? `${promotion.title} | Tupperware Exclusive Store Kerala`
      : 'Promotion | Tupperware Exclusive Store Kerala',
    description:
      promotion?.description ||
      'Explore this limited combo offer from Tupperware Exclusive Store Kerala.',
  })

  if (loading) {
    return (
      <Container className="py-12 md:py-20">
        <Spinner className="h-96 w-full" />
      </Container>
    )
  }

  // `promotion` is `null` both for an unknown/inactive slug and for any
  // fetch failure (getPromotionBySlug()/handleApiError() throw, useAsync()
  // catches into `error` and leaves `data` null) — same convention as
  // ProductDetailPage's own "Product not found" state, so no raw Supabase
  // error can ever reach the customer here.
  if (!promotion) {
    return (
      <Container className="py-12 md:py-20">
        <EmptyState
          icon="🔍"
          title="Promotion not found"
          description="This offer doesn't exist, may have ended, or may have been removed."
          action={
            <Button variant="primary" onClick={() => navigate('/promotions')}>
              Browse Promotions
            </Button>
          }
        />
      </Container>
    )
  }

  const products = promotion.products ?? []
  const isStaged = stagedPromotion?.id === promotion.id
  const whatsappMessage =
    promotion.whatsappText || buildDefaultPromotionWhatsappMessage(promotion)

  return (
    <>
      <PageBanner title={promotion.title} image={promotion.image} />
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Promotions & Special Offers', href: '/promotions' },
          { label: promotion.title },
        ]}
      />

      <Section className="py-10 md:py-14">
        <Container>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2 md:items-center md:gap-10">
            {/* Left column (desktop/tablet) — the existing promotion.image,
                same aspect-square/rounded-lg/object-cover treatment as
                ProductGallery.jsx's own main image, just without its
                multi-image thumbnail strip (a promotion has exactly one
                image). Stacks above the offer content on mobile. */}
            <div className="w-full overflow-hidden rounded-lg bg-surface-subtle md:mx-auto md:max-w-md">
              <img
                src={promotion.image}
                alt={promotion.title}
                className="aspect-square h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              {promotion.badge && (
                <span className="mb-4 inline-block w-fit rounded-full bg-black px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                  {promotion.badge}
                </span>
              )}

              {/* Smaller than PageBanner's own <h1> (text-[26px] md:text-4xl,
                  see PageBanner.jsx) — the banner remains the page's primary
                  heading; this is a secondary, in-content restatement. */}
              <h1 className="mb-3 font-heading text-xl font-bold leading-[1.2] text-ink md:text-2xl">
                {promotion.title}
              </h1>

              {promotion.description && (
                <p className="mb-5 text-[15px] leading-relaxed text-ink-secondary">
                  {promotion.description}
                </p>
              )}

              {promotion.price != null && (
                <div className="mb-6">
                  <ProductPrice
                    price={promotion.price}
                    originalPrice={promotion.originalPrice}
                    className="text-lg"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-6">
                <Button
                  variant={isStaged ? 'wa' : 'primary'}
                  onClick={() => addPromotionToEnquiry(promotion)}
                >
                  {isStaged ? '✓ Added to Enquiry list' : 'Add to Enquiry'}
                </Button>
                <Button
                  variant="wa"
                  href={buildWhatsAppUrl(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconWhatsApp className="h-4 w-4" />
                  WhatsApp Enquiry
                </Button>
              </div>
            </div>
          </div>

          {products.length > 0 && (
            <div className="mt-10 border-t border-hairline pt-10">
              <h2 className="mb-6 font-heading text-xl font-bold text-ink sm:text-2xl">
                What&apos;s Included
              </h2>
              <ProductGrid
                products={products}
                enquiryIds={enquiryIds}
                onAddToEnquiry={addToEnquiry}
                onSelect={(product) => navigate(`/product/${product.slug}`)}
              />
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
