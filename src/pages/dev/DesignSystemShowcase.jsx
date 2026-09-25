import { useState } from 'react'
import {
  Button,
  Badge,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  Card,
  ProductCard,
  ProductPrice,
  ProductRating,
  EmptyState,
  Spinner,
} from '../../components/ui'
import {
  Container,
  Section,
  SectionHeader,
  Header,
  Navbar,
  MegaMenu,
  MobileMenu,
  Footer,
  SearchOverlay,
  Breadcrumb,
} from '../../components/layout'
import {
  IconFacebook,
  IconInstagram,
  IconWhatsApp,
} from '../../components/layout/icons'
import {
  HeroCarousel,
  CategoryCarousel,
  PromotionStrip,
  WhyChooseUs,
  TestimonialCarousel,
  InstagramReels,
  NewsletterCTA,
} from '../../features/home'
import {
  ProductGrid,
  ProductFilters,
  FilterSidebar,
  SortDropdown,
  ViewToggle,
} from '../../features/shop'
import {
  ProductGallery,
  ProductInfo,
  RelatedProducts,
  RecentlyViewed,
} from '../../features/product'
import { SearchResults, SearchSuggestions } from '../../features/search'
import { FloatingEnquiryButton, EnquiryDrawer } from '../../features/enquiry'
import {
  MOCK_HERO_SLIDES,
  MOCK_CATEGORIES,
  MOCK_PROMOTIONS,
  MOCK_WHY_US,
  MOCK_TESTIMONIALS,
  MOCK_REELS,
  MOCK_PRODUCTS,
  MOCK_SEARCH_SUGGESTIONS,
  MOCK_ENQUIRY_ITEMS,
  MOCK_NAV_LINKS,
  MOCK_FOOTER_COLUMNS,
  MOCK_BREADCRUMB_ITEMS,
} from '../../data'

// Dev-only component showcase. Reachable at /dev/design-system.
// Delete this entire pages/dev/ directory before production.

const SAMPLE_PRODUCT = {
  id: 'tup-01',
  name: 'Aquasafe 1000ml Flip Top Bottle Set',
  image: '/images/cat_bottles.png',
  badge: 'Best Seller',
  price: 1150,
  originalPrice: 1500,
  rating: 4.8,
}

const SAMPLE_PRODUCT_2 = {
  id: 'tup-03',
  name: 'Modular Mates Oval Pantry Set — a much longer product name to verify the 2-line clamp behavior',
  image: '/images/cat_kitchen.png',
  price: 2450,
  rating: 4.9,
}

function ShowcaseSection({ title, children }) {
  return (
    <section className="border-b border-hairline pb-10">
      <h2 className="mb-2 font-heading text-2xl font-bold text-ink md:mb-6 md:text-[38px]">
        {title}
      </h2>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </section>
  )
}

// `fixed`/`sticky` layout components would otherwise escape this page and
// take over the whole viewport. A `transform` on an ancestor creates a new
// containing block for `position: fixed` descendants (standard CSS
// behavior), which keeps the preview contained to this box instead.
function PreviewFrame({ height = 400, children }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-hairline"
      style={{ height, transform: 'translateZ(0)' }}
    >
      {children}
    </div>
  )
}

export default function DesignSystemShowcase() {
  const [inEnquiry, setInEnquiry] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(true)
  const [searchValue, setSearchValue] = useState('')

  // Milestone 3 demo state
  const [shopFilters, setShopFilters] = useState({
    search: '',
    category: 'all',
    priceMax: 3000,
    capacity: 'all',
    inStockOnly: false,
    collection: 'all',
    discounts: [],
  })
  const [sort, setSort] = useState('newest')
  const [layout, setLayout] = useState('grid')
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [enquiryItems, setEnquiryItems] = useState(MOCK_ENQUIRY_ITEMS)

  const updateQty = (item, delta) =>
    setEnquiryItems((items) =>
      items.map((i) =>
        i.id === item.id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
      )
    )
  const removeItem = (item) =>
    setEnquiryItems((items) => items.filter((i) => i.id !== item.id))

  return (
    <div className="min-h-screen bg-surface p-12 font-body">
      <h1 className="mb-10 font-heading text-3xl font-bold text-ink">
        Design System Showcase{' '}
        <span className="text-base font-normal text-ink-muted">
          (dev only — not shipped)
        </span>
      </h1>

      <div className="flex max-w-3xl flex-col gap-10">
        <ShowcaseSection title="Button — variants">
          <Button variant="primary">Start Your Project</Button>
          <Button variant="secondary">See Case Studies</Button>
          <Button variant="wa">Send Enquiry via WhatsApp</Button>
          <Button variant="subtle">Add to Enquiry (subtle)</Button>
        </ShowcaseSection>

        <ShowcaseSection title="Button — sizes">
          <Button variant="primary" size="md">
            Medium (default)
          </Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
        </ShowcaseSection>

        <ShowcaseSection title="Button — states">
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="primary" href="#test">
            Renders as &lt;a&gt; (href)
          </Button>
        </ShowcaseSection>

        <ShowcaseSection title="Button — full width">
          <div className="w-64">
            <Button variant="primary" fullWidth>
              Full Width
            </Button>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Badge — variants">
          <Badge variant="solid">Best Seller</Badge>
          <Badge variant="wa">In Stock</Badge>
          <Badge variant="warning">Limited Stock</Badge>
          <Badge variant="discount">17% off</Badge>
          <div className="rounded-lg bg-ink p-6">
            <Badge variant="translucent">New Arrival</Badge>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Input">
          <div className="w-72">
            <Input label="Your Full Name *" placeholder="e.g. Ananya Nair" />
          </div>
          <div className="w-72">
            <Input
              label="WhatsApp / Mobile Number *"
              placeholder="e.g. 98470XXXXX"
              error="Please enter a valid mobile number"
            />
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Textarea">
          <div className="w-72">
            <Textarea
              label="Special Requests / Notes"
              placeholder="e.g. Specific color preferences"
            />
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Select">
          <div className="w-72">
            <Select label="City / Location in Kerala *" defaultValue="Kochi">
              <option value="Kochi">Kochi / Ernakulam</option>
              <option value="TVM">Thiruvananthapuram</option>
              <option value="Kozhikode">Kozhikode</option>
            </Select>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Checkbox">
          <Checkbox defaultChecked>In Stock Only</Checkbox>
          <Checkbox>20% - 30% off</Checkbox>
        </ShowcaseSection>

        <ShowcaseSection title="Radio">
          <Radio name="showcase-radio" defaultChecked>
            All Categories
          </Radio>
          <Radio name="showcase-radio">Bottles & Hydration</Radio>
        </ShowcaseSection>

        <ShowcaseSection title="Card (generic primitive)">
          <Card className="w-64 p-6 text-center hover:border-hairline-strong hover:shadow-subtle">
            <p className="font-heading font-bold text-ink">Why-card style</p>
            <p className="mt-1 text-[13px] text-ink-secondary">
              Hover treatment supplied via className, not baked into Card.
            </p>
          </Card>
        </ShowcaseSection>

        <ShowcaseSection title="ProductPrice">
          <ProductPrice price={1150} originalPrice={1500} />
          <ProductPrice price={980} />
        </ShowcaseSection>

        <ShowcaseSection title="ProductRating">
          <ProductRating rating={4.8} />
          <ProductRating rating={4.8} showOutOfFive />
        </ShowcaseSection>

        <ShowcaseSection title="EmptyState">
          <div className="w-96 rounded-lg border border-hairline">
            <EmptyState
              icon="📝"
              title="Your enquiry list is empty"
              description="Browse our premium catalog, add products to the list, and submit via WhatsApp."
              action={<Button variant="primary">Browse Products</Button>}
            />
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Spinner">
          <Spinner className="h-6 w-40" />
          <Spinner className="h-[180px] w-[240px]" />
        </ShowcaseSection>

        <ShowcaseSection title="ProductCard (presentation-only — click handlers just log/toggle here)">
          <div className="w-64">
            <ProductCard
              product={SAMPLE_PRODUCT}
              isInEnquiry={inEnquiry}
              onAddToEnquiry={() => setInEnquiry((v) => !v)}
              onClick={(p) => console.log('card click', p)}
            />
          </div>
          <div className="w-64">
            <ProductCard
              product={SAMPLE_PRODUCT_2}
              onAddToEnquiry={(p) => console.log('add to enquiry', p)}
            />
          </div>
        </ShowcaseSection>

        {/* ---- Milestone 2: layout components ---- */}

        <ShowcaseSection title="Container">
          <div className="w-full bg-surface-subtle py-4">
            <Container>
              <div className="border border-hairline-strong py-2 text-center text-xs text-ink-secondary">
                max-w-container (1440px), centered, 16px side padding
              </div>
            </Container>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Section / SectionHeader">
          <div className="w-full">
            <Section grey className="py-8">
              <Container>
                <SectionHeader
                  eyebrow="Sample Eyebrow"
                  title="Section title, centered (default)"
                  description="80px vertical rhythm (reduced here for the showcase), grey background variant."
                />
              </Container>
            </Section>
            <Section className="py-8">
              <Container>
                <SectionHeader
                  align="left"
                  title="Left-aligned variant"
                  description="Used for e.g. Related Products / Recently Viewed headers."
                />
              </Container>
            </Section>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Header (contains Navbar + MegaMenu — hover 'Shop'/'About')">
          <PreviewFrame height={420}>
            <Header
              logo={
                <span className="font-heading text-xl font-black tracking-tight text-ink flex items-baseline gap-0.5">
                  <span>Tupperware</span>
                  <span className="text-[10px] font-bold align-top relative -top-2">
                    ®
                  </span>
                </span>
              }
              navLinks={MOCK_NAV_LINKS}
              enquiryCount={3}
              onSearchClick={() => console.log('search click')}
              onEnquiryClick={() => console.log('enquiry click')}
              mobileMenuOpen={mobileMenuOpen}
              onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)}
            />
            <div className="p-6 text-sm text-ink-muted">
              Page content would go here.
            </div>
          </PreviewFrame>
        </ShowcaseSection>

        <ShowcaseSection title="Navbar (standalone, desktop only)">
          <div className="w-full rounded-lg border border-hairline p-6">
            <Navbar links={MOCK_NAV_LINKS} />
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="MegaMenu (forced open here for visibility — normally shown via Navbar's group-hover)">
          <div className="relative h-64 w-full rounded-lg border border-hairline">
            <div className="p-4 text-sm text-ink-muted">
              In Navbar, this panel is CSS-only group-hover — no JS state.
            </div>
            {/* className overrides win via twMerge (same-property conflicts:
                absolute→static, invisible→visible, opacity-0→opacity-100,
                translate-y-2→translate-y-0), forcing it open for this demo. */}
            <MegaMenu
              className="static visible translate-y-0 opacity-100"
              columns={MOCK_NAV_LINKS[1].megaMenu}
            />
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="MobileMenu">
          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? 'Close' : 'Open'} Mobile Menu
            </Button>
            <span className="text-xs text-ink-muted">
              (also toggled by the Header preview above — shared state)
            </span>
          </div>
          <PreviewFrame height={320}>
            <div className="flex h-[60px] items-center border-b border-hairline px-4 text-xs text-ink-muted">
              header area (60px, matches MobileMenu's top offset)
            </div>
            <MobileMenu
              isOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
              links={MOCK_NAV_LINKS}
              className="absolute inset-x-0 top-[60px] h-[calc(100%-60px)]"
            />
          </PreviewFrame>
        </ShowcaseSection>

        <ShowcaseSection title="SearchOverlay">
          <Button variant="primary" onClick={() => setSearchOpen((v) => !v)}>
            {searchOpen ? 'Close' : 'Open'} Search Overlay
          </Button>
          <PreviewFrame height={360}>
            <SearchOverlay
              isOpen={searchOpen}
              onClose={() => setSearchOpen(false)}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="absolute"
            >
              <EmptyState
                title="No results yet"
                description="Results content is passed in as children — this component doesn't fetch or know about products."
              />
            </SearchOverlay>
          </PreviewFrame>
        </ShowcaseSection>

        <ShowcaseSection title="Breadcrumb">
          <div className="w-full">
            <Breadcrumb items={MOCK_BREADCRUMB_ITEMS} />
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Footer">
          <div className="w-full rounded-lg border border-hairline">
            <Footer
              brand={
                <div>
                  <span className="font-heading text-xl font-extrabold text-ink">
                    Logo
                  </span>
                  <p className="mt-4 max-w-[340px] text-sm leading-relaxed text-ink-secondary">
                    Sample brand description text for the footer preview.
                  </p>
                </div>
              }
              linkColumns={MOCK_FOOTER_COLUMNS}
              onNewsletterSubmit={(email) => console.log('newsletter', email)}
              socialLinks={[
                {
                  label: 'Facebook',
                  href: '#',
                  icon: <IconFacebook className="h-4 w-4" />,
                },
                {
                  label: 'Instagram',
                  href: '#',
                  icon: <IconInstagram className="h-4 w-4" />,
                },
                {
                  label: 'WhatsApp',
                  href: '#',
                  icon: <IconWhatsApp className="h-4 w-4" />,
                },
              ]}
              bottomText="© 2026 Sample Store. All rights reserved."
            />
          </div>
        </ShowcaseSection>

        {/* ---- Milestone 3: feature components ---- */}

        <ShowcaseSection title="HeroCarousel (contains HeroBanner)">
          <PreviewFrame height={440}>
            <HeroCarousel slides={MOCK_HERO_SLIDES} />
          </PreviewFrame>
        </ShowcaseSection>

        <ShowcaseSection title="CategoryCarousel">
          <div className="w-full">
            <CategoryCarousel
              categories={MOCK_CATEGORIES}
              onSelect={(c) => console.log('category', c)}
            />
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="PromotionStrip">
          <div className="w-full">
            <PromotionStrip
              promotions={MOCK_PROMOTIONS}
              onSelect={(p) => console.log('promo', p)}
            />
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="WhyChooseUs">
          <div className="w-full">
            <WhyChooseUs items={MOCK_WHY_US} />
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="TestimonialCarousel">
          <div className="w-full">
            <TestimonialCarousel testimonials={MOCK_TESTIMONIALS} />
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="InstagramReels">
          <div className="w-full">
            <InstagramReels
              reels={MOCK_REELS}
              onSelect={(r) => console.log('reel', r)}
            />
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="NewsletterCTA">
          <div className="w-full max-w-xl">
            <NewsletterCTA
              description="Sample description for the newsletter CTA block."
              onSubmit={(email) => console.log('newsletter', email)}
            />
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Shop: FilterSidebar + ProductFilters + SortDropdown + ViewToggle + ProductGrid">
          <div className="flex w-full flex-col gap-6 lg:flex-row">
            <FilterSidebar>
              <ProductFilters
                search={shopFilters.search}
                onSearchChange={(v) =>
                  setShopFilters((f) => ({ ...f, search: v }))
                }
                category={shopFilters.category}
                onCategoryChange={(v) =>
                  setShopFilters((f) => ({ ...f, category: v }))
                }
                priceMax={shopFilters.priceMax}
                onPriceMaxChange={(v) =>
                  setShopFilters((f) => ({ ...f, priceMax: v }))
                }
                capacity={shopFilters.capacity}
                onCapacityChange={(v) =>
                  setShopFilters((f) => ({ ...f, capacity: v }))
                }
                inStockOnly={shopFilters.inStockOnly}
                onInStockChange={(v) =>
                  setShopFilters((f) => ({ ...f, inStockOnly: v }))
                }
                collection={shopFilters.collection}
                onCollectionChange={(v) =>
                  setShopFilters((f) => ({ ...f, collection: v }))
                }
                discounts={shopFilters.discounts}
                onDiscountsChange={(v) =>
                  setShopFilters((f) => ({ ...f, discounts: v }))
                }
              />
            </FilterSidebar>
            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-ink-muted">
                  Showing {MOCK_PRODUCTS.length} products
                </span>
                <div className="flex items-center gap-3">
                  <SortDropdown value={sort} onChange={setSort} />
                  <ViewToggle value={layout} onChange={setLayout} />
                </div>
              </div>
              <ProductGrid products={MOCK_PRODUCTS} layout={layout} />
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product: ProductGallery + ProductInfo">
          <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
            <ProductGallery
              images={['/images/cat_bottles.png', '/images/cat_kitchen.png']}
              alt="Sample product"
            />
            <ProductInfo
              product={{
                name: 'Sample Product Detail Name',
                badge: 'Best Seller',
                availability: 'In Stock',
                rating: 4.8,
                price: 1150,
                originalPrice: 1500,
                description:
                  'A short sample product description for layout verification.',
                categoryName: 'Sample Category',
                colors: ['Dusty Blue', 'Sage Green', 'Charcoal'],
                features: [
                  'Sample feature one',
                  'Sample feature two',
                  'Sample feature three',
                ],
                specs: { Capacity: '1000 ml', Material: 'Sample Material' },
              }}
              onAddToEnquiry={(selection) =>
                console.log('add to enquiry', selection)
              }
            />
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="RelatedProducts / RecentlyViewed">
          <div className="flex w-full flex-col gap-10">
            <RelatedProducts
              products={MOCK_PRODUCTS.slice(0, 3)}
              categoryName="Sample Category"
            />
            <RecentlyViewed products={MOCK_PRODUCTS.slice(1, 3)} />
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="SearchSuggestions / SearchResults">
          <div className="flex w-full flex-col gap-6">
            <SearchSuggestions
              suggestions={MOCK_SEARCH_SUGGESTIONS}
              onSelect={(s) => console.log('suggestion', s)}
            />
            <SearchResults results={MOCK_PRODUCTS.slice(0, 2)} query="Sample" />
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="FloatingEnquiryButton / EnquiryDrawer (contains EnquiryItem + EnquirySummary)">
          <Button variant="primary" onClick={() => setEnquiryOpen((v) => !v)}>
            {enquiryOpen ? 'Close' : 'Open'} Enquiry Drawer
          </Button>
          <PreviewFrame height={440}>
            <FloatingEnquiryButton
              count={enquiryItems.reduce((n, i) => n + i.qty, 0)}
              onClick={() => setEnquiryOpen(true)}
              className="absolute bottom-4 right-4"
            />
            <EnquiryDrawer
              isOpen={enquiryOpen}
              onClose={() => setEnquiryOpen(false)}
              items={enquiryItems}
              onIncrement={(item) => updateQty(item, 1)}
              onDecrement={(item) => updateQty(item, -1)}
              onRemove={removeItem}
              onSubmit={() => console.log('submit enquiry', enquiryItems)}
              className="absolute"
            />
          </PreviewFrame>
        </ShowcaseSection>
      </div>
    </div>
  )
}
