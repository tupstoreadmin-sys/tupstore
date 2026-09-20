-- Tupstore — Social Video Storage SELECT policy migration
-- Adds ONLY the two admin-gated SELECT policies that
-- db/migrations/0009_social_video_storage.sql omitted, on the same two
-- buckets it created (social-video-thumbnails, social-videos). Nothing
-- else changes.
--
-- WHY THIS IS NEEDED (found during Step 2 QA, not a hypothetical):
-- Supabase Storage's list()/remove()/update() operations resolve their
-- target object(s) via an RLS-gated SELECT against storage.objects BEFORE
-- applying the list/delete/update itself. 0009 gave `authenticated`
-- INSERT/UPDATE/DELETE policies on these two buckets but no SELECT policy
-- — matching db/migrations/0003_admin_category_storage.sql's and
-- 0006_admin_product_storage.sql's identical precedent, which has the same
-- gap. Without SELECT, that internal lookup finds zero rows for an admin
-- session, so:
--   - supabase.storage.from(bucket).list() returns an empty list even when
--     objects exist,
--   - supabase.storage.from(bucket).remove([path]) returns
--     { data: [], error: null } — no error, but nothing is actually
--     deleted, even for a real, existing, correctly-authenticated admin
--     request.
-- This was verified directly against production during Step 2 QA: a
-- real just-uploaded thumbnail and video file were confirmed to still be
-- fetchable via their public URLs immediately after remove() reported
-- success with zero objects removed.
--
-- WHY A SELECT POLICY IS SAFE HERE (does not affect customer-facing
-- reads): both buckets have `public = true` (set in 0009). A public
-- bucket's objects are served to anyone, including anon, through
-- Storage's public-URL endpoint (`/storage/v1/object/public/<bucket>/...`)
-- entirely OUTSIDE of storage.objects' RLS — that is what
-- social_videos.image/video_url already resolve to, and it is what let
-- thumbnails/videos load correctly throughout Step 2 QA with zero SELECT
-- policy in place. RLS SELECT policies on storage.objects only gate
-- queries made THROUGH the Storage API's authenticated data plane (list/
-- remove/update's internal lookup, or a future admin file browser) — they
-- have no effect on the public read path. Scoping this SELECT policy to
-- `to authenticated ... and public.is_admin()` (identical shape to 0009's
-- own INSERT/UPDATE/DELETE policies) means a non-admin authenticated user
-- still cannot see these objects via the Storage API either — only an
-- admin session gains anything here.
--
-- Deliberately NOT added: an anon SELECT policy. Public customer reads
-- must keep working exactly as they do today, through the public-URL
-- endpoint only, never through an RLS-gated storage.objects query — adding
-- anon SELECT here would be unnecessary (reads already work without it)
-- and would needlessly widen what an anonymous request can query.
--
-- Does NOT touch: bucket rows (social-video-thumbnails, social-videos —
-- no change to public/file_size_limit/allowed_mime_types), the six
-- existing INSERT/UPDATE/DELETE policies from 0009, social_videos,
-- social_video_products, products, categories, or any of their policies/
-- grants. Does NOT touch category-images, product-images, or any of their
-- policies. Does NOT touch any customer-facing file.
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push` and do not paste this into the Dashboard SQL Editor
-- until it has been explicitly approved. Once approved, apply it manually
-- through the Supabase Dashboard SQL Editor, exactly like every prior
-- migration in this project.

create policy "Admins can view social video thumbnails" on storage.objects
  for select to authenticated
  using (bucket_id = 'social-video-thumbnails' and public.is_admin());

create policy "Admins can view social videos" on storage.objects
  for select to authenticated
  using (bucket_id = 'social-videos' and public.is_admin());

-- End of migration. No bucket configuration, no existing policy, no
-- table, and no frontend file is touched by this file. A signed-in
-- non-admin account satisfies is_admin() = false and still cannot see
-- these objects via the Storage API; public customer reads are
-- unaffected, since they never went through storage.objects RLS in the
-- first place.
