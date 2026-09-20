-- Tupstore — Canonical Product Category Taxonomy migration
-- Renames the 3 existing production categories in place (same ids, same
-- product relationships), creates the 7 remaining client-approved
-- categories, and adds a `sort_order` column so the business's deliberate
-- display order can be honored instead of alphabetical order.
--
-- Does NOT touch: products, product_images, product_features,
-- product_specifications, enquiries, enquiry_items, profiles, or any of
-- their policies/grants. Does NOT delete any category or product row.
-- Does NOT change any product's price, availability, image, description,
-- features, or specifications. Does NOT touch RLS or Storage — the
-- existing 0002_admin_categories.sql policies (SELECT/INSERT/UPDATE/DELETE
-- for authenticated where is_admin()) already cover every operation below,
-- and already work identically regardless of a row's name/slug/sort_order
-- values, so nothing here requires a policy change.
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push`, do not paste this into the Dashboard SQL Editor,
-- until it has been explicitly approved. Once approved, apply it manually
-- through the Supabase Dashboard SQL Editor, exactly like every prior
-- migration in this project.
--
-- Verified immediately before writing this file (read-only, live):
--   Kitchen Storage   id 0e2d7a57-1ec4-4ed5-95f4-a7c1d5d2aba1  slug kitchen-storage
--   Bottles & Sippers id 8ec430a5-2e21-42a4-aad5-b73686a1c980  slug bottles-sippers
--   Bakeware          id 24ae9386-e1b0-49b7-a4c4-2112b6aef94d  slug bakeware
-- Every UPDATE below targets rows by slug (old OR new spelling), not by
-- id, so this migration is safe to re-run if it's ever interrupted
-- partway through — a second run simply matches 0 rows for whatever
-- already succeeded.

-- ── 1. Rename existing categories in place ──────────────────────────────
-- Same `id` before and after — every product's `category_id` foreign key
-- keeps pointing at the same row, so no product needs to change at all
-- for these three. `image` is deliberately not touched (existing images,
-- including Bakeware's real uploaded photo, are left exactly as they are).
update categories
set name = 'DRY STORAGES',
    slug = 'dry-storages',
    tagline = 'Modular storage containers for Lentils, flour, pulses, snacks'
where slug in ('kitchen-storage', 'dry-storages');

update categories
set name = 'BOTTLES',
    slug = 'bottles',
    tagline = 'Carry your own bottle - avoid disposable bottles'
where slug in ('bottles-sippers', 'bottles');

-- Bakeware is renamed, not replaced — its one product (Insulated Lunch
-- Box) keeps the exact same category_id it already has, so this single
-- UPDATE is the entire "remap" for that product; no product table write
-- is needed or performed.
update categories
set name = 'LUNCH ON THE GO',
    slug = 'lunch-on-the-go',
    tagline = 'Carry fresh food and beverages, everywhere you go'
where slug in ('bakeware', 'lunch-on-the-go');

-- ── 2. Create the remaining 7 client-approved categories ────────────────
-- `image` is omitted (defaults to NULL) for every new category — no image
-- is invented here; each gets a real image later via the Admin panel's
-- already-working upload feature. `on conflict (slug) do nothing` makes
-- this block safe to re-run.
insert into categories (slug, name, tagline)
values
  ('fridge-storages', 'FRIDGE STORAGES', 'Fruits, veggies, Cooked food, leftovers - stay fresher, longer'),
  ('freezer-storages', 'FREEZER STORAGES', 'Freeze your food fresher, longer'),
  ('thermals', 'THERMALS', 'Insulated Bottles to keep your food & beverages warm'),
  ('kids', 'KIDS', 'For your Super Kids'),
  ('prep-and-cook', 'PREP & COOK', 'Prep easy, cook healthy'),
  ('serving', 'SERVING', 'Durable, light and convenient serving solutions'),
  ('spare-parts', 'SPARE PARTS', 'Replacement Seals, Lids & Caps')
on conflict (slug) do nothing;

-- ── 3. Deterministic display order ───────────────────────────────────────
-- No sort_order column exists today (categories.getCategories() currently
-- returns Postgres's unspecified default order — see db/schema.sql). The
-- business supplied these 10 categories in a deliberate order, so an
-- alphabetical or insertion-order fallback would not match their intent.
-- Additive, nullable-free (defaults every existing/future row to 0), so
-- this cannot break any existing row.
alter table categories add column if not exists sort_order int not null default 0;

update categories set sort_order = 1  where slug = 'dry-storages';
update categories set sort_order = 2  where slug = 'fridge-storages';
update categories set sort_order = 3  where slug = 'freezer-storages';
update categories set sort_order = 4  where slug = 'lunch-on-the-go';
update categories set sort_order = 5  where slug = 'bottles';
update categories set sort_order = 6  where slug = 'thermals';
update categories set sort_order = 7  where slug = 'kids';
update categories set sort_order = 8  where slug = 'prep-and-cook';
update categories set sort_order = 9  where slug = 'serving';
update categories set sort_order = 10 where slug = 'spare-parts';

-- End of migration. #TRENDINGNOW and MUST HAVES are deliberately not
-- created here (per your instruction — they are future curated
-- collections, not ordinary categories). No category row is deleted; no
-- product row is inserted, updated, or deleted.
