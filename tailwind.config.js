// KNOWN ISSUE: arbitrary Tailwind values containing commas (e.g.
// `bg-[rgba(255,255,255,0.92)]`, `bg-[rgb(255_0_0_/_0.5)]`) generate no CSS
// at all in this project's Tailwind/PostCSS/Vite setup — confirmed via
// isolated testing across multiple properties and color formats; hex
// arbitrary values (`bg-[#ff00aa]`) and calc() work fine. Root cause not
// identified. Workaround: any translucent/multi-argument color a component
// needs must be added as a named token below (JS string values in this
// config work correctly) rather than written as an arbitrary value in a
// className string.

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces — DESIGN_SYSTEM.md §1
        surface: '#ffffff', // --bg-main / --bg-card
        'surface-subtle': '#f5f5f7', // --bg-subtle
        'surface-dark': '#111111', // --bg-dark
        'banner-dark': '#0f172a', // .page-header-banner background (distinct from --bg-dark)

        // Text — DESIGN_SYSTEM.md §1
        ink: '#111111', // --text-primary
        'ink-secondary': '#6e6e73', // --text-secondary
        'ink-muted': '#86868b', // --text-muted
        'ink-inverse': '#ffffff', // --text-inverse

        // Borders — DESIGN_SYSTEM.md §1
        hairline: 'rgba(0, 0, 0, 0.08)', // --border-light
        'hairline-subtle': 'rgba(0, 0, 0, 0.04)', // --border-subtle
        'hairline-dark': '#2c2c2e', // --border-dark
        'hairline-strong': '#d1d1d6', // recurring un-tokenized border (inputs, secondary btn hover)
        'hairline-hover': 'rgba(0, 0, 0, 0.15)', // §16 — ProductCard hover border

        // Accent — the site's one saturated color, WhatsApp only
        wa: '#25d366', // --accent-wa
        'wa-hover': '#1eaa53', // --accent-wa-hover

        // Feedback — un-tokenized in source but reused across form/toast states
        error: '#d93025',
        'error-bg': '#fff8f8',
        star: '#ffb800',
        discount: '#15803d', // .reel-discount-badge text
        'discount-bg': '#dcfce7', // .reel-discount-badge background
        'badge-translucent': 'rgba(255, 255, 255, 0.92)', // §16 — .product-badge on-image background
        'header-glass': 'rgba(255, 255, 255, 0.88)', // .site-header background
        overlay: 'rgba(0, 0, 0, 0.5)', // .modal-overlay background
        'surface-faint': '#f8fafc', // .breadcrumb-bar / .newsletter-input background
        'dot-inactive': 'rgba(0, 0, 0, 0.18)', // .hero-dot
        'dot-hover': 'rgba(0, 0, 0, 0.4)', // .hero-dot:hover
        'promo-sub': '#1d1d1d', // .promo-card-sub text
      },
      borderRadius: {
        // Overrides Tailwind's default sm/md/lg/xl/full — DESIGN_SYSTEM.md §6
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      boxShadow: {
        // DESIGN_SYSTEM.md §7
        subtle: '0 4px 20px rgba(0, 0, 0, 0.03)',
        hover: '0 12px 36px rgba(0, 0, 0, 0.08)',
        drawer: '-8px 0 32px rgba(0, 0, 0, 0.12)',
        modal: '0 20px 50px rgba(0, 0, 0, 0.2)',
        fab: '0 10px 30px rgba(0, 0, 0, 0.25)',
        'fab-hover': '0 14px 36px rgba(0, 0, 0, 0.3)',
        focus: '0 0 0 3px rgba(17, 17, 17, 0.12)',
        'btn-primary': '0 4px 14px rgba(0, 0, 0, 0.12)',
        'btn-primary-hover': '0 6px 20px rgba(0, 0, 0, 0.18)',
        'btn-wa-hover': '0 6px 20px rgba(37, 211, 102, 0.25)',
        input: '0 1px 3px rgba(0, 0, 0, 0.04)', // §9 — .form-input/select/textarea resting shadow
        'product-badge': '0 2px 6px rgba(0, 0, 0, 0.06)', // §16 — translucent on-image badge
        'card-cta': '0 6px 20px rgba(0, 0, 0, 0.22)', // §16 — thumb-hover-enquiry-btn
        mega: '0 16px 32px rgba(0, 0, 0, 0.05)', // .mega-menu
        dropdown: '0 16px 32px rgba(0, 0, 0, 0.08)', // .simple-dropdown
        'nav-arrow-hover': '0 8px 20px rgba(0, 0, 0, 0.15)', // .hero-slider-nav:hover
        'testimonial-hover': '0 8px 28px rgba(0, 0, 0, 0.06)', // .testimonial-card:hover
      },
      fontFamily: {
        // DESIGN_SYSTEM.md §2
        heading: [
          '"Plus Jakarta Sans"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        body: ['Inter', 'sans-serif'],
      },
      transitionDuration: {
        // DESIGN_SYSTEM.md §15
        fast: '200ms',
        smooth: '350ms',
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      maxWidth: {
        // DESIGN_SYSTEM.md §12
        container: '1440px',
      },
      keyframes: {
        // DESIGN_SYSTEM.md §15 — .skeleton / @keyframes loadingSkeleton
        loadingSkeleton: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        loadingSkeleton: 'loadingSkeleton 1.5s infinite',
      },
    },
  },
  plugins: [],
}
