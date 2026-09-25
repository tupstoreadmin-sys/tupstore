-- Tupstore — Promotion Detail Page + Combo Enquiry migration
-- Adds the minimum schema needed for Promotions to become an independent,
-- routable, priced combo/offer entity (client decision — Promotions are no
-- longer a proxy for a single tagged product) and for an enquiry to be
-- attributed to a promotion instead of only ever to individual products.
--
-- Does NOT touch: categories, products, product_images, product_features,
-- product_specifications, social_videos, social_video_products,
-- promotion_products, enquiry_items, profiles, newsletter_subscribers,
-- hero_slides, or any of their existing policies/grants/data. Does not
-- rewrite or amend any previously-applied migration (0001–0023).
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push`, do not paste this into the Dashboard SQL Editor,
-- until it has been explicitly approved. Once approved, apply it manually
-- through the Supabase Dashboard SQL Editor, exactly like every prior
-- migration in this project.
--
-- Idempotent/rerun-safe: `add column if not exists` for every column,
-- guarded `do $$ if not exists $$` blocks for every constraint (Postgres
-- has no `add constraint if not exists` form) — same pattern as
-- 0023_add_product_sku.sql.

-- ── A. promotions: slug + offer pricing ────────────────────────────────

alter table promotions add column if not exists slug text;
alter table promotions add column if not exists price numeric(10,2);
alter table promotions add column if not exists original_price numeric(10,2);

-- Backfill slug for the 3 currently live promotions (verified by direct
-- read-only introspection immediately before writing this migration — real
-- ids, real titles, never guessed). Every future promotion supplies its own
-- slug via the Admin form (client-side slugify, same algorithm/precedent as
-- products/categories) before this column is locked NOT NULL below.
update promotions set slug = 'premia-glass-borosilicate-series'
  where id = '6e42cd3e-c2fd-48a9-8dc2-fd7ccbcc2460' and slug is null;
update promotions set slug = 'executive-lunch-box-hydration-flask'
  where id = '4f01570f-f622-440d-9a72-4fcc84ba07bb' and slug is null;
update promotions set slug = 'aquasafe-1l-pastel-flip-top-set'
  where id = '256ede13-f8c7-4acb-ba78-b15547ec4404' and slug is null;

-- Unique slug, matching products_slug_key's existing precedent (db/schema.sql).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'promotions_slug_key'
  ) then
    alter table promotions add constraint promotions_slug_key unique (slug);
  end if;
end $$;

-- price/original_price stay NULLABLE (existing promotions may have neither
-- until an admin fills them in) — only constrained to be strictly positive
-- *when provided*, never required. No calculated-discount column: the
-- frontend derives "original_price > price" itself (see ProductPrice.jsx),
-- exactly like products.price/original_price already work today.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'promotions_price_positive'
  ) then
    alter table promotions add constraint promotions_price_positive
      check (price is null or price > 0);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'promotions_original_price_positive'
  ) then
    alter table promotions add constraint promotions_original_price_positive
      check (original_price is null or original_price > 0);
  end if;
end $$;

-- slug becomes required only after the 3 existing rows are backfilled above
-- — every promotion needs a real /promotion/:slug destination for "View
-- Offer" to route to; price/original_price are deliberately left nullable
-- per this task's own explicit instruction.
alter table promotions alter column slug set not null;

-- No RLS/policy change needed for these 3 new columns: promotions' existing
-- policies (0012_promotions.sql) are row-level ("Public read access to
-- active promotions" / admin-gated CRUD), not column-level, so they already
-- cover slug/price/original_price exactly like every other existing column.

-- ── B. enquiries: optional promotion attribution ───────────────────────

-- Nullable FK — NULL for every existing/ordinary product enquiry (zero
-- behavior change there). `on delete set null` (not `restrict`, unlike
-- products(id) in enquiry_items) because a promotion is marketing content
-- an admin should be able to remove later without being permanently
-- blocked by old enquiry history — the enquiry row itself is preserved
-- either way, it just loses the promotion label if that promotion is later
-- deleted.
alter table enquiries add column if not exists promotion_id uuid
  references public.promotions(id) on delete set null;

create index if not exists idx_enquiries_promotion_id
  on public.enquiries (promotion_id);

-- No RLS/policy change needed: `anon`'s existing "Public insert access" on
-- enquiries (db/schema.sql) is `with check (true)` — unconditional, already
-- allows inserting any column value including promotion_id. Admin's
-- existing (undocumented, pre-existing per 0014_admin_enquiries.sql's own
-- note) SELECT access is whole-row, so it already covers this new column
-- too. `anon` still has no SELECT on enquiries at all — this migration does
-- not change that, so no customer-facing enquiry data is newly exposed.

-- End of migration. No existing promotions/enquiries row, policy, or grant
-- is altered beyond the 3 explicit slug backfills above. No product,
-- category, promotion_products, or enquiry_items row is touched.
