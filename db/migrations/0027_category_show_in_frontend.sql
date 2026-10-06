-- 0027 - categories.show_in_frontend
--
-- Lets a category exist (and be managed in Admin, and have products assigned
-- to it) without being shown on the public storefront. Used for the
-- internal-only category OTHER.
--
--   * Adds categories.show_in_frontend boolean NOT NULL DEFAULT true. Every
--     existing category therefore becomes visible (true) - nothing changes
--     for them.
--   * Sets it to false for the category with slug 'other' (slug is unique,
--     so this is one specific row).
--
-- No category or product is deleted or modified otherwise, product_categories
-- is untouched, and no RLS policy changes: the storefront filters on this
-- column in its category queries (src/api/productApi.js), while the Admin
-- queries stay unrestricted and keep seeing every category.
--
-- Apply BEFORE deploying the matching code if possible; until applied, the
-- storefront falls back to showing all categories (it does not break).
-- Safe to run more than once.

alter table public.categories
  add column if not exists show_in_frontend boolean not null default true;

update public.categories
   set show_in_frontend = false
 where slug = 'other';
