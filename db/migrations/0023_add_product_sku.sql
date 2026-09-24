-- Tupstore — Add Product SKU migration
-- Client requirement: a separate SKU identifier for products, distinct
-- from the existing `product_code` (Product Code / Item Number, added in
-- 0005_admin_products.sql). Both columns coexist — this migration does
-- not touch `product_code`, its unique constraint, its data, or any other
-- product field.
--
-- CONFIRMED LIVE STATE BEFORE THIS MIGRATION (direct introspection, not
-- assumed): all 4 current production products have `product_code = NULL`
-- (never populated) — Classic Airtight Container Set, Stackable Spice
-- Organizer, Eco Bottle 1L, Insulated Lunch Box. None have an `sku` value
-- either, since the column does not exist yet. No SKU value is invented or
-- backfilled for any existing product by this migration — every row gets
-- `sku = NULL`, exactly like `product_code` did in 0005.
--
-- Added NULLABLE (not NOT NULL) for the same reason product_code was:
-- existing products have no SKU today, and a NOT NULL column could not be
-- added without either inventing values or leaving rows unable to save.
-- A future migration can add `not null` once every product has a real SKU
-- — not part of this migration, not performed now.
--
-- Naming matches the existing convention: `products_product_code_key` is
-- Postgres's default auto-generated name for a single-column UNIQUE
-- constraint (`products_<column>_key`) — `products_sku_key` follows the
-- same pattern, confirmed via pg_constraint/pg_indexes introspection
-- before writing this file (no existing constraint/index with that name).
--
-- Idempotent/rerun-safe as explicitly requested: `add column if not
-- exists` for the column, and a guarded DO block for the constraint since
-- Postgres has no `add constraint if not exists` form.

alter table products add column if not exists sku text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_sku_key'
  ) then
    alter table products add constraint products_sku_key unique (sku);
  end if;
end $$;

-- End of migration. `sku` is nullable and unique when present; no existing
-- product_code, slug, price, category, or other product data is touched;
-- no RLS policy is added or changed (the existing admin-gated CRUD +
-- public-select policies on `products`, defined in 0005_admin_products.sql,
-- already cover every column on the table, including this new one).
