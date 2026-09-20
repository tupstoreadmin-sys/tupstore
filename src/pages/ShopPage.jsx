import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  IconFilter,
} from '../components/layout'
import { Spinner } from '../components/ui'
import {
  ProductFilters,
  FilterSidebar,
  FilterDrawer,
  SortDropdown,
  ViewToggle,
  ProductGrid,
} from '../features/shop'
import { MOCK_FILTER_OPTIONS } from '../data'

// `category` is synced to the URL (?category=) — shareable/bookmarkable and
// deep-linked from HomePage's CategoryCarousel. Other filters are local UI
// state (no requirement to persist those). Categories come from
// ProductRepository; capacity/collection/discount OPTION LABELS still come
// from MOCK_FILTER_OPTIONS (they're static filter-UI definitions, not
// product data), but selecting them now actually filters — see
// MockProductRepository.js/SupabaseProductRepository.js, which match them
// against each product's existing capacity/badge/price/originalPrice
// fields.
//
// Enquiry state comes from EnquiryContext/useAddToEnquiry directly (no
// longer passed down as props from App) — see ARCHITECTURE.md §5/§8.

export default function ShopPage() {
  useSEO({
    title: 'Shop All Products | Tupperware Exclusive Store Kerala',
    description:
      'Browse our complete catalogue of genuine Tupperware kitchen storage, eco bottles, executive lunch boxes, and thermal flasks in Kerala.',
  })

  const navigate = useNavigate()
  const { ids: enquiryIds } = useEnquiry()
  const addToEnquiry = useAddToEnquiry()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || 'all'

  const [search, setSearch] = useState('')
  const [priceMax, setPriceMax] = useState(3000)
  const [capacity, setCapacity] = useState('all')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [collection, setCollection] = useState('all')
  const [discounts, setDiscounts] = useState([])
  const [sort, setSort] = useState('newest')
  const [layout, setLayout] = useState('grid')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  const { data: categories } = useAsync(
    () => productRepository.getCategories(),
    []
  )

  const { data: products, loading } = useAsync(
    () =>
      productRepository.getProducts({
        search,
        category,
        priceMax,
        inStockOnly,
        capacity,
        collection,
        discounts,
      }),
    [search, category, priceMax, inStockOnly, capacity, collection, discounts]
  )

  const sortedProducts = useMemo(() => {
    if (!products) return []
    const sorted = [...products]
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price)
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating)
    return sorted
  }, [products, sort])

  const filterOptions = useMemo(
    () => ({
      ...MOCK_FILTER_OPTIONS,
      categories: [
        { id: 'all', label: 'All Categories' },
        ...(categories ?? []).map((c) => ({ id: c.id, label: c.name })),
      ],
    }),
    [categories]
  )

  const handleClearAllFilters = () => {
    setSearch('')
    setSearchParams({})
    setPriceMax(3000)
    setCapacity('all')
    setInStockOnly(false)
    setCollection('all')
    setDiscounts([])
  }

  const renderFilters = (
    <ProductFilters
      options={filterOptions}
      search={search}
      onSearchChange={setSearch}
      category={category}
      onCategoryChange={(value) =>
        setSearchParams(value === 'all' ? {} : { category: value })
      }
      priceMax={priceMax}
      onPriceMaxChange={setPriceMax}
      capacity={capacity}
      onCapacityChange={setCapacity}
      inStockOnly={inStockOnly}
      onInStockChange={setInStockOnly}
      collection={collection}
      onCollectionChange={setCollection}
      discounts={discounts}
      onDiscountsChange={setDiscounts}
    />
  )

  return (
    <>
      <PageBanner
        title="Exclusive Product Catalogue"
        image="/images/hero_banner_kitchen.png"
      />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Shop' }]} />

      <Section className="py-12">
        <Container>
          <div className="flex flex-col gap-8 md:flex-row min-w-0 w-full">
            <FilterSidebar>{renderFilters}</FilterSidebar>

            <FilterDrawer
              isOpen={isFilterDrawerOpen}
              onClose={() => setIsFilterDrawerOpen(false)}
              onClearAll={handleClearAllFilters}
            >
              {renderFilters}
            </FilterDrawer>

            <div className="flex-1 min-w-0 w-full">
              {/* Product Toolbar & Count */}
              <div className="mb-6 flex flex-col gap-3.5 md:mb-4">
                {/* Mobile Count & Toolbar (< md) */}
                <div className="flex flex-col gap-3 md:hidden">
                  <span className="text-sm text-ink-muted">
                    {loading
                      ? 'Loading products…'
                      : `Showing ${sortedProducts.length} products`}
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
                    <button
                      type="button"
                      onClick={() => setIsFilterDrawerOpen(true)}
                      className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-hairline bg-white px-2.5 sm:px-3 text-xs font-medium text-ink transition-colors hover:bg-surface-subtle shrink-0 cursor-pointer"
                      aria-label="Open filter menu"
                    >
                      <IconFilter className="h-3.5 w-3.5 text-ink-secondary shrink-0" />
                      <span>Filters</span>
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <SortDropdown
                        value={sort}
                        onChange={setSort}
                        className="h-9 w-full text-xs font-medium py-0 pl-2.5 sm:pl-3 pr-7 truncate"
                        containerClassName="w-full min-w-0"
                      />
                    </div>

                    <ViewToggle value={layout} onChange={setLayout} className="shrink-0" />
                  </div>
                </div>

                {/* Desktop Count & Toolbar (>= md) */}
                <div className="hidden md:flex items-center justify-between gap-3">
                  <span className="text-sm text-ink-muted">
                    {loading
                      ? 'Loading products…'
                      : `Showing ${sortedProducts.length} products`}
                  </span>
                  <div className="flex items-center gap-3">
                    <SortDropdown value={sort} onChange={setSort} />
                    <ViewToggle value={layout} onChange={setLayout} />
                  </div>
                </div>
              </div>

              {loading ? (
                <Spinner className="h-96 w-full" />
              ) : (
                <ProductGrid
                  products={sortedProducts}
                  layout={layout}
                  enquiryIds={enquiryIds}
                  onAddToEnquiry={addToEnquiry}
                  onSelect={(product) => navigate(`/product/${product.slug}`)}
                />
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
