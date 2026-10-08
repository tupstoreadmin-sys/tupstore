-- 0028 - social_videos.external_video_url
--
-- Lets a Reel be played from an external video link (e.g. a YouTube video or
-- Short) instead of, or in addition to, an uploaded video file.
--
-- Why a new column: the existing columns each already mean something else -
--   video_url  = the uploaded MP4/WebM file in Storage (Admin "Upload Video")
--   reel_url   = the Instagram / Reel page link ("Instagram / Reel URL")
-- so neither can hold the external link without overwriting what it is for,
-- and a Reel must be able to keep an uploaded file AND have an external link
-- (the external link takes priority for playback on the storefront).
--
-- Nullable, no default, nothing is changed for existing rows. No RLS change:
-- the table's existing policies already cover all of its columns. Safe to
-- run more than once.
--
-- Apply BEFORE using the Video URL field in Admin: until it exists, the Admin
-- Social Videos page cannot load (it selects this column). The public
-- storefront falls back gracefully without it.

alter table public.social_videos
  add column if not exists external_video_url text;
