// Tupperware Exclusive Store Kerala - Products & Categories Dataset

export const RAW_CATEGORIES = [
  {
    id: "kitchen",
    name: "Dry Storages",
    tagline: "Modular storage containers for Lentils, flour, pulses, snacks",
    image: "/images/cat_kitchen.png"
  },
  {
    id: "refrigerator",
    name: "Fridge Storages",
    tagline: "Fruits, veggies, Cooked food, leftovers - stay fresher, longer",
    image: "/images/cat_refrigerator.png"
  },
  {
    id: "freezer",
    name: "Freezer Storages",
    tagline: "Freeze your food fresher, longer",
    image: "/images/cat_freezer.png"
  },
  {
    id: "lunch",
    name: "Lunch On The Go",
    tagline: "Carry fresh food and beverages, everywhere you go",
    image: "/images/cat_lunch.png"
  },
  {
    id: "bottles",
    name: "Bottles",
    tagline: "Carry your own bottle - avoid disposable bottles",
    image: "/images/cat_bottles.png"
  },
  {
    id: "thermals",
    name: "Thermals",
    tagline: "Insulated Bottles to keep your food & beverages warm",
    image: "/images/cat_thermals.png"
  },
  {
    id: "kids",
    name: "Kids",
    tagline: "For your Super Kids",
    image: "/images/cat_kids.png"
  },
  {
    id: "accessories",
    name: "Prep & Cook",
    tagline: "Prep easy, cook healthy",
    image: "/images/cat_tools.png"
  },
  {
    id: "bakeware",
    name: "Serving",
    tagline: "Durable, light and convenient serving solutions",
    image: "/images/cat_bakeware.png"
  },
  {
    id: "trending",
    name: "Trending Now",
    tagline: "Build your collection and your savings",
    image: "/images/cat_pantry.png"
  },
  {
    id: "must-haves",
    name: "Must Haves",
    tagline: "Accessorize yourself with original collectibles",
    image: "/images/cat_kitchen.png"
  },
  {
    id: "spare-parts",
    name: "Spare Parts",
    tagline: "Replacement Seals, Lids & Caps",
    image: "/images/cat_tools.png"
  }
];

export const PROMOTIONS = [
  {
    id: "promo-1",
    tag: "New Arrival",
    title: "Premia Glass Borosilicate Series",
    subtitle: "Oven safe up to 400°C • 100% Leak-proof Smart Clip Lids",
    image: "/images/cat_bakeware.png",
    cta: "Explore Premia Glass",
    category: "kitchen"
  },
  {
    id: "promo-2",
    tag: "Best Seller",
    title: "Aquasafe 1L Pastel Flip Top Set",
    subtitle: "India's favorite hydration bottle • Ergonomic grip",
    image: "/images/cat_bottles.png",
    cta: "Enquire Aquasafe Set",
    category: "bottles"
  },
  {
    id: "promo-3",
    tag: "Limited Combo Offer",
    title: "Executive Lunch Box + Hydration Flask",
    subtitle: "Complete daily meal kit with insulated carry tote",
    image: "/images/cat_lunch.png",
    cta: "View Executive Kit",
    category: "lunch"
  },
  {
    id: "promo-4",
    tag: "Featured Collection",
    title: "Modular Mates Pantry Organizer Kit",
    subtitle: "Save 50% cabinet space • Clear window level indicator",
    image: "/images/cat_kitchen.png",
    cta: "Pantry Makeover Set",
    category: "kitchen"
  }
];

export const PRODUCTS = [
  {
    id: "tup-01",
    name: "Aquasafe 1000ml Flip Top Bottle Set",
    category: "bottles",
    categoryName: "Hydration Bottles",
    capacity: "1000 ml (Set of 4)",
    badge: "Best Seller",
    price: 1150,
    originalPrice: 1500,
    rating: 4.8,
    availability: "In Stock",
    shortDesc: "Ergonomic, spill-proof bottles designed for refrigerator storage and on-the-go hydration.",
    fullDesc: "The iconic Aquasafe 1L Flip Top Bottle set is engineered with 100% virgin food-grade material. Features a wide base for stability and an easy-open flip cap that prevents accidental spillages. Ideal for households in Kerala.",
    features: [
      "100% Virgin Food-Grade & BPA Free Plastic",
      "Liquid-tight flip top cap prevents leakages",
      "Fits perfectly into standard refrigerator door pockets",
      "Easy to clean wide mouth design"
    ],
    colors: ["Dusty Blue", "Sage Green", "Charcoal", "Pastel Pink"],
    image: "/images/cat_bottles.png",
    gallery: [
      "/images/cat_bottles.png",
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "tup-02",
    name: "Executive Lunch Box with Insulated Bag",
    category: "lunch",
    categoryName: "Lunch Boxes",
    capacity: "Set of 4 Containers + Bag",
    badge: "BPA Free",
    price: 1350,
    originalPrice: 1450,
    rating: 4.7,
    availability: "In Stock",
    shortDesc: "Keep your homemade Kerala meals hot, fresh, and spill-free all day long.",
    fullDesc: "Designed for working professionals and students. Includes 2 small bowl containers for curry, 1 large container for rice/roti, and 1 liquid-tight bottle. Packed inside a thermal-insulated washable canvas tote bag.",
    features: [
      "Microwave safe without lids (up to 3 mins)",
      "100% Air-tight & liquid-proof silicone seals",
      "Sturdy thermal insulated carry bag with shoulder strap",
      "Dishwasher safe & stain resistant"
    ],
    colors: ["Jet Black", "Navy Blue", "Olive Green"],
    image: "/images/cat_lunch.png",
    gallery: [
      "/images/cat_lunch.png",
      "https://images.unsplash.com/photo-1543083477-4f7f4ecda8a2?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "tup-03",
    name: "Modular Mates Oval Pantry Set",
    category: "kitchen",
    categoryName: "Kitchen Storage",
    capacity: "Set of 6 (500ml to 2.3L)",
    badge: "100% Airtight",
    price: 2450,
    originalPrice: 3200,
    rating: 4.9,
    availability: "In Stock",
    shortDesc: "Transform kitchen cabinets into organized space-saving systems with clear viewing windows.",
    fullDesc: "Modular Mates are designed to stack seamlessly, maximizing shelf space by up to 50%. Ideal for storing rice, lentils, spices, flour, and tea leaves while protecting them from moisture, humidity, and pests.",
    features: [
      "Air-tight seal keeps contents crisp & moisture-free",
      "Transparent window to monitor ingredient levels easily",
      "Stackable design creates a clean organized pantry",
      "Durable scratch-resistant matte exterior"
    ],
    colors: ["Midnight Black Seal", "Chili Red Seal", "Snow White Seal"],
    image: "/images/cat_kitchen.png",
    gallery: [
      "/images/cat_kitchen.png",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "tup-04",
    name: "FreezerMate Fresh Storage Container Set",
    category: "freezer",
    categoryName: "Freezer Storage",
    capacity: "Set of 4 (650ml & 1.5L)",
    badge: "10-Yr Guarantee",
    price: 1850,
    originalPrice: 2180,
    rating: 4.6,
    availability: "In Stock",
    shortDesc: "Specially formulated flexible material that withstands sub-zero temperatures without cracking.",
    fullDesc: "Keep fish, meat, cut vegetables, and frozen snacks fresh without freezer burns. The rounded corners enable fast freezing and easy food removal even when contents are rock solid.",
    features: [
      "Flexible base material bends easily for quick food release",
      "Special feet at the bottom allow cold air circulation underneath",
      "Seals lock in natural moisture and nutrients",
      "Resists cracking down to -25°C"
    ],
    colors: ["Teal Frosted", "Ice Blue"],
    image: "/images/cat_freezer.png",
    gallery: [
      "/images/cat_freezer.png",
      "https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "tup-05",
    name: "Thermal Flask 750ml Vacuum Insulated",
    category: "thermals",
    categoryName: "Thermals",
    capacity: "750 ml",
    badge: "New Arrival",
    price: 2100,
    originalPrice: 2470,
    rating: 4.8,
    availability: "In Stock",
    shortDesc: "Double-wall stainless steel flask retaining hot tea/coffee or iced drinks for up to 18 hours.",
    fullDesc: "Engineered with high-grade 18/8 food-grade stainless steel with copper lining. Features a sweat-proof exterior and leak-proof screw cap with built-in silicone strap for effortless carrying.",
    features: [
      "Retains hot beverage temperature for 12 hours & cold for 18 hours",
      "18/8 Stainless Steel construction inside & out",
      "Sweat-free outer coating prevents wet palm marks",
      "Built-in silicone carrying lanyard"
    ],
    colors: ["Matte Black", "Brushed Steel", "Rose Gold"],
    image: "/images/cat_thermals.png",
    gallery: [
      "/images/cat_thermals.png",
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "tup-06",
    name: "Cute Characters Kids Hydration & Snack Set",
    category: "kids",
    categoryName: "Kids Collection",
    capacity: "350ml Bottle + Container",
    badge: "Safe for Kids",
    price: 850,
    originalPrice: 920,
    rating: 4.5,
    availability: "In Stock",
    shortDesc: "Lightweight, unbreakable, and colorful daily hydration and snack set for school children.",
    fullDesc: "Make school lunchtime fun! Ergonomically contoured for little hands to grip securely with simple pop-up straws and easy-snap latches.",
    features: [
      "100% Non-toxic, lead-free and BPA-free material",
      "Pop-up straw cap with protective hygenic cover",
      "Compact size fits school bag side pockets",
      "Vibrant fade-proof graphics"
    ],
    colors: ["Sunshine Yellow", "Sky Blue", "Berry Pink"],
    image: "/images/cat_kids.png",
    gallery: [
      "/images/cat_kids.png"
    ]
  },
  {
    id: "tup-07",
    name: "Smart Saver Round Dry Container Set",
    category: "kitchen",
    categoryName: "Kitchen Storage",
    capacity: "Set of 3 (1.1L to 4.3L)",
    badge: "New Arrival",
    price: 1450,
    originalPrice: 1900,
    rating: 4.7,
    availability: "Limited Stock",
    shortDesc: "Ideal bulk storage containers for Kerala rice varieties, idli batter, and flours.",
    fullDesc: "Smart Saver round containers come with a classic round liquid-tight and air-tight seal, making them perfect for wet batters or dry bulk grains.",
    features: [
      "Liquid-tight round seal prevents leaks during transportation",
      "Wide opening for easy scooping with cups",
      "Translucent body for easy identification",
      "Nest-able when empty to save storage space"
    ],
    colors: ["Crimson Red", "Dark Slate"],
    image: "/images/cat_kitchen.png",
    gallery: [
      "/images/cat_kitchen.png"
    ]
  },
  {
    id: "tup-08",
    name: "Slim Fast Break Lunch Box",
    category: "lunch",
    categoryName: "Lunch Boxes",
    capacity: "600 ml + Divided Inserts",
    badge: "Compact",
    price: 680,
    originalPrice: 720,
    rating: 4.6,
    availability: "In Stock",
    shortDesc: "Ultra-slim profile lunch box designed to slip effortlessly into laptop bags and backpacks.",
    fullDesc: "Features fixed inner dividers to separate rotis, sandwiches, and cut fruits without mixing flavors or sauces.",
    features: [
      "Ultra-thin profile fits flat into briefcase or school bag",
      "Fixed internal dividers for portion control",
      "One-piece tabbed lid for easy opening",
      "Stain-resistant smooth interior finish"
    ],
    colors: ["Coral Pink", "Slate Gray", "Ocean Blue"],
    image: "/images/cat_lunch.png",
    gallery: [
      "/images/cat_lunch.png"
    ]
  },
  {
    id: "tup-09",
    name: "Eco Bottle 500ml Sports Edition (Set of 2)",
    category: "bottles",
    categoryName: "Hydration Bottles",
    capacity: "500 ml x 2 Pcs",
    badge: "Popular",
    price: 720,
    originalPrice: 850,
    rating: 4.8,
    availability: "In Stock",
    shortDesc: "Sleek gym and travel hydration bottles with easy-flow drink spout.",
    fullDesc: "Stay hydrated during workouts, yoga, or daily commutes. Fits bike water bottle cages and backpack side mesh pockets.",
    features: [
      "Slim waistline contour for effortless athletic grip",
      "Hygienic push-pull spout cap",
      "Durable impact-resistant body",
      "100% recyclable virgin material"
    ],
    colors: ["Neon Lime & Black", "Turquoise & Charcoal"],
    image: "/images/cat_bottles.png",
    gallery: [
      "/images/cat_bottles.png"
    ]
  },
  {
    id: "tup-10",
    name: "One Touch Topper Canister Set",
    category: "kitchen",
    categoryName: "Kitchen Storage",
    capacity: "Set of 4 (950ml to 3L)",
    badge: "New Arrival",
    price: 1950,
    originalPrice: 2550,
    rating: 4.9,
    availability: "In Stock",
    shortDesc: "Press the center of the lid with one thumb to seal or open instantly.",
    fullDesc: "Engineered with Tupperware's patented One-Touch seal mechanism. Just press the center with your thumb or palm to lock in crispness for biscuits, snacks, tea, and sugar.",
    features: [
      "One-touch press seal opens & closes effortlessly",
      "Decorative subtle sunburst lid design",
      "Ideal for crispy snacks, chips, tea powder, & sugar",
      "Stackable and elegant dining counter display"
    ],
    colors: ["Classic White", "Pastel Mint"],
    image: "/images/cat_kitchen.png",
    gallery: [
      "/images/cat_kitchen.png"
    ]
  },
  {
    id: "tup-11",
    name: "Insulated Food Jar 500ml",
    category: "thermals",
    categoryName: "Thermals",
    capacity: "500 ml",
    badge: "Thermal Tech",
    price: 1650,
    originalPrice: 1940,
    rating: 4.7,
    availability: "Limited Stock",
    shortDesc: "Keep soups, stews, and payasam piping hot for up to 6 hours.",
    fullDesc: "Wide mouth insulated food flask built for warm lunches on the move. Includes a foldable stainless steel spoon neatly tucked into the inner lid.",
    features: [
      "Double-wall vacuum insulation keeps food hot up to 6h",
      "Includes folding SS spoon inside lid",
      "Pressure release button on lid for easy opening",
      "Non-slip silicone base pad"
    ],
    colors: ["Steel Black", "Warm Sand"],
    image: "/images/cat_thermals.png",
    gallery: [
      "/images/cat_thermals.png"
    ]
  },
  {
    id: "tup-12",
    name: "Premia Borosilicate Glass Square Container",
    category: "kitchen",
    categoryName: "Kitchen Storage",
    capacity: "1000 ml",
    badge: "New Arrival",
    price: 1250,
    originalPrice: 1650,
    rating: 4.8,
    availability: "In Stock",
    shortDesc: "Bake, store, microwave, freeze, and serve all in a single crystal-clear glass dish.",
    fullDesc: "Crafted from premium borosilicate glass that withstands thermal shocks up to 400°C. Complemented by a 4-latch leakproof Tupperware air-tight lid.",
    features: [
      "Borosilicate glass safe for oven, microwave, freezer & dishwasher",
      "100% leak-proof 4-latch locking lid with removable gasket",
      "Odor-free, stain-free, and crystal clear transparency",
      "Elegant table-to-fridge design"
    ],
    colors: ["Clear Glass with Black Seal"],
    image: "/images/cat_bakeware.png",
    gallery: [
      "/images/cat_bakeware.png"
    ]
  },
  {
    id: "tup-13",
    name: "FridgeSmart Medium Deep Freshness Keeper",
    category: "refrigerator",
    categoryName: "Refrigerator Storage",
    capacity: "1.8 Liter",
    badge: "Best Seller",
    price: 1100,
    originalPrice: 1180,
    rating: 4.8,
    availability: "In Stock",
    shortDesc: "Patented dual venting valve system regulates air flow to keep vegetables fresh 3x longer.",
    fullDesc: "FridgeSmart containers adapt air circulation to match produce breathability ratings. Prevent soggy leafy greens, berries, and cucumber wilt.",
    features: [
      "Dual vent slide mechanism for precise oxygen regulation",
      "Built-in grid channels keep moisture away from produce",
      "Dishwasher safe clear poly-carbonate material",
      "Saves food waste and grocery spend"
    ],
    colors: ["Emerald Clear", "Mint Green"],
    image: "/images/cat_refrigerator.png",
    gallery: ["/images/cat_refrigerator.png"]
  },
  {
    id: "tup-14",
    name: "Clear Bowl Refrigerator Container Set",
    category: "refrigerator",
    categoryName: "Refrigerator Storage",
    capacity: "Set of 3 (600ml, 1L, 1.5L)",
    badge: "Popular",
    price: 1420,
    originalPrice: 1670,
    rating: 4.7,
    availability: "In Stock",
    shortDesc: "Glass-like elegance with unbreakable lightweight polymer convenience.",
    fullDesc: "Store leftovers, curries, cut fruits, and salads in elegant clear bowls that double up as serving dishes.",
    features: [
      "Airtight & spill-proof silicone rimmed seals",
      "Crystal clear transparency for instant fridge audit",
      "Nests inside each other when stored empty",
      "Stain & odor resistant"
    ],
    colors: ["Crystal Clear & White Seal"],
    image: "/images/cat_refrigerator.png",
    gallery: ["/images/cat_refrigerator.png"]
  },
  {
    id: "tup-15",
    name: "Silicon Zone Baking Mat & Mold",
    category: "bakeware",
    categoryName: "Bakeware & Serving",
    capacity: "Standard 30x40 cm",
    badge: "Chef Choice",
    price: 1750,
    originalPrice: 2300,
    rating: 4.9,
    availability: "In Stock",
    shortDesc: "Non-stick premium silicone baking sheet withstands up to 220°C oven heat.",
    fullDesc: "Bake cakes, cookies, or roasted snacks effortlessly without greasing or parchment paper.",
    features: [
      "100% High-grade flexible food silicone",
      "Non-stick surface for instant baked good release",
      "Oven, microwave, freezer & dishwasher safe",
      "Easy roll-up storage"
    ],
    colors: ["Terracotta Red"],
    image: "/images/cat_bakeware.png",
    gallery: ["/images/cat_bakeware.png"]
  },
  {
    id: "tup-16",
    name: "Modular Spice Keeper Dispenser Set",
    category: "pantry",
    categoryName: "Pantry Organizers",
    capacity: "Set of 4 (250ml each)",
    badge: "Kitchen Essential",
    price: 990,
    originalPrice: 1150,
    rating: 4.8,
    availability: "In Stock",
    shortDesc: "Dual-flip openings for precise sprinkling or spooning of ground Kerala spices.",
    fullDesc: "Keep turmeric, chili powder, black pepper, and garam masala fresh, moisture-free, and aroma-locked.",
    features: [
      "Dual opening flip lid for sprinkle or spoon access",
      "Clear windows with dosage measurements",
      "Stackable compact rack friendly shape",
      "Moisture-proof tight seal"
    ],
    colors: ["Black Seal", "Red Seal"],
    image: "/images/cat_pantry.png",
    gallery: ["/images/cat_pantry.png"]
  },
  {
    id: "tup-17",
    name: "Ergonomic Vegetable Peeler & Julienne Tool",
    category: "accessories",
    categoryName: "Kitchen Tools",
    capacity: "Dual Blade Tool",
    badge: "Top Utility",
    price: 490,
    originalPrice: 520,
    rating: 4.9,
    availability: "In Stock",
    shortDesc: "Razor-sharp stainless steel swivel blade for smooth peeling of carrots, potatoes, and mangos.",
    fullDesc: "Ergonomically contoured grip for left and right-handed users. Includes a potato eye remover loop.",
    features: [
      "Japanese grade stainless steel rust-free blades",
      "Contoured anti-slip grip handle",
      "Integrated potato eye remover",
      "Dishwasher safe"
    ],
    colors: ["Bright Orange", "Vibrant Red"],
    image: "/images/cat_tools.png",
    gallery: ["/images/cat_tools.png"]
  },
  {
    id: "tup-18",
    name: "Aquasafe 750ml Flip Top Bottle (Set of 4)",
    category: "bottles",
    categoryName: "Hydration Bottles",
    capacity: "750 ml x 4 Pcs",
    badge: "Popular",
    price: 980,
    originalPrice: 1300,
    rating: 4.8,
    availability: "In Stock",
    shortDesc: "Medium-capacity ergonomic hydration bottles for office desks and day trips.",
    fullDesc: "Fits all standard bag side pockets and car bottle holders. Durable 100% BPA-free construction.",
    features: [
      "Liquid-tight flip top cap",
      "Easy grip waistline shape",
      "Vibrant pastel color palette",
      "Stain resistant & easy to wash"
    ],
    colors: ["Pastel Combo", "Ocean Shades"],
    image: "/images/cat_bottles.png",
    gallery: ["/images/cat_bottles.png"]
  }
];

// Dynamically compute product counts per category for total consistency across UI
export const CATEGORIES = RAW_CATEGORIES.map(cat => {
  const count = PRODUCTS.filter(p => p.category === cat.id).length;
  return {
    ...cat,
    count: count
  };
});

export const TESTIMONIALS = [
  {
    id: "t-1",
    name: "Dr. Lakshmi Menon",
    location: "Kochi, Kerala",
    role: "Homemaker & Pediatrician",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    text: "As a doctor, food safety is my top priority. Buying genuine Tupperware from tupstore.in gives me total peace of mind that my family is using 100% BPA-free containers. The WhatsApp enquiry service was super responsive!"
  },
  {
    id: "t-2",
    name: "Rajesh Varma",
    location: "Thiruvananthapuram, Kerala",
    role: "IT Project Lead",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    text: "I needed a durable executive lunch box and thermal flask for long office shifts. Added items to the enquiry list and received a custom quote on WhatsApp within 10 minutes. Fast store pickup in TVM!"
  },
  {
    id: "t-3",
    name: "Anusha Sreenivasan",
    location: "Kozhikode, Kerala",
    role: "Interior Designer",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    text: "The Modular Mates completely revamped my kitchen pantry! The black and clear aesthetic fits my modern Scandinavian kitchen perfectly. Highly recommend this official store."
  }
];

export const WHY_US = [
  {
    id: "w-1",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
    title: "100% Genuine Products",
    desc: "Guaranteed authentic Tupperware directly from authorized exclusive store inventory."
  },
  {
    id: "w-2",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    title: "Premium World-Class Quality",
    desc: "Precision Swiss & German engineering for unmatched durability and lifetime seal integrity."
  },
  {
    id: "w-3",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>`,
    title: "Trusted Kerala Franchise",
    desc: "Serving thousands of happy families across Kochi, Trivandrum, Kozhikode & Thrissur."
  },
  {
    id: "w-4",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
    title: "100% BPA Free & Safe",
    desc: "Made from non-toxic virgin materials that meet stringent international food safety standards."
  },
  {
    id: "w-5",
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`,
    title: "Long-lasting Guarantee",
    desc: "Backed by Tupperware's legendary quality assurance against chipping, warping, and cracking."
  }
];

export const INSTA_REELS = [
  {
    id: "reel-1",
    title: "Premia Glass Borosilicate Oven Baking & Storage Set",
    views: "48.5K views",
    duration: "0:45",
    image: "/images/cat_bakeware.png",
    productName: "Premia Borosilicate Glass Set",
    price: 1250,
    originalPrice: 1500,
    discount: "17% off",
    productId: "tup-12"
  },
  {
    id: "reel-2",
    title: "Trayam Tri-ply 20cm Small Kadhai Cooking Demonstration",
    views: "92.3K views",
    duration: "0:58",
    image: "/images/cat_kitchen.png",
    productName: "Trayam Tri-ply 20cm Small Kadhai",
    price: 6428,
    originalPrice: 8035,
    discount: "20% off",
    productId: "tup-03"
  },
  {
    id: "reel-3",
    title: "TRAYAM (Saucepan + Casserole) Stainless Steel Set",
    views: "76.1K views",
    duration: "1:12",
    image: "/images/cat_kitchen.png",
    productName: "TRAYAM Saucepan + Casserole Set",
    price: 6900,
    originalPrice: 8880,
    discount: "22% off",
    productId: "tup-03"
  },
  {
    id: "reel-4",
    title: "Tupperware Brand Voila Glass 3-Piece Storage Collection",
    views: "115K views",
    duration: "0:39",
    image: "/images/cat_bakeware.png",
    productName: "Tupperware Brand Voila Glass Set",
    price: 840,
    originalPrice: 990,
    discount: "15% off",
    productId: "tup-12"
  },
  {
    id: "reel-5",
    title: "Air Fryer 3L Black Handle Quick Meal Recipe Reel",
    views: "184K views",
    duration: "0:52",
    image: "/images/cat_tools.png",
    productName: "AIR FRYER 3L - BLACK HANDLE",
    price: 9999,
    originalPrice: 12000,
    discount: "17% off",
    productId: "tup-16"
  },
  {
    id: "reel-6",
    title: "Modular Mates Kitchen Pantry Transformation in Kerala",
    views: "210K views",
    duration: "1:05",
    image: "/images/cat_kitchen.png",
    productName: "Modular Mates Pantry Storage Set",
    price: 2450,
    originalPrice: 2950,
    discount: "17% off",
    productId: "tup-03"
  }
];
