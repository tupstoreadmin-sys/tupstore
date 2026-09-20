# Component Inventory — Tupperware Exclusive Store (React Rebuild)

Derived from a full read of `reference/src/main.js` (all seven view-render
functions: Home, Shop, Product Detail, Contact, About, About Store,
Promotions), `reference/index.html`, and `reference/src/style.css`. Every
component below maps to a real, in-use markup/CSS pattern in the approved
design — nothing here is speculative, except where explicitly flagged.

**Reusability scale used throughout:**
- **High** — generic, zero domain knowledge, usable in any future project
- **Medium** — reused across several contexts but aware of this domain (products, enquiries)
- **Low** — a page-shell singleton, instantiated exactly once in the whole app

Where a component genuinely belongs to two categories (e.g. the Header is
both "Layout" and "Navigation"), it's detailed once and cross-referenced
from the other section, rather than duplicated.

---

## 1. Core UI Components
*(`components/ui` — generic, no product/enquiry knowledge, no Tailwind arbitrary values beyond what DESIGN_SYSTEM.md already specifies)*

| Component | Purpose | Reusability | Dependencies | Used in |
|---|---|---|---|---|
| **Button** ✅ built | Primary/secondary/WhatsApp CTA — §8 | High | `cn()` | Everywhere |
| **IconButton** | Circular icon-only button (`.icon-btn`) — header search/social/WhatsApp icons, modal close buttons | High | `cn()` | Header, all modals, drawer |
| **Badge** | Small status pill — product badges ("Best Seller"), stock badges, discount badges | High | `cn()` | ProductCard, ProductDetail, ReelCard |
| **CountBadge** | Small numeric counter overlay (`.badge-count`) — distinct from Badge: circular, positioned absolute-top-right on a parent icon | High | `cn()` | Header enquiry icon, floating trigger, drawer title, mobile bottom bar |
| **Input** | Text/email/tel/search field (`.form-input`) | High | `cn()` | Enquiry form, Contact form, Shop search widget, Search modal |
| **Textarea** | Multi-line field (`.form-textarea`) | High | `cn()` | Enquiry form (notes), Contact form |
| **Select** | Dropdown (`.form-select`) | High | `cn()` | Enquiry form (city, fulfillment), Contact form, Shop sort dropdown |
| **Checkbox** | `.filter-label` + `input[type=checkbox]` | High | `cn()` | Shop sidebar: "In Stock Only", discount-range multi-select |
| **Radio** | `.filter-label` + `input[type=radio]` | High | `cn()` | Shop sidebar: category, capacity, collection (single-select each) |
| **RangeSlider** | `input[type=range]` price slider, ₹500–₹3000 | Medium | `cn()` | Shop sidebar "Max Price" widget only — *not in the original M1 list, found during this review* |
| **Card** | Generic elevated surface — base for Why/Testimonial/Category cards | High | `cn()` | Composed into several feature-level cards below |
| **Modal** | Generic overlay + centered panel, `radius-xl`, `shadow-modal` | High | `cn()`, focus-trap logic | Search modal, QuickView modal (product), Reel modal |
| **Drawer** | Slide-in side panel, `shadow-drawer` | Medium | `cn()`, focus-trap logic | Enquiry drawer (the one and only use today, but built generically) |
| **RatingStars** | Gold star display (`★`, `#FFB800`), optional numeric value | High | none | ProductCard, ProductDetail, Testimonials |
| **Avatar** | Circular image, fallback initials | High | none | Testimonials (`author-avatar`) |
| **Spinner / Skeleton** | Loading shimmer (`loadingSkeleton` keyframe, §15) | High | none | Anywhere data is being fetched (no direct precedent in source — source has no async loading state since data is a static import; this becomes relevant once a real backend/API exists) |
| **EmptyState** | Icon + message + optional action, seen as the drawer's "Your enquiry list is empty" state | High | Button (optional) | Enquiry drawer (confirmed); Shop "no results" state (implied by `filterAndRenderShopProducts` but not read in detail — verify) |
| **Toast** | Transient success/error notification | High | none | **No direct precedent in the reference design** — the source shows success by mutating button text in place (e.g. "Message sent — we'll reply shortly") rather than a toast/snackbar system. This is a genuinely new pattern for the React version, not an extraction. Flagging explicitly since every other row in this table traces to real source markup and this one doesn't. |

---

## 2. Layout Components
*(`components/layout` — page-shell singletons, each mounted exactly once in the root layout)*

| Component | Purpose | Reusability | Dependencies | Used in |
|---|---|---|---|---|
| **Header / Navbar** | Sticky header, logo, nav links, action icons, enquiry badge | Low | IconButton, CountBadge, MegaMenu | Every page (root layout) |
| **MegaMenu** | "Products" nav-link dropdown — 6 category columns, each linking into Shop filtered by category or directly to a product | Low | none | Inside Header only |
| **Footer** | Brand blurb, newsletter form, 3 link columns, store info, social icons | Low | NewsletterForm, IconButton | Every page (root layout) |
| **MobileBottomBar** | Fixed app-like tab bar: Home/Shop/Search/Enquiry | Low | CountBadge | Every page, mobile only |
| **PageBanner** | Full-width image-background banner with a single `<h1>` — used identically on every non-home page | Medium | none | Shop, Product Detail, Promotions, About, About Store, Contact |
| **BreadcrumbBar** | Thin bar directly below `PageBanner`, wraps the `Breadcrumbs` primitive (§5) | Medium | Breadcrumbs | Same pages as PageBanner |

---

## 3. Product Components
*(`features/product` and `features/shop` — domain-aware, compose Core UI primitives)*

| Component | Purpose | Reusability | Dependencies | Used in |
|---|---|---|---|---|
| **ProductCard** | The full spec from DESIGN_SYSTEM.md §16 — image, badge, quick-view trigger, hover enquiry action, title, price/rating row, footer enquiry button with `in-enquiry` state | Medium | Card, Badge, RatingStars, PriceDisplay, IconButton, Button | Shop grid, Related Products, Recently Viewed, Search results grid |
| **ProductGrid** | Grid wrapper around `ProductCard[]`, handles empty state | Medium | ProductCard, EmptyState | Shop, Related Products, Recently Viewed |
| **CategoryCard** | Home "Shop By Category" tile — image + name + tagline | Medium | Card | Home page only |
| **PromoCard** | Featured-offer slide — tag, title, subtitle, CTA, image | Medium | Badge, Button | Home "Featured Highlights" promotions slider |
| **ReelCard** | Instagram-style video teaser — thumbnail, play button, view count/duration, product name + price row | Medium | PriceDisplay, Badge | Home "Watch in Action" reels carousel |
| **ProductGallery** | Main image + clickable thumbnail strip, swaps main image on click | Low (product-detail-specific) | none | Product Detail page only |
| **ColorOptionPicker** | Row of text-label pill buttons (not literal swatches), single-select | Medium | none | Product Detail page (could extend to ProductCard quick-view later) |
| **QuantityStepper** | `− qty +` control | Medium | none | Product Detail page, Enquiry drawer line items |
| **PriceDisplay** | Current price + strikethrough original + discount-% badge, one recurring layout | High | Badge | ProductCard, Product Detail, ReelCard |
| **ProductSpecsTable** | Simple 2-column key/value table (capacity, materials, safety rating, etc.) | Low | none | Product Detail page only |
| **ProductFeaturesList** | Checkmark-icon bullet list ("Key Highlights") | Medium | none | Product Detail page (could reuse for QuickView modal) |

---

## 4. Form Components
*(`features/*` — domain compositions built from Core UI form atoms; none of these are themselves reusable across *different* forms, but each is built entirely from reusable atoms)*

| Component | Purpose | Reusability | Dependencies | Used in |
|---|---|---|---|---|
| **EnquiryForm** | Customer details (name, phone, city, fulfillment preference, notes) inside the drawer, feeds `buildEnquiryMessage()` | Low | Input, Select, Textarea, Button | Enquiry drawer only |
| **ContactForm** | Contact page enquiry form (structure not fully confirmed in this review — `renderContactView` was not read line-by-line; revisit before building) | Low | Input, Select, Textarea, Button | Contact page only |
| **NewsletterForm** | Email capture, inline in Footer | Low | Input, Button | Footer only |
| **ShopFilterSidebar** | Composition of one **FilterWidget** (collapsible section, see the discount widget's expand/collapse icon) per filter group: search, category (Radio group), price (RangeSlider), capacity (Radio group), availability (Checkbox), collection (Radio group), discount (Checkbox group) | Low | Input, Radio, Checkbox, RangeSlider | Shop page sidebar only |
| **SearchBox** | Search modal's input + live-filtered results grid | Low | Input, ProductGrid | Search modal only |

---

## 5. Navigation Components
*(Several of these are detailed in full under §2 Layout — cross-referenced here rather than duplicated, since they're structurally page-shell components that also happen to be the site's wayfinding.)*

| Component | Purpose | Reusability | Dependencies | Used in |
|---|---|---|---|---|
| **Header / Navbar** | *(see §2 — full detail there)* | Low | — | Root layout |
| **MegaMenu** | *(see §2)* | Low | — | Inside Header |
| **MobileBottomBar** | *(see §2)* | Low | — | Root layout, mobile |
| **Breadcrumbs** | `Home / Shop / Product Name` trail — the actual reusable primitive `BreadcrumbBar` (§2) wraps | High | none | Shop, Product Detail, and (implied) other secondary pages |
| **CarouselControls** | Prev/next arrow pair — **identical markup appears three separate times** (hero slider, promotions slider, reels carousel), each currently hand-duplicated in the source. Genuinely reusable navigation primitive worth extracting once, not three times. | High | none | Hero slider, Promotions slider, Reels carousel |
| **SliderDots** | Pagination dots + counter (`01 / 04`) + autoplay progress bar — specific to the hero slider only in the source (promotions/reels carousels don't have dots) | Low | none | Hero slider only |

---

## 6. Feedback Components
*(Mostly cross-referenced from §1 Core UI — grouped here by the *purpose* they serve rather than re-detailed.)*

| Component | Purpose | Reusability | Dependencies | Used in |
|---|---|---|---|---|
| **Toast** | *(see §1 — flagged as new, no source precedent)* | High | — | Add-to-enquiry confirmation, form submit success/error (new UX, not extracted) |
| **Spinner / Skeleton** | *(see §1)* | High | — | Future async data states |
| **EmptyState** | *(see §1)* | High | — | Empty enquiry drawer, empty shop results |
| **FieldError** | Inline validation message below a field (`#enquiry-form-error`, `.input-error` red-border state) | High | none | EnquiryForm (confirmed), ContactForm (likely — unconfirmed) |
| **CountBadge** | *(see §1)* — the "feedback" role here is specifically the enquiry-count signal | High | — | Header, floating trigger, drawer, bottom bar |
| **ProductCard `in-enquiry` state** | Not a separate component — a state variant of the existing enquiry-action buttons (grey → permanent WhatsApp-green, per DESIGN_SYSTEM.md §16). Documenting here so it isn't mistaken for a missing Toast/confirmation component — the source's "feedback" for this specific action is a persistent button-color change, not a transient notification. | — | Button/Badge variant logic | ProductCard, Product Detail |

---

## 7. Shared Components
*(Cross-cutting — used by nearly everything else, live at the top of `components/ui` or `src/utils`)*

| Component | Purpose | Reusability | Dependencies | Used in |
|---|---|---|---|---|
| **Container** ✅ token exists in Tailwind config | `max-w-container` (1440px) + centered + 16px padding, §12 | High | none | Every section on every page |
| **SectionTitle** | Eyebrow label + `<h2>` + description paragraph — the `.section-header`/`.section-subtitle`/`.section-title`/`.section-desc` pattern, repeated on nearly every home-page section | High | Typography | Home (5+ sections), Shop, Product Detail ("Related Products"/"Recently Viewed" headers use a left-aligned variant) |
| **Typography** (`Heading`, `Text`) | Wraps the `font-heading`/`font-body` families and the practical type scale from DESIGN_SYSTEM.md §3 into consistent primitives instead of raw `<h2>`/`<p>` + ad hoc classes everywhere | High | none | Everywhere |
| **IconButton** | *(see §1 — listed here too since it's genuinely cross-cutting: header, modals, drawer, product cards all use it)* | High | — | Everywhere |
| **`cn()` utility** ✅ built | Not a component — the shared class-merge helper every component above depends on | — | `clsx`, `tailwind-merge` | Every component |

---

## Open items to resolve before building (not decisions this document makes)

1. **`ContactForm`'s exact fields** — `renderContactView` wasn't read in full during this pass; confirm its structure before building rather than assuming it mirrors `EnquiryForm`.
2. **Shop's empty-results state** — `filterAndRenderShopProducts` wasn't read in full; confirm it actually renders an `EmptyState`-shaped message before assuming that reuse.
3. **`StepCard`/`.steps-grid`** — fully specified in `style.css` (§ referenced in DESIGN_SYSTEM.md §18) but **not found in any rendered view read during this pass** (not on Home). Possibly used on About/About Store, or dead CSS. Verify before deciding whether it's a real component to build.
4. **`CarouselControls`/dots** — three carousels currently duplicate arrow markup independently in the source; confirm during build whether their subtle differences (dots+counter on hero only) justify one flexible component or two smaller ones.

---

## Showcase page

Per your instruction, all future component verification happens in a
dedicated dev-only route rather than by editing `App.jsx`:
[`src/pages/dev/DesignSystemShowcase.jsx`](src/pages/dev/DesignSystemShowcase.jsx),
reachable at `/dev/design-system`, wired in `main.jsx` alongside (not inside)
the untouched `App.jsx`. It currently shows the approved Button. Each future
component gets added here as it's approved, and the whole `pages/dev/`
directory is deleted before production.
