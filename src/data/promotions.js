// Mock data for feature-component demos and verification only — not a
// data layer. Replaced by a real repository in a later milestone.

export const MOCK_HERO_SLIDES = [
  {
    tag: 'Modular Kitchen Essentials',
    title: 'Organize Your Dream Kitchen in Style',
    image: '/images/cat_kitchen.png',
    primaryCta: { label: 'Explore Kitchen Storage', href: '/shop' },
    secondaryCta: { label: 'Kitchen Consultation', href: '#' },
    trustBadges: [
      '100% Air-Tight Moisture Seal',
      'Space-Saving Modular Design',
      'BPA-Free Food Grade Material',
    ],
  },
  {
    tag: 'Hydration & On-The-Go',
    title: 'Stay Fresh & Hydrated Every Single Day',
    image: '/images/cat_bottles.png',
    primaryCta: { label: 'Explore Bottles & Sets', href: '/shop' },
    secondaryCta: { label: 'WhatsApp Enquiry', href: '#' },
    trustBadges: [
      'Spill-Proof & Ergonomic Grip',
      '100% Safe Eco-Friendly Plastic',
      'Vibrant Colors & Lifetime Quality',
    ],
  },
  {
    tag: 'Smart Meal Prep & Insulated',
    title: 'Keep Meals Hot & Fresh Wherever You Go',
    image: '/images/cat_kitchen.png',
    primaryCta: { label: 'Explore Lunch Collections', href: '/shop' },
    secondaryCta: { label: 'Get Recommendation', href: '#' },
    trustBadges: [
      'Advanced Thermal Insulation',
      'Leak-Proof Inner Container Seals',
      'Compact & Easy-Carrying Bag',
    ],
  },
  {
    tag: 'Pantry Organization',
    title: 'Transform Your Pantry Storage Experience',
    image: '/images/cat_bottles.png',
    primaryCta: { label: 'Shop Best Sellers', href: '/shop' },
    secondaryCta: { label: 'Store Consultation', href: '#' },
    trustBadges: [
      'Clear Window Easy Identification',
      'Stackable Space-Maximizing Shape',
      'Authentic Tupperware Guarantee',
    ],
  },
]

export const MOCK_FEATURED_HIGHLIGHTS = [
  {
    id: 'highlight-1',
    badge: 'LIMITED COMBO OFFER',
    title: 'Executive Lunch Box + Hydration Flask',
    description: 'Complete daily meal kit with insulated carry tote',
    buttonText: 'View Executive Kit',
    buttonLink: '/collections/executive-kit',
    image: '/images/hero_banner_kitchen.png',
  },
  {
    id: 'highlight-2',
    badge: 'FEATURED COLLECTION',
    title: 'Modular Mates Pantry Organizer Kit',
    description: 'Save 50% cabinet space • Clear window level indicator',
    buttonText: 'Pantry Makeover Set',
    buttonLink: '/collections/pantry-makeover-set',
    image: '/images/hero_kitchen.png',
  },
  {
    id: 'highlight-3',
    badge: 'EXCLUSIVE BUNDLE',
    title: 'Smart Saver Modular Canister Set',
    description: 'Airtight & moisture-proof storage for pulses and grains',
    buttonText: 'Explore Canister Set',
    buttonLink: '/collections/smart-saver-set',
    image: '/images/hero_banner_glass.png',
  },
  {
    id: 'highlight-4',
    badge: 'SPECIAL OFFER',
    title: 'Aquasafe Water Bottle 1L (Set of 4)',
    description: 'Ergonomic design with liquid-tight flip top cap',
    buttonText: 'Shop Bottle Combo',
    buttonLink: '/collections/aquasafe-set',
    image: '/images/cat_bottles.png',
  },
]

export const MOCK_PROMOTIONS = MOCK_FEATURED_HIGHLIGHTS.map((item) => ({
  id: item.id,
  tag: item.badge,
  title: item.title,
  subtitle: item.description,
  cta: item.buttonText,
  href: item.buttonLink,
  image: item.image,
}))
