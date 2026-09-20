-- Tupstore — Admin Category Image Storage migration
-- Creates the `category-images` Storage bucket (public read, so the
-- storefront can display images without any auth) and admin-gated write
-- policies on storage.objects, restricted to public.is_admin() = true
-- (defined in db/migrations/0001_admin_foundation.sql).
--
-- Does NOT touch: categories, products, product_images, product_features,
-- product_specifications, enquiries, enquiry_items, profiles, or any of
-- their policies/grants. Does NOT touch the existing (separately prepared,
-- also-unapplied) db/migrations/0002_admin_categories.sql.
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push`, do not paste this into the Dashboard SQL Editor, and
-- do not create the bucket via the Dashboard UI, until this has been
-- explicitly approved.
--
-- Unlike the plain `public` schema tables in db/schema.sql, storage.objects
-- and storage.buckets are managed by the Supabase Storage extension and
-- already ship with the base GRANTs `authenticated`/`anon` need — only RLS
-- policies (below) are required to gate actual access; no `grant ...`
-- statements are needed here.

-- ── Bucket ────────────────────────────────────────────────────────────────
-- `public = true` lets the storefront load category images via Storage's
-- public URL scheme (what supabase.storage.from(...).getPublicUrl()
-- returns) without needing a SELECT policy below — public buckets serve
-- reads outside RLS entirely. Only writes (insert/update/delete) are
-- gated by policy.
insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true)
on conflict (id) do nothing;

-- ── Admin-gated write policies ───────────────────────────────────────────
-- Every policy is scoped to this one bucket (bucket_id = 'category-images')
-- so it can never affect any other bucket created later (e.g. a future
-- product-images bucket), and every policy requires is_admin() — a
-- signed-in non-admin account satisfies none of these, same as the
-- categories table policies in 0002_admin_categories.sql.
create policy "Admins can upload category images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'category-images' and public.is_admin());

create policy "Admins can update category images" on storage.objects
  for update to authenticated
  using (bucket_id = 'category-images' and public.is_admin())
  with check (bucket_id = 'category-images' and public.is_admin());

create policy "Admins can delete category images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'category-images' and public.is_admin());

-- End of migration. No SELECT policy is added — the bucket's `public` flag
-- already makes objects readable by anyone (customers included) via the
-- public URL, which is what the storefront needs; this migration does not
-- grant the `authenticated` role (or anyone) the ability to list/browse
-- the bucket's contents, only to upload/replace/delete their own uploads
-- while is_admin() is true.
