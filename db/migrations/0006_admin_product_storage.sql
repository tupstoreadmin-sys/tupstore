-- Tupstore — Admin Product Image Storage migration
-- Creates the `product-images` Storage bucket (public read, matching
-- src/utils/imageUrl.js's existing hardcoded bucket name) and admin-gated
-- write policies on storage.objects, restricted to public.is_admin() =
-- true. Follows the exact pattern established in
-- db/migrations/0003_admin_category_storage.sql.
--
-- Does NOT touch: categories, products, product_images, product_features,
-- product_specifications, enquiries, enquiry_items, profiles, or any of
-- their policies/grants. Does NOT touch the existing category-images
-- bucket or ANY of its policies — every policy below is scoped to
-- bucket_id = 'product-images' only, and every policy name below is
-- distinct from 0003's ("... category images" vs "... product images"),
-- so nothing here can collide with or shadow an existing policy.
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push`, do not paste this into the Dashboard SQL Editor,
-- and do not create the bucket via the Dashboard UI, until this has been
-- explicitly approved.
--
-- Verified immediately before writing this file (read-only, live): a
-- probe of GET /storage/v1/object/public/product-images/<nonexistent>
-- returned "Bucket not found" (NoSuchBucket) — confirming this bucket
-- genuinely does not exist yet in production, unlike category-images
-- (which returns "Object not found" for the same kind of probe).

-- ── Bucket ────────────────────────────────────────────────────────────────
-- `public = true`, matching category-images — lets the storefront load
-- product images via Storage's public URL scheme without needing a SELECT
-- policy below; public buckets serve reads outside RLS entirely. Only
-- writes (insert/update/delete) are gated by policy.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- ── Admin-gated write policies ───────────────────────────────────────────
create policy "Admins can upload product images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can update product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can delete product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- End of migration. No SELECT policy is added — the bucket's `public`
-- flag already makes objects readable by anyone (customers included) via
-- the public URL. A signed-in non-admin account satisfies is_admin() =
-- false and gets no upload/update/delete access, identical to the
-- category-images security model. The existing category-images bucket
-- and its three policies from 0003 are completely untouched.
