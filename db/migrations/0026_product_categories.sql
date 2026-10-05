-- Tupstore — Multiple categories per product + Draft/Published status
--
-- Two related client requirements, one migration:
--
--  1. Multiple categories per product. A product can be listed under several
--     categories (e.g. DRY STORAGES + MUST HAVES + TRENDING NOW). Adds a
--     many-to-many junction table, product_categories, backfilled from the
--     existing single products.category_id so no current relationship is lost.
--
--  2. Draft / Published status. Products are bulk-created without images,
--     prices or categories, completed one by one in Admin, and only then made
--     visible. Adds products.status ('draft' | 'published'):
--       * every EXISTING product becomes 'published' (so the live storefront
--         is unchanged — the 4 current products keep appearing),
--       * every NEW product defaults to 'draft',
--       * the public (anon) role can only read published products — enforced
--         here in the database by RLS, not just in frontend queries.
--
-- Does NOT modify migrations 0001–0025, and does NOT touch enquiries,
-- enquiry_items, promotions, promotion_products, or any existing product
-- row's data other than the new status column described above.
--
-- products.category_id is KEPT (not dropped) and relaxed to NULLABLE:
--   * It continues to hold each product's "primary" category (the first one
--     selected in Admin), so storefront code that still reads one category
--     per product — the Product Detail "Category:" label and banner image —
--     keeps working unchanged, and any rollback is trivial.
--   * Nullable so draft products can exist before a category is chosen. The
--     junction table is the source of truth for category listings.
--   The on-delete-restrict FK on products.category_id is unchanged.
--
-- NOT applied automatically. Review only — apply manually through the
-- Supabase Dashboard SQL Editor, exactly like every prior migration.
-- Wrapped in one transaction so the policy swap in section D can never be
-- left half-applied. Safe to re-run: add column / create table / create index
-- use IF NOT EXISTS, the backfill uses ON CONFLICT DO NOTHING, policies are
-- dropped-then-created, and NO statement re-publishes or re-drafts existing
-- products on a second run.

begin;

-- ── A. Product status ────────────────────────────────────────────────────
-- ADD COLUMN with DEFAULT 'published' stamps every row that exists right now
-- as published (metadata-only on Postgres 11+, no table rewrite). The default
-- is then switched to 'draft' for all FUTURE inserts. The CHECK keeps any
-- other value from ever being stored.
alter table products
  add column if not exists status text not null default 'published'
  constraint products_status_check check (status in ('draft', 'published'));

alter table products alter column status set default 'draft';

create index if not exists idx_products_status
  on public.products (status);

-- ── B. Junction table ────────────────────────────────────────────────────
-- product_id cascades: deleting a product removes its category links.
-- category_id cascades as well (as applied to production): deleting a
-- category removes the product↔category links pointing at it. The products
-- themselves are never deleted, and the separate on-delete-restrict FK on
-- products.category_id still blocks deleting a category that is some
-- product's primary category.
create table if not exists product_categories (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (product_id, category_id)
);

-- unique (product_id, category_id) already provides the product_id-leading
-- index; only the reverse lookup (all products in a category — the
-- storefront category listing) needs its own.
create index if not exists idx_product_categories_category_id
  on public.product_categories (category_id);

-- Backfill from the existing single category.
insert into product_categories (product_id, category_id)
select id, category_id
from products
where category_id is not null
on conflict (product_id, category_id) do nothing;

-- ── C. Allow products with no category yet ──────────────────────────────
alter table products alter column category_id drop not null;

-- ── D. Row Level Security ───────────────────────────────────────────────
-- products: replace the anon blanket-read policy ("Public read access",
-- using (true), db/schema.sql) with a published-only one. Admin policies
-- (0005: "Admins can select products" etc., authenticated + is_admin()) are
-- untouched, so Admin keeps seeing — and managing — drafts and published
-- alike. This also covers every embed of products in a public query
-- (promotion_products, social_video_products): a draft simply comes back as
-- null there, which the existing mappers already skip.
drop policy if exists "Public read access" on products;
drop policy if exists "Public read access to published products" on products;
create policy "Public read access to published products" on products
  for select to anon
  using (status = 'published');

alter table product_categories enable row level security;

-- Public read of the mapping is limited to published products so draft
-- products' category assignments are not exposed either.
drop policy if exists "Public read access" on product_categories;
drop policy if exists "Public read access to published product categories" on product_categories;
create policy "Public read access to published product categories" on product_categories
  for select to anon
  using (
    exists (
      select 1 from products p
      where p.id = product_categories.product_id
        and p.status = 'published'
    )
  );

grant select on public.product_categories to anon;

-- Admin CRUD, gated by the existing public.is_admin() (0001) — same shape
-- as product_images/product_features in 0005.
grant select, insert, update, delete on public.product_categories to authenticated;

drop policy if exists "Admins can select product categories" on product_categories;
create policy "Admins can select product categories" on product_categories
  for select to authenticated
  using (is_admin());

drop policy if exists "Admins can insert product categories" on product_categories;
create policy "Admins can insert product categories" on product_categories
  for insert to authenticated
  with check (is_admin());

drop policy if exists "Admins can update product categories" on product_categories;
create policy "Admins can update product categories" on product_categories
  for update to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "Admins can delete product categories" on product_categories;
create policy "Admins can delete product categories" on product_categories
  for delete to authenticated
  using (is_admin());

commit;

-- End of migration. No existing product, category, enquiry, or promotion row
-- is modified: the 4 existing products only gain status = 'published' and keep
-- every other value (including category_id, which is only made nullable).
-- products.image is intentionally NOT altered: image-less products use the
-- project's existing empty-string convention (products.image stays
-- NOT NULL; '' means "no image yet") and live as drafts until completed.
