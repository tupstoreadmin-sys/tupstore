// Mock data for feature-component demos and verification only — not a
// data layer. Replaced by real navigation config in a later milestone.
//
// Generic placeholder content only — deliberately not the real site's nav/
// category/footer copy, since layout components must stay product-data-free.
// Moved here from DesignSystemShowcase.jsx (was SAMPLE_NAV_LINKS /
// SAMPLE_FOOTER_COLUMNS / SAMPLE_BREADCRUMB_ITEMS) — values unchanged.

export const MOCK_NAV_LINKS = [
  { label: 'Home', href: '/' },
  {
    label: 'Products',
    href: '/shop',
    megaMenu: [
      {
        title: 'Bottles & Hydration',
        links: [
          {
            label: 'Aquasafe 1000ml Set',
            href: '/shop?category=bottles-hydration',
          },
          {
            label: 'Eco Bottle 500ml Sports',
            href: '/shop?category=bottles-hydration',
          },
        ],
      },
      {
        title: 'Lunch Boxes & Sets',
        links: [
          {
            label: 'Executive Lunch Box Set',
            href: '/shop?category=lunch-boxes',
          },
          { label: 'Slim Fast Break Box', href: '/shop?category=lunch-boxes' },
        ],
      },
      {
        title: 'Kitchen Storage',
        links: [
          {
            label: 'Modular Mates Oval Set',
            href: '/shop?category=kitchen-storage',
          },
          {
            label: 'Smart Saver Round Set',
            href: '/shop?category=kitchen-storage',
          },
          {
            label: 'One Touch Topper Set',
            href: '/shop?category=kitchen-storage',
          },
          {
            label: 'Premia Borosilicate Glass',
            href: '/shop?category=kitchen-storage',
          },
        ],
      },
      {
        title: 'Freezer Storage',
        links: [
          {
            label: 'FreezerMate Fresh Set',
            href: '/shop?category=freezer-storage',
          },
        ],
      },
      {
        title: 'Thermals & Insulated',
        links: [
          {
            label: 'Vacuum Insulated Flask',
            href: '/shop?category=thermals-insulated',
          },
          {
            label: 'Insulated Food Jar',
            href: '/shop?category=thermals-insulated',
          },
        ],
      },
      {
        title: 'Kids Collection',
        links: [
          {
            label: 'Cute Characters Set',
            href: '/shop?category=kids-collection',
          },
        ],
      },
    ],
  },
  { label: 'Promotions', href: '/promotions' },
  {
    label: 'About',
    href: '/about-tupperware',
    dropdown: [
      { label: 'About Tupperware', href: '/about-tupperware' },
      { label: 'About Tupstore', href: '/about-tupstore' },
    ],
  },
  { label: 'Contact', href: '/contact' },
]

export const MOCK_FOOTER_COLUMNS = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Product Catalogue', href: '/shop' },
      { label: 'Featured Offers', href: '/promotions' },
      { label: 'About Tupperware', href: '/about-tupperware' },
      { label: 'About Tupstore', href: '/about-tupstore' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'Categories',
    links: [
      {
        label: 'Bottles & Hydration',
        href: '/shop?category=bottles-hydration',
      },
      { label: 'Lunch Box Sets', href: '/shop?category=lunch-boxes' },
      {
        label: 'Modular Kitchen Storage',
        href: '/shop?category=kitchen-storage',
      },
      { label: 'Freezer Containers', href: '/shop?category=freezer-storage' },
      { label: 'Thermal Flasks', href: '/shop?category=thermals-insulated' },
    ],
  },
  {
    title: 'Store Information',
    storeInfo: [
      { label: 'Official Store:', value: 'tupstore.in' },
      {
        label: 'Location:',
        value: 'Thiruvalla, Pathanamthitta, Kerala 682016',
      },
      { label: 'Hours:', value: 'Mon - Sat: 10:00 AM - 8:00 PM' },
      { label: 'WhatsApp Support:', value: '+91 7736730041' },
      { label: 'Email Enquiry:', value: 'store@tupstore.in' },
    ],
    links: [
      { label: 'Thiruvalla, Pathanamthitta, Kerala 682016', href: '/contact' },
      { label: 'Mon - Sat: 10:00 AM - 8:00 PM', href: '/contact' },
      { label: '+91 7736730041', href: 'https://wa.me/917736730041' },
      { label: 'store@tupstore.in', href: 'mailto:store@tupstore.in' },
    ],
  },
]

export const MOCK_BREADCRUMB_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Sample Product Name' },
]
