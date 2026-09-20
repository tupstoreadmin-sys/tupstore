-- Tupstore — Admin Social Video Storage migration
-- Creates the `social-video-thumbnails` and `social-videos` Storage
-- buckets (both public read) and admin-gated write policies on
-- storage.objects, restricted to public.is_admin() = true (defined in
-- db/migrations/0001_admin_foundation.sql). Follows the exact pattern
-- established in db/migrations/0003_admin_category_storage.sql and
-- 0006_admin_product_storage.sql.
--
-- Does NOT touch: categories, products, product_images, product_features,
-- product_specifications, enquiries, enquiry_items, profiles,
-- social_videos, social_video_products, or any of their policies/grants.
-- Does NOT touch the existing category-images or product-images buckets
-- or ANY of their policies — every policy below is scoped to its own
-- bucket_id only, and every policy name below is distinct from 0003's/
-- 0006's ("... category images" / "... product images" vs
-- "... social video thumbnails" / "... social videos"), so nothing here
-- can collide with or shadow an existing policy.
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push`, do not paste this into the Dashboard SQL Editor,
-- and do not create either bucket via the Dashboard UI, until this has
-- been explicitly approved.
--
-- Unlike the plain `public` schema tables in db/schema.sql, storage.objects
-- and storage.buckets are managed by the Supabase Storage extension and
-- already ship with the base GRANTs `authenticated`/`anon` need — only RLS
-- policies (below) are required to gate actual access; no `grant ...`
-- statements are needed here, same as 0003/0006.
--
-- Object naming (documented here for whenever the future Admin upload
-- code is written — not implemented by this migration, which only creates
-- buckets/policies): flat `${crypto.randomUUID()}.${extension}` per
-- bucket, matching category-images' existing flat convention rather than
-- product-images' per-record-folder convention — each social_videos row
-- has exactly one thumbnail and one video (not a multi-image gallery like
-- products), so there is no per-record collection to namespace by folder.
-- Bucket separation alone already keeps thumbnails and videos apart.
--
-- No automatic deletion of a previous thumbnail/video when a record is
-- later updated is added here or intended later at this stage — matching
-- category-images/product-images' own existing precedent, where a
-- replaced image's old Storage object is likewise never auto-deleted by
-- any policy or trigger in this project. Any future cleanup remains a
-- deliberate, separate, explicitly-approved decision, not silent
-- housekeeping logic.

-- ── Bucket 1: social-video-thumbnails ────────────────────────────────────
-- `public = true`, matching category-images/product-images — lets the
-- storefront load thumbnails via Storage's public URL scheme without
-- needing a SELECT policy below; public buckets serve reads outside RLS
-- entirely. Only writes (insert/update/delete) are gated by policy.
--
-- `file_size_limit`/`allowed_mime_types` are set directly on the bucket
-- row — a deliberate enhancement beyond 0003/0006's precedent (neither
-- set these; they relied on client-side validation only in
-- adminStorageApi.js/adminProductApi.js). Setting them here gives
-- defense-in-depth: even if a future admin upload path's own client-side
-- check were ever bypassed or buggy, Supabase Storage itself will reject
-- a disallowed type or oversized file at the API level.
--
-- 5 MB matches the existing category-images/product-images convention
-- exactly (see adminStorageApi.js's/adminProductApi.js's own
-- MAX_IMAGE_BYTES = 5 * 1024 * 1024). JPG and JPEG are the same MIME type
-- (image/jpeg) — no separate entry is needed for each spelling.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'social-video-thumbnails',
  'social-video-thumbnails',
  true,
  5242880, -- 5 MB, in bytes (5 * 1024 * 1024) — matches category-images/product-images
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ── Bucket 2: social-videos ──────────────────────────────────────────────
-- Chosen limit: 50 MB (52428800 bytes), explicitly documented here rather
-- than silently picked:
--   These are short, Instagram-Reel-style clips (typically 15-60 seconds),
--   not full-length videos. A 60-second clip at a reasonable web-delivery
--   bitrate of ~5-7 Mbps (H.264/VP9, 1080p or lower — comfortably
--   good-quality for a phone-viewed reel) lands at roughly 35-50 MB.
--   50 MB comfortably covers that realistic use case with a small margin,
--   while still ruling out accidental uploads of long-form or
--   unnecessarily high-bitrate source files that would bloat Storage
--   usage and bandwidth costs for a small Kerala storefront's project
--   tier. This is a starting point, not a permanent decision — revisit if
--   real admin usage shows it's too tight or too generous.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'social-videos',
  'social-videos',
  true,
  52428800, -- 50 MB, in bytes (50 * 1024 * 1024) — see rationale above
  array['video/mp4', 'video/webm']
)
on conflict (id) do nothing;

-- ── Admin-gated write policies ───────────────────────────────────────────
-- Every policy is scoped to its own bucket_id so it can never affect the
-- other new bucket, or any existing bucket, and every policy requires
-- is_admin() — a signed-in non-admin account satisfies none of these,
-- identical to the category-images/product-images security model. No
-- public/anon insert, update, or delete policy is added for either
-- bucket, and no service-role credential is used or referenced anywhere
-- in this file.
create policy "Admins can upload social video thumbnails" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'social-video-thumbnails' and public.is_admin());

create policy "Admins can update social video thumbnails" on storage.objects
  for update to authenticated
  using (bucket_id = 'social-video-thumbnails' and public.is_admin())
  with check (bucket_id = 'social-video-thumbnails' and public.is_admin());

create policy "Admins can delete social video thumbnails" on storage.objects
  for delete to authenticated
  using (bucket_id = 'social-video-thumbnails' and public.is_admin());

create policy "Admins can upload social videos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'social-videos' and public.is_admin());

create policy "Admins can update social videos" on storage.objects
  for update to authenticated
  using (bucket_id = 'social-videos' and public.is_admin())
  with check (bucket_id = 'social-videos' and public.is_admin());

create policy "Admins can delete social videos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'social-videos' and public.is_admin());

-- End of migration. No SELECT policy is added for either bucket — each
-- bucket's `public` flag already makes its objects readable by anyone
-- (customers included) via the public URL, which is what
-- social_videos.image/video_url will eventually store, exactly as
-- categories.image/products.image already do today. A signed-in
-- non-admin account satisfies is_admin() = false and gets no
-- upload/update/delete access on either bucket. The existing
-- category-images and product-images buckets, and every one of their
-- existing policies, are completely untouched by this file. No row is
-- inserted into social_videos or social_video_products by this migration.
-- No Admin UI is created by this migration.
