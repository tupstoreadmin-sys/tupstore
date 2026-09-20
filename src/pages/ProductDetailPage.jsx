import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'
import { useAsync } from '../hooks/useAsync'
import { useAddToEnquiry } from '../hooks/useAddToEnquiry'
import { useEnquiry } from '../contexts'
import { productRepository } from '../services/products'
import {
  Container,
  Section,
  Breadcrumb,
  PageBanner,
} from '../components/layout'
import { Spinner, EmptyState, Button } from '../components/ui'
import {
  ProductGallery,
  ProductInfo,
  RelatedProducts,
  RecentlyViewed,
} from '../features/product'

// Routes by `slug` (URL-safe), not the internal `id`. "Recently viewed" is
// session-only in-memory state owned by App (via `recentlyViewedIds`/`onView`
// props) — no Context, no localStorage, so it resets on refresh; that's an
// accepted limitation, not a bug, given this milestone's constraints.
//
// Enquiry state comes from EnquiryContext/useAddToEnquiry directly (no
// longer passed down as props from App) — see ARCHITECTURE.md §5/§8.

// Looked up by product.categorySlug || product.category (see bannerImage
// below) — covers both backends with one table:
//   - Supabase mode: product.categorySlug is the canonical category slug
//     (db/migrations/0004_canonical_categories.sql), never a raw
//     category_id UUID, which couldn't usefully key a static lookup.
//   - Mock mode: MockProductRepository never sets categorySlug, so this
//     falls back to product.category, which still holds the original
//     mock-era ids (kitchen/freezer/lunch/bottles/thermals) — mock data was
//     not touched, so those ids are preserved here rather than migrated.
// `bottles`/`thermals` happen to be spelled identically in both schemes, so
// they only need one entry each. Only categories with an existing
// dedicated banner asset get an entry; everything else (any other
// Supabase category, or an unmatched mock id) falls through to the
// existing default banner below. No new banner artwork was added.
const CATEGORY_BANNERS = {
  'dry-storages': '/images/hero_banner_kitchen.png', // Supabase — old mock "kitchen"
  'freezer-storages': '/images/hero_banner_kitchen.png', // Supabase — old mock "freezer"
  'lunch-on-the-go': '/images/hero_banner_kitchen.png', // Supabase — old mock "lunch"
  bottles: '/images/hero_banner_bottles.png', // both Supabase and mock
  thermals: '/images/hero_banner_bottles.png', // both Supabase and mock
  kitchen: '/images/hero_banner_kitchen.png', // mock only
  freezer: '/images/hero_banner_kitchen.png', // mock only
  lunch: '/images/hero_banner_kitchen.png', // mock only
}

export default function ProductDetailPage({ recentlyViewedIds, onView }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { ids: enquiryIds } = useEnquiry()
  const addToEnquiry = useAddToEnquiry()

  const { data: product, loading } = useAsync(
    () => productRepository.getProductBySlug(slug),
    [slug]
  )

  useSEO({
    title: product
      ? `${product.name} | Tupperware Exclusive Store Kerala`
      : 'Product | Tupperware Exclusive Store Kerala',
    description:
      product?.description ||
      'Browse authentic Tupperware products from our official Kerala store franchise.',
  })

  useEffect(() => {
    if (product) onView?.(product.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id])

  const { data: related } = useAsync(
    () =>
      product
        ? productRepository.getRelatedProducts(product.id)
        : Promise.resolve([]),
    [product?.id]
  )

  const { data: recentlyViewedProducts } = useAsync(async () => {
    const ids = (recentlyViewedIds ?? []).filter((id) => id !== product?.id)
    if (ids.length === 0) return []
    const results = await Promise.all(
      ids.map((id) => productRepository.getProductById(id))
    )
    return results.filter(Boolean)
  }, [recentlyViewedIds, product?.id])

  if (loading) {
    return (
      <Container className="py-12 md:py-20">
        <Spinner className="h-96 w-full" />
      </Container>
    )
  }

  if (!product) {
    return (
      <Container className="py-12 md:py-20">
        <EmptyState
          icon="🔍"
          title="Product not found"
          description="The product you're looking for doesn't exist or may have been removed."
          action={
            <Button variant="primary" onClick={() => navigate('/shop')}>
              Back to Shop
            </Button>
          }
        />
      </Container>
    )
  }

  const bannerImage =
    product.bannerImage ||
    CATEGORY_BANNERS[product.categorySlug || product.category] ||
    '/images/hero_banner_kitchen.png'

  return (
    <>
      <PageBanner title={product.name} image={bannerImage} />
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/shop' },
          { label: product.name },
        ]}
      />

      <Section>
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <ProductGallery
              images={product.images ?? [product.image]}
              alt={product.name}
              className="md:mx-auto md:max-w-md lg:mx-0 lg:max-w-none"
            />
            <ProductInfo
              product={product}
              isInEnquiry={enquiryIds?.includes(product.id)}
              onAddToEnquiry={(selection) =>
                addToEnquiry(selection.product, selection.qty, selection.color)
              }
            />
          </div>

          {related?.length > 0 && (
            <RelatedProducts
              products={related}
              categoryName={product.categoryName}
              enquiryIds={enquiryIds}
              onAddToEnquiry={addToEnquiry}
              onSelect={(p) => navigate(`/product/${p.slug}`)}
              className="mt-20"
            />
          )}

          {recentlyViewedProducts?.length > 0 && (
            <RecentlyViewed
              products={recentlyViewedProducts}
              enquiryIds={enquiryIds}
              onAddToEnquiry={addToEnquiry}
              onSelect={(p) => navigate(`/product/${p.slug}`)}
              className="mt-16"
            />
          )}
        </Container>
      </Section>
    </>
  )
}
