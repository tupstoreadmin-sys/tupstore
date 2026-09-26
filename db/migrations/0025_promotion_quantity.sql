-- Tupstore — Promotion Quantity migration
-- Adds `promotion_quantity` to `enquiries` so a customer can enquire about
-- more than one unit of a staged promotion (client decision, see
-- EnquiryContext.jsx's `promotion.quantity`). Does NOT touch any other
-- table, column, policy, or grant. Does not rewrite or amend any
-- previously-applied migration (0001–0024).
--
-- NOT applied automatically. Review only — apply manually through the
-- Supabase Dashboard SQL Editor once approved, exactly like every prior
-- migration in this project.
--
-- Idempotent/rerun-safe: `add column if not exists`, guarded
-- `do $$ if not exists $$` for the check constraint (same pattern as
-- 0023_add_product_sku.sql / 0024_promotion_detail_and_combo_enquiry.sql).

alter table enquiries
  add column if not exists promotion_quantity integer not null default 1;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'enquiries_promotion_quantity_positive'
  ) then
    alter table enquiries add constraint enquiries_promotion_quantity_positive
      check (promotion_quantity > 0);
  end if;
end $$;

-- Every existing row (promotion or not) already receives 1 automatically via
-- the column default above — no backfill UPDATE needed. `promotion_id`
-- remains independently nullable; a normal product-only enquiry simply
-- carries promotion_quantity = 1 as an unused default, exactly like it
-- already carries promotion_id = null. Adding a NOT NULL column with a
-- non-volatile default is a metadata-only change on Postgres 11+ (no table
-- rewrite, no row-by-row lock), safe to run against the live table as-is.
--
-- No RLS/policy/grant change needed: `anon`'s existing "Public insert
-- access" on enquiries (db/schema.sql) is `with check (true)` —
-- unconditional, already allows inserting this new column's value. Admin's
-- existing whole-row SELECT already covers it too.
--
-- End of migration. No existing enquiries/promotions row, policy, or grant
-- is altered beyond the new column + constraint above.
