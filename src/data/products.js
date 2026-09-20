// Authentic product dataset derived directly from reference/src/products.js

export const MOCK_PRODUCTS = [
  {
    id: 'tup-01',
    slug: 'aquasafe-1000ml-flip-top-bottle-set',
    name: 'Aquasafe 1000ml Flip Top Bottle Set',
    category: 'bottles',
    categoryName: 'Hydration Bottles',
    capacity: '1000 ml (Set of 4)',
    badge: 'Best Seller',
    featured: true,
    price: 1150,
    originalPrice: 1500,
    rating: 4.8,
    availability: 'In Stock',
    shortDesc:
      'Ergonomic, spill-proof bottles designed for refrigerator storage and on-the-go hydration.',
    fullDesc:
      'The iconic Aquasafe 1L Flip Top Bottle set is engineered with 100% virgin food-grade material. Features a wide base for stability and an easy-open flip cap that prevents accidental spillages.',
    features: [
      '100% Virgin Food-Grade & BPA Free Plastic',
      'Liquid-tight flip top cap prevents leakages',
      'Fits perfectly into standard refrigerator door pockets',
      'Easy to clean wide mouth design',
    ],
    colors: ['Dusty Blue', 'Sage Green', 'Charcoal', 'Pastel Pink'],
    image: '/images/cat_bottles.png',
    images: [
      '/images/cat_bottles.png',
      '/images/cat_bottles.png',
      '/images/cat_bottles.png',
      '/images/cat_bottles.png',
    ],
  },
  {
    id: 'tup-02',
    slug: 'executive-lunch-box-set',
    name: 'Executive Lunch Box with Insulated Bag',
    category: 'lunch',
    categoryName: 'Lunch Boxes',
    capacity: 'Set of 4 Containers + Bag',
    badge: 'BPA Free',
    featured: false,
    price: 1350,
    originalPrice: 1450,
    rating: 4.7,
    availability: 'In Stock',
    shortDesc:
      'Keep your homemade Kerala meals hot, fresh, and spill-free all day long.',
    fullDesc:
      'Designed for working professionals and students. Includes 2 small bowl containers for curry, 1 large container for rice/roti, and 1 liquid-tight bottle inside a thermal-insulated bag.',
    features: [
      'Microwave safe without lids (up to 3 mins)',
      '100% Air-tight & liquid-proof silicone seals',
      'Sturdy thermal insulated carry bag with shoulder strap',
      'Dishwasher safe & stain resistant',
    ],
    colors: ['Jet Black', 'Navy Blue', 'Olive Green'],
    image: '/images/cat_lunch.png',
    images: ['/images/cat_lunch.png', '/images/cat_lunch.png'],
  },
  {
    id: 'tup-03',
    slug: 'modular-mates-oval-pantry-set',
    name: 'Modular Mates Oval Pantry Set',
    category: 'kitchen',
    categoryName: 'Kitchen Storage',
    capacity: 'Set of 6 (500ml to 2.3L)',
    badge: '100% Airtight',
    featured: true,
    price: 2450,
    originalPrice: 3200,
    rating: 4.9,
    availability: 'In Stock',
    shortDesc:
      'Transform kitchen cabinets into organized space-saving systems with clear viewing windows.',
    fullDesc:
      'Modular Mates are designed to stack seamlessly, maximizing shelf space by up to 50%. Ideal for storing rice, lentils, spices, flour, and tea leaves while protecting them from moisture.',
    features: [
      'Air-tight seal keeps contents crisp & moisture-free',
      'Transparent window to monitor ingredient levels easily',
      'Stackable design creates a clean organized pantry',
      'Durable scratch-resistant matte exterior',
    ],
    colors: ['Midnight Black Seal', 'Chili Red Seal', 'Snow White Seal'],
    image: '/images/cat_kitchen.png',
    images: ['/images/cat_kitchen.png'],
  },
  {
    id: 'tup-04',
    slug: 'freezermate-fresh-storage-container-set',
    name: 'FreezerMate Fresh Storage Container Set',
    category: 'freezer',
    categoryName: 'Freezer Storage',
    capacity: 'Set of 4 (650ml & 1.5L)',
    badge: '10-Yr Guarantee',
    featured: false,
    price: 1850,
    originalPrice: 2180,
    rating: 4.6,
    availability: 'In Stock',
    shortDesc:
      'Specially formulated flexible material that withstands sub-zero temperatures without cracking.',
    fullDesc:
      'Keep fish, meat, cut vegetables, and frozen snacks fresh without freezer burns. Flexible base material bends easily for quick food release.',
    features: [
      'Flexible base material bends easily for quick food release',
      'Special feet at the bottom allow cold air circulation underneath',
      'Seals lock in natural moisture and nutrients',
      'Resists cracking down to -25°C',
    ],
    colors: ['Teal Frosted', 'Ice Blue'],
    image: '/images/cat_freezer.png',
    images: [
      '/images/cat_freezer.png',
      '/images/cat_freezer.png',
      '/images/cat_freezer.png',
      '/images/cat_freezer.png',
      '/images/cat_freezer.png',
      '/images/cat_freezer.png',
    ],
  },
  {
    id: 'tup-05',
    slug: 'thermal-flask-750ml-vacuum-insulated',
    name: 'Thermal Flask 750ml Vacuum Insulated',
    category: 'thermals',
    categoryName: 'Thermals',
    capacity: '750 ml',
    badge: 'New Arrival',
    featured: true,
    price: 2100,
    originalPrice: 2470,
    rating: 4.8,
    availability: 'In Stock',
    shortDesc:
      'Double-wall stainless steel flask retaining hot tea/coffee or iced drinks for up to 18 hours.',
    fullDesc:
      'Engineered with high-grade 18/8 food-grade stainless steel with copper lining. Features a sweat-proof exterior and leak-proof screw cap with built-in silicone strap.',
    features: [
      'Retains hot beverage temperature for 12 hours & cold for 18 hours',
      '18/8 Stainless Steel construction inside & out',
      'Sweat-free outer coating prevents wet palm marks',
      'Built-in silicone carrying lanyard',
    ],
    colors: ['Matte Black', 'Brushed Steel', 'Rose Gold'],
    image: '/images/cat_thermals.png',
  },
]

export const MOCK_FILTER_OPTIONS = {
  categories: [
    { id: 'all', label: 'All Categories' },
    { id: 'bottles', label: 'Hydration Bottles' },
    { id: 'lunch', label: 'Lunch Boxes' },
    { id: 'kitchen', label: 'Dry Storages' },
    { id: 'freezer', label: 'Freezer Storage' },
    { id: 'thermals', label: 'Thermals & Flasks' },
  ],
  capacities: [
    { id: 'all', label: 'All Capacities' },
    { id: 'small', label: 'Under 750ml' },
    { id: 'medium', label: '750ml - 2L' },
    { id: 'large', label: 'Over 2L' },
  ],
  collections: [
    { id: 'all', label: 'All Items' },
    { id: 'best', label: 'Best Sellers' },
    { id: 'new', label: 'New Arrivals' },
  ],
  discounts: [
    { id: '20-30', label: '20% - 30%' },
    { id: '10-20', label: '10% - 20%' },
    { id: 'under-10', label: 'Under 10%' },
  ],
}

export const MOCK_SEARCH_SUGGESTIONS = [
  'Aquasafe 1000ml Flip Top Bottle Set',
  'Modular Mates Oval Pantry Set',
  'Executive Lunch Box Set',
  'Thermal Flask 750ml',
]

export const MOCK_ENQUIRY_ITEMS = [
  {
    id: 'tup-01',
    name: 'Aquasafe 1000ml Flip Top Bottle Set',
    image: '/images/cat_bottles.png',
    capacity: '1000 ml (Set of 4)',
    price: 1150,
    qty: 2,
    selectedColor: 'Dusty Blue',
  },
  {
    id: 'tup-03',
    name: 'Modular Mates Oval Pantry Set',
    image: '/images/cat_kitchen.png',
    capacity: 'Set of 6 (500ml to 2.3L)',
    price: 2450,
    qty: 1,
    selectedColor: 'Midnight Black Seal',
  },
]
