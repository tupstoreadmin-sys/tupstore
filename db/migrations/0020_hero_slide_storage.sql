-- Tupstore — Admin Hero Slide Storage migration
-- Creates the `hero-images` Storage bucket (public read) and admin-gated
-- policies on storage.objects, restricted to public.is_admin() = true
-- (defined in db/migrations/0001_admin_foundation.sql). Follows the exact
-- pattern established in 0003_admin_category_storage.sql/
-- 0006_admin_product_storage.sql/0009_social_video_storage.sql/
-- 0013_promotion_storage.sql.
--
-- Does NOT touch: categories, products, product_images, product_features,
-- product_specifications, enquiries, enquiry_items, newsletter_subscribers,
-- profiles, social_videos, social_video_products, promotions,
-- promotion_products, hero_slides, hero_slide_features (the table
-- migration, 0019, is separate and already applied by the time this runs),
-- or any of their policies/grants. Does NOT touch the existing
-- category-images, product-images, social-video-thumbnails,
-- social-videos, or promotion-images buckets, or ANY of their policies —
-- every policy below is scoped to bucket_id = 'hero-images' only, and
-- every policy name below is distinct from every prior bucket's own policy
-- names, so nothing here can collide with or shadow an existing policy.
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push`, do not paste this into the Dashboard SQL Editor, and
-- do not create the bucket via the Dashboard UI, until this has been
-- explicitly approved. Docker is unavailable in this project, so
-- `supabase db push` is never the intended application path here anyway.
--
-- Unlike the plain `public` schema tables in db/schema.sql, storage.objects
-- and storage.buckets are managed by the Supabase Storage extension and
-- already ship with the base GRANTs `authenticated`/`anon` need — only RLS
-- policies (below) are required to gate actual access; no `grant ...`
-- statements are needed here, same as every prior Storage migration.
--
-- LEARNED FROM THIS PROJECT'S OWN HISTORY (not a hypothetical): the first
-- three Storage migrations (0003, 0006, 0009) each omitted an admin SELECT
-- policy, and each had to be followed by a separate fix migration (0010,
-- 0011) once real QA found that Supabase Storage's list()/remove()/
-- update() resolve their target object(s) via an RLS-gated SELECT against
-- storage.objects BEFORE acting — without SELECT, list() silently returns
-- an empty array and remove() silently deletes nothing, both with no
-- error. 0013 already included the admin SELECT policy from the start;
-- this migration does the same, to avoid repeating that same gap a fifth
-- time on a fifth bucket.
--
-- Object naming (documented here for the Admin upload code in
-- adminHeroApi.js, which this migration does not write): flat
-- `${crypto.randomUUID()}.${extension}`, matching category-images'/
-- social-video-thumbnails'/promotion-images' existing flat convention
-- (never product-images' per-record-folder convention) — one hero slide
-- has exactly two possible images (desktop, mobile), not a multi-image
-- gallery, so there is no per-record collection to namespace by folder.
-- Both the desktop and mobile image share this one bucket.
--
-- No automatic deletion of a previous image when a hero slide record is
-- later updated is added here or intended later at this stage — matching
-- every existing bucket's own precedent, where a replaced image's old
-- Storage object is likewise never auto-deleted by any policy or trigger
-- in this project. Any future cleanup remains a deliberate, separate,
-- explicitly-approved decision, not silent housekeeping logic.

-- ── Bucket: hero-images ──────────────────────────────────────────────────
-- `public = true`, matching every existing image bucket — lets the
-- storefront load hero images via Storage's public URL scheme without
-- needing a SELECT policy for that path; public buckets serve reads
-- outside RLS entirely. Only writes (insert/update/delete) and the admin
-- data-plane SELECT below are gated by policy. The customer-facing Hero is
-- NOT connected to this bucket in this phase — see 0019's own header note.
--
-- `file_size_limit`/`allowed_mime_types` are set directly on the bucket
-- row, matching category-images/product-images/social-video-thumbnails/
-- promotion-images' precedent exactly — defense-in-depth even if a future
-- admin upload path's own client-side check were ever bypassed or buggy.
--
-- 5 MB / JPG-PNG-WebP matches every existing image bucket exactly
-- (adminHeroApi.js's own MAX_IMAGE_BYTES = 5 * 1024 * 1024). JPG and JPEG
-- are the same MIME type (image/jpeg) — no separate entry needed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hero-images',
  'hero-images',
  true,
  5242880, -- 5 MB, in bytes (5 * 1024 * 1024) — matches every existing image bucket
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ── Admin-gated policies ─────────────────────────────────────────────────
-- Every policy is scoped to bucket_id = 'hero-images' so it can never
-- affect any other bucket, and every policy requires is_admin() — a
-- signed-in non-admin account satisfies none of these, identical to every
-- existing bucket's security model. No public/anon insert, update, or
-- delete policy is added, and no service-role credential is used or
-- referenced anywhere in this file.
create policy "Admins can upload hero images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'hero-images' and public.is_admin());

create policy "Admins can update hero images" on storage.objects
  for update to authenticated
  using (bucket_id = 'hero-images' and public.is_admin())
  with check (bucket_id = 'hero-images' and public.is_admin());

create policy "Admins can delete hero images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'hero-images' and public.is_admin());

-- Admin SELECT — required for the admin upload/manage UI's list()/
-- remove()/update() calls to actually see their own target objects (see
-- the project-history note above). Deliberately NOT an anon SELECT policy:
-- public customer reads must keep working exactly as every other bucket's
-- already does, through the public-URL endpoint only, never through an
-- RLS-gated storage.objects query — adding anon SELECT here would be
-- unnecessary (reads already work without it) and would needlessly widen
-- what an anonymous request can query.
create policy "Admins can view hero images" on storage.objects
  for select to authenticated
  using (bucket_id = 'hero-images' and public.is_admin());

-- End of migration. No bucket configuration, no existing policy, no table,
-- and no frontend file is touched by this file. A signed-in non-admin
-- account satisfies is_admin() = false and gets no upload/update/delete/
-- list access to this bucket either; public customer reads are unaffected,
-- since they never go through storage.objects RLS in the first place. No
-- Admin UI is created by this migration.
