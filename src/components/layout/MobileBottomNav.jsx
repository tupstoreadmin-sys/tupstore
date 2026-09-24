import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { IconHome, IconShop, IconGrid, IconCart, IconWhatsApp } from './icons'
import { CategoryPickerSheet } from './CategoryPickerSheet'

// App-style mobile bottom tab bar — additive, mobile-only. Sits alongside
// (does not replace) the existing sticky Header/MobileMenu. Hidden at `md:`
// (768px) and up, matching ShopPage.jsx's own existing mobile/desktop
// toolbar split (the closest existing precedent in this codebase for a
// mobile-only control bar), rather than Header's wider `lg:` (1024px) cutoff.
//
// z-[40] — deliberately below EVERY existing fixed/overlay element in this
// app, including the lowest of them (FilterDrawer.jsx's z-50 slide-up
// panel), so any of them — FilterDrawer, MobileMenu (z-100),
// CategoryPickerSheet/EnquiryDrawer/SearchOverlay (z-[290]/z-[300]) —
// already covers this bar automatically whenever open, with no extra
// visibility wiring needed here.
//
// "Categories" has no route of its own — it opens CategoryPickerSheet
// (reusing the same `categories` data + `/shop?category=<id>` destination
// HomePage's CategoryCarousel/Header's mega menu already use), matching the
// explicit "do not create a separate Categories page" requirement.
// "Enquiry" reuses the existing enquiry-drawer callback (same one Header's
// cart icon and FloatingEnquiryButton already call) — also not a route.
// "WhatsApp" is a genuine external action (`target="_blank"`), not a route.

function isShopRouteActive(pathname) {
  // Same rule as MobileMenu.jsx's own isLinkActive('/shop') — a product
  // detail page still counts as "Shop" for active-state purposes.
  return (
    pathname === '/shop' ||
    pathname.startsWith('/shop/') ||
    pathname.startsWith('/product/')
  )
}

const TAB_CLASS = (active) =>
  cn(
    'flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[10.5px] font-medium transition-colors duration-fast ease-brand',
    active ? 'text-ink' : 'text-ink-secondary'
  )

/**
 * @param {object} props
 * @param {{id: string, name: string}[]} [props.categories]
 * @param {number} [props.enquiryCount]
 * @param {() => void} [props.onEnquiryClick]
 * @param {boolean} [props.enquiryDrawerOpen]
 * @param {string} props.whatsappUrl
 * @param {(href: string) => void} props.onNavigate
 * @param {string} [props.className]
 */
export function MobileBottomNav({
  categories = [],
  enquiryCount = 0,
  onEnquiryClick,
  enquiryDrawerOpen = false,
  whatsappUrl,
  onNavigate,
  className,
}) {
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const location = useLocation()

  const homeActive = location.pathname === '/'
  const shopActive = isShopRouteActive(location.pathname)

  const handleCategorySelect = (category) => {
    setCategoriesOpen(false)
    onNavigate?.(`/shop?category=${category.id}`)
  }

  return (
    <>
      <nav
        aria-label="Mobile primary navigation"
        className={cn(
          'mobile-bottom-nav-floating fixed inset-x-3 z-40 flex items-stretch overflow-hidden rounded-xl border border-hairline bg-white shadow-subtle md:hidden',
          className
        )}
      >
        <Link to="/" aria-label="Home" aria-current={homeActive ? 'page' : undefined} className={TAB_CLASS(homeActive)}>
          <IconHome className="h-5 w-5" />
          <span>Home</span>
        </Link>

        <Link
          to="/shop"
          aria-label="Shop"
          aria-current={shopActive ? 'page' : undefined}
          className={TAB_CLASS(shopActive)}
        >
          <IconShop className="h-5 w-5" />
          <span>Shop</span>
        </Link>

        <button
          type="button"
          aria-label="Browse categories"
          aria-pressed={categoriesOpen}
          onClick={() => setCategoriesOpen(true)}
          className={TAB_CLASS(categoriesOpen)}
        >
          <IconGrid className="h-5 w-5" />
          <span>Categories</span>
        </button>

        <button
          type="button"
          aria-label={`Enquiry list${enquiryCount > 0 ? `, ${enquiryCount} items` : ''}`}
          aria-pressed={enquiryDrawerOpen}
          onClick={onEnquiryClick}
          className={cn('relative', TAB_CLASS(enquiryDrawerOpen))}
        >
          <span className="relative">
            <IconCart className="h-5 w-5" />
            {enquiryCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-2 -top-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#25D366] px-0.5 text-[9px] font-bold leading-none text-white border border-white"
              >
                {enquiryCount}
              </span>
            )}
          </span>
          <span>Enquiry</span>
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp (opens in a new tab)"
          className={TAB_CLASS(false)}
        >
          <IconWhatsApp className="h-5 w-5" />
          <span>WhatsApp</span>
        </a>
      </nav>

      <CategoryPickerSheet
        isOpen={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
        categories={categories}
        onSelect={handleCategorySelect}
      />
    </>
  )
}
