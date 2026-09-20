-- Tupstore — Admin-managed "Watch Us In Action" videos migration
-- Creates the backend foundation for admin-managed Instagram-style videos,
-- so a future Admin UI can eventually replace src/data/reels.js's
-- MOCK_REELS with real Supabase data — WITHOUT requiring any change to
-- src/features/home/InstagramReels.jsx or InstagramReelModal.jsx, whose
-- existing field names this schema was deliberately shaped to match
-- one-for-one (see the read-only inspection this migration follows).
--
-- BACKEND ONLY. Does not touch: products, categories, product_images,
-- product_features, product_specifications, enquiries, enquiry_items, or
-- any of their existing policies/grants/data. Does not touch any existing
-- Storage bucket or policy — following this project's established
-- incremental pattern (0002 categories table → 0003 category storage;
-- 0005 products table → 0006 product storage), Storage buckets for video
-- files/thumbnails are deliberately left to a separate future migration,
-- not bundled into this one.
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push`, do not paste this into the Dashboard SQL Editor,
-- until it has been explicitly approved. Once approved, apply it manually
-- through the Supabase Dashboard SQL Editor, exactly like every prior
-- migration in this project.
--
-- `create table`/`create policy` have no safe "run twice" form in
-- Postgres for every statement below — this file is safe to review
-- repeatedly but is intended to be run against production exactly once.

-- ── Customer-facing "latest 15" window (query-level, not enforced here) ──
-- The eventual customer-facing read query must be:
--   .eq('is_published', true)
--   .order('created_at', { ascending: false })
--   .order('id', { ascending: false })   -- stable tiebreaker only; no
--                                           chronological meaning of its
--                                           own, just deterministic
--                                           ordering when created_at ties
--   .limit(15)
-- This is a QUERY-level view, re-evaluated fresh on every read — it does
-- NOT cap how many rows this table may hold, nor how many may have
-- is_published = true. Publishing a 16th video does not fail and does not
-- delete/unpublish/archive the previous 15th-newest — that row is simply
-- no longer selected by this LIMIT once a newer row exists, exactly like
-- any other `ORDER BY ... LIMIT n` query. No trigger, cron job, or archive
-- flag is needed or added here to achieve that "sliding window" behavior.
-- `created_at`/`id` already exist below and need no schema change to
-- support this; only the future read-query code (not yet written) must
-- apply this exact ordering + limit, and the frontend must consume
-- whatever that single query returns rather than re-limiting it again
-- with a different, arbitrary count.
--
-- ── A. social_videos ─────────────────────────────────────────────────────
-- Column names deliberately mirror the existing frontend's own field names
-- (see InstagramReels.jsx's JSDoc: id, title, views, duration, image,
-- account, videoUrl, reelUrl) rather than inventing different DB-side
-- names — minimizes/eliminates the mapping layer a future
-- SupabaseReelsRepository-style read path would need.
--
-- `image` is NOT NULL, matching `products.image`'s existing precedent —
-- every card unconditionally renders `reel.image` today (see
-- InstagramReels.jsx), so a video record with no thumbnail would always
-- render broken; same reasoning already applied to products' required
-- main image in an earlier task.
--
-- `video_url`, `reel_url`, `account`, `views`, `duration` are all
-- nullable — every one of today's 4 mock reels already has `videoUrl:
-- null`, and InstagramReels.jsx/InstagramReelModal.jsx already handle a
-- missing videoUrl (falls back to the poster image) and a missing
-- `account` (defaults to '@TUPPERWARE_KERALA') gracefully today, so
-- requiring them here would only make it harder to add an image-only
-- video record later, with no corresponding benefit.
--
-- `views`/`duration` are kept as free text (e.g. "115K views", "0:42"),
-- not numeric — the component displays them verbatim with no formatting
-- step, exactly matching today's mock data shape.
--
-- `sort_order`/`is_published` follow the same conventions already used by
-- `categories.sort_order` (0004) and every admin-managed table's
-- draft-safety needs — a video can be prepared in Admin and only exposed
-- to customers once explicitly published.
create table if not exists social_videos (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  image       text not null,
  video_url   text,
  reel_url    text,
  account     text,
  views       text,
  duration    text,
  sort_order  int not null default 0,
  is_published boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_social_videos_updated_at
  before update on social_videos
  for each row execute function set_updated_at();

create index if not exists idx_social_videos_sort_order on social_videos (sort_order);

-- Partial covering index for the future customer-facing "latest 15
-- published" query (.eq('is_published', true).order('created_at',
-- {ascending:false}).order('id', {ascending:false}).limit(15)) — matches
-- that query's WHERE/ORDER BY exactly, so Postgres can satisfy it with a
-- single index scan instead of a full-table sort as the table grows.
-- `where is_published = true` keeps the index small (only published rows
-- are ever indexed here) and irrelevant to every admin-side query, which
-- reads unpublished rows too via is_admin() and doesn't use this index.
create index if not exists idx_social_videos_published_latest
  on public.social_videos (created_at desc, id desc)
  where is_published = true;

-- ── B. social_video_products ─────────────────────────────────────────────
-- Covers InstagramReelModal.jsx's existing "Tagged Product Cards" feature
-- (currentReel.products — already rendered today for every mock reel that
-- supplies it, including reels with 2 tagged products), which the
-- customer-facing component already fully supports but which the
-- previously-proposed field list omitted. A join table (same shape as
-- product_images/product_features: child table + product_id FK +
-- sort_order) lets one video tag any number of existing products without
-- duplicating any product data — the tagged product's own name/price/
-- image are read via the existing `products` table through this table's
-- `product_id`, never copied here.
--
-- `unique(video_id, product_id)` prevents accidentally tagging the same
-- product twice on the same video — same reasoning as
-- product_specifications' existing unique(product_id, spec_key).
create table if not exists social_video_products (
  id          uuid primary key default gen_random_uuid(),
  video_id    uuid not null references social_videos(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  unique (video_id, product_id)
);

create index if not exists idx_social_video_products_video_id   on social_video_products (video_id);
create index if not exists idx_social_video_products_product_id on social_video_products (product_id);

-- ── C. Row Level Security ────────────────────────────────────────────────
alter table social_videos          enable row level security;
alter table social_video_products  enable row level security;

-- Public read access — published videos only. Deliberately narrower than
-- categories/products' blanket "using (true)" read policy: this table
-- introduces a real draft/publish workflow (is_published), so an
-- unpublished video must never be selectable by `anon` at all, not just
-- hidden by the frontend's own query logic.
create policy "Public read access to published videos" on social_videos
  for select to anon
  using (is_published = true);

-- Tagged-product join rows are only readable by `anon` when their parent
-- video is published — an unpublished video's tagged products stay
-- invisible too, with no separate is_published flag needed on this table.
create policy "Public read access to published video products" on social_video_products
  for select to anon
  using (
    exists (
      select 1 from social_videos v
      where v.id = social_video_products.video_id
        and v.is_published = true
    )
  );

-- Base table privileges — `grant usage on schema public to anon` was
-- already granted by db/schema.sql; only the per-table grants these two
-- new tables still need.
grant select on public.social_videos          to anon;
grant select on public.social_video_products  to anon;

-- ── D. Admin RLS/grants ──────────────────────────────────────────────────
-- Same shape as every admin-gated table in this project (0002/0005):
-- `usage on schema public to authenticated` was already granted by
-- 0001_admin_foundation.sql, so only the per-table grants are repeated
-- here. is_admin() (from 0001) is reused unmodified — no new admin-auth
-- mechanism is introduced.
grant select, insert, update, delete on public.social_videos          to authenticated;
grant select, insert, update, delete on public.social_video_products  to authenticated;

create policy "Admins can select social videos" on social_videos
  for select to authenticated
  using (is_admin());

create policy "Admins can insert social videos" on social_videos
  for insert to authenticated
  with check (is_admin());

create policy "Admins can update social videos" on social_videos
  for update to authenticated
  using (is_admin())
  with check (is_admin());

create policy "Admins can delete social videos" on social_videos
  for delete to authenticated
  using (is_admin());

create policy "Admins can select social video products" on social_video_products
  for select to authenticated
  using (is_admin());

create policy "Admins can insert social video products" on social_video_products
  for insert to authenticated
  with check (is_admin());

create policy "Admins can update social video products" on social_video_products
  for update to authenticated
  using (is_admin())
  with check (is_admin());

create policy "Admins can delete social video products" on social_video_products
  for delete to authenticated
  using (is_admin());

-- End of migration. No existing table, policy, grant, Storage bucket, or
-- row is touched. No row is inserted into either new table — both start
-- empty; the client will add real videos later via a future Admin UI.
-- No customer-facing component (InstagramReels.jsx, InstagramReelModal.jsx,
-- HomePage.jsx) needs any change to keep working exactly as it does today,
-- since MOCK_REELS remains untouched and unreferenced by this migration.
