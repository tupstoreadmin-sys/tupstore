# Design System — Tupperware Exclusive Store (Kerala)

Extracted directly from the approved reference implementation in
[`reference/`](reference/) — specifically `reference/src/style.css` (4,872
lines) and the markup patterns in `reference/index.html`. Every value below
is a real, in-use value from that codebase, not an invented target. Where
the source has no formal token (spacing, breakpoints, font sizes), this
document lists the *practical* scale actually in use, so M1 can decide how
to formalize it in Tailwind — that decision is deliberately left open here.

The stylesheet's own header comment describes the intent:
> "Design System: Apple & Muji Inspired Minimal Luxury"

---

## 1. Brand Colors

All colors are declared as CSS custom properties in `:root` — no hardcoded
hex values outside this block for core UI (component-specific accents like
star ratings are the exception, noted below).

| Token | Value | Usage |
|---|---|---|
| `--bg-main` | `#ffffff` | Page background |
| `--bg-subtle` | `#f5f5f7` | Section backgrounds, input fallback, badge chips |
| `--bg-card` | `#ffffff` | Card surfaces |
| `--bg-dark` | `#111111` | Dark surfaces (footer, etc.) |
| `--text-primary` | `#111111` | Headings, primary text, primary button background |
| `--text-secondary` | `#6e6e73` | Body copy, descriptions |
| `--text-muted` | `#86868b` | De-emphasized text (e.g. step numbers) |
| `--text-inverse` | `#ffffff` | Text on dark/colored backgrounds |
| `--border-light` | `rgba(0,0,0,0.08)` | Default card/input borders |
| `--border-subtle` | `rgba(0,0,0,0.04)` | Faint dividers |
| `--border-dark` | `#2c2c2e` | Dark-mode-style borders |
| `--accent-wa` | `#25D366` | WhatsApp brand green — the site's one accent color |
| `--accent-wa-hover` | `#1eaa53` | WhatsApp green, hover state |
| `--accent-badge` | `#111111` | Badge backgrounds |

**Notable non-tokenized colors** (used ad hoc, not as CSS variables):
- Error/validation red: `#d93025`, error background `#fff8f8`
- Star rating gold: `#FFB800`
- Hover-darkened black: `#2c2c2e` (primary button hover), `#000000` (enquiry hover)
- Secondary button border hover: `#d1d1d6`

**Palette philosophy:** near-monochrome (black/white/grey) with exactly one
saturated accent color (WhatsApp green), used *only* for WhatsApp/enquiry
actions — reinforcing that WhatsApp is the site's single conversion path.
No blue "link" color, no multi-color category system.

---

## 2. Typography

| Token | Value | Usage |
|---|---|---|
| `--font-primary` | `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | All headings (`h1`–`h6`), logo text, numerals (step numbers, prices in some contexts) |
| `--font-body` | `'Inter', sans-serif` | Body copy, buttons, form inputs |

Loaded via Google Fonts `@import` (weights 300/400/500/600/700 for both
families). Headings additionally get `letter-spacing: -0.02em` (tightened
tracking) and `font-weight: 700` by default at the element level.

---

## 3. Font Sizes

No `--font-size-*` custom properties exist — sizes are literal pixel values
set per component. Consolidated list of every distinct value found, largest
to smallest (a `.5px` suffix pattern like `13.5px` appears repeatedly,
suggesting deliberate fine-tuning rather than a strict scale):

**Display / hero:** 52px, 48px, 38px, 36px, 32px, 28px

**Headings / section titles:** 24px, 22px, 20px, 18px, 16px

**Body / UI text:** 15px, 14.5px, 14px, 13.5px, 13px, 12.5px, 12px

**Small / meta / labels:** 11.5px, 11px, 10.5px, 10px

**Base document size:** `html { font-size: 16px }`

This is a *practical* scale, not a formal one — worth deciding in M1
whether to snap these to Tailwind's default type scale or preserve the
fractional values (the `.5px` increments do appear intentional in several
dense UI contexts like product cards).

---

## 4. Font Weights

| Weight | Usage |
|---|---|
| 800 | Logo text, price values, step numbers, biggest stat numbers |
| 700 | All headings (default), product titles, badges, form labels, bold UI labels |
| 600 | Buttons, section subtitles (eyebrow labels), "why" card hover text |
| 500 | Store badge, secondary UI text |
| 400 | Body copy, descriptions (explicit — not just the browser default) |

No 300 (light) weight is actually used in component CSS despite being
loaded from Google Fonts — worth confirming in M1 whether it's needed
before dropping it from the font `@import` to save a network request.

---

## 5. Spacing Scale

No `--space-*` tokens — spacing is literal pixels, applied consistently
enough to read as an informal scale. Distinct values observed, ascending:

```
4  6  8  10  12  14  16  18  20  24  28  32  36  40  56  80
```

Roughly 4px-incremented up to 32px (matching Tailwind's default spacing
scale almost exactly), then jumps to larger "layout-level" gaps: 40px
(mobile hero-grid gap), 56px (desktop hero-grid gap, section-header bottom
margin), 80px (`.section` vertical padding — the single largest, most
consistent unit, used as the primary rhythm between page sections).

---

## 6. Border Radius

A clean, fully-tokenized scale — one of the most disciplined parts of the
system:

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `8px` | Badges, small buttons |
| `--radius-md` | `12px` | Buttons (small variant), form inputs, icon step-cards |
| `--radius-lg` | `16px` | Primary buttons, product cards, why-cards, step-cards |
| `--radius-xl` | `24px` | Modal containers |
| `--radius-full` | `9999px` | Pills (icon buttons, floating trigger, badges, why-icon circles) |

---

## 7. Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-subtle` | `0 4px 20px rgba(0,0,0,0.03)` | Resting hover state for secondary cards (why-cards) |
| `--shadow-hover` | `0 12px 36px rgba(0,0,0,0.08)` | Product card hover lift |
| `--shadow-drawer` | `-8px 0 32px rgba(0,0,0,0.12)` | Enquiry drawer panel |

**Component-specific one-off shadows** (not tokenized, used directly):
- Primary button: `0 4px 14px rgba(0,0,0,0.12)` → hover `0 6px 20px rgba(0,0,0,0.18)`
- WhatsApp button hover: `0 6px 20px rgba(37,211,102,0.25)` (tinted with the accent color)
- Floating enquiry trigger: `0 10px 30px rgba(0,0,0,0.25)` → hover `0 14px 36px rgba(0,0,0,0.3)`
- Modal container: `0 20px 50px rgba(0,0,0,0.2)`
- Form input focus ring: `0 0 0 3px rgba(17,17,17,0.12)` (a focus *ring*, not a shadow, but implemented the same way)

Pattern: shadows scale in size and opacity together as elevation increases
(subtle → hover → drawer → modal), and hover shadows on colored buttons
tint toward that button's own color rather than staying neutral black.

---

## 8. Button Variants

Base `.btn` class: `inline-flex`, centered content, `gap: 8px`,
`padding: 14px 28px`, `border-radius: var(--radius-lg)`, `font-weight: 600`,
`font-size: 15px`, `transition: all var(--transition-fast)`.

| Variant | Background | Hover behavior |
|---|---|---|
| `.btn-primary` | `--text-primary` (black), white text | Darkens to `#2c2c2e`, lifts `translateY(-2px)`, shadow deepens |
| `.btn-secondary` | white, `1px solid --border-light` | Background → `#f5f5f7`, border → `#d1d1d6`, lifts `-2px` |
| `.btn-wa` | `--accent-wa` (WhatsApp green) | Darkens to `--accent-wa-hover`, lifts `-2px`, green-tinted shadow |
| `.btn-sm` | (modifier) | `padding: 8px 16px`, `font-size: 13px`, `radius: --radius-md` |
| `.btn-full` | (modifier) | `width: 100%` |

**Icon buttons** (`.icon-btn`, header/social icons): 38×38px, fully round
(`--radius-full`), transparent by default, `hover: opacity 0.7, scale(1.08)`.
`.icon-btn-wa` variant is solid green. Every hover on this whole site uses
either a lift (`translateY`), a scale, or both — never just a color swap.

---

## 9. Input Styles

Shared by `.form-input`, `.form-select`, `.form-textarea`:
- `padding: 12px 14px`, `border-radius: var(--radius-md)` (12px)
- `border: 1px solid #d1d1d6`
- `font: var(--font-body)`, `14px`
- Resting shadow: `0 1px 3px rgba(0,0,0,0.04)` (subtle depth even unfocused)
- **Focus:** border → `--text-primary` (black), `box-shadow: 0 0 0 3px rgba(17,17,17,0.12)` (a black focus ring, not the browser default blue)
- **Error state** (`.input-error`): border → `#d93025`, background → `#fff8f8`

Labels (`.form-label`): 12px, weight 700, uppercase, `letter-spacing: 0.05em`
— consistently used above every field.

---

## 10. Card Styles

Three distinct card patterns, all sharing the same DNA (white surface, 1px
`--border-light`, `--radius-lg`, hover lift + shadow) but tuned differently:

| Card type | Rest state | Hover state |
|---|---|---|
| `.product-card` | white, border, `radius-lg`, `overflow:hidden` | `translateY(-6px)`, `--shadow-hover`, border darkens to `rgba(0,0,0,0.15)` |
| `.why-card` (value props) | white, border, `radius-lg`, `padding: 28px 20px`, centered text | `translateY(-4px)`, `--shadow-subtle`, border → `#d1d1d6` |
| `.step-card` (how-it-works) | white, border, `radius-lg`, `padding: 32px 24px` | (no hover transform defined — static) |

Product cards are the only ones with an image; why-cards/step-cards are
icon + text only (56×56px and 44×44px icon containers respectively, the
former circular, the latter rounded-square).

---

## 11. Icon Usage

**Approach:** hand-authored inline SVG (`<svg viewBox="0 0 24 24" ...>`)
directly in markup — no icon font, no icon component library, no sprite
sheet for most icons (one exception: `/icons.svg` referenced via `<use>`
for a few footer/doc icons in the Vite scaffold, unrelated to the storefront
UI itself).

**Sizing convention** (from actual `width`/`height` attributes in the markup):
- 24×24 — mobile bottom nav icons
- 20×20 — header search/WhatsApp icons, close buttons, enquiry cart icon
- 19×19 — Facebook/Instagram icons specifically (odd size, deliberate optical match to the other 20px icons)
- 18×18 — footer social icons, WhatsApp button icon
- 22×22 — mobile menu toggle, reel modal close

**Stroke convention:** `fill="none" stroke="currentColor" stroke-width="2"`
almost universally (`stroke-width="2.5"` for a couple of modal-close/arrow
icons that want more visual weight). `currentColor` means every icon
inherits its color from the surrounding text/button color — no icon ever
hardcodes its own fill.

---

## 12. Container Widths

```css
.container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 16px;
}
```

One container width for the entire site — no separate "narrow" container
variant for text-heavy sections (About, Contact copy just sits inside the
same 1440px container, visually narrowed by grid columns instead, e.g. the
`.hero-grid`'s `1fr 1fr` split).

---

## 13. Responsive Breakpoints

No `--breakpoint-*` tokens — every `@media` query hardcodes its own
max-width. Distinct values in use, descending:

```
1400px  1100px  1024px  992px  991px  880px  768px  640px
```

This is **not** a clean formal scale — it's per-component tuning (e.g. the
category grid steps down at 1400/1100/880/640, while the primary layout
grids step down at 1024/768). The two values that recur most and function
as the site's real structural breakpoints are:

- **1024px** — primary tablet breakpoint (hero becomes single-column,
  product grid 5→3 columns, footer 4→2 columns)
- **768px** — primary mobile breakpoint (product grid 3→2, product image
  height 320px→180px, most component-level mobile overrides live here)

M1 should decide whether to preserve this ad hoc set or consolidate to
Tailwind's default breakpoints (`sm:640 md:768 lg:1024 xl:1280 2xl:1536`) —
768/1024/640 already align with Tailwind defaults almost exactly.

---

## 14. Hover Effects

A consistent vocabulary is used everywhere — never a bare color change
alone:

| Pattern | Example |
|---|---|
| **Lift** (`translateY(-Npx)`) | Buttons `-2px`, product cards `-6px`, why-cards `-4px`, floating trigger `-4px` |
| **Scale** | Icon buttons `scale(1.08)`, WhatsApp icon button `scale(1.05)`, floating trigger `scale(1.03)`, enquiry-in-cart button `scale(1.02)` |
| **Image zoom** | Product thumbnail `scale(1.04)` on card hover (image scales, card doesn't) |
| **Shadow deepen** | Every lift is paired with a larger/darker shadow, often tinted toward the element's own accent color |
| **Reveal** | Quick-view button and the "add to enquiry" overlay on product cards are `opacity: 0` at rest, fade+slide to `opacity: 1` on card hover (and forced permanently visible below 768px, since there's no hover on touch) |

All hover transitions use the tokenized timing functions (§ below), never
an ad hoc duration.

---

## 15. Animation Styles

**Transition tokens:**
```css
--transition-fast:   0.2s  cubic-bezier(0.16, 1, 0.3, 1);
--transition-smooth:  0.35s cubic-bezier(0.16, 1, 0.3, 1);
```
Same custom easing curve (a snappy ease-out) for both — `fast` for
buttons/icons/hovers, `smooth` for larger surface changes (card lifts,
image zoom, drawer/overlay reveals).

**Keyframe animations:**

| Name | Duration | Purpose |
|---|---|---|
| `fadeInView` | `0.5s` (same easing curve as above) | Route/view transition — fades in + slides up 12px on every page navigation |
| `loadingSkeleton` | `1.5s infinite` | Shimmer effect (`background-position` sweep) for loading placeholders |
| `pulseDot` | `1.8s infinite ease-in-out` | Scale 1→1.5 + fade, a "live"/attention-drawing pulsing dot |

No spring physics, no bounce easing — everything uses the one custom
ease-out curve, which reads as deliberate restraint (matches the "Apple &
Muji" minimal-luxury intent stated in the stylesheet header).

---

## 16. Product Card Specifications

The single most detailed, most-iterated component in the system — full spec:

- **Container:** white card, `1px solid --border-light`, `radius-lg` (16px), `overflow: hidden`, flex column
- **Image wrapper:** fixed height **320px** desktop → **180px** at ≤768px, `background: --bg-subtle` (visible if image is slow to load), image itself `object-fit: cover`, zooms to `scale(1.04)` on card hover
- **Badge** (e.g. "Best Seller", "New Arrival"): top-left, 11px/700 weight, translucent white pill (`rgba(255,255,255,0.92)` + `backdrop-filter: blur(4px)`), `radius-sm`
- **Quick-view button:** top-right, 36×36px circle, same translucent-blur treatment, hidden (`opacity:0`) until card hover — **except on mobile, where it's permanently visible** (no hover state to reveal it)
- **Hover-reveal enquiry action:** a full-width black button that slides up from the bottom of the image on hover (desktop) or sits permanently visible (mobile, smaller padding/font)
- **Body padding:** `12px 16px`
- **Title:** 14px/700, exactly 2 lines via `-webkit-line-clamp: 2` with a fixed `2.6em` height reserved (so cards stay aligned in a row even with short titles)
- **Price/rating row:** flex, space-between; price 13.5px/800 weight; rating shown as gold (`#FFB800`) star glyphs + numeric value 12px/700
- **Footer button** (`.add-enquiry-btn`): full-width, grey at rest, inverts to black on hover, **turns WhatsApp-green permanently once the item is in the enquiry list** (`.in-enquiry` state) — this state applies to both the footer button and the hover-overlay button independently
- **Grid gap:** 10px desktop, 12px mobile (tighter than most other grids on the site, intentional given how many cards are visible at once)

This "in-enquiry" visual state (grey → green, not a checkmark or counter) is
the main piece of interactive product-card logic worth preserving exactly
in the React rebuild.

---

## 17. Image Aspect Ratios

**No CSS `aspect-ratio` property is used anywhere in the stylesheet.** The
actual pattern throughout is: a wrapper with a **fixed pixel height** +
`object-fit: cover` on the `<img>`, letting width flex fluidly with the
grid column. This means the *effective* aspect ratio changes with viewport
width rather than being locked — worth an explicit decision in M1 on
whether to keep this fixed-height approach (simpler, matches source exactly)
or convert to true `aspect-ratio` values (more robust across arbitrary
column widths, avoids any height/width mismatch at extreme viewport sizes).

Observed heights by context:
- Product card thumbnail: 320px desktop / 180px mobile
- Category card image: 170px desktop → 130px at ≤640px
- Hero images: full-bleed via `.hero-slide-bg`, not a fixed aspect box
- Logo: fixed `height: 38px`, `width: auto` (intrinsic ratio preserved)

---

## 18. Grid System

All grids are native CSS Grid (`display: grid`), no framework, no 12-column
utility system — each component defines its own column count and steps it
down independently per breakpoint. No shared `--grid-gap` token; gaps are
tuned per component (10–56px range).

| Grid | Base columns | Responsive cascade |
|---|---|---|
| `.product-grid` (shop/catalog) | 5 | → 3 @1024px → 2 @768px |
| `.home-category-cards-grid` | 6 | → 5 @1400px → 4 @1100px → 3 @880px → 2 @640px |
| `.why-grid` (value props) | 5 | → 3 @1024px |
| `.steps-grid` (how it works) | 4 | → 2 @1024px |
| `.hero-grid` | 2 (`1fr 1fr`) | → 1 @1024px (stacks) |
| `.footer-grid` | (multi-column, brand + 3 link columns) | → `1fr 1fr` @1024px |
| `.category-grid` | (mega-menu / other category listing) | → 2 @1024px |

Pattern: every grid degrades toward fewer, wider columns as viewport
shrinks, bottoming out at 1–2 columns on mobile; none use `auto-fit`/
`minmax()` — every column count at every breakpoint is an explicit integer,
which is why the breakpoint set in §13 is so granular (each grid was tuned
by eye rather than sharing a formula).

---

## Open questions for M1

A few things this document deliberately doesn't resolve, since they're
design-system *decisions*, not extraction facts:

1. Formalize the practical spacing/font-size/breakpoint scales above into
   `tailwind.config.js` tokens, or keep them as arbitrary values?
2. Keep the fixed-height + `object-fit: cover` image pattern, or move to
   `aspect-ratio`?
3. The `.5px` font sizes (`13.5px`, `14.5px`, etc.) — preserve exactly, or
   round to the nearest whole/Tailwind-scale value?
4. Confirm whether the unused 300 (light) font weight should still be
   loaded from Google Fonts.
