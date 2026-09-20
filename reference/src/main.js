import { CATEGORIES, PROMOTIONS, PRODUCTS, WHY_US, TESTIMONIALS, INSTA_REELS } from './products.js';

// Application State
let enquiryList = JSON.parse(localStorage.getItem('tup_enquiry_list') || '[]');
// Sanitize loaded data to backfill pricing/details and filter obsolete products
enquiryList = enquiryList.map(item => {
  const prod = PRODUCTS.find(p => p.id === item.id);
  if (prod) {
    return {
      ...item,
      price: prod.price,
      name: prod.name,
      image: prod.image,
      capacity: prod.capacity
    };
  }
  return item;
}).filter(item => PRODUCTS.some(p => p.id === item.id));

let recentlyViewed = JSON.parse(localStorage.getItem('tup_recently_viewed') || '[]');

// Shop Filters State
let shopFilters = {
  search: '',
  category: 'all',
  priceMax: 3000,
  capacity: 'all', // all, small (under 750ml), medium (750ml-2L), large (over 2L)
  availability: 'all', // all, in-stock
  collection: 'all', // all, new, best
  discounts: [] // [], ['20-30'], ['10-20'], ['under-10']
};
let shopSortBy = 'newest';
let shopLayoutGrid = true; // true = grid, false = list

// Initialize Router & Global Listeners
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  updateEnquiryUI();
  setupGlobalListeners();
});

// SPA Router
function initRouter() {
  const handleRoute = () => {
    const hash = window.location.hash || '#/';
    const mainContent = document.getElementById('app-content');
    if (!mainContent) return;

    // Clean active nav link highlight
    updateActiveNavLink(hash);

    // Route Matching
    if (hash === '#/' || hash === '') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      renderHomeView(mainContent);
    } else if (hash.startsWith('#/shop')) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      // Parse query params (e.g. #/shop?category=bottles)
      const params = parseQueryParams(hash);
      if (params.category) {
        shopFilters.category = params.category;
      } else {
        shopFilters.category = 'all';
      }
      renderShopView(mainContent);
    } else if (hash.startsWith('#/product/')) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      const prodId = hash.split('#/product/')[1]?.split('?')[0];
      renderProductDetailView(mainContent, prodId);
    } else if (hash.startsWith('#/contact')) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      renderContactView(mainContent);
    } else if (hash.startsWith('#/about-store')) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      renderAboutStoreView(mainContent);
    } else if (hash.startsWith('#/about')) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      renderAboutView(mainContent);
    } else if (hash.startsWith('#/promotions')) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      renderPromotionsView(mainContent);
    } else if (hash.startsWith('#')) {
      // Handle anchor links on home page (e.g. #promotions, #categories, #about-store, #contact, #why-us)
      renderHomeView(mainContent);
      const targetId = hash.substring(1);
      setTimeout(() => {
        const targetElem = document.getElementById(targetId);
        if (targetElem) {
          targetElem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      window.location.hash = '#/';
    }
  };

  window.addEventListener('hashchange', handleRoute);
  handleRoute(); // Call once at start
}

// Helper to parse query parameters from hash
function parseQueryParams(hash) {
  const params = {};
  const queryIdx = hash.indexOf('?');
  if (queryIdx !== -1) {
    const queryStr = hash.substring(queryIdx + 1);
    const pairs = queryStr.split('&');
    pairs.forEach(pair => {
      const [key, val] = pair.split('=');
      if (key) params[key] = decodeURIComponent(val || '');
    });
  }
  return params;
}

// Highlight active links in navigation bar
function updateActiveNavLink(hash) {
  const links = document.querySelectorAll('.nav-links .nav-link, .mobile-bottom-bar .bottom-bar-item');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return; // Skip buttons like search/cart without href

    if (hash.startsWith(href) && href !== '#/') {
      link.classList.add('active');
    } else if (hash === '#/' && href === '#/') {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ==========================================================================
   VIEW 1: HOME PAGE VIEW
   ========================================================================== */
function renderHomeView(container) {
  container.innerHTML = `
    <div class="route-view">


      <!-- Fullwidth Hero Slider Section -->
      <section class="hero-slider-fullwidth" id="hero">
        <div class="hero-slides-wrapper" id="hero-slides-wrapper">
          <!-- Slide 1: Official Exclusive Store Franchise -->
          <div class="hero-slide-item active" data-slide="0">
            <div class="hero-slide-bg hero-slide-bg-1"></div>
            <div class="hero-slide-overlay"></div>
            <div class="container hero-slide-container">
              <div class="hero-content">
                <div class="hero-tag">
                  <span class="hero-tag-dot"></span>
                  <span>Official Exclusive Store Franchise • Kerala</span>
                </div>
                <h1 class="hero-title">Discover Genuine Tupperware Products</h1>
                <div class="hero-ctas">
                  <a href="#/shop" class="btn btn-primary">
                    Browse Products
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </a>
                  <a href="https://wa.me/919847012345?text=Hi%20Tupperware%20Kerala!%20I%20would%20like%20to%20enquire%20about%20products." target="_blank" class="btn btn-wa hero-wa-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    <span class="hero-wa-text">Contact on WhatsApp</span>
                  </a>
                </div>
                <div class="hero-trust-badges">
                  <span class="trust-badge-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Official Store Franchise
                  </span>
                  <span class="trust-badge-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Genuine Products Guaranteed
                  </span>
                  <span class="trust-badge-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Serving All Over Kerala
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Slide 2: Modular Kitchen Storage & Pantry Organizers -->
          <div class="hero-slide-item" data-slide="1">
            <div class="hero-slide-bg hero-slide-bg-2"></div>
            <div class="hero-slide-overlay"></div>
            <div class="container hero-slide-container">
              <div class="hero-content">
                <div class="hero-tag">
                  <span class="hero-tag-dot"></span>
                  <span>Modular Kitchen Essentials</span>
                </div>
                <h1 class="hero-title">Organize Your Dream Kitchen in Style</h1>
                <div class="hero-ctas">
                  <a href="#/shop" class="btn btn-primary">
                    Explore Kitchen Storage
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </a>
                  <a href="https://wa.me/919847012345?text=Hi!%20I%20want%20to%20know%20more%20about%20Modular%20Kitchen%20Storage%20Sets." target="_blank" class="btn btn-wa hero-wa-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    <span class="hero-wa-text">Kitchen Consultation</span>
                  </a>
                </div>
                <div class="hero-trust-badges">
                  <span class="trust-badge-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    100% Air-Tight Moisture Seal
                  </span>
                  <span class="trust-badge-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Space-Saving Modular Design
                  </span>
                  <span class="trust-badge-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    BPA-Free Food Grade Material
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Slide 3: On-The-Go Hydration & Smart Lunch Sets -->
          <div class="hero-slide-item" data-slide="2">
            <div class="hero-slide-bg hero-slide-bg-3"></div>
            <div class="hero-slide-overlay"></div>
            <div class="container hero-slide-container">
              <div class="hero-content">
                <div class="hero-tag">
                  <span class="hero-tag-dot"></span>
                  <span>Everyday On-The-Go</span>
                </div>
                <h1 class="hero-title">Eco Bottles & Executive Lunch Sets</h1>
                <div class="hero-ctas">
                  <a href="#/shop" class="btn btn-primary">
                    Shop Bottles & Lunch Sets
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </a>
                  <a href="https://wa.me/919847012345?text=Hi!%20I%20would%20like%20to%20enquire%20about%20Executive%20Lunch%20Boxes%20and%20Eco%20Bottles." target="_blank" class="btn btn-wa hero-wa-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    <span class="hero-wa-text">Bulk & Gift Enquiries</span>
                  </a>
                </div>
                <div class="hero-trust-badges">
                  <span class="trust-badge-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Ergonomic & Spill-Proof Design
                  </span>
                  <span class="trust-badge-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Non-Toxic & Reusable
                  </span>
                  <span class="trust-badge-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Ideal for Office, School & Travel
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Slide 4: Premia Borosilicate Glass & Thermals -->
          <div class="hero-slide-item" data-slide="3">
            <div class="hero-slide-bg hero-slide-bg-4"></div>
            <div class="hero-slide-overlay"></div>
            <div class="container hero-slide-container">
              <div class="hero-content">
                <div class="hero-tag">
                  <span class="hero-tag-dot"></span>
                  <span>Premium Collection</span>
                </div>
                <h1 class="hero-title">Premia Borosilicate Glass & Thermals</h1>
                <div class="hero-ctas">
                  <a href="#/shop" class="btn btn-primary">
                    View Premia Glass
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </a>
                  <a href="https://wa.me/919847012345?text=Hi!%20I%20want%20to%20enquire%20about%20Premia%20Borosilicate%20Glass%20%26%20Thermals." target="_blank" class="btn btn-wa hero-wa-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    <span class="hero-wa-text">Glassware Enquiries</span>
                  </a>
                </div>
                <div class="hero-trust-badges">
                  <span class="trust-badge-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Oven, Microwave & Dishwasher Safe
                  </span>
                  <span class="trust-badge-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    100% Thermal Retention
                  </span>
                  <span class="trust-badge-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Smart Clip Leak-Proof Lids
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Arrows -->
        <button class="hero-slider-nav hero-slider-prev" id="hero-slider-prev" aria-label="Previous Slide">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="hero-slider-nav hero-slider-next" id="hero-slider-next" aria-label="Next Slide">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        <!-- Bottom Slider Controls: Dots Pagination & Counter -->
        <div class="hero-slider-footer">
          <div class="container hero-slider-footer-inner">
            <div class="hero-slider-counter">
              <span class="counter-current" id="hero-slider-current">01</span>
              <span class="counter-divider">/</span>
              <span class="counter-total">04</span>
            </div>

            <div class="hero-slider-dots" id="hero-slider-dots">
              <button class="hero-dot active" data-index="0" aria-label="Slide 1"></button>
              <button class="hero-dot" data-index="1" aria-label="Slide 2"></button>
              <button class="hero-dot" data-index="2" aria-label="Slide 3"></button>
              <button class="hero-dot" data-index="3" aria-label="Slide 4"></button>
            </div>

            <div class="hero-slider-autoplay-status" id="hero-slider-autoplay-indicator" title="Autoplay Active">
              <span class="progress-bar-fill" id="hero-progress-fill"></span>
            </div>
          </div>
        </div>
      </section>

      <!-- Shop by Category Section -->
      <section class="section section-grey" id="shop-by-category">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle">EXPLORE COLLECTIONS</span>
            <h2 class="section-title">Shop By Category</h2>
            <p class="section-desc">Browse genuine Tupperware kitchen storage, bottles, lunch boxes, and home essentials.</p>
          </div>
          <div class="home-category-cards-grid" id="home-category-cards-grid"></div>
        </div>
      </section>

      <!-- Featured Collections spotlight -->
      <section class="section" id="promotions">
        <div class="container">
          <div class="section-header-with-nav">
            <div>
              <span class="section-subtitle">Special Banners</span>
              <h2 class="section-title">Featured Highlights</h2>
              <p class="section-desc">Ongoing limited combos and curated kit promotions for Kerala customers.</p>
            </div>
            <div class="promo-slider-controls">
              <button class="promo-nav-btn prev" id="promo-slider-prev" aria-label="Previous Highlight">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button class="promo-nav-btn next" id="promo-slider-next" aria-label="Next Highlight">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>

          <div class="promo-slider-wrapper" id="promo-slider-wrapper">
            <div class="promo-slider-container" id="home-promo-grid"></div>
          </div>
        </div>
      </section>

      <!-- Why Choose Tupperware -->
      <section class="section section-grey" id="why-us">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle">The Tupperware Difference</span>
            <h2 class="section-title">Why Choose Tupperware?</h2>
            <p class="section-desc">Decades of world-class innovation, food safety, and trusted quality.</p>
          </div>
          <div class="why-grid" id="home-why-grid"></div>
        </div>
      </section>

      <!-- Instagram Video & Reels Showcase Slider -->
      <section class="section" id="insta-reels">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle">AS SEEN ON INSTAGRAM</span>
            <h2 class="section-title">Watch Tupperware in Action</h2>
            <p class="section-desc">Explore recipe reels, product demonstrations, and kitchen organization guides from our Instagram @tupperware_kerala.</p>
          </div>

          <div class="reels-carousel-wrapper">
            <button class="carousel-nav-btn prev" id="reels-carousel-prev" aria-label="Previous Reel">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            
            <div class="reels-scroll-container" id="reels-scroll-container">
              <!-- Rendered dynamically via main.js -->
            </div>

            <button class="carousel-nav-btn next" id="reels-carousel-next" aria-label="Next Reel">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </section>

      <!-- Official Store Section -->
      <section class="section section-grey" id="about-store">
        <div class="container">
          <div class="store-intro-grid">
            <div class="store-intro-text">
              <span class="section-subtitle">Official Exclusive Store</span>
              <h2 class="section-title" style="margin-bottom: 24px;">Your Trusted Destination for Genuine Tupperware in Kerala</h2>
              <p>Welcome to our Official Tupperware Exclusive Store franchise. Serving families, working professionals, and culinary enthusiasts across Kochi, Trivandrum, Kozhikode, and all of Kerala.</p>
              <p>We believe in offering only 100% genuine, BPA-free, high-quality Tupperware storage solutions and thermalware directly from verified company stocks. All products displayed here feature standard prices, and are backed by Tupperware's legendary warranty against chipping, cracking, or breaking under normal household usage.</p>
              <p style="margin-bottom: 32px;">Browse our interactive catalog, add your preferred items to the Enquiry List, and send it directly to our WhatsApp consultation team. We provide price quotes, combo discounts, and secure home delivery options anywhere in Kerala.</p>
              <a href="https://wa.me/919847012345?text=Hello%20Tupperware%20Store!%20I%20want%20to%20know%20more%20about%20store%20offers." target="_blank" class="btn btn-primary">
                Learn About Ongoing Offers
              </a>
            </div>
            <div class="store-intro-visual">
              <img src="/images/hero_kitchen.png" alt="Official Tupperware Exclusive Store Kerala" class="store-intro-img" />
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="section" id="testimonials">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle">Customer Reviews</span>
            <h2 class="section-title">Loved by Families Across Kerala</h2>
            <p class="section-desc">What our customers say about ordering genuine items and our WhatsApp service.</p>
          </div>
          <div class="testimonial-grid" id="home-testimonial-grid"></div>
        </div>
      </section>

      <!-- Final Consultation CTA / Product Selection Guidance -->
      <section class="section consultation-section" id="contact">
        <div class="container">
          <div class="consultation-card">
            <div class="consultation-grid">
              
              <!-- Left Column: Copy, Topics, Actions -->
              <div class="consultation-content">
                <div class="consultation-badge">
                  <span class="pulse-dot"></span>
                  <span>Free Personal Specialist Guidance</span>
                </div>

                <h2 class="consultation-title">Need Help Choosing the Right Tupperware?</h2>
                <p class="consultation-desc">
                  Connect directly with our official Tupperware specialists in Kerala. We help you choose exact container capacities, plan complete kitchen makeovers, and curate custom gift sets.
                </p>

                <!-- Value Highlights -->
                <div class="consultation-features">
                  <div class="consultation-feature-item">
                    <div class="feature-icon">📐</div>
                    <div>
                      <strong>Custom Size & Capacity Guidance</strong>
                      <span>Match your family size and storage requirements perfectly</span>
                    </div>
                  </div>
                  <div class="consultation-feature-item">
                    <div class="feature-icon">🛡️</div>
                    <div>
                      <strong>100% Genuine & Lifetime Guarantee</strong>
                      <span>Official Kerala store support & authentic original items</span>
                    </div>
                  </div>
                  <div class="consultation-feature-item">
                    <div class="feature-icon">🚚</div>
                    <div>
                      <strong>Doorstep Express Delivery</strong>
                      <span>Fast & safe delivery anywhere across Kerala</span>
                    </div>
                  </div>
                </div>

                <!-- CTA Actions -->
                <div class="consultation-actions">
                  <a id="consultation-wa-btn" href="https://wa.me/919847012345?text=Hello!%20I%20need%20help%20selecting%20Tupperware%20products%20for%20my%20home." target="_blank" class="btn btn-wa-glowing">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    <span>Chat on WhatsApp Now</span>
                  </a>
                  <a href="tel:+919847012345" class="btn btn-call-store">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span>Call Store (+91 98470 12345)</span>
                  </a>
                </div>

                <div class="consultation-response-note">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>Instant response • Direct phone & WhatsApp support in Kerala</span>
                </div>
              </div>

              <!-- Right Column: Tupperware Product Showcase & Visual Collage -->
              <div class="consultation-visual">
                <!-- Main Feature Banner Image -->
                <div class="consultation-hero-image-wrapper">
                  <img src="/images/consultation_tupperware.png" alt="Tupperware Product Selection Assistance" class="consultation-hero-img" loading="lazy" />
                  <div class="hero-image-overlay"></div>
                  
                  <div class="hero-image-badge hero-image-badge-top">
                    <span class="badge-icon">✨</span>
                    <span>100% Genuine Tupperware</span>
                  </div>

                  <div class="hero-image-badge hero-image-badge-bottom">
                    <span class="badge-icon">🛡️</span>
                    <span>Lifetime Guarantee</span>
                  </div>
                </div>

             
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  // Render components inside Home Layout
  renderHomeCategoryCards();
  renderHomePromotions();
  renderHomeWhyUs();
  renderHomeReels();
  renderHomeTestimonials();
  initHeroSlider();
}

function renderHomeCategoryCards() {
  const container = document.getElementById('home-category-cards-grid');
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => `
    <a href="#/shop?category=${cat.id}" class="category-card-item" title="Browse ${cat.name}">
      <div class="category-card-img-wrapper">
        <img src="${cat.image}" alt="${cat.name}" class="category-card-img" loading="lazy" />
      </div>
      <div class="category-card-body">
        <h3 class="category-card-title">${cat.name}</h3>
      </div>
    </a>
  `).join('');
}

let heroSliderInterval = null;

function initHeroSlider() {
  const heroSection = document.getElementById('hero');
  if (!heroSection) return;

  const slides = heroSection.querySelectorAll('.hero-slide-item');
  const dots = heroSection.querySelectorAll('.hero-dot');
  const currentCounter = document.getElementById('hero-slider-current');
  const prevBtn = document.getElementById('hero-slider-prev');
  const nextBtn = document.getElementById('hero-slider-next');
  const progressFill = document.getElementById('hero-progress-fill');

  if (!slides.length) return;

  let currentIndex = 0;
  const slideDuration = 5500; // 5.5s per slide

  function resetProgressBar() {
    if (!progressFill) return;
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    // Force reflow
    void progressFill.offsetWidth;
    progressFill.style.transition = `width ${slideDuration}ms linear`;
    progressFill.style.width = '100%';
  }

  function goToSlide(index, isInitial = false) {
    if (index < 0) {
      index = slides.length - 1;
    } else if (index >= slides.length) {
      index = 0;
    }

    if (!isInitial && currentIndex === index && slides[index].classList.contains('active')) {
      return;
    }

    currentIndex = index;

    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    if (currentCounter) {
      currentCounter.textContent = String(currentIndex + 1).padStart(2, '0');
    }
  }

  function startAutoplay() {
    stopAutoplay();
    resetProgressBar();
    heroSliderInterval = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, slideDuration);
  }

  function stopAutoplay() {
    if (heroSliderInterval) {
      clearInterval(heroSliderInterval);
      heroSliderInterval = null;
    }
    if (progressFill) {
      progressFill.style.transition = 'none';
    }
  }

  // Event Listeners for Prev/Next
  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.preventDefault();
      goToSlide(currentIndex - 1);
      startAutoplay();
    };
  }

  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.preventDefault();
      goToSlide(currentIndex + 1);
      startAutoplay();
    };
  }

  // Dots click handler
  dots.forEach(dot => {
    dot.onclick = (e) => {
      e.preventDefault();
      const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
      goToSlide(idx);
      startAutoplay();
    };
  });

  // Pause on hover
  heroSection.onmouseenter = () => {
    stopAutoplay();
  };

  heroSection.onmouseleave = () => {
    startAutoplay();
  };

  // Touch Swipe Support
  let touchStartX = 0;
  let touchEndX = 0;

  heroSection.ontouchstart = (e) => {
    touchStartX = e.changedTouches[0].screenX;
  };

  heroSection.ontouchend = (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  };

  function handleSwipe() {
    const diffX = touchEndX - touchStartX;
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) {
        // Swipe Left -> Next
        goToSlide(currentIndex + 1);
      } else {
        // Swipe Right -> Prev
        goToSlide(currentIndex - 1);
      }
      startAutoplay();
    }
  }

  // Keyboard navigation
  const handleKeydown = (e) => {
    if (!document.getElementById('hero')) return;
    if (e.key === 'ArrowLeft') {
      goToSlide(currentIndex - 1);
      startAutoplay();
    } else if (e.key === 'ArrowRight') {
      goToSlide(currentIndex + 1);
      startAutoplay();
    }
  };

  if (window._heroKeydownHandler) {
    window.removeEventListener('keydown', window._heroKeydownHandler);
  }
  window._heroKeydownHandler = handleKeydown;
  window.addEventListener('keydown', handleKeydown);

  // Initialize first slide and start autoplay
  goToSlide(0, true);
  startAutoplay();
}

let promoSliderInterval = null;

function renderHomePromotions() {
  const grid = document.getElementById('home-promo-grid');
  if (!grid) return;
  grid.innerHTML = PROMOTIONS.map(promo => `
    <div class="promo-card">
      <img src="${promo.image}" alt="${promo.title}" class="promo-card-bg" loading="lazy" />
      <div class="promo-card-gradient-overlay"></div>
      <div class="promo-card-content">
        <span class="promo-tag">${promo.tag}</span>
        <h3 class="promo-title">${promo.title}</h3>
        <p class="promo-subtitle">${promo.subtitle}</p>
        <a href="#/shop?category=${promo.category}" class="btn btn-primary btn-sm">
          ${promo.cta}
        </a>
      </div>
    </div>
  `).join('');

  setupPromotionsSlider();
}

function setupPromotionsSlider() {
  const container = document.getElementById('home-promo-grid');
  const prevBtn = document.getElementById('promo-slider-prev');
  const nextBtn = document.getElementById('promo-slider-next');

  if (!container) return;

  if (promoSliderInterval) {
    clearInterval(promoSliderInterval);
    promoSliderInterval = null;
  }

  const updateNavButtons = () => {
    if (!prevBtn || !nextBtn) return;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (scrollLeft <= 10) {
      prevBtn.classList.add('disabled');
    } else {
      prevBtn.classList.remove('disabled');
    }

    if (scrollLeft >= maxScroll - 10) {
      nextBtn.classList.add('disabled');
    } else {
      nextBtn.classList.remove('disabled');
    }
  };

  if (prevBtn) {
    prevBtn.onclick = () => {
      const card = container.querySelector('.promo-card');
      const cardWidth = card ? card.offsetWidth : 400;
      container.scrollBy({ left: -(cardWidth + 24), behavior: 'smooth' });
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      const card = container.querySelector('.promo-card');
      const cardWidth = card ? card.offsetWidth : 400;
      container.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
    };
  }

  container.onscroll = updateNavButtons;
  container.onmouseenter = null;
  container.onmouseleave = null;
  window.addEventListener('resize', updateNavButtons);
  setTimeout(updateNavButtons, 50);
}

function renderHomeWhyUs() {
  const grid = document.getElementById('home-why-grid');
  if (!grid) return;
  grid.innerHTML = WHY_US.map(w => `
    <div class="why-card">
      <div class="why-icon">${w.icon}</div>
      <h3 class="why-title">${w.title}</h3>
      <p class="why-desc">${w.desc}</p>
    </div>
  `).join('');
}

function renderHomeReels() {
  const container = document.getElementById('reels-scroll-container');
  if (!container) return;

  container.innerHTML = INSTA_REELS.map(reel => {
    const prod = PRODUCTS.find(p => p.id === reel.productId);
    const isInEnquiry = prod ? enquiryList.some(item => item.id === prod.id) : false;

    return `
      <div class="reel-card">
        <div class="reel-thumb-wrapper" onclick="openReelModal('${reel.id}')" role="button" tabindex="0">
          <img src="${reel.image}" alt="${reel.title}" class="reel-thumb-img" loading="lazy" />
          <div class="reel-overlay-gradient"></div>
          
          <div class="reel-play-btn" title="Play Video Reel">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          
          <div class="reel-meta-top">
            <span class="reel-badge-insta">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              Instagram Reel
            </span>
          </div>

          <div class="reel-meta-bottom">
            <span>▶ ${reel.views}</span>
            <span>${reel.duration}</span>
          </div>
        </div>

        <div class="reel-card-body">
          <h4 class="reel-product-title" title="${reel.title}">${reel.productName}</h4>
          
          <div class="reel-price-row">
            <span class="reel-price">₹${reel.price.toLocaleString('en-IN')}</span>
            ${reel.originalPrice ? `<span class="reel-price-original">₹${reel.originalPrice.toLocaleString('en-IN')}</span>` : ''}
            ${reel.discount ? `<span class="reel-discount-badge">${reel.discount}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  setupReelsCarousel();
}

function setupReelsCarousel() {
  const container = document.getElementById('reels-scroll-container');
  const prevBtn = document.getElementById('reels-carousel-prev');
  const nextBtn = document.getElementById('reels-carousel-next');
  const wrapper = container?.closest('.reels-carousel-wrapper');

  if (!container || !prevBtn || !nextBtn) return;

  const updateState = () => {
    const isOverflowing = container.scrollWidth > container.clientWidth + 5;

    if (!isOverflowing) {
      if (wrapper) wrapper.classList.add('is-fitting');
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    } else {
      if (wrapper) wrapper.classList.remove('is-fitting');
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';

      const scrollLeft = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (scrollLeft <= 10) {
        prevBtn.classList.add('disabled');
      } else {
        prevBtn.classList.remove('disabled');
      }

      if (scrollLeft >= maxScroll - 10) {
        nextBtn.classList.add('disabled');
      } else {
        nextBtn.classList.remove('disabled');
      }
    }
  };

  prevBtn.onclick = () => {
    const scrollAmount = container.clientWidth * 0.7;
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  };

  nextBtn.onclick = () => {
    const scrollAmount = container.clientWidth * 0.7;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  container.onscroll = updateState;
  window.onresize = updateState;
  setTimeout(updateState, 50);
}

let currentReelModalIndex = 0;

window.openReelModal = function (reelId) {
  const index = INSTA_REELS.findIndex(r => r.id === reelId);
  currentReelModalIndex = index > -1 ? index : 0;

  const modal = document.getElementById('reel-modal');
  if (modal) {
    modal.classList.add('open');
    renderReelModalContent();
  }
};

window.renderReelModalContent = function () {
  const container = document.getElementById('reel-modal-container');
  if (!container) return;

  const total = INSTA_REELS.length;
  if (total === 0) return;

  const prevIndex = (currentReelModalIndex - 1 + total) % total;
  const activeIndex = currentReelModalIndex;
  const nextIndex = (currentReelModalIndex + 1) % total;

  const prevReel = INSTA_REELS[prevIndex];
  const activeReel = INSTA_REELS[activeIndex];
  const nextReel = INSTA_REELS[nextIndex];

  const activeProd = PRODUCTS.find(p => p.id === activeReel.productId);

  // Find other items in the same category for the bottom slider
  const categoryProducts = activeProd
    ? PRODUCTS.filter(p => p.category === activeProd.category)
    : PRODUCTS.slice(0, 5);

  container.innerHTML = `
    <!-- Left Side Preview Card -->
    <div class="modal-reel-card side" onclick="window.navigateModalReel(-1)" title="${prevReel.title}">
      <div class="modal-reel-video-wrapper">
        <img src="${prevReel.image}" alt="${prevReel.title}" class="modal-reel-bg-img" />
        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%);"></div>
        <div style="position: absolute; bottom: 16px; left: 14px; right: 14px; color: #fff;">
          <div style="font-size: 10.5px; font-weight: 700; opacity: 0.85; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 2px;">PREVIOUS REEL</div>
          <div style="font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${prevReel.productName}</div>
        </div>
      </div>
    </div>

    <!-- Center Active Featured Reel Card -->
    <div class="modal-reel-card active">
      <div class="modal-reel-video-wrapper">
        <img src="${activeReel.image}" alt="${activeReel.title}" class="modal-reel-bg-img" />
        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(11,11,11,0.95) 0%, rgba(11,11,11,0.1) 40%, rgba(0,0,0,0.6) 100%);"></div>

        <!-- Progress bar top -->
        <div class="modal-reel-progress-bar">
          <div class="modal-reel-progress-fill"></div>
        </div>

        <!-- Top Instagram Handle Header -->
        <div class="modal-reel-header">
          <span class="reel-badge-insta">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            @tupperware_kerala
          </span>
          <span style="font-size: 11.5px; font-weight: 600; color: rgba(255,255,255,0.85);">▶ ${activeReel.views}</span>
        </div>

        <!-- Center Play Button -->
        <div class="modal-reel-center-play" onclick="alert('Playing Video Reel: ${activeReel.title}')" title="Play Video">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>

        <!-- Floating Share Button -->
        <button class="reel-share-btn" onclick="event.stopPropagation(); window.toggleReelShareMenu('${activeReel.id}');" title="Share Reel & Product">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>

        <!-- Share Menu Popover -->
        <div class="reel-share-menu" id="reel-share-menu-${activeReel.id}" style="display: none;">
          <button class="reel-share-option wa-option" onclick="window.shareReelWhatsApp('${activeReel.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            Share to WhatsApp
          </button>
          <button class="reel-share-option" onclick="window.copyReelLink('${activeReel.productId || 'tup-01'}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Copy Product Link
          </button>
        </div>

        <!-- Floating Bottom Horizontal Product Slider (Same Category Products) -->
        <div class="reel-bottom-products-slider">
          <div class="reel-bottom-products-track">
            ${categoryProducts.map(p => {
    const isAdded = enquiryList.some(item => item.id === p.id);
    return `
                <div class="reel-mini-prod-card">
                  <div class="mini-prod-header" onclick="window.closeReelModal(); window.location.hash='#/product/${p.id}';">
                    <div class="mini-prod-img-wrapper">
                      <img src="${p.image}" alt="${p.name}" class="mini-prod-img" />
                    </div>
                    <div class="mini-prod-title-row">
                      <span class="mini-prod-title" title="${p.name}">${p.name}</span>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </div>
                    <div class="mini-prod-price-row">
                      <span class="mini-prod-price">₹${p.price.toLocaleString('en-IN')}</span>
                      ${p.originalPrice ? `<span class="mini-prod-orig-price">₹${p.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                    </div>
                  </div>
                  <button class="mini-prod-add-btn ${isAdded ? 'in-list' : ''}" onclick="event.stopPropagation(); toggleEnquiryItem('${p.id}'); renderReelModalContent();">
                    ${isAdded ? 'IN ENQUIRY' : 'ADD TO ENQUIRY'}
                  </button>
                </div>
              `;
  }).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side Preview Card -->
    <div class="modal-reel-card side" onclick="window.navigateModalReel(1)" title="${nextReel.title}">
      <div class="modal-reel-video-wrapper">
        <img src="${nextReel.image}" alt="${nextReel.title}" class="modal-reel-bg-img" />
        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%);"></div>
        <div style="position: absolute; bottom: 16px; left: 14px; right: 14px; color: #fff;">
          <div style="font-size: 10.5px; font-weight: 700; opacity: 0.85; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 2px;">NEXT REEL</div>
          <div style="font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${nextReel.productName}</div>
        </div>
      </div>
    </div>
  `;
};

window.toggleReelShareMenu = function (reelId) {
  const menu = document.getElementById(`reel-share-menu-${reelId}`);
  if (menu) {
    const isVisible = menu.style.display === 'flex';
    menu.style.display = isVisible ? 'none' : 'flex';
  }
};

window.shareReelWhatsApp = function (reelId) {
  const reel = INSTA_REELS.find(r => r.id === reelId);
  if (!reel) return;
  const link = encodeURIComponent(`${window.location.origin}/#/product/${reel.productId}`);
  const text = encodeURIComponent(`Watch this Tupperware Reel for ${reel.productName}: `);
  window.open(`https://wa.me/?text=${text}${link}`, '_blank');
};

window.copyReelLink = function (productId) {
  const link = `${window.location.origin}/#/product/${productId}`;
  navigator.clipboard.writeText(link).then(() => {
    alert('Product link copied to clipboard!');
  }).catch(() => {
    prompt('Copy product link:', link);
  });
};

window.navigateModalReel = function (direction) {
  const total = INSTA_REELS.length;
  currentReelModalIndex = (currentReelModalIndex + direction + total) % total;
  renderReelModalContent();
};

window.closeReelModal = function () {
  const modal = document.getElementById('reel-modal');
  if (modal) modal.classList.remove('open');
};

window.closeReelModal = function () {
  const modal = document.getElementById('reel-modal');
  if (modal) modal.classList.remove('open');
};

function renderHomeTestimonials() {
  const grid = document.getElementById('home-testimonial-grid');
  if (!grid) return;
  grid.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card">
      <div>
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-text">"${t.text}"</p>
      </div>
      <div class="testimonial-author">
        <img src="${t.avatar}" alt="${t.name}" class="author-avatar" loading="lazy" />
        <div>
          <div class="author-name">${t.name}</div>
          <div class="author-role">${t.role} • ${t.location}</div>
        </div>
      </div>
    </div>
  `).join('');
}


/* ==========================================================================
   VIEW 2: PRODUCT LISTING (SHOP) VIEW
   ========================================================================== */
function renderShopView(container) {
  container.innerHTML = `
    <div class="route-view">
      <!-- Shop Header Banner -->
      <section class="page-header-banner" style="background-image: url('/images/hero_banner_kitchen.png');">
        <div class="container">
          <h1 class="page-banner-title">Exclusive Tupperware Catalogue</h1>
        </div>
      </section>

      <!-- Breadcrumb Bar Below Banner -->
      <div class="breadcrumb-bar">
        <div class="container">
          <div class="breadcrumb">
            <a href="#/">Home</a>
            <span>/</span>
            <span>Shop Catalogue</span>
          </div>
        </div>
      </div>

      <div class="section" style="padding: 48px 0 96px 0;">
        <div class="container">
          <div class="shop-layout">
            <!-- Sidebar Filters -->
            <aside class="shop-sidebar">
              <!-- Search Widget -->
              <div class="filter-widget">
                <h5 class="filter-widget-title">Search Products</h5>
                <input type="text" id="shop-search" class="form-input" placeholder="Keyword search..." value="${shopFilters.search}" style="padding: 10px; font-size: 13.5px;" />
              </div>

              <!-- Categories Widget -->
              <div class="filter-widget">
                <h5 class="filter-widget-title">Categories</h5>
                <div class="filter-list">
                  <label class="filter-label">
                    <input type="radio" name="shop-category" value="all" ${shopFilters.category === 'all' ? 'checked' : ''} />
                    All Categories
                  </label>
                  ${CATEGORIES.map(cat => `
                    <label class="filter-label">
                      <input type="radio" name="shop-category" value="${cat.id}" ${shopFilters.category === cat.id ? 'checked' : ''} />
                      ${cat.name}
                    </label>
                  `).join('')}
                </div>
              </div>

              <!-- Price Filter Widget -->
              <div class="filter-widget">
                <h5 class="filter-widget-title">Max Price (INR)</h5>
                <div class="price-slider-wrapper">
                  <input type="range" class="price-slider" id="shop-price-slider" min="500" max="3000" step="100" value="${shopFilters.priceMax}" />
                  <div class="price-range-labels">
                    <span>₹500</span>
                    <span id="price-slider-value" style="font-weight: 700;">₹${shopFilters.priceMax.toLocaleString('en-IN')}</span>
                    <span>₹3,000+</span>
                  </div>
                </div>
              </div>

              <!-- Capacity Filter Widget -->
              <div class="filter-widget">
                <h5 class="filter-widget-title">Capacity Size</h5>
                <div class="filter-list">
                  <label class="filter-label">
                    <input type="radio" name="shop-capacity" value="all" ${shopFilters.capacity === 'all' ? 'checked' : ''} />
                    All Capacities
                  </label>
                  <label class="filter-label">
                    <input type="radio" name="shop-capacity" value="small" ${shopFilters.capacity === 'small' ? 'checked' : ''} />
                    Under 750ml
                  </label>
                  <label class="filter-label">
                    <input type="radio" name="shop-capacity" value="medium" ${shopFilters.capacity === 'medium' ? 'checked' : ''} />
                    750ml - 2L
                  </label>
                  <label class="filter-label">
                    <input type="radio" name="shop-capacity" value="large" ${shopFilters.capacity === 'large' ? 'checked' : ''} />
                    Over 2L / Bulk
                  </label>
                </div>
              </div>

              <!-- Stock Availability Widget -->
              <div class="filter-widget">
                <h5 class="filter-widget-title">Availability</h5>
                <div class="filter-list">
                  <label class="filter-label">
                    <input type="checkbox" id="shop-stock-checkbox" ${shopFilters.availability === 'in-stock' ? 'checked' : ''} />
                    In Stock Only
                  </label>
                </div>
              </div>

              <!-- Featured Collection Badge Widget -->
              <div class="filter-widget">
                <h5 class="filter-widget-title">Collections</h5>
                <div class="filter-list">
                  <label class="filter-label">
                    <input type="radio" name="shop-collection" value="all" ${shopFilters.collection === 'all' ? 'checked' : ''} />
                    All Items
                  </label>
                  <label class="filter-label">
                    <input type="radio" name="shop-collection" value="best" ${shopFilters.collection === 'best' ? 'checked' : ''} />
                    Best Sellers
                  </label>
                  <label class="filter-label">
                    <input type="radio" name="shop-collection" value="new" ${shopFilters.collection === 'new' ? 'checked' : ''} />
                    New Arrivals
                  </label>
                </div>
              </div>

              <!-- Discount Filter Widget -->
              <div class="filter-widget">
                <div class="filter-widget-header" id="shop-discount-header">
                  <h5 class="filter-widget-title">Discount</h5>
                  <span class="filter-toggle-icon" id="shop-discount-toggle-icon">-</span>
                </div>
                <div class="filter-list" id="shop-discount-list">
                  <label class="filter-label">
                    <input type="checkbox" name="shop-discount" value="20-30" ${shopFilters.discounts.includes('20-30') ? 'checked' : ''} />
                    <span class="filter-label-text">20% - 30% <span class="filter-count" id="discount-count-20-30">(0)</span></span>
                  </label>
                  <label class="filter-label">
                    <input type="checkbox" name="shop-discount" value="10-20" ${shopFilters.discounts.includes('10-20') ? 'checked' : ''} />
                    <span class="filter-label-text">10% - 20% <span class="filter-count" id="discount-count-10-20">(0)</span></span>
                  </label>
                  <label class="filter-label">
                    <input type="checkbox" name="shop-discount" value="under-10" ${shopFilters.discounts.includes('under-10') ? 'checked' : ''} />
                    <span class="filter-label-text">Under 10% <span class="filter-count" id="discount-count-under-10">(0)</span></span>
                  </label>
                </div>
              </div>
            </aside>

            <!-- Main Shop Listing -->
            <div>
              <!-- Top Toolbar -->
              <div class="toolbar-shop">
                <div class="results-count" id="shop-results-count">Showing 0 products</div>
                <div class="toolbar-controls">
                  <!-- Sort select -->
                  <select id="shop-sort" class="sort-select">
                    <option value="newest" ${shopSortBy === 'newest' ? 'selected' : ''}>Newest Arrivals</option>
                    <option value="price-asc" ${shopSortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
                    <option value="price-desc" ${shopSortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
                    <option value="rating" ${shopSortBy === 'rating' ? 'selected' : ''}>Top Rated</option>
                  </select>

                  <!-- Layout Toggles -->
                  <div class="layout-toggles">
                    <button class="layout-toggle-btn ${shopLayoutGrid ? 'active' : ''}" id="layout-grid-btn" title="Grid Layout">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    </button>
                    <button class="layout-toggle-btn ${!shopLayoutGrid ? 'active' : ''}" id="layout-list-btn" title="List Layout">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Product Cards Grid -->
              <div class="product-grid ${!shopLayoutGrid ? 'list-view' : ''}" id="shop-products-grid">
                <!-- Rendered dynamically -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Apply filters and bind listeners
  bindShopFilterListeners();
  filterAndRenderShopProducts();
}

function bindShopFilterListeners() {
  const searchInput = document.getElementById('shop-search');
  const priceSlider = document.getElementById('shop-price-slider');
  const priceValLabel = document.getElementById('price-slider-value');
  const stockCheckbox = document.getElementById('shop-stock-checkbox');
  const sortSelect = document.getElementById('shop-sort');
  const gridToggle = document.getElementById('layout-grid-btn');
  const listToggle = document.getElementById('layout-list-btn');

  // Text search listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      shopFilters.search = e.target.value.toLowerCase().trim();
      filterAndRenderShopProducts();
    });
  }

  // Categories radio buttons
  document.querySelectorAll('input[name="shop-category"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      shopFilters.category = e.target.value;
      const targetHash = e.target.value === 'all' ? '#/shop' : `#/shop?category=${e.target.value}`;
      if (window.location.hash !== targetHash) {
        history.replaceState(null, '', targetHash);
      }
      filterAndRenderShopProducts();
    });
  });

  // Price slider listener
  if (priceSlider) {
    priceSlider.addEventListener('input', (e) => {
      shopFilters.priceMax = parseInt(e.target.value);
      if (priceValLabel) priceValLabel.textContent = `₹${shopFilters.priceMax.toLocaleString('en-IN')}`;
      filterAndRenderShopProducts();
    });
  }

  // Capacity radio buttons
  document.querySelectorAll('input[name="shop-capacity"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      shopFilters.capacity = e.target.value;
      filterAndRenderShopProducts();
    });
  });

  // Stock checkbox
  if (stockCheckbox) {
    stockCheckbox.addEventListener('change', (e) => {
      shopFilters.availability = e.target.checked ? 'in-stock' : 'all';
      filterAndRenderShopProducts();
    });
  }

  // Collections radio buttons
  document.querySelectorAll('input[name="shop-collection"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      shopFilters.collection = e.target.value;
      filterAndRenderShopProducts();
    });
  });

  // Discount accordion toggle listener
  const discountHeader = document.getElementById('shop-discount-header');
  const discountList = document.getElementById('shop-discount-list');
  const discountToggleIcon = document.getElementById('shop-discount-toggle-icon');

  if (discountHeader && discountList && discountToggleIcon) {
    discountHeader.addEventListener('click', () => {
      const isHidden = discountList.style.display === 'none';
      if (isHidden) {
        discountList.style.display = 'flex';
        discountToggleIcon.textContent = '-';
      } else {
        discountList.style.display = 'none';
        discountToggleIcon.textContent = '+';
      }
    });
  }

  // Discount checkboxes listener
  document.querySelectorAll('input[name="shop-discount"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const checkedBoxes = document.querySelectorAll('input[name="shop-discount"]:checked');
      shopFilters.discounts = Array.from(checkedBoxes).map(cb => cb.value);
      filterAndRenderShopProducts();
    });
  });

  // Sort listener
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      shopSortBy = e.target.value;
      filterAndRenderShopProducts();
    });
  }

  // Grid / List Toggles
  if (gridToggle && listToggle) {
    gridToggle.addEventListener('click', () => {
      shopLayoutGrid = true;
      gridToggle.classList.add('active');
      listToggle.classList.remove('active');
      document.getElementById('shop-products-grid')?.classList.remove('list-view');
      filterAndRenderShopProducts();
    });

    listToggle.addEventListener('click', () => {
      shopLayoutGrid = false;
      listToggle.classList.add('active');
      gridToggle.classList.remove('active');
      document.getElementById('shop-products-grid')?.classList.add('list-view');
      filterAndRenderShopProducts();
    });
  }
}

function getProductDiscount(prod) {
  if (prod.discountPercent !== undefined) return prod.discountPercent;
  const orig = prod.originalPrice || Math.round(prod.price * 1.25 / 10) * 10;
  return Math.round(((orig - prod.price) / orig) * 100);
}

function updateDiscountCounts() {
  let count2030 = 0;
  let count1020 = 0;
  let countUnder10 = 0;

  PRODUCTS.forEach(prod => {
    if (shopFilters.search) {
      const matchName = prod.name.toLowerCase().includes(shopFilters.search);
      const matchCat = prod.categoryName.toLowerCase().includes(shopFilters.search);
      const matchDesc = prod.shortDesc.toLowerCase().includes(shopFilters.search);
      const matchBadge = prod.badge.toLowerCase().includes(shopFilters.search);
      const matchFeatures = prod.features.some(f => f.toLowerCase().includes(shopFilters.search));
      if (!matchName && !matchCat && !matchDesc && !matchBadge && !matchFeatures) return;
    }

    if (shopFilters.category !== 'all' && prod.category !== shopFilters.category) return;
    if (prod.price > shopFilters.priceMax) return;

    if (shopFilters.capacity !== 'all') {
      const volMatch = prod.capacity.match(/(\d+)\s*(ml|l)/i);
      if (volMatch) {
        let value = parseFloat(volMatch[1]);
        const unit = volMatch[2].toLowerCase();
        if (unit === 'l') value *= 1000;
        if (shopFilters.capacity === 'small' && value >= 750) return;
        if (shopFilters.capacity === 'medium' && (value < 750 || value > 2000)) return;
        if (shopFilters.capacity === 'large' && value <= 2000) return;
      }
    }

    if (shopFilters.availability === 'in-stock' && prod.availability !== 'In Stock') return;

    if (shopFilters.collection !== 'all') {
      if (shopFilters.collection === 'best' && prod.badge !== 'Best Seller') return;
      if (shopFilters.collection === 'new' && prod.badge !== 'New Arrival') return;
    }

    const d = getProductDiscount(prod);
    if (d >= 20 && d <= 30) count2030++;
    else if (d >= 10 && d < 20) count1020++;
    else if (d < 10) countUnder10++;
  });

  const el2030 = document.getElementById('discount-count-20-30');
  const el1020 = document.getElementById('discount-count-10-20');
  const elUnder10 = document.getElementById('discount-count-under-10');

  if (el2030) el2030.textContent = `(${count2030})`;
  if (el1020) el1020.textContent = `(${count1020})`;
  if (elUnder10) elUnder10.textContent = `(${countUnder10})`;
}

function filterAndRenderShopProducts() {
  const container = document.getElementById('shop-products-grid');
  const resultsLabel = document.getElementById('shop-results-count');
  if (!container) return;

  updateDiscountCounts();

  // Filter logic
  let filtered = PRODUCTS.filter(prod => {
    // Search query match across title, category, description & features
    if (shopFilters.search) {
      const matchName = prod.name.toLowerCase().includes(shopFilters.search);
      const matchCat = prod.categoryName.toLowerCase().includes(shopFilters.search);
      const matchDesc = prod.shortDesc.toLowerCase().includes(shopFilters.search);
      const matchBadge = prod.badge.toLowerCase().includes(shopFilters.search);
      const matchFeatures = prod.features.some(f => f.toLowerCase().includes(shopFilters.search));
      if (!matchName && !matchCat && !matchDesc && !matchBadge && !matchFeatures) return false;
    }

    // Category match
    if (shopFilters.category !== 'all' && prod.category !== shopFilters.category) {
      return false;
    }

    // Price match
    if (prod.price > shopFilters.priceMax) {
      return false;
    }

    // Capacity size categorization
    if (shopFilters.capacity !== 'all') {
      const volMatch = prod.capacity.match(/(\d+)\s*(ml|l)/i);
      if (volMatch) {
        let value = parseFloat(volMatch[1]);
        const unit = volMatch[2].toLowerCase();
        if (unit === 'l') value *= 1000;

        if (shopFilters.capacity === 'small' && value >= 750) return false;
        if (shopFilters.capacity === 'medium' && (value < 750 || value > 2000)) return false;
        if (shopFilters.capacity === 'large' && value <= 2000) return false;
      }
    }

    // Stock availability
    if (shopFilters.availability === 'in-stock' && prod.availability !== 'In Stock') {
      return false;
    }

    // Collections tag match
    if (shopFilters.collection !== 'all') {
      if (shopFilters.collection === 'best' && prod.badge !== 'Best Seller') return false;
      if (shopFilters.collection === 'new' && prod.badge !== 'New Arrival') return false;
    }

    // Discount percentage match
    if (shopFilters.discounts && shopFilters.discounts.length > 0) {
      const disc = getProductDiscount(prod);
      const matches = shopFilters.discounts.some(range => {
        if (range === '20-30') return disc >= 20 && disc <= 30;
        if (range === '10-20') return disc >= 10 && disc < 20;
        if (range === 'under-10') return disc < 10;
        return false;
      });
      if (!matches) return false;
    }

    return true;
  });

  // Sorting logic
  if (shopSortBy === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (shopSortBy === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (shopSortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else {
    // default newest/by id or New Arrivals
    filtered.sort((a, b) => (b.badge === 'New Arrival' ? 1 : 0) - (a.badge === 'New Arrival' ? 1 : 0));
  }

  // Update results label count
  if (resultsLabel) {
    resultsLabel.textContent = `Showing ${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 64px; color: var(--text-muted);">
        <p style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No matching items found</p>
        <p style="font-size: 13.5px;">Try loosening your filters or typing a different keyword search.</p>
      </div>
    `;
    return;
  }

  // Render cards
  container.innerHTML = filtered.map(prod => {
    const isInEnquiry = enquiryList.some(item => item.id === prod.id);
    return `
      <div class="product-card">
        <div class="product-thumb-wrapper">
          <span class="product-badge">${prod.badge}</span>
          <a href="#/product/${prod.id}">
            <img src="${prod.image}" alt="${prod.name}" class="product-thumb" loading="lazy" />
          </a>
          <button class="quick-view-btn" onclick="openQuickView('${prod.id}')" title="Quick View Specs">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <div class="thumb-hover-action-wrapper">
            <button class="thumb-hover-enquiry-btn ${isInEnquiry ? 'in-enquiry' : ''}" onclick="toggleEnquiryItem('${prod.id}')">
              ${isInEnquiry ? `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                In Enquiry List
              ` : `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Enquiry
              `}
            </button>
          </div>
        </div>

        <div class="product-body">
          <h3 class="product-title">
            <a href="#/product/${prod.id}" title="${prod.name}">${prod.name}</a>
          </h3>
          <div class="product-price-rating-row" style="margin-bottom: 0;">
            <div class="product-price-wrap" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span class="product-price">₹${prod.price.toLocaleString('en-IN')}</span>
              <span class="reel-price-original">₹${(prod.originalPrice || Math.round(prod.price * 1.25 / 10) * 10).toLocaleString('en-IN')}</span>
              <span class="reel-discount-badge">${prod.discount || Math.round((((prod.originalPrice || Math.round(prod.price * 1.25 / 10) * 10) - prod.price) / (prod.originalPrice || Math.round(prod.price * 1.25 / 10) * 10)) * 100) + '% OFF'}</span>
            </div>
            <div class="detail-rating-row">
              <span class="detail-stars" style="font-size:13px;">★</span>
              <span class="detail-rating-val">${prod.rating}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}


/* ==========================================================================
   VIEW 3: PRODUCT DETAIL PAGE VIEW
   ========================================================================== */
function renderProductDetailView(container, prodId) {
  const prod = PRODUCTS.find(p => p.id === prodId);
  if (!prod) {
    container.innerHTML = `
      <div class="container section" style="text-align: center; padding: 96px 0;">
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist in our store.</p>
        <a href="#/shop" class="btn btn-primary" style="margin-top: 24px;">Back to Shop</a>
      </div>
    `;
    return;
  }

  // Update Recently Viewed history (limit to 4 unique items)
  recentlyViewed = recentlyViewed.filter(id => id !== prodId);
  recentlyViewed.unshift(prodId);
  recentlyViewed = recentlyViewed.slice(0, 4);
  localStorage.setItem('tup_recently_viewed', JSON.stringify(recentlyViewed));

  const isInEnquiry = enquiryList.some(item => item.id === prod.id);
  const activeColor = prod.colors[0];

  container.innerHTML = `
    <div class="route-view">
      <!-- Product Detail Header Banner -->
      <section class="page-header-banner" style="background-image: url('${prod.image || '/images/hero_banner_glass.png'}');">
        <div class="container">
          <h1 class="page-banner-title">${prod.name}</h1>
        </div>
      </section>

      <!-- Breadcrumb Bar Below Banner -->
      <div class="breadcrumb-bar">
        <div class="container">
          <div class="breadcrumb">
            <a href="#/">Home</a>
            <span>/</span>
            <a href="#/shop">Shop</a>
            <span>/</span>
            <span>${prod.name}</span>
          </div>
        </div>
      </div>

      <div class="section" style="padding: 48px 0 96px 0;">
        <div class="container">
          <div class="detail-layout">
            <!-- Left Column: Gallery -->
            <div class="detail-gallery">
              <div class="gallery-main">
                <img id="detail-main-img" src="${prod.image}" alt="${prod.name}" />
              </div>
              <div class="gallery-thumbs">
                ${prod.gallery ? prod.gallery.map((img, idx) => `
                  <div class="gallery-thumb-item ${idx === 0 ? 'active' : ''}" onclick="window.switchDetailMainImage(this, '${img}')">
                    <img src="${img}" alt="${prod.name} thumbnail ${idx + 1}" />
                  </div>
                `).join('') : `
                  <div class="gallery-thumb-item active">
                    <img src="${prod.image}" alt="${prod.name} thumbnail" />
                  </div>
                `}
              </div>
            </div>

            <!-- Right Column: Info & Actions -->
            <div class="detail-info">
              <div class="detail-badge-row">
                <span class="detail-badge">${prod.badge}</span>
                <span class="detail-badge stock-badge ${prod.availability !== 'In Stock' ? 'limited' : ''}">${prod.availability}</span>
              </div>

              <h1 class="detail-title">${prod.name}</h1>
              <div class="detail-category-label">Collection: <strong>${prod.categoryName}</strong></div>

              <div class="detail-rating-row">
                <span class="detail-stars" style="font-size:16px;">★</span>
                <span class="detail-rating-val">${prod.rating} / 5.0 (Authorized Rating)</span>
              </div>

              <div class="detail-price-row" style="display: flex; align-items: center; gap: 10px; margin: 12px 0 16px 0;">
                <span class="detail-price">₹${prod.price.toLocaleString('en-IN')}</span>
                <span class="reel-price-original" style="font-size: 16px;">₹${(prod.originalPrice || Math.round(prod.price * 1.25 / 10) * 10).toLocaleString('en-IN')}</span>
                <span class="reel-discount-badge" style="font-size: 12px; padding: 3px 8px;">${prod.discount || Math.round((((prod.originalPrice || Math.round(prod.price * 1.25 / 10) * 10) - prod.price) / (prod.originalPrice || Math.round(prod.price * 1.25 / 10) * 10)) * 100) + '% OFF'}</span>
              </div>
              <p class="detail-desc">${prod.fullDesc}</p>

              <!-- Colors Choice Selection -->
              <div class="detail-meta-block">
                <div class="meta-label">Select Color Option</div>
                <div class="color-options" id="detail-color-pills">
                  ${prod.colors.map((col, idx) => `
                    <button class="color-option-btn ${idx === 0 ? 'active' : ''}" onclick="window.switchDetailColor(this, '${col}')">
                      ${col}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Quantity Selection & Add to Enquiry -->
              <div class="action-row-detail">
                <div class="detail-qty-wrapper">
                  <button class="detail-qty-btn" onclick="window.updateDetailQty(-1)">-</button>
                  <span class="detail-qty-val" id="detail-qty-counter">1</span>
                  <button class="detail-qty-btn" onclick="window.updateDetailQty(1)">+</button>
                </div>
                <button class="btn ${isInEnquiry ? 'btn-wa' : 'btn-primary'} btn-full" id="detail-add-enquiry-btn" onclick="window.addDetailItemToEnquiry('${prod.id}')">
                  ${isInEnquiry ? '✓ Added to Enquiry list' : 'Add to Enquiry List'}
                </button>
              </div>

              <!-- Features checklist -->
              <div class="detail-meta-block">
                <div class="meta-label">Key Highlights</div>
                <ul class="detail-features">
                  ${prod.features.map(f => `
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>${f}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>

              <!-- Specifications Sheet -->
              <div class="detail-meta-block" style="border-bottom: none; padding-bottom: 0;">
                <div class="meta-label">Specifications</div>
                <table class="detail-specs-table">
                  <tr>
                    <td>Capacity / Volume</td>
                    <td>${prod.capacity}</td>
                  </tr>
                  <tr>
                    <td>Materials</td>
                    <td>100% Virgin Food-Grade, BPA Free Plastic</td>
                  </tr>
                  <tr>
                    <td>Safety Rating</td>
                    <td>FDA Approved Standards</td>
                  </tr>
                  <tr>
                    <td>Dishwasher Safe</td>
                    <td>Yes, Top Rack Recommended</td>
                  </tr>
                  <tr>
                    <td>Warranty Scope</td>
                    <td>Tupperware Lifetime Quality Assurance against Chipping</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>

          <!-- Related Products Section -->
          <div style="margin-top: 96px; padding-top: 64px; border-top: 1px solid var(--border-light);">
            <div class="section-header" style="text-align: left; margin-bottom: 40px;">
              <h2 style="font-size: 28px;">Related Products</h2>
              <p style="font-size: 14.5px; color: var(--text-secondary);">Explore similar options from our ${prod.categoryName} category.</p>
            </div>
            <div class="product-grid" id="related-products-grid"></div>
          </div>

          <!-- Recently Viewed Section -->
          <div style="margin-top: 64px; padding-top: 64px; border-top: 1px solid var(--border-light);" id="recently-viewed-container">
            <div class="section-header" style="text-align: left; margin-bottom: 40px;">
              <h2 style="font-size: 28px;">Recently Viewed</h2>
              <p style="font-size: 14.5px; color: var(--text-secondary);">Products you have reviewed in your session.</p>
            </div>
            <div class="product-grid" id="recently-viewed-grid"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Switch Main Image Helper
  window.switchDetailMainImage = (elem, imgPath) => {
    document.querySelectorAll('.gallery-thumb-item').forEach(item => item.classList.remove('active'));
    elem.classList.add('active');
    document.getElementById('detail-main-img').src = imgPath;
  };

  // Color Switcher
  let selectedColor = activeColor;
  window.switchDetailColor = (elem, colorName) => {
    document.querySelectorAll('.color-option-btn').forEach(btn => btn.classList.remove('active'));
    elem.classList.add('active');
    selectedColor = colorName;
  };

  // Quantity Control inside Detail Page
  let detailQty = 1;
  window.updateDetailQty = (delta) => {
    detailQty += delta;
    if (detailQty < 1) detailQty = 1;
    document.getElementById('detail-qty-counter').textContent = detailQty;
  };

  // Add Item to Enquiry from Detail Page with specific quantity and selected color option
  window.addDetailItemToEnquiry = (prodId) => {
    const p = PRODUCTS.find(item => item.id === prodId);
    if (!p) return;

    // Check if already in list, if so replace or update quantity
    const existingIdx = enquiryList.findIndex(item => item.id === prodId);
    if (existingIdx > -1) {
      enquiryList[existingIdx].qty = detailQty;
      enquiryList[existingIdx].selectedColor = selectedColor;
    } else {
      enquiryList.push({
        id: p.id,
        name: p.name,
        capacity: p.capacity,
        image: p.image,
        qty: detailQty,
        price: p.price,
        selectedColor: selectedColor
      });
    }

    saveEnquiryState();
    updateEnquiryUI();

    const btn = document.getElementById('detail-add-enquiry-btn');
    if (btn) {
      btn.textContent = '✓ Added to Enquiry List';
      btn.className = 'btn btn-wa btn-full';
    }

    // Toggle open enquiry drawer automatically
    document.getElementById('open-drawer-btn')?.click();
  };

  // Render related products
  renderRelatedProducts(prod);

  // Render recently viewed products
  renderRecentlyViewed(prodId);
}

function renderRelatedProducts(currProd) {
  const grid = document.getElementById('related-products-grid');
  if (!grid) return;

  const related = PRODUCTS.filter(p => p.category === currProd.category && p.id !== currProd.id).slice(0, 4);

  if (related.length === 0) {
    grid.parentNode.style.display = 'none'; // hide section if no related items
    return;
  }

  grid.innerHTML = related.map(prod => `
    <div class="product-card" onclick="window.location.hash = '#/product/${prod.id}'" style="cursor: pointer;">
      <div class="product-thumb-wrapper" style="height: 180px;">
        <img src="${prod.image}" alt="${prod.name}" class="product-thumb" />
      </div>
      <div class="product-body" style="padding: 16px;">
        <div class="product-title" style="font-size: 14px; font-weight: 700;">${prod.name}</div>
        <div class="product-price-wrap" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 8px;">
          <span class="product-price">₹${prod.price.toLocaleString('en-IN')}</span>
          <span class="reel-price-original">₹${(prod.originalPrice || Math.round(prod.price * 1.25 / 10) * 10).toLocaleString('en-IN')}</span>
          <span class="reel-discount-badge">${prod.discount || Math.round((((prod.originalPrice || Math.round(prod.price * 1.25 / 10) * 10) - prod.price) / (prod.originalPrice || Math.round(prod.price * 1.25 / 10) * 10)) * 100) + '% OFF'}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderRecentlyViewed(currId) {
  const container = document.getElementById('recently-viewed-container');
  const grid = document.getElementById('recently-viewed-grid');
  if (!container || !grid) return;

  const historyIds = recentlyViewed.filter(id => id !== currId);
  const items = historyIds.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);

  if (items.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  grid.innerHTML = items.map(prod => `
    <div class="product-card" onclick="window.location.hash = '#/product/${prod.id}'" style="cursor: pointer;">
      <div class="product-thumb-wrapper" style="height: 180px;">
        <img src="${prod.image}" alt="${prod.name}" class="product-thumb" />
      </div>
      <div class="product-body" style="padding: 16px;">
        <div class="product-title" style="font-size: 14px; font-weight: 700;">${prod.name}</div>
        <div class="product-price-wrap" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 8px;">
          <span class="product-price">₹${prod.price.toLocaleString('en-IN')}</span>
          <span class="reel-price-original">₹${(prod.originalPrice || Math.round(prod.price * 1.25 / 10) * 10).toLocaleString('en-IN')}</span>
          <span class="reel-discount-badge">${prod.discount || Math.round((((prod.originalPrice || Math.round(prod.price * 1.25 / 10) * 10) - prod.price) / (prod.originalPrice || Math.round(prod.price * 1.25 / 10) * 10)) * 100) + '% OFF'}</span>
        </div>
      </div>
    </div>
  `).join('');
}


/* ==========================================================================
   ENQUIRY DRAWER & QUANTITY HANDLERS
   ========================================================================== */

// Toggle item directly from Home or Shop grids
window.toggleEnquiryItem = (prodId) => {
  const index = enquiryList.findIndex(item => item.id === prodId);
  if (index > -1) {
    enquiryList.splice(index, 1);
  } else {
    const prod = PRODUCTS.find(p => p.id === prodId);
    if (prod) {
      enquiryList.push({
        id: prod.id,
        name: prod.name,
        capacity: prod.capacity,
        image: prod.image,
        qty: 1,
        price: prod.price,
        selectedColor: prod.colors[0]
      });
    }
  }

  saveEnquiryState();
  updateEnquiryUI();

  // Re-render current page grids so states display updated checkmarks
  const hash = window.location.hash || '#/';
  if (hash.startsWith('#/shop')) {
    filterAndRenderShopProducts();
  }
};

window.updateQty = (prodId, delta) => {
  const item = enquiryList.find(i => i.id === prodId);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      enquiryList = enquiryList.filter(i => i.id !== prodId);
    }
    saveEnquiryState();
    updateEnquiryUI();

    // Rerender grids
    const hash = window.location.hash || '#/';
    if (hash.startsWith('#/shop')) {
      filterAndRenderShopProducts();
    }
  }
};

window.removeEnquiryItem = (prodId) => {
  enquiryList = enquiryList.filter(i => i.id !== prodId);
  saveEnquiryState();
  updateEnquiryUI();

  // Rerender grids
  const hash = window.location.hash || '#/';
  if (hash.startsWith('#/shop')) {
    filterAndRenderShopProducts();
  }
};

function saveEnquiryState() {
  localStorage.setItem('tup_enquiry_list', JSON.stringify(enquiryList));
}

function updateEnquiryUI() {
  const totalCount = enquiryList.reduce((acc, curr) => acc + curr.qty, 0);

  // Update header badge and bottom floating badges
  document.getElementById('header-badge-count').textContent = totalCount;
  const mobileBadge = document.getElementById('header-badge-count-mobile');
  if (mobileBadge) mobileBadge.textContent = totalCount;
  document.getElementById('floating-badge-count').textContent = totalCount;
  document.getElementById('drawer-item-count').textContent = totalCount;
  const bottomBadge = document.getElementById('bottom-badge-count');
  if (bottomBadge) bottomBadge.textContent = totalCount;

  // Render list inside drawer
  const container = document.getElementById('enquiry-items-container');
  if (!container) return;

  if (enquiryList.length === 0) {
    container.innerHTML = `
      <div class="drawer-empty">
        <div class="drawer-empty-icon">📝</div>
        <p style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">Your enquiry list is empty</p>
        <p style="font-size: 13.5px;">Browse our premium catalog, add products to the list, and submit via WhatsApp.</p>
      </div>
    `;
    return;
  }

  // Calculate sum totals
  const sumTotal = enquiryList.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

  container.innerHTML = `
    <div class="enquiry-items-list">
      ${enquiryList.map(item => `
        <div class="enquiry-item">
          <img src="${item.image}" alt="${item.name}" class="enquiry-item-thumb" />
          <div class="enquiry-item-details">
            <div class="enquiry-item-name">${item.name}</div>
            <div class="enquiry-item-capacity">${item.capacity} ${item.selectedColor ? `• ${item.selectedColor}` : ''}</div>
            <div style="font-size: 13px; font-weight: 700; margin: 4px 0;">₹${item.price.toLocaleString('en-IN')}</div>
            <div class="quantity-controls">
              <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
              <span class="qty-val">Qty: ${item.qty}</span>
              <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
            </div>
          </div>
          <button onclick="removeEnquiryItem('${item.id}')" style="color: var(--text-muted); padding: 4px;" title="Remove">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `).join('')}
    </div>
    <div style="padding: 16px; background-color: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 14.5px; font-weight: 700; color: var(--text-secondary);">Approx. Total:</span>
      <span style="font-size: 20px; font-weight: 800; color: var(--text-primary);">₹${sumTotal.toLocaleString('en-IN')}</span>
    </div>
  `;
}

function sendWhatsAppEnquiry() {
  const errContainer = document.getElementById('enquiry-form-error');
  const nameInput = document.getElementById('cust-name');
  const phoneInput = document.getElementById('cust-phone');

  // Reset errors
  if (errContainer) {
    errContainer.style.display = 'none';
    errContainer.textContent = '';
  }
  if (nameInput) nameInput.classList.remove('input-error');
  if (phoneInput) phoneInput.classList.remove('input-error');

  if (enquiryList.length === 0) {
    if (errContainer) {
      errContainer.textContent = 'Your enquiry list is currently empty. Please add items to submit an enquiry.';
      errContainer.style.display = 'block';
    } else {
      alert('Please add at least one product to your enquiry list before submitting.');
    }
    return;
  }

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const city = document.getElementById('cust-city')?.value || 'Kochi / Ernakulam';
  const pref = document.getElementById('cust-pref')?.value || 'Home Delivery Across Kerala';
  const notes = document.getElementById('cust-notes')?.value.trim() || '';

  if (!name || !phone) {
    if (!name && nameInput) nameInput.classList.add('input-error');
    if (!phone && phoneInput) phoneInput.classList.add('input-error');

    if (errContainer) {
      errContainer.textContent = 'Please fill in both your Full Name and Mobile/WhatsApp Number.';
      errContainer.style.display = 'block';
      errContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      alert('Please provide your Full Name and Mobile/WhatsApp number.');
    }
    return;
  }

  let message = `Hello Tupperware Exclusive Store Kerala! 👋\n`;
  message += `I would like to enquire about the following products from tupstore.in:\n\n`;

  let grandTotal = 0;
  enquiryList.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    grandTotal += itemTotal;
    message += `${index + 1}. *${item.name}* (${item.capacity})\n`;
    if (item.selectedColor) message += `   🎨 Color: ${item.selectedColor}\n`;
    message += `   Qty: ${item.qty} x ₹${item.price.toLocaleString('en-IN')} = *₹${itemTotal.toLocaleString('en-IN')}*\n\n`;
  });

  message += `*Approximate Total Value:* ₹${grandTotal.toLocaleString('en-IN')}\n\n`;
  message += `*Customer Details:*\n`;
  message += `👤 *Name:* ${name}\n`;
  message += `📞 *WhatsApp:* ${phone}\n`;
  message += `📍 *Location:* ${city}\n`;
  message += `🚚 *Preference:* ${pref}\n`;
  if (notes) {
    message += `📝 *Notes:* ${notes}\n`;
  }
  message += `\nPlease share the best price quote, current franchise discounts, and availability. Thank you!`;

  const waUrl = `https://wa.me/919847012345?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
}

/* ==========================================================================
   GLOBAL INTERACTION MODALS & LISTENERS
   ========================================================================== */

// Dynamic Quick View Modal (keeps the catalog highly interactive)
window.openQuickView = (prodId) => {
  const prod = PRODUCTS.find(p => p.id === prodId);
  if (!prod) return;

  const modal = document.getElementById('quickview-modal');
  const content = document.getElementById('quickview-content');
  const isInEnquiry = enquiryList.some(item => item.id === prod.id);

  content.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center;">
      <div style="background: var(--bg-subtle); border-radius: var(--radius-lg); padding: 24px; text-align: center;">
        <img src="${prod.image}" alt="${prod.name}" style="max-height: 280px; margin: 0 auto; object-fit: contain;" />
      </div>
      <div>
        <span class="product-badge" style="position: relative; top: 0; left: 0; display: inline-block; margin-bottom: 12px;">${prod.badge}</span>
        <h2 style="font-size: 24px; margin-bottom: 8px;">${prod.name}</h2>
        <div style="font-size: 14px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">${prod.capacity}</div>
        <div style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">₹${prod.price.toLocaleString('en-IN')}</div>
        <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px;">${prod.shortDesc}</p>
        
        <button class="btn btn-secondary btn-full" style="margin-bottom: 12px;" onclick="window.location.hash='#/product/${prod.id}'; document.getElementById('quickview-modal').classList.remove('open');">
          View Detailed Product Sheet
        </button>

        <button class="btn ${isInEnquiry ? 'btn-wa' : 'btn-primary'} btn-full" onclick="toggleEnquiryItem('${prod.id}'); openQuickView('${prod.id}');">
          ${isInEnquiry ? '✓ Added to Enquiry List' : '+ Add to Enquiry List'}
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');
};

function setupGlobalListeners() {
  // Enquiry Drawer triggers
  const openDrawerBtn = document.getElementById('open-drawer-btn');
  const floatingTriggerBtn = document.getElementById('floating-trigger-btn');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const backdrop = document.getElementById('drawer-backdrop');
  const drawer = document.getElementById('enquiry-drawer');

  const openDrawer = () => {
    drawer.classList.add('open');
    backdrop.classList.add('open');
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
  };

  if (openDrawerBtn) openDrawerBtn.addEventListener('click', openDrawer);
  if (floatingTriggerBtn) floatingTriggerBtn.addEventListener('click', openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  const bottomBarCart = document.getElementById('bottom-bar-cart');
  if (bottomBarCart) bottomBarCart.addEventListener('click', openDrawer);

  // Clear list button inside drawer
  const clearBtn = document.getElementById('clear-enquiry-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your enquiry list?')) {
        enquiryList = [];
        saveEnquiryState();
        updateEnquiryUI();

        // Rerender grids
        if (hash.startsWith('#/shop')) {
          filterAndRenderShopProducts();
        }
      }
    });
  }

  // Submit enquiry WhatsApp button
  const sendWaBtn = document.getElementById('send-wa-enquiry-btn');
  if (sendWaBtn) {
    sendWaBtn.addEventListener('click', sendWhatsAppEnquiry);
  }

  // Search Modal overlay triggers
  const searchTrigger = document.getElementById('search-trigger-btn');
  const searchModal = document.getElementById('search-modal');
  const closeSearchBtn = document.getElementById('close-search-btn');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results-list');

  const openSearch = () => {
    searchModal.classList.add('open');
    searchInput.value = '';
    searchResults.innerHTML = '';
    searchInput.focus();
  };

  if (searchTrigger) searchTrigger.addEventListener('click', openSearch);

  const bottomBarSearch = document.getElementById('bottom-bar-search');
  if (bottomBarSearch) bottomBarSearch.addEventListener('click', openSearch);

  if (closeSearchBtn) {
    closeSearchBtn.addEventListener('click', () => {
      searchModal.classList.remove('open');
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        searchResults.innerHTML = '';
        return;
      }
      const matches = PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q)
      );

      if (matches.length === 0) {
        searchResults.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 24px;">No matching products found.</div>`;
        return;
      }

      searchResults.innerHTML = matches.map(prod => `
        <div class="product-card" onclick="window.location.hash='#/product/${prod.id}'; document.getElementById('search-modal').classList.remove('open');" style="cursor: pointer;">
          <div class="product-thumb-wrapper" style="height: 140px;">
            <img src="${prod.image}" alt="${prod.name}" class="product-thumb" />
          </div>
          <div class="product-body" style="padding: 12px;">
            <div class="product-title" style="font-size: 14px;">${prod.name}</div>
            <div class="product-price-wrap" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 4px;">
              <span class="product-price" style="font-size: 13.5px;">₹${prod.price.toLocaleString('en-IN')}</span>
              <span class="reel-price-original">₹${(prod.originalPrice || Math.round(prod.price * 1.25 / 10) * 10).toLocaleString('en-IN')}</span>
              <span class="reel-discount-badge">${prod.discount || Math.round((((prod.originalPrice || Math.round(prod.price * 1.25 / 10) * 10) - prod.price) / (prod.originalPrice || Math.round(prod.price * 1.25 / 10) * 10)) * 100) + '% OFF'}</span>
            </div>
          </div>
        </div>
      `).join('');
    });
  }

  // Quick View Close
  const closeQuickViewBtn = document.getElementById('close-quickview-btn');
  const quickViewModal = document.getElementById('quickview-modal');
  if (closeQuickViewBtn) {
    closeQuickViewBtn.addEventListener('click', () => {
      quickViewModal.classList.remove('open');
    });
  }

  // Reel Modal Close & Navigation
  const closeReelBtn = document.getElementById('close-reel-btn');
  const reelModal = document.getElementById('reel-modal');
  const modalReelPrev = document.getElementById('modal-reel-prev');
  const modalReelNext = document.getElementById('modal-reel-next');

  if (closeReelBtn) {
    closeReelBtn.addEventListener('click', () => {
      if (reelModal) reelModal.classList.remove('open');
    });
  }
  if (reelModal) {
    reelModal.addEventListener('click', (e) => {
      if (e.target === reelModal) reelModal.classList.remove('open');
    });
  }
  if (modalReelPrev) {
    modalReelPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      window.navigateModalReel(-1);
    });
  }
  if (modalReelNext) {
    modalReelNext.addEventListener('click', (e) => {
      e.stopPropagation();
      window.navigateModalReel(1);
    });
  }

  // Mobile navigation hamburger toggle
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const navMenu = document.getElementById('nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('mobile-open');
      if (isOpen) {
        mobileToggle.innerHTML = '<svg id="mobile-toggle-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      } else {
        mobileToggle.innerHTML = '<svg id="mobile-toggle-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="10" y1="15" x2="20" y2="15"/></svg>';
      }
    });

    const menuLinks = navMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
        mobileToggle.innerHTML = '<svg id="mobile-toggle-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="10" y1="15" x2="20" y2="15"/></svg>';
      });
    });
  }
}

/* ==========================================================================
   VIEW 4: DEDICATED CONTACT PAGE VIEW
   ========================================================================== */
function renderContactView(container) {
  container.innerHTML = `
    <div class="route-view contact-page-view">
      <!-- Contact Page Header Banner -->
      <section class="page-header-banner" style="background-image: url('/images/hero_banner_store4.jpg');">
        <div class="container">
          <h1 class="page-banner-title">Get in Touch with Our Exclusive Store</h1>
        </div>
      </section>

      <!-- Breadcrumb Bar Below Banner -->
      <div class="breadcrumb-bar">
        <div class="container">
          <div class="breadcrumb">
            <a href="#/">Home</a>
            <span>/</span>
            <span>Contact Us</span>
          </div>
        </div>
      </div>

      <!-- Contact Main Content Section -->
      <section class="section section-grey contact-body-section">
        <div class="container">
          <div class="contact-grid">
            
            <!-- Left Column: Store Details & Fast Support Cards -->
            <div class="contact-info-column">
              
              <!-- Direct WhatsApp Quick Action Card -->
              <div class="contact-card contact-wa-card">
                <div class="contact-wa-header">
                  <div class="contact-wa-icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  </div>
                  <div>
                    <h3 class="contact-card-title" style="margin-bottom: 2px;">Instant WhatsApp Assistance</h3>
                    <div style="font-size: 12.5px; color: var(--accent-wa); font-weight: 700;">Active Store Representative Online</div>
                  </div>
                </div>
                <p class="contact-card-text">Connect directly with our Kerala store representative on WhatsApp for real-time inventory checks, price quotes, and instant home delivery booking.</p>
                <a href="https://wa.me/919847012345?text=Hello%20Tupperware%20Kerala!%20I%20have%20an%20enquiry%20regarding%20products." target="_blank" rel="noopener noreferrer" class="btn btn-wa btn-sm" style="margin-top: 14px; width: 100%;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  Chat on WhatsApp (+91 98470 12345)
                </a>
              </div>

              <!-- Location & Contact Info Card -->
              <div class="contact-card">
                <h3 class="contact-card-title">Store & Franchise Details</h3>
                
                <ul class="contact-detail-list">
                  <li>
                    <div class="contact-icon-box">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div>
                      <strong>Exclusive Store Location:</strong>
                      <p>MG Road, Ernakulam / Kochi, Kerala 682016, India</p>
                    </div>
                  </li>
                  <li>
                    <div class="contact-icon-box">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <div>
                      <strong>Phone Helpline:</strong>
                      <p>+91 98470 12345 / +91 484 2380000</p>
                    </div>
                  </li>
                  <li>
                    <div class="contact-icon-box">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <div>
                      <strong>Email Support:</strong>
                      <p>store@tupstore.in / enquiry@tupstore.in</p>
                    </div>
                  </li>
                  <li>
                    <div class="contact-icon-box">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div>
                      <strong>Operating Hours:</strong>
                      <p>Mon - Sat: 10:00 AM - 8:00 PM<br/>Sunday: 11:00 AM - 5:00 PM</p>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- Kerala Delivery Coverage Card -->
              <div class="contact-card">
                <h3 class="contact-card-title">Serving All Districts in Kerala</h3>
                <p class="contact-card-text" style="margin-bottom: 14px;">We provide fast dispatch, home delivery, and franchise store pick-ups across all districts:</p>
                <div class="contact-cities-tags">
                  <span class="city-tag">Ernakulam / Kochi</span>
                  <span class="city-tag">Thiruvananthapuram</span>
                  <span class="city-tag">Kozhikode</span>
                  <span class="city-tag">Thrissur</span>
                  <span class="city-tag">Kottayam</span>
                  <span class="city-tag">Palakkad</span>
                  <span class="city-tag">Kannur</span>
                  <span class="city-tag">Alappuzha</span>
                  <span class="city-tag">Kollam</span>
                  <span class="city-tag">Malappuram</span>
                </div>
              </div>            </div>

            <!-- Right Column: Interactive Product Enquiry Form -->
            <div class="contact-form-column">
              <div class="contact-card contact-form-card">
                <h2 class="form-heading">Send Product & Pricing Enquiry</h2>
                <p class="form-subheading">Fill out the form below to receive immediate pricing, volume discount details, or home delivery options from our Kerala store manager.</p>

                <div id="contact-form-alert" style="display: none;"></div>

                <form id="standalone-contact-form">
                  <div class="form-row-2col">
                    <div class="form-group">
                      <label class="form-label" for="contact-name">Full Name <span style="color:#d93025;">*</span></label>
                      <input type="text" id="contact-name" class="form-input" placeholder="e.g. Anjali Nair" required />
                    </div>
                    <div class="form-group">
                      <label class="form-label" for="contact-phone">WhatsApp / Phone Number <span style="color:#d93025;">*</span></label>
                      <input type="tel" id="contact-phone" class="form-input" placeholder="e.g. 98470 12345" required />
                    </div>
                  </div>

                  <div class="form-row-2col">
                    <div class="form-group">
                      <label class="form-label" for="contact-email">Email Address</label>
                      <input type="email" id="contact-email" class="form-input" placeholder="e.g. anjali@example.com" />
                    </div>
                    <div class="form-group">
                      <label class="form-label" for="contact-city">Nearest District / City in Kerala</label>
                      <select id="contact-city" class="form-select">
                        <option value="Ernakulam / Kochi">Ernakulam / Kochi</option>
                        <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                        <option value="Kozhikode">Kozhikode</option>
                        <option value="Thrissur">Thrissur</option>
                        <option value="Kottayam">Kottayam</option>
                        <option value="Palakkad">Palakkad</option>
                        <option value="Kannur">Kannur</option>
                        <option value="Alappuzha">Alappuzha</option>
                        <option value="Kollam">Kollam</option>
                        <option value="Malappuram">Malappuram</option>
                        <option value="Other Kerala District">Other Kerala District</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="contact-category">Product Category of Interest</label>
                    <select id="contact-category" class="form-select">
                      <option value="All Categories / General Enquiry">All Categories / General Enquiry</option>
                      <option value="Hydration Bottles & Flasks">Hydration Bottles & Flasks</option>
                      <option value="Lunch Boxes & Sets">Lunch Boxes & Sets</option>
                      <option value="Modular Kitchen Storage">Modular Kitchen Storage</option>
                      <option value="Refrigerator & Produce Keepers">Refrigerator & Produce Keepers</option>
                      <option value="Freezer Storage Sets">Freezer Storage Sets</option>
                      <option value="Thermals & Vacuum Flasks">Thermals & Vacuum Flasks</option>
                      <option value="Kids Collection & Bento Boxes">Kids Collection & Bento Boxes</option>
                      <option value="Bakeware & Borosilicate Glass">Bakeware & Borosilicate Glass</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="contact-message">Enquiry Details / Message <span style="color:#d93025;">*</span></label>
                    <textarea id="contact-message" class="form-textarea" rows="5" placeholder="Specify products, quantities, custom set requirements, or delivery address..." required></textarea>
                  </div>

                  <div class="form-actions-stack">
                    <button type="submit" class="btn btn-primary btn-full btn-lg" id="submit-contact-direct-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      Submit Direct Enquiry
                    </button>
                    <button type="button" class="btn btn-wa btn-full btn-lg" id="submit-contact-wa-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                      Send Enquiry via WhatsApp
                    </button>
                  </div>
                </form>

                <!-- Success Confirmation Box (Hidden initially) -->
                <div class="contact-success-card" id="contact-success-card" style="display: none;">
                  <div class="success-icon-badge">✓</div>
                  <h3 class="success-title">Enquiry Submitted Successfully!</h3>
                  <p class="success-desc">Thank you! Your enquiry has been routed directly to our Tupperware Exclusive Store team in Kerala. Our store representative will contact you via WhatsApp/Phone shortly.</p>
                  <div class="success-ref-box">
                    <span>Enquiry Reference ID:</span>
                    <strong id="contact-ref-id">#TUP-KER-9482</strong>
                  </div>
                  <div style="display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap;">
                    <a href="#/shop" class="btn btn-primary btn-sm">Explore Product Catalogue</a>
                    <button type="button" class="btn btn-secondary btn-sm" id="reset-contact-form-btn">Send Another Enquiry</button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- Interactive Google Maps Card (Full Width) -->
          <div class="contact-card contact-map-card" style="display: flex; flex-direction: column; margin-top: 32px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
              <div>
                <h3 class="contact-card-title" style="margin-bottom: 4px;">Visit Our Showroom</h3>
                <div style="font-size: 14px; color: var(--text-secondary);">Tupperware Exclusive Store Thiruvalla, Pathanamthitta, Kerala</div>
              </div>
              <a href="https://maps.app.goo.gl/AZ3kRBx54WgBYtw28" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="width: fit-content;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Open in Google Maps
              </a>
            </div>
            <iframe 
              src="https://maps.google.com/maps?q=Tupperware+Exclusive+Store+Thiruvalla&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="450" 
              style="border:0; border-radius: var(--radius-lg);" 
              allowfullscreen="" 
              loading="lazy">
            </iframe>
          </div>

        </div>
      </section>
    </div>
  `;

  // Attach Contact Form Event Handlers
  setupContactFormEvents();
}

// Setup Event Listeners for Standalone Contact Form
function setupContactFormEvents() {
  const form = document.getElementById('standalone-contact-form');
  const alertBox = document.getElementById('contact-form-alert');
  const successCard = document.getElementById('contact-success-card');
  const waBtn = document.getElementById('submit-contact-wa-btn');
  const resetBtn = document.getElementById('reset-contact-form-btn');

  if (!form) return;

  const validateForm = () => {
    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name) {
      alertBox.className = 'form-error-msg';
      alertBox.style.display = 'block';
      alertBox.textContent = 'Please enter your Full Name.';
      return null;
    }
    if (!phone || phone.length < 8) {
      alertBox.className = 'form-error-msg';
      alertBox.style.display = 'block';
      alertBox.textContent = 'Please enter a valid WhatsApp / Phone Number.';
      return null;
    }
    if (!message) {
      alertBox.className = 'form-error-msg';
      alertBox.style.display = 'block';
      alertBox.textContent = 'Please enter your enquiry message.';
      return null;
    }

    alertBox.style.display = 'none';
    return {
      name,
      phone,
      email: document.getElementById('contact-email').value.trim(),
      city: document.getElementById('contact-city').value,
      category: document.getElementById('contact-category').value,
      message
    };
  };

  // Direct Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = validateForm();
    if (!data) return;

    const refId = '#TUP-KER-' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('contact-ref-id').textContent = refId;
    form.style.display = 'none';
    successCard.style.display = 'block';
    window.scrollTo({ top: 300, behavior: 'smooth' });
  });

  // WhatsApp Button Click
  if (waBtn) {
    waBtn.addEventListener('click', () => {
      const data = validateForm();
      if (!data) return;

      const waText = encodeURIComponent(
        `*New Enquiry from Website (tupstore.in)*\n\n` +
        `👤 *Name:* ${data.name}\n` +
        `📞 *Phone:* ${data.phone}\n` +
        `📍 *Location:* ${data.city}\n` +
        `📦 *Category:* ${data.category}\n` +
        `📝 *Enquiry:* ${data.message}`
      );

      const waUrl = `https://wa.me/919847012345?text=${waText}`;
      window.open(waUrl, '_blank');

      const refId = '#TUP-KER-' + Math.floor(1000 + Math.random() * 9000);
      document.getElementById('contact-ref-id').textContent = refId;
      form.style.display = 'none';
      successCard.style.display = 'block';
    });
  }

  // Reset form listener
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.style.display = 'block';
      successCard.style.display = 'none';
      alertBox.style.display = 'none';
    });
  }
}

/* ==========================================================================
   VIEW 5: DEDICATED ABOUT US PAGE VIEW (`#/about`)
   ========================================================================== */
function renderAboutView(container) {
  container.innerHTML = `
    <div class="route-view about-page-view">
      <!-- About Page Header Banner -->
      <section class="page-header-banner" style="background-image: url('/images/hero_banner_store.webp');">
        <div class="container">
          <h1 class="page-banner-title">Authentic Tupperware Excellence</h1>
        </div>
      </section>

      <!-- Breadcrumb Bar Below Banner -->
      <div class="breadcrumb-bar">
        <div class="container">
          <div class="breadcrumb">
            <a href="#/">Home</a>
            <span>/</span>
            <span>About Us</span>
          </div>
        </div>
      </div>

      <!-- Brand Story & Franchise Heritage -->
      <section class="section section-grey">
        <div class="container">
          <div class="about-story-grid">
            <div class="about-story-content">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                <span class="hero-tag-dot" style="display:inline-block; width:8px; height:8px; background:var(--accent-wa); border-radius:50%;"></span>
                <span style="font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-secondary);">Our Franchise Mission</span>
              </div>
              <h2 style="font-size: 32px; margin-bottom: 16px; line-height: 1.2;">Zero Compromise on Food Safety & Kitchen Organization</h2>
              <p style="font-size: 16px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
                At <strong>tupstore.in</strong> (Official Exclusive Store Franchise, MG Road Ernakulam), we believe that healthy living starts in the kitchen. Every product in our catalogue is manufactured from 100% virgin food-grade polymer materials, completely free from harmful BPA, lead, and phthalates.
              </p>
              <p style="font-size: 15.5px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">
                Whether you are organizing a traditional Kerala kitchen with airtight spice and rice storage, packing fresh homemade lunches for school and work, or upgrading to eco-friendly borosilicate glassware, we guarantee 100% authentic inventory sourced directly from Tupperware India manufacturing units.
              </p>
              
              <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                <a href="#/shop" class="btn btn-primary">Browse Full Catalogue</a>
                <a href="#/contact" class="btn btn-secondary">Contact Store Manager</a>
              </div>
            </div>

            <div class="about-story-card">
              <img src="/images/cat_kitchen.png" alt="Tupperware Modern Kitchen Organization" style="width:100%; height:320px; object-fit:cover; border-radius:var(--radius-lg); margin-bottom:20px;" />
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; text-align: center;">
                <div style="background:var(--bg-subtle); padding:16px; border-radius:var(--radius-md);">
                  <div style="font-size:28px; font-weight:800; color:var(--text-primary);">25,000+</div>
                  <div style="font-size:12.5px; color:var(--text-secondary); font-weight:600;">Happy Kerala Households</div>
                </div>
                <div style="background:var(--bg-subtle); padding:16px; border-radius:var(--radius-md);">
                  <div style="font-size:28px; font-weight:800; color:var(--text-primary);">100%</div>
                  <div style="font-size:12.5px; color:var(--text-secondary); font-weight:600;">Virgin BPA-Free Plastic</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5 Core Pillars of Excellence -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle">Why Choose Us</span>
            <h2 class="section-title">The Official Tupperware Advantage</h2>
            <p class="section-desc">Why thousands of families across Kochi, Trivandrum, Kozhikode & Thrissur trust our exclusive store franchise.</p>
          </div>

          <div class="why-grid">
            ${WHY_US.map(item => `
              <div class="why-card">
                <div class="why-icon-box">${item.icon}</div>
                <h3 class="why-title">${item.title}</h3>
                <p class="why-desc">${item.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>


      <!-- Customer Testimonials Section -->
      <section class="section section-grey" id="testimonials">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle">Customer Reviews</span>
            <h2 class="section-title">Loved by Families Across Kerala</h2>
            <p class="section-desc">Read genuine feedback from doctors, professionals, and homemakers who rely on our products daily.</p>
          </div>

          <div class="testimonial-grid">
            ${TESTIMONIALS.map(t => `
              <div class="testimonial-card">
                <div>
                  <div class="testimonial-stars">★★★★★</div>
                  <p class="testimonial-text">"${t.text}"</p>
                </div>
                <div class="testimonial-author">
                  <img src="${t.avatar}" alt="${t.name}" class="author-avatar" loading="lazy" />
                  <div>
                    <div class="author-name">${t.name}</div>
                    <div class="author-role">${t.role} • ${t.location}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- CTA Banner to Products -->
      <section class="section">
        <div class="container">
          <div class="cta-banner">
            <h2>Ready to Upgrade Your Kitchen?</h2>
            <p>Explore our complete catalogue of authentic Tupperware products and find the perfect storage solutions for your home.</p>
            <div style="display:flex; justify-content:center; margin-top: 24px;">
              <a href="#/shop" class="btn btn-primary" style="background-color: #ffffff; color: var(--text-primary);">
                Browse Full Catalogue
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

/* ==========================================================================
   VIEW 6: DEDICATED PROMOTIONS PAGE VIEW (`#/promotions`)
   ========================================================================== */
function renderPromotionsView(container) {
  container.innerHTML = `
    <div class="route-view promo-page-view">
      <!-- Promotions Page Header Banner -->
      <section class="page-header-banner" style="background-image: url('/images/hero_banner_glass.png');">
        <div class="container">
          <h1 class="page-banner-title">Special Offers & Featured Combos</h1>
        </div>
      </section>

      <!-- Breadcrumb Bar Below Banner -->
      <div class="breadcrumb-bar">
        <div class="container">
          <div class="breadcrumb">
            <a href="#/">Home</a>
            <span>/</span>
            <span>Promotions & Special Offers</span>
          </div>
        </div>
      </div>

      <!-- Active Promotions Grid -->
      <section class="section section-grey">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle">Live Featured Deals</span>
            <h2 class="section-title">Current Exclusive Promotions</h2>
            <p class="section-desc">Enquire directly on WhatsApp to claim special franchise discount pricing and bundled gifts.</p>
          </div>

          <div class="promo-grid">
            ${PROMOTIONS.map(p => `
              <div class="promo-card">
                <img src="${p.image}" alt="${p.title}" class="promo-card-bg" />
                <div class="promo-card-gradient-overlay"></div>
                <div class="promo-card-content">
                  <span class="promo-tag">${p.tag}</span>
                  <h3 class="promo-title">${p.title}</h3>
                  <p class="promo-subtitle">${p.subtitle}</p>
                  
                  <div style="display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap;">
                    <a href="#/shop?category=${p.category}" class="btn btn-primary btn-sm">
                      ${p.cta}
                    </a>
                    <a href="https://wa.me/919847012345?text=Hi!%20I%20want%20to%20enquire%20about%20the%20${encodeURIComponent(p.title)}%20offer." target="_blank" rel="noopener noreferrer" class="btn btn-wa btn-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                      Enquire Offer on WA
                    </a>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Video Reels Carousel Spotlight -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle">Video Spotlight</span>
            <h2 class="section-title">See Products in Action</h2>
            <p class="section-desc">Watch quick recipe demonstrations, airtight seal testing, and kitchen makeover videos.</p>
          </div>

          <div class="reels-carousel-wrapper" id="reels-carousel-wrapper">
            <button class="carousel-nav-btn prev" id="reels-carousel-prev" aria-label="Previous Reels">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>

            <div class="reels-scroll-container" id="reels-scroll-container">
              ${INSTA_REELS.map(reel => `
                <div class="reel-card">
                  <div class="reel-thumb-wrapper" onclick="openReelModal('${reel.id}')" role="button" tabindex="0">
                    <img src="${reel.image}" alt="${reel.title}" class="reel-thumb-img" loading="lazy" />
                    <div class="reel-overlay-gradient"></div>
                    
                    <div class="reel-play-btn" title="Play Video Reel">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                    
                    <div class="reel-meta-top">
                      <span class="reel-badge-insta">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        Instagram Reel
                      </span>
                    </div>

                    <div class="reel-meta-bottom">
                      <span>▶ ${reel.views}</span>
                      <span>${reel.duration}</span>
                    </div>
                  </div>

                  <div class="reel-card-body">
                    <h4 class="reel-product-title" title="${reel.title}">${reel.productName || reel.title}</h4>
                    
                    <div class="reel-price-row">
                      <span class="reel-price">₹${reel.price.toLocaleString('en-IN')}</span>
                      ${reel.originalPrice ? `<span class="reel-price-original">₹${reel.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                      ${reel.discount ? `<span class="reel-discount-badge">${reel.discount}</span>` : ''}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <button class="carousel-nav-btn next" id="reels-carousel-next" aria-label="Next Reels">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </section>

      <!-- Franchise Guarantee Banner -->
      <section class="section section-grey">
        <div class="container">
          <div class="minimal-quote-banner">
            <div class="minimal-quote-content">
              <span class="minimal-quote-tag">Wholesale & Corporate Gifting</span>
              <h3 class="minimal-quote-title">Looking for Custom Bulk Sets?</h3>
              <p class="minimal-quote-desc">
                We offer special wholesale and corporate gifting discounts for festivals, office events, and family functions across Kerala. Get a personalized invoice and custom product combo quote within 15 minutes on WhatsApp.
              </p>
              <a href="https://wa.me/919847012345?text=Hello%20Tupperware%20Kerala!%20I%20have%20a%20bulk%20/%20corporate%20order%20enquiry." target="_blank" rel="noopener noreferrer" class="btn-minimal-wa">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                Request Custom Bulk Quote on WhatsApp
              </a>
            </div>
            <div class="minimal-quote-image-wrapper">
              <img src="/images/consultation_tupperware.png" alt="Tupperware Bulk Gifting Sets" class="minimal-quote-img" loading="lazy" />
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  setTimeout(() => {
    setupReelsCarousel();
  }, 50);
}

/* ==========================================================================
   VIEW: DEDICATED ABOUT STORE PAGE (TUPSTORE KERALA)
   ========================================================================== */
function renderAboutStoreView(container) {
  container.innerHTML = `
    <div class="route-view about-page-view">
      <!-- About Store Page Header Banner -->
      <section class="page-header-banner" style="background-image: url('/images/hero_banner_store1.png');">
        <div class="container">
          <h1 class="page-banner-title">Your Authorized Exclusive Store</h1>
        </div>
      </section>

      <!-- Breadcrumb Bar Below Banner -->
      <div class="breadcrumb-bar">
        <div class="container">
          <div class="breadcrumb">
            <a href="#/">Home</a>
            <span>/</span>
            <span>About Tupstore</span>
          </div>
        </div>
      </div>

      <section class="section section-grey">
        <div class="container">
          <div class="about-story-grid">
            <div class="about-story-content">
              <h2 style="font-size: 32px; margin-bottom: 16px; line-height: 1.2;">Visit Our Physical Store</h2>
              <p style="font-size: 16px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
                Experience the premium quality, feel the robust airtight seals, and see the vibrant colors of authentic Tupperware in person. Our expert store representatives are always ready to demonstrate products, suggest the best kitchen storage systems, and help you pick perfect gifts.
              </p>
              <ul style="list-style:none; display:flex; flex-direction:column; gap:16px; margin-bottom: 24px;">
                <li style="display:flex; gap:12px; align-items:flex-start;">
                  <strong>📍 Location:</strong>
                  <span style="color: var(--text-secondary);">Thiruvalla, Pathanamthitta, Kerala 689101</span>
                </li>
                <li style="display:flex; gap:12px; align-items:flex-start;">
                  <strong>🕒 Hours:</strong>
                  <span style="color: var(--text-secondary);">Mon - Sat: 10:00 AM - 8:00 PM</span>
                </li>
                <li style="display:flex; gap:12px; align-items:flex-start;">
                  <strong>📞 Phone / WA:</strong>
                  <span style="color: var(--text-secondary);">+91 98470 12345</span>
                </li>
                <li style="display:flex; gap:12px; align-items:flex-start;">
                  <strong>✉️ Email:</strong>
                  <span style="color: var(--text-secondary);">hello@tupstore.in</span>
                </li>
              </ul>
              
              <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                <a href="https://maps.app.goo.gl/AZ3kRBx54WgBYtw28" target="_blank" class="btn btn-primary">Get Directions</a>
                <a href="#/contact" class="btn btn-secondary">Contact Us</a>
              </div>
            </div>

            <div class="about-story-card">
              <img src="/images/hero_kitchen.png" alt="Tupstore Storefront" style="width:100%; height:320px; object-fit:cover; border-radius:var(--radius-lg); margin-bottom:20px;" />
            </div>
          </div>
        </div>
      </section>

      <!-- Customer Testimonials Section -->
      <section class="section" id="testimonials">
        <div class="container">
          <div class="section-header">
            <span class="section-subtitle">Customer Reviews</span>
            <h2 class="section-title">Loved by Families Across Kerala</h2>
            <p class="section-desc">Read genuine feedback from doctors, professionals, and homemakers who rely on our products daily.</p>
          </div>

          <div class="testimonial-grid">
            ${TESTIMONIALS.map(t => `
              <div class="testimonial-card">
                <div>
                  <div class="testimonial-stars">★★★★★</div>
                  <p class="testimonial-text">"${t.text}"</p>
                </div>
                <div class="testimonial-author">
                  <img src="${t.avatar}" alt="${t.name}" class="author-avatar" loading="lazy" />
                  <div>
                    <div class="author-name">${t.name}</div>
                    <div class="author-role">${t.role} • ${t.location}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Physical Store Spotlight -->
      <section class="section" style="padding-top: 0;">
        <div class="container">
          <div class="store-spotlight-card" style="background:var(--bg-dark); color:#ffffff; border-radius:var(--radius-xl); padding:48px; display:flex; flex-wrap:wrap; gap:40px; align-items:center;">
            <div style="flex:1; min-width: 300px;">
              <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--accent-wa); margin-bottom:12px;">Visit Our Showroom</div>
              <h2 style="font-size:32px; color:#ffffff; margin-bottom:16px;">Tupperware Exclusive Store Thiruvalla, Pathanamthitta</h2>
              <p style="color:#a1a1a6; font-size:15.5px; line-height:1.6; margin-bottom:24px;">
                Experience the full product range in person! Our showroom staff will help you choose exact container sizes, test liquid-tight seals, and assemble custom kitchen storage sets.
              </p>
              <div style="display:flex; gap:16px; flex-wrap:wrap;">
                <a href="#/shop" class="btn btn-wa">Check Products</a>
                <a href="https://wa.me/919847012345?text=Hello!%20I%20want%20to%20visit%20the%20Thiruvalla%20store." target="_blank" class="btn btn-secondary" style="background:rgba(255,255,255,0.1); color:#fff; border-color:rgba(255,255,255,0.2);">WhatsApp Store Helpline</a>
              </div>
            </div>
            <div style="flex:1; min-width: 300px;">
              <img src="/images/hero_kitchen.png" alt="Showroom Kitchen Display" style="width:100%; height:300px; object-fit:cover; border-radius:var(--radius-lg);" />
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}
