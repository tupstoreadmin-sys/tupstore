-- Tupstore — TRENDING NOW / MUST HAVES real-category migration
-- Business decision (reversing 0004_canonical_categories.sql's original
-- call): TRENDING NOW and MUST HAVES are no longer Home-only curated
-- collections — they are now official customer-facing categories, exactly
-- like DRY STORAGES, BOTTLES, SERVING, etc. Clicking either must filter
-- Shop by category_id like every other category.
--
-- Does NOT touch: products, product_images, product_features,
-- product_specifications, enquiries, enquiry_items, or any of their
-- policies/grants. Does NOT delete or recreate any existing category row —
-- all 10 existing category ids/slugs/names/images are left exactly as they
-- are. Does NOT add any product to either new category — both start empty;
-- the client will assign products later via the existing Admin panel.
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push`, do not paste this into the Dashboard SQL Editor,
-- until it has been explicitly approved. Once approved, apply it manually
-- through the Supabase Dashboard SQL Editor, exactly like every prior
-- migration in this project.
--
-- Verified immediately before writing this file (read-only, live query
-- against the production categories table):
--   sort_order 1..9 already exactly: dry-storages, fridge-storages,
--   freezer-storages, lunch-on-the-go, bottles, thermals, kids,
--   prep-and-cook, serving — unaffected by this migration.
--   SPARE PARTS  id 1ce33814-49d8-498e-8db3-436a46709a19  sort_order 10
--     (before this migration) → sort_order 12 (after)
--
-- `on conflict (slug) do nothing` makes the insert safe to re-run if this
-- migration is ever interrupted partway through.

-- ── 1. Move SPARE PARTS to the end of the display order FIRST ──────────
-- Run before the inserts below so sort_order 10/11 are free the moment
-- TRENDING NOW/MUST HAVES are created — SPARE PARTS currently holds
-- sort_order 10, the same value TRENDING NOW is about to take. Targeted by
-- slug, not id — the row itself (id, name, image) is untouched, only its
-- sort_order changes.
update categories set sort_order = 12 where slug = 'spare-parts';

-- ── 2. Create TRENDING NOW ───────────────────────────────────────────────
-- `image` reuses the exact same approved local asset path already used by
-- HomePage.jsx's (now-removed) local override for this collection — no new
-- image is invented here. `tagline` is left NULL: no tagline copy has been
-- supplied for this category, and none is fabricated here, matching every
-- other "no content provided yet" field in this project.
insert into categories (slug, name, image, sort_order)
values ('trending-now', 'TRENDING NOW', '/images/category_trending_now.webp', 10)
on conflict (slug) do nothing;

-- ── 3. Create MUST HAVES ─────────────────────────────────────────────────
-- Same reasoning as step 2.
insert into categories (slug, name, image, sort_order)
values ('must-haves', 'MUST HAVES', '/images/category_must_haves.webp', 11)
on conflict (slug) do nothing;

-- End of migration. No category is deleted or recreated. No product row is
-- inserted, updated, or deleted. RLS/Storage/grants are untouched — the
-- existing "Public read access" policy on categories (db/schema.sql)
-- already covers these two new rows identically to every other category.
