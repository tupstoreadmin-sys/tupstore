-- Tupstore — Admin Products migration
-- Adds `product_code` to `products`, and grants the `authenticated` role
-- admin-gated CRUD access to products, product_images, product_features,
-- and product_specifications, restricted to public.is_admin() = true
-- (defined in db/migrations/0001_admin_foundation.sql). Follows the exact
-- pattern established in db/migrations/0002_admin_categories.sql, repeated
-- per table.
--
-- Does NOT touch: categories, enquiries, enquiry_items, profiles, or any
-- of their policies/grants. Does NOT touch the existing "Public read
-- access" anon policies on products/product_images/product_features/
-- product_specifications, or any anon grant — customer-facing reads are
-- completely unaffected. Does NOT modify any existing product row's data.
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push`, do not paste this into the Dashboard SQL Editor,
-- until it has been explicitly approved.
--
-- Like 0002/0003/0004, `create policy` (and, here, `add constraint`) have
-- no `IF NOT EXISTS` form in Postgres — this file is safe to review
-- repeatedly but is intended to be run against production exactly once.

-- ── A. product_code ──────────────────────────────────────────────────────
-- Added NULLABLE, not NOT NULL. Verified live immediately before writing
-- this file: all 4 current production products have no product_code value
-- (the column doesn't exist yet, so by definition none do) —
--   Classic Airtight Container Set, Eco Bottle 1L, Insulated Lunch Box,
--   Stackable Spice Organizer
-- None of these codes are known or safe to invent, and this migration
-- must not fabricate them just to satisfy a NOT NULL constraint.
--
-- UNIQUE is safe to add immediately even though the column is nullable —
-- Postgres does not treat multiple NULLs as duplicates under a UNIQUE
-- constraint, so all 4 existing rows staying NULL is fine and this
-- constraint will not fail.
--
-- Recommended next steps (not part of this migration, not performed now):
--   1. This migration: add product_code nullable + unique.
--   2. Populate real product_code values for the 4 existing products
--      through Admin Product Management, once it exists.
--   3. A separate future migration adds `not null` once every existing
--      product has a real code — only after step 2 is confirmed complete.
alter table products add column if not exists product_code text;

alter table products add constraint products_product_code_key unique (product_code);

-- ── B. Admin RLS/grants — products + child tables ───────────────────────
-- Base table privileges — `usage on schema public to authenticated` was
-- already granted by 0001_admin_foundation.sql, so it is not repeated
-- here; only the per-table grants each of these four tables still need.
grant select, insert, update, delete on public.products               to authenticated;
grant select, insert, update, delete on public.product_images         to authenticated;
grant select, insert, update, delete on public.product_features       to authenticated;
grant select, insert, update, delete on public.product_specifications to authenticated;

-- products — same shape as categories' policies in 0002.
create policy "Admins can select products" on products
  for select to authenticated
  using (is_admin());

create policy "Admins can insert products" on products
  for insert to authenticated
  with check (is_admin());

create policy "Admins can update products" on products
  for update to authenticated
  using (is_admin())
  with check (is_admin());

create policy "Admins can delete products" on products
  for delete to authenticated
  using (is_admin());

-- product_images — child table, same admin gate. Anon can still only
-- SELECT (existing policy, untouched); only an admin session can write.
create policy "Admins can select product images" on product_images
  for select to authenticated
  using (is_admin());

create policy "Admins can insert product images" on product_images
  for insert to authenticated
  with check (is_admin());

create policy "Admins can update product images" on product_images
  for update to authenticated
  using (is_admin())
  with check (is_admin());

create policy "Admins can delete product images" on product_images
  for delete to authenticated
  using (is_admin());

-- product_features — same pattern.
create policy "Admins can select product features" on product_features
  for select to authenticated
  using (is_admin());

create policy "Admins can insert product features" on product_features
  for insert to authenticated
  with check (is_admin());

create policy "Admins can update product features" on product_features
  for update to authenticated
  using (is_admin())
  with check (is_admin());

create policy "Admins can delete product features" on product_features
  for delete to authenticated
  using (is_admin());

-- product_specifications — same pattern. The existing
-- unique(product_id, spec_key) constraint from db/schema.sql is untouched
-- and still applies to admin writes exactly as it does today.
create policy "Admins can select product specifications" on product_specifications
  for select to authenticated
  using (is_admin());

create policy "Admins can insert product specifications" on product_specifications
  for insert to authenticated
  with check (is_admin());

create policy "Admins can update product specifications" on product_specifications
  for update to authenticated
  using (is_admin())
  with check (is_admin());

create policy "Admins can delete product specifications" on product_specifications
  for delete to authenticated
  using (is_admin());

-- End of migration. Existing anon SELECT policies on products/
-- product_images/product_features/product_specifications, and every
-- policy/grant on categories/enquiries/enquiry_items/profiles, are
-- completely untouched by this file. No product or category row is
-- inserted, updated, or deleted; product_code is added empty (NULL) for
-- every existing row.
