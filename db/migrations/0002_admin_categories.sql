-- Tupstore — Admin Categories migration
-- Grants the `authenticated` role admin-gated CRUD access to `categories`,
-- restricted to users where public.is_admin() = true (defined in
-- db/migrations/0001_admin_foundation.sql).
--
-- Does NOT touch: products, product_images, product_features,
-- product_specifications, enquiries, enquiry_items, or profiles. Does NOT
-- touch the existing "Public read access" anon policy on categories, or
-- any anon grant — customer-facing reads are completely unaffected.
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push`, do not paste this into the Dashboard SQL Editor,
-- until it has been explicitly approved.

-- Base table privilege — RLS alone is not enough; `authenticated` needs
-- this GRANT before RLS is even evaluated for any of the four operations
-- below (same gotcha already documented in db/schema.sql). `usage on
-- schema public to authenticated` was already granted by
-- 0001_admin_foundation.sql, so it is not repeated here.
grant select, insert, update, delete on public.categories to authenticated;

-- Admin-gated policies — each checks is_admin(), not merely "is signed
-- in". A signed-in account whose profiles.role isn't 'admin' satisfies
-- none of these and gets the same empty/denied result an anonymous
-- request would.
create policy "Admins can select categories" on categories
  for select to authenticated
  using (is_admin());

create policy "Admins can insert categories" on categories
  for insert to authenticated
  with check (is_admin());

create policy "Admins can update categories" on categories
  for update to authenticated
  using (is_admin())
  with check (is_admin());

create policy "Admins can delete categories" on categories
  for delete to authenticated
  using (is_admin());

-- End of migration. The existing "Public read access" anon policy on
-- categories, and every policy/grant on products, product_images,
-- product_features, product_specifications, enquiries, enquiry_items, and
-- profiles, are completely untouched by this file. Category deletion
-- safety against products still relies entirely on the existing
-- `products.category_id references categories(id) on delete restrict`
-- constraint from db/schema.sql — this migration does not add or change
-- any constraint.
