-- Tupstore — Admin-managed Hero Slides migration (Step 1: backend only)
-- Creates the backend foundation for a future Admin Hero Slides feature —
-- STEP 1 ONLY, per the current task's explicit scope. No Admin UI table is
-- referenced by the customer-facing Hero yet: Home's existing carousel
-- (src/features/home/HeroCarousel.jsx, src/pages/HomePage.jsx) keeps
-- reading MOCK_HERO_SLIDES exactly as it does today — this migration is
-- not connected to it in any way.
--
-- BACKEND ONLY. Does not touch: products, categories, product_images,
-- product_features, product_specifications, enquiries, enquiry_items,
-- newsletter_subscribers, profiles, social_videos, social_video_products,
-- promotions, promotion_products, or any of their existing
-- policies/grants/data. Does not touch any existing Storage bucket or
-- policy — following this project's established incremental pattern (0002
-- table → 0003 storage; 0005 table → 0006 storage; 0008 table → 0009
-- storage; 0012 table → 0013 storage), the `hero-images` Storage bucket is
-- created in a separate follow-up migration (0020), not bundled here.
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

-- ── A. hero_slides ───────────────────────────────────────────────────────
-- Column shape matches the current customer-facing MOCK_HERO_SLIDES shape
-- (src/data/promotions.js) where a direct equivalent exists (title, image,
-- two CTAs, a list of trust-badge-style feature bullets via
-- hero_slide_features below), plus badge/mobile_image/alt_text/is_active/
-- sort_order, matching this project's established draft-safety +
-- ordering convention (social_videos.is_published/sort_order 0008,
-- categories.sort_order 0004, promotions.is_active/sort_order 0012).
--
-- `image` is NOT NULL (the required desktop hero image); `mobile_image` is
-- nullable — a slide without one is expected to fall back to `image` on
-- small screens, matching how every other optional-secondary-image field
-- in this project (product_images beyond the first, social video
-- thumbnails) already tolerates absence. Neither column is connected to
-- the customer-facing Hero by this migration.
--
-- Two independent CTA button slots (button1_*/button2_*), matching the
-- current MOCK_HERO_SLIDES' primaryCta/secondaryCta shape exactly — never
-- more than two, matching the approved Hero design's fixed two-button
-- layout (not modified by this migration).
--
-- BUTTON TYPES — "do not make button destinations unrestricted by
-- default": each button1_type/button2_type is constrained by a CHECK to
-- exactly one of 'category' | 'product' | 'whatsapp' | 'url' (or NULL,
-- meaning that button slot is unused). This is enforced at the database
-- level, not only in the future Admin UI, matching this project's existing
-- enquiries.status CHECK-constraint precedent (db/schema.sql).
--
-- button1_target/button2_target are plain `text`, deliberately NOT a
-- foreign key — this is the one polymorphic reference in this schema
-- (every other FK in this project points at exactly one table). Depending
-- on the sibling *_type column, a target holds: a categories.id (type =
-- 'category'), a products.id (type = 'product'), an arbitrary external URL
-- (type = 'url'), or is unused/NULL (type = 'whatsapp' — that CTA is
-- expected to use the existing site-wide STORE_WHATSAPP_NUMBER
-- configuration from src/utils/whatsapp.js, never a per-slide number
-- stored here). A real categories/products FK is intentionally not
-- possible on a single polymorphic column; validity is the responsibility
-- of the future Admin UI's picker (select an existing category/product)
-- plus this CHECK constraint, exactly as scoped by this task.
--
-- No row is inserted by this migration — the table starts empty. No
-- current Hero button destination (/shop, wa.me, etc.) is hardcoded here,
-- per this task's explicit instruction.
create table if not exists hero_slides (
  id            uuid primary key default gen_random_uuid(),
  badge         text,
  title         text not null,
  image         text not null,
  mobile_image  text,
  alt_text      text,
  button1_text   text,
  button1_type   text,
  button1_target text,
  button2_text   text,
  button2_type   text,
  button2_target text,
  is_active     boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint hero_slides_button1_type_check
    check (button1_type is null or button1_type in ('category', 'product', 'whatsapp', 'url')),
  constraint hero_slides_button2_type_check
    check (button2_type is null or button2_type in ('category', 'product', 'whatsapp', 'url'))
);

-- Reuses the existing set_updated_at() function (db/schema.sql) — no
-- duplicate trigger function is created; this is the same function
-- trg_profiles_updated_at/trg_categories_updated_at/trg_products_updated_at/
-- trg_social_videos_updated_at/trg_promotions_updated_at already all
-- execute.
create trigger trg_hero_slides_updated_at
  before update on hero_slides
  for each row execute function set_updated_at();

-- Partial covering index for a future customer-facing read query
-- (.eq('is_active', true).order('sort_order')) — matches that query's
-- WHERE/ORDER BY exactly, same reasoning as idx_promotions_active_sort_order
-- (0012)/idx_social_videos_published_latest (0008). Not used by this
-- migration or any current frontend code.
create index if not exists idx_hero_slides_active_sort_order
  on public.hero_slides (sort_order)
  where is_active = true;

-- General-purpose admin-listing index (newest-first), matching
-- idx_promotions_created_at (0012)'s own precedent — a future Admin Hero
-- list needs to see inactive rows too.
create index if not exists idx_hero_slides_created_at
  on public.hero_slides (created_at desc);

-- ── B. hero_slide_features ───────────────────────────────────────────────
-- Same shape/role as product_features (db/schema.sql): a small ordered
-- bullet list attached to one parent, with replace-all update semantics
-- (see adminHeroApi.js's replaceHeroSlideFeatures()) matching
-- saveProductFeatures()/replaceTaggedPromotionProducts() exactly. Column
-- named `text` per this task's explicit column list — legal as a Postgres
-- identifier (not a reserved word) and consistent with product_features'
-- own `label` column serving the identical role under a different name.
--
-- No updated_at/trigger — matches product_features' own precedent (a
-- bullet is deleted and re-inserted on edit, never updated in place).
create table if not exists hero_slide_features (
  id            uuid primary key default gen_random_uuid(),
  hero_slide_id uuid not null references public.hero_slides(id) on delete cascade,
  text          text not null,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists idx_hero_slide_features_hero_slide_id
  on public.hero_slide_features (hero_slide_id);

-- ── C. Row Level Security ────────────────────────────────────────────────
alter table hero_slides          enable row level security;
alter table hero_slide_features  enable row level security;

-- Public read access — active slides only, matching promotions' own
-- is_active-gated policy exactly (0012): this table has a real
-- draft/activate workflow, so an inactive slide must never be selectable
-- by `anon` at all, not just hidden by frontend query logic.
create policy "Public read access to active hero slides" on hero_slides
  for select to anon
  using (is_active = true);

-- Feature-bullet rows are only readable by `anon` when their parent slide
-- is active — an inactive slide's bullets stay invisible too, with no
-- separate is_active flag needed on this table. Same shape as
-- promotion_products' own anon policy (0012).
create policy "Public read access to active hero slide features" on hero_slide_features
  for select to anon
  using (
    exists (
      select 1 from hero_slides h
      where h.id = hero_slide_features.hero_slide_id
        and h.is_active = true
    )
  );

-- Base table privileges — `grant usage on schema public to anon` was
-- already granted by db/schema.sql; only the per-table grants these two
-- new tables still need.
grant select on public.hero_slides          to anon;
grant select on public.hero_slide_features  to anon;

-- ── D. Admin RLS/grants ──────────────────────────────────────────────────
-- Same shape as every admin-gated table in this project (0002/0005/0008/
-- 0012): `usage on schema public to authenticated` was already granted by
-- 0001_admin_foundation.sql, so only the per-table grants are repeated
-- here. is_admin() (from 0001) is reused unmodified — no new admin-auth
-- mechanism is introduced, and no policy here bypasses it.
--
-- LEARNED FROM THIS PROJECT'S OWN HISTORY: 0016/0017 had to retroactively
-- grant `service_role` SELECT on enquiries/enquiry_items/products because
-- no table in this project ever receives that grant by default. No
-- service-role-only Edge Function reads hero_slides in this phase, so no
-- service_role grant is added here — if a future phase adds one, it must
-- be granted explicitly then, exactly like 0016/0017 had to.
grant select, insert, update, delete on public.hero_slides          to authenticated;
grant select, insert, update, delete on public.hero_slide_features  to authenticated;

create policy "Admins can select hero slides" on hero_slides
  for select to authenticated
  using (is_admin());

create policy "Admins can insert hero slides" on hero_slides
  for insert to authenticated
  with check (is_admin());

create policy "Admins can update hero slides" on hero_slides
  for update to authenticated
  using (is_admin())
  with check (is_admin());

create policy "Admins can delete hero slides" on hero_slides
  for delete to authenticated
  using (is_admin());

create policy "Admins can select hero slide features" on hero_slide_features
  for select to authenticated
  using (is_admin());

create policy "Admins can insert hero slide features" on hero_slide_features
  for insert to authenticated
  with check (is_admin());

create policy "Admins can update hero slide features" on hero_slide_features
  for update to authenticated
  using (is_admin())
  with check (is_admin());

create policy "Admins can delete hero slide features" on hero_slide_features
  for delete to authenticated
  using (is_admin());

-- End of migration. No existing table, policy, grant, Storage bucket, or
-- row is touched. No row is inserted into either new table — both start
-- empty; a future Admin UI (not built by this migration) will add real
-- Hero slides later. The customer-facing Hero (HeroCarousel.jsx,
-- HomePage.jsx) needs no change to keep working exactly as it does today,
-- since this migration is not referenced by any existing frontend code.
-- See db/migrations/0020_hero_slide_storage.sql for the companion Storage
-- bucket + policies (kept separate, matching this project's established
-- table-migration/storage-migration split).
