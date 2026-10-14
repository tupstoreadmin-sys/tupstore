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

// Same banner as the Shop listing (ShopPage.jsx) for every product, so the
// two page types stay visually consistent. Replaces the earlier per-category
// lookup (hero_banner_kitchen / hero_banner_bottles).
const PRODUCT_BANNER = '/images/products_banner.webp'

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

  return (
    <>
      <PageBanner title={product.name} image={PRODUCT_BANNER} />
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
