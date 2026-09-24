-- Tupstore — Seed initial production Hero Slides
-- Converts the customer-facing Hero's current content
-- (src/data/promotions.js's MOCK_HERO_SLIDES, unchanged verbatim) into
-- real hero_slides/hero_slide_features rows, so that switching HomePage.jsx
-- from MOCK_HERO_SLIDES to Supabase (see src/services/hero/) does not make
-- the live Hero disappear — public.hero_slides currently has zero rows.
--
-- DATA ONLY. Does not touch: the hero_slides/hero_slide_features schema,
-- their RLS policies/grants (0019_admin_hero_slides.sql), the hero-images
-- Storage bucket/policies (0020_hero_slide_storage.sql), or any other
-- table's data (products, categories, promotions, enquiries,
-- newsletter_subscribers, etc.).
--
-- Every field below is copied verbatim from MOCK_HERO_SLIDES — no new copy,
-- no new images, no invented CTA destination. Images are the existing
-- static assets already shipped in public/images/ (e.g.
-- /images/cat_kitchen.png) — these are plain text paths resolved by the
-- browser against the site's own origin, so storing them as-is displays
-- pixel-identical images with no Storage upload needed.
--
-- ONE REAL COMPATIBILITY GAP, RESOLVED HERE (reported, not silently
-- guessed): MOCK_HERO_SLIDES' primaryCta.href is '/shop' on all 4 slides —
-- the general Shop Catalogue, not a specific category or product. None of
-- the 4 supported button types (category/product/whatsapp/url) has a
-- first-class "go to the general shop page" concept — category/product
-- both need a specific id, and whatsapp is already used by the secondary
-- button on every slide. The destination itself is NOT missing information
-- (it is exactly '/shop', taken verbatim) — only the type label is a loose
-- fit. Resolution: button1_type = 'url' with button1_target = '/shop'.
-- src/pages/HomePage.jsx's buildHeroCta() opens a 'url' target via
-- `navigate()` (in-app, same tab) when it starts with '/', and only via
-- `window.open` (new tab) for a genuine absolute URL — so this exactly
-- reproduces today's real click behavior (in-app navigation to /shop),
-- not a behavior change. secondaryCta always opened WhatsApp regardless of
-- its own (always '#') href on every mock slide — reproduced exactly as
-- button2_type = 'whatsapp' (target unused, uses the site-wide
-- STORE_WHATSAPP_NUMBER, never a per-slide number, matching the previous
-- hardcoded behavior exactly).
--
-- mobile_image and alt_text are NULL on all 4 rows — MOCK_HERO_SLIDES never
-- had a distinct mobile image or alt text (HeroBanner.jsx previously
-- hardcoded alt=""), so NULL is the faithful, non-invented value; NULL
-- mobile_image preserves the exact current single-image responsive
-- fallback (see HeroBanner.jsx's own updated comment).
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push`, do not paste this into the Dashboard SQL Editor,
-- until it has been explicitly approved. Once approved, apply it manually
-- through the Supabase Dashboard SQL Editor, exactly like every prior
-- migration in this project.
--
-- RERUN-SAFE: hero_slides.id already has a primary key, so the hero_slides
-- insert below adds `on conflict (id) do nothing` to turn a second run's
-- would-be primary-key violation into a silent no-op instead of a hard
-- error. hero_slide_features has no natural unique key of its own, so this
-- file adds one — a unique index on (hero_slide_id, sort_order), which is
-- exactly the shape needed to give its insert an `on conflict ... do
-- nothing` target too. Running this whole file any number of times against
-- the same database leaves exactly 4 hero_slides rows and 12
-- hero_slide_features rows — never duplicates.

insert into hero_slides
  (id, badge, title, image, mobile_image, alt_text,
   button1_text, button1_type, button1_target,
   button2_text, button2_type, button2_target,
   is_active, sort_order)
values
  ('a1a1a1a1-0001-4000-8000-000000000001',
   'Modular Kitchen Essentials',
   'Organize Your Dream Kitchen in Style',
   '/images/cat_kitchen.png', null, null,
   'Explore Kitchen Storage', 'url', '/shop',
   'Kitchen Consultation', 'whatsapp', null,
   true, 0),

  ('a1a1a1a1-0001-4000-8000-000000000002',
   'Hydration & On-The-Go',
   'Stay Fresh & Hydrated Every Single Day',
   '/images/cat_bottles.png', null, null,
   'Explore Bottles & Sets', 'url', '/shop',
   'WhatsApp Enquiry', 'whatsapp', null,
   true, 1),

  ('a1a1a1a1-0001-4000-8000-000000000003',
   'Smart Meal Prep & Insulated',
   'Keep Meals Hot & Fresh Wherever You Go',
   '/images/cat_kitchen.png', null, null,
   'Explore Lunch Collections', 'url', '/shop',
   'Get Recommendation', 'whatsapp', null,
   true, 2),

  ('a1a1a1a1-0001-4000-8000-000000000004',
   'Pantry Organization',
   'Transform Your Pantry Storage Experience',
   '/images/cat_bottles.png', null, null,
   'Shop Best Sellers', 'url', '/shop',
   'Store Consultation', 'whatsapp', null,
   true, 3)
on conflict (id) do nothing;

-- Added here (not in 0019_admin_hero_slides.sql, per this fix's own scope)
-- purely to give the hero_slide_features insert below a real conflict
-- target — no two feature bullets on the same slide are ever meant to
-- share a sort_order, so this is a safe, generally-correct constraint, not
-- a workaround specific to this seed.
create unique index if not exists idx_hero_slide_features_slide_sort_order
  on hero_slide_features (hero_slide_id, sort_order);

insert into hero_slide_features (hero_slide_id, text, sort_order)
values
  ('a1a1a1a1-0001-4000-8000-000000000001', '100% Air-Tight Moisture Seal', 0),
  ('a1a1a1a1-0001-4000-8000-000000000001', 'Space-Saving Modular Design', 1),
  ('a1a1a1a1-0001-4000-8000-000000000001', 'BPA-Free Food Grade Material', 2),

  ('a1a1a1a1-0001-4000-8000-000000000002', 'Spill-Proof & Ergonomic Grip', 0),
  ('a1a1a1a1-0001-4000-8000-000000000002', '100% Safe Eco-Friendly Plastic', 1),
  ('a1a1a1a1-0001-4000-8000-000000000002', 'Vibrant Colors & Lifetime Quality', 2),

  ('a1a1a1a1-0001-4000-8000-000000000003', 'Advanced Thermal Insulation', 0),
  ('a1a1a1a1-0001-4000-8000-000000000003', 'Leak-Proof Inner Container Seals', 1),
  ('a1a1a1a1-0001-4000-8000-000000000003', 'Compact & Easy-Carrying Bag', 2),

  ('a1a1a1a1-0001-4000-8000-000000000004', 'Clear Window Easy Identification', 0),
  ('a1a1a1a1-0001-4000-8000-000000000004', 'Stackable Space-Maximizing Shape', 1),
  ('a1a1a1a1-0001-4000-8000-000000000004', 'Authentic Tupperware Guarantee', 2)
on conflict (hero_slide_id, sort_order) do nothing;

-- End of seed. 4 hero_slides rows, 12 hero_slide_features rows, all
-- is_active = true, sort_order 0-3 (matching MOCK_HERO_SLIDES' existing
-- array order exactly). No other table or row is touched. Rerunning this
-- entire file produces the same end state — no duplicates.
