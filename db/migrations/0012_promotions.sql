-- Tupstore — Admin-managed Promotions migration (Step 1: backend only)
-- Creates the backend foundation for a future Promotions Admin feature —
-- STEP 1 ONLY, per the current task's explicit scope. No Admin UI is
-- created by this migration, and Home's existing Featured Highlights
-- section (src/features/home/PromotionStrip.jsx, src/pages/HomePage.jsx)
-- is not connected to this table by this migration — both keep working
-- exactly as they do today, reading `products.featured = true` as they
-- already do. A promotion is a deliberately separate concept from a
-- featured product (see the column-shape notes below).
--
-- BACKEND ONLY. Does not touch: products, categories, product_images,
-- product_features, product_specifications, enquiries, enquiry_items,
-- profiles, social_videos, social_video_products, or any of their existing
-- policies/grants/data. Does not touch any existing Storage bucket or
-- policy — following this project's established incremental pattern (0002
-- table → 0003 storage; 0005 table → 0006 storage; 0008 table → 0009
-- storage), the `promotion-images` Storage bucket is created in a separate
-- follow-up migration (0013), not bundled into this one.
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push`, do not paste this into the Dashboard SQL Editor,
-- until it has been explicitly approved. Once approved, apply it manually
-- through the Supabase Dashboard SQL Editor, exactly like every prior
-- migration in this project. Docker is unavailable in this project, so
-- `supabase db push` is never the intended application path here anyway.
--
-- `create table`/`create policy` have no safe "run twice" form in
-- Postgres for every statement below — this file is safe to review
-- repeatedly but is intended to be run against production exactly once.

-- ── A. promotions ────────────────────────────────────────────────────────
-- A promotion is NOT a product and does not duplicate product fields —
-- no price/original_price/rating/capacity/colors here. It is a marketing
-- card (title/description/image/badge/button) that optionally tags one or
-- more EXISTING catalogue products via promotion_products below, the same
-- "reference, never duplicate" relationship social_video_products already
-- established between social_videos and products.
--
-- Column shape deliberately anticipates (without implementing) a future
-- mapper feeding src/features/home/PromotionStrip.jsx, which today expects
-- a plain {id, title, description, image, badge, buttonText, slug} shape
-- per HomePage.jsx's own toFeaturedHighlight() — `title`/`description`/
-- `image`/`badge` below match those names directly; `button_text` maps to
-- `buttonText` the same snake_case-to-camelCase boundary every existing
-- mapper (productMapper.js, reelMapper.js) already performs. This
-- migration does not write or touch that mapper — it doesn't exist yet.
--
-- `image` is NOT NULL, matching products.image/social_videos.image's
-- existing precedent — every promotion card would need to render an image
-- unconditionally, exactly like every product/reel card already does.
--
-- `button_text` defaults to 'View Offer', matching
-- PromotionStrip.jsx's own existing default prop
-- (buttonLabel = promo.buttonText || promo.cta || 'View Offer') — this is
-- not new copy invented for this migration, it is the literal string
-- already hardcoded as that component's own fallback today.
--
-- `whatsapp_text` is nullable, free text — lets a future admin customize
-- the WhatsApp enquiry message per promotion; PromotionStrip.jsx currently
-- builds that message client-side from promo.title only
-- (`Hi! I want to enquire about the ${promo.title || 'featured'} offer.`)
-- and is not required to use this column later — this migration only adds
-- the storage for that future option, nothing reads it yet.
--
-- `is_active`/`sort_order` follow the exact same draft-safety + ordering
-- convention as social_videos.is_published/sort_order (0008) and
-- categories.sort_order (0004) — a promotion can be prepared in a future
-- Admin UI and only exposed to customers once explicitly activated.
-- Deliberately no start_date/end_date — not requested for this step.
create table if not exists promotions (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  image         text not null,
  badge         text,
  button_text   text not null default 'View Offer',
  whatsapp_text text,
  is_active     boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Reuses the existing set_updated_at() function (db/schema.sql) — no
-- duplicate trigger function is created; this is the same function
-- trg_profiles_updated_at/trg_categories_updated_at/trg_products_updated_at/
-- trg_social_videos_updated_at already all execute.
create trigger trg_promotions_updated_at
  before update on promotions
  for each row execute function set_updated_at();

-- Partial covering index for the future customer-facing read query
-- (.eq('is_active', true).order('sort_order')) — matches that query's
-- WHERE/ORDER BY exactly, so Postgres can satisfy it with a single index
-- scan as the table grows. `where is_active = true` keeps the index small
-- and irrelevant to admin-side queries, which read inactive rows too via
-- is_admin() and don't use this index — same reasoning as
-- idx_social_videos_published_latest (0008).
create index if not exists idx_promotions_active_sort_order
  on public.promotions (sort_order)
  where is_active = true;

-- General-purpose admin-listing index (newest-first), matching
-- AdminSocialVideosPage's own existing `.order('created_at', {ascending:
-- false})` admin-list convention — not partial, since a future Admin
-- Promotions list needs to see inactive rows too.
create index if not exists idx_promotions_created_at
  on public.promotions (created_at desc);

-- ── B. promotion_products ────────────────────────────────────────────────
-- Same shape as social_video_products (0008): join table + product_id FK +
-- sort_order, letting one promotion tag any number of EXISTING catalogue
-- products without duplicating any product data — a tagged product's own
-- name/price/image/etc. are always read live via `products`, through this
-- table's `product_id`, never copied here.
--
-- `unique(promotion_id, product_id)` prevents accidentally tagging the
-- same product twice on the same promotion — same reasoning as
-- product_specifications' unique(product_id, spec_key) and
-- social_video_products' unique(video_id, product_id).
create table if not exists promotion_products (
  id            uuid primary key default gen_random_uuid(),
  promotion_id  uuid not null references public.promotions(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete cascade,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  unique (promotion_id, product_id)
);

create index if not exists idx_promotion_products_promotion_id
  on public.promotion_products (promotion_id);

create index if not exists idx_promotion_products_product_id
  on public.promotion_products (product_id);

-- ── C. Row Level Security ────────────────────────────────────────────────
alter table promotions          enable row level security;
alter table promotion_products  enable row level security;

-- Public read access — active promotions only. Deliberately narrower than
-- categories/products' blanket "using (true)" read policy, exactly
-- mirroring social_videos' own is_published-gated policy: this table has a
-- real draft/activate workflow, so an inactive promotion must never be
-- selectable by `anon` at all, not just hidden by frontend query logic.
create policy "Public read access to active promotions" on promotions
  for select to anon
  using (is_active = true);

-- Tagged-product join rows are only readable by `anon` when their parent
-- promotion is active — an inactive promotion's tagged products stay
-- invisible too, with no separate is_active flag needed on this table.
-- This is the exact same shape as social_video_products' own anon policy
-- (0008) and is what prevents promotion_products from ever leaking which
-- products belong to an inactive promotion.
create policy "Public read access to active promotion products" on promotion_products
  for select to anon
  using (
    exists (
      select 1 from promotions p
      where p.id = promotion_products.promotion_id
        and p.is_active = true
    )
  );

-- Base table privileges — `grant usage on schema public to anon` was
-- already granted by db/schema.sql; only the per-table grants these two
-- new tables still need.
grant select on public.promotions          to anon;
grant select on public.promotion_products  to anon;

-- ── D. Admin RLS/grants ──────────────────────────────────────────────────
-- Same shape as every admin-gated table in this project (0002/0005/0008):
-- `usage on schema public to authenticated` was already granted by
-- 0001_admin_foundation.sql, so only the per-table grants are repeated
-- here. is_admin() (from 0001) is reused unmodified — no new admin-auth
-- mechanism is introduced, and no policy here bypasses it.
grant select, insert, update, delete on public.promotions          to authenticated;
grant select, insert, update, delete on public.promotion_products  to authenticated;

create policy "Admins can select promotions" on promotions
  for select to authenticated
  using (is_admin());

create policy "Admins can insert promotions" on promotions
  for insert to authenticated
  with check (is_admin());

create policy "Admins can update promotions" on promotions
  for update to authenticated
  using (is_admin())
  with check (is_admin());

create policy "Admins can delete promotions" on promotions
  for delete to authenticated
  using (is_admin());

create policy "Admins can select promotion products" on promotion_products
  for select to authenticated
  using (is_admin());

create policy "Admins can insert promotion products" on promotion_products
  for insert to authenticated
  with check (is_admin());

create policy "Admins can update promotion products" on promotion_products
  for update to authenticated
  using (is_admin())
  with check (is_admin());

create policy "Admins can delete promotion products" on promotion_products
  for delete to authenticated
  using (is_admin());

-- End of migration. No existing table, policy, grant, Storage bucket, or
-- row is touched. No row is inserted into either new table — both start
-- empty; a future Admin UI (not built by this migration) will add real
-- promotions later. No customer-facing component (PromotionStrip.jsx,
-- HomePage.jsx, or any other) needs any change to keep working exactly as
-- it does today, since this migration is not referenced by any existing
-- frontend code. See db/migrations/0013_promotion_storage.sql for the
-- companion Storage bucket + policies (kept separate, matching this
-- project's established table-migration/storage-migration split).
