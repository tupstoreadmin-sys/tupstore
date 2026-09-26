import { useMemo, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import {
  Header,
  Footer,
  MobileMenu,
  MobileBottomNav,
  SearchOverlay,
  ScrollToTop,
} from './components/layout'
import {
  IconFacebook,
  IconInstagram,
  IconYouTube,
  IconWhatsApp,
} from './components/layout/icons'
import { FloatingEnquiryButton, EnquiryDrawer } from './features/enquiry'
import { SearchResults, SearchSuggestions } from './features/search'
import { UIProvider, EnquiryProvider, useUI, useEnquiry } from './contexts'
import { useAddToEnquiry } from './hooks/useAddToEnquiry'
import { useSubmitEnquiry } from './hooks/useSubmitEnquiry'
import { useAsync } from './hooks/useAsync'
import { productRepository } from './services/products'
import { subscribeToNewsletter } from './api/newsletterApi'
import { STORE_WHATSAPP_NUMBER } from './utils/whatsapp'
import { SOCIAL_LINKS } from './utils/socialLinks'
import {
  MOCK_NAV_LINKS,
  MOCK_FOOTER_COLUMNS,
  MOCK_SEARCH_SUGGESTIONS,
} from './data'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import PromotionsPage from './pages/PromotionsPage'
import PromotionDetailPage from './pages/PromotionDetailPage'
import AboutTupperwarePage from './pages/AboutTupperwarePage'
import AboutTupstorePage from './pages/AboutTupstorePage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'

// Root component — just nests the two independent providers (order does
// not matter, see ARCHITECTURE.md §2) around AppShell, which is where
// everything that used to be local state now reads from Context instead.
export default function App() {
  return (
    <UIProvider>
      <EnquiryProvider>
        <AppShell />
      </EnquiryProvider>
    </UIProvider>
  )
}

// `recentlyViewedIds` stays local state here — it doesn't fit either
// context's responsibility (see ARCHITECTURE.md §10) and only one page
// reads it.
function AppShell() {
  const navigate = useNavigate()
  const ui = useUI()
  const enquiry = useEnquiry()
  const addToEnquiry = useAddToEnquiry()
  const {
    submit: submitEnquiry,
    submitting: submittingEnquiry,
    error: submitEnquiryError,
  } = useSubmitEnquiry()
  const [recentlyViewedIds, setRecentlyViewedIds] = useState([])

  // Footer newsletter form — local to AppShell, same reasoning as
  // recentlyViewedIds above (doesn't fit either context, only Footer reads
  // it). 'idle' | 'submitting' | 'success' | 'duplicate' | 'error'.
  const [newsletterStatus, setNewsletterStatus] = useState('idle')
  const [newsletterMessage, setNewsletterMessage] = useState('')

  const handleNewsletterSubmit = async ({ name, email }) => {
    if (newsletterStatus === 'submitting') return // guards against double-submit
    setNewsletterStatus('submitting')
    setNewsletterMessage('')
    try {
      const { status } = await subscribeToNewsletter({ name, email })
      if (status === 'already_subscribed') {
        setNewsletterStatus('duplicate')
        setNewsletterMessage("You're already subscribed.")
      } else {
        setNewsletterStatus('success')
        setNewsletterMessage("Thanks! You're subscribed for updates.")
      }
    } catch (error) {
      setNewsletterStatus('error')
      setNewsletterMessage(error.message)
    }
  }

  const handleView = (productId) =>
    setRecentlyViewedIds((ids) =>
      [productId, ...ids.filter((id) => id !== productId)].slice(0, 4)
    )

  const { data: searchResults } = useAsync(
    () =>
      ui.searchValue
        ? productRepository.searchProducts(ui.searchValue)
        : Promise.resolve([]),
    [ui.searchValue]
  )

  // Header "Products" dropdown reuses the same category data source and
  // /shop?category=<id> route Home/Shop already use — see
  // MegaMenu.jsx/Navbar.jsx for the (unchanged) rendering. Every other
  // MOCK_NAV_LINKS entry (Home, Promotions, About, Contact) is left exactly
  // as-is; only the Products link's megaMenu is replaced with real
  // categories. MOCK_NAV_LINKS itself is never mutated — DesignSystemShowcase.jsx
  // still imports and renders its own static mock megaMenu unaffected.
  const { data: categories } = useAsync(() => productRepository.getCategories(), [])

  // MegaMenu.jsx's grid is a fixed 6-column layout (grid-cols-2/md:3/lg:6) —
  // approved and locked, not touched here. Categories already arrive
  // sorted by sort_order (see getCategories()), so chunking them into
  // consecutive pairs of 2 reproduces the client-approved column grouping
  // (1&2, 3&4, ... 11&12) without hardcoding any category name or id: once
  // the 12-category migration is applied this naturally yields exactly 6
  // columns of 2 links each. Each column's title is the first category's
  // own name (real data, never invented copy) — MegaMenu.jsx keys each
  // column by `col.title`, so every column needs a distinct, non-empty
  // value or React would warn about duplicate keys.
  const productMegaMenu = useMemo(() => {
    const sorted = categories ?? []
    const columns = []
    for (let i = 0; i < sorted.length; i += 2) {
      const pair = sorted.slice(i, i + 2)
      columns.push({
        title: pair[0].name,
        links: pair.map((category) => ({
          label: category.name,
          href: `/shop?category=${category.id}`,
        })),
      })
    }
    return columns
  }, [categories])

  const navLinks = useMemo(
    () =>
      MOCK_NAV_LINKS.map((link) =>
        link.label === 'Products' ? { ...link, megaMenu: productMegaMenu } : link
      ),
    [productMegaMenu]
  )

  return (
    <div className="mobile-bottom-nav-spacer flex min-h-screen flex-col">
      <ScrollToTop />
      <Header
        logo={
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center select-none"
          >
            <img
              src="/logo.webp"
              alt="The Tupperware Store"
              className="h-7 w-auto sm:h-8 lg:h-9"
            />
          </button>
        }
        navLinks={navLinks}
        enquiryCount={enquiry.count}
        onSearchClick={ui.openSearch}
        onEnquiryClick={ui.openEnquiryDrawer}
        mobileMenuOpen={ui.mobileMenuOpen}
        onMobileMenuToggle={ui.toggleMobileMenu}
        socialLinks={{
          facebook: SOCIAL_LINKS.facebook,
          instagram: SOCIAL_LINKS.instagram,
          youtube: SOCIAL_LINKS.youtube,
          whatsapp: `https://wa.me/${STORE_WHATSAPP_NUMBER}`,
        }}
      />

      <MobileMenu
        isOpen={ui.mobileMenuOpen}
        onClose={ui.closeMobileMenu}
        links={navLinks}
        onSearchClick={ui.openSearch}
        onEnquiryClick={ui.openEnquiryDrawer}
        enquiryCount={enquiry.count}
        socialLinks={{
          facebook: SOCIAL_LINKS.facebook,
          instagram: SOCIAL_LINKS.instagram,
          youtube: SOCIAL_LINKS.youtube,
          whatsapp: `https://wa.me/${STORE_WHATSAPP_NUMBER}`,
        }}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route
            path="/product/:slug"
            element={
              <ProductDetailPage
                recentlyViewedIds={recentlyViewedIds}
                onView={handleView}
              />
            }
          />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/promotion/:slug" element={<PromotionDetailPage />} />
          <Route path="/about-tupperware" element={<AboutTupperwarePage />} />
          <Route path="/about-tupstore" element={<AboutTupstorePage />} />
          <Route path="/about-store" element={<AboutTupstorePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer
        brand={
          <div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center select-none"
            >
              <img
                src="/logo.webp"
                alt="The Tupperware Store"
                className="h-7 w-auto sm:h-8 lg:h-9"
              />
            </button>
            <p className="mt-3 max-w-[340px] text-[13px] md:text-sm leading-relaxed text-ink-secondary">
              Official Tupperware Exclusive Store Franchise serving customers
              across Kerala, India.
            </p>
          </div>
        }
        linkColumns={MOCK_FOOTER_COLUMNS}
        onNewsletterSubmit={handleNewsletterSubmit}
        newsletterStatus={newsletterStatus}
        newsletterMessage={newsletterMessage}
        socialLinks={[
          {
            label: 'Instagram',
            href: SOCIAL_LINKS.instagram,
            icon: <IconInstagram className="h-4 w-4" />,
          },
          {
            label: 'Facebook',
            href: SOCIAL_LINKS.facebook,
            icon: <IconFacebook className="h-4 w-4" />,
          },
          {
            label: 'WhatsApp',
            href: `https://wa.me/${STORE_WHATSAPP_NUMBER}`,
            icon: <IconWhatsApp className="h-4 w-4" />,
          },
          {
            label: 'YouTube',
            href: SOCIAL_LINKS.youtube,
            icon: <IconYouTube className="h-4 w-4" />,
          },
        ]}
        bottomText="© 2026 Official Tupperware Exclusive Store, Kerala."
      />

      <FloatingEnquiryButton
        count={enquiry.count}
        onClick={ui.openEnquiryDrawer}
        className="hidden md:flex"
      />

      <MobileBottomNav
        categories={categories}
        enquiryCount={enquiry.count}
        onEnquiryClick={ui.openEnquiryDrawer}
        enquiryDrawerOpen={ui.enquiryDrawerOpen}
        whatsappUrl={`https://wa.me/${STORE_WHATSAPP_NUMBER}`}
        onNavigate={navigate}
      />

      <EnquiryDrawer
        // Forces a real unmount/remount on every open/close toggle, so the
        // drawer's own local `step`/`result` state (cart → details →
        // success) never persists stale across closing and reopening — see
        // EnquiryDrawer.jsx's own header comment.
        key={ui.enquiryDrawerOpen}
        isOpen={ui.enquiryDrawerOpen}
        onClose={ui.closeEnquiryDrawer}
        items={enquiry.items}
        onIncrement={enquiry.incrementItem}
        onDecrement={enquiry.decrementItem}
        onRemove={enquiry.removeItem}
        onSubmit={submitEnquiry}
        submitting={submittingEnquiry}
        submitError={submitEnquiryError}
        promotion={enquiry.promotion}
      />

      <SearchOverlay
        isOpen={ui.searchOpen}
        onClose={ui.closeSearch}
        value={ui.searchValue}
        onChange={(e) => ui.setSearchValue(e.target.value)}
      >
        {ui.searchValue ? (
          <SearchResults
            results={searchResults ?? []}
            query={ui.searchValue}
            enquiryIds={enquiry.ids}
            onAddToEnquiry={addToEnquiry}
            onSelect={(product) => {
              ui.closeSearch()
              navigate(`/product/${product.slug}`)
            }}
          />
        ) : (
          <SearchSuggestions
            suggestions={MOCK_SEARCH_SUGGESTIONS}
            onSelect={ui.setSearchValue}
          />
        )}
      </SearchOverlay>
    </div>
  )
}
