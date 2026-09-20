-- Tupstore — Enquiry SELECT Security Fix migration
-- Fixes a confirmed, undocumented anon SELECT grant on enquiries/
-- enquiry_items, and — required to actually reach the intended end state —
-- adds the admin SELECT policy that has never existed on either table.
--
-- ROOT CAUSE (confirmed via direct pg_policies/pg_roles/information_schema
-- inspection against the live database, not guessed):
--   - `anon` currently holds an undocumented SELECT grant (plus REFERENCES/
--     TRIGGER/TRUNCATE) on both enquiries and enquiry_items — none of this
--     appears in db/schema.sql or any prior migration.
--   - Neither `anon` nor `authenticated` has BYPASSRLS.
--   - Zero SELECT policies exist on either table for ANY role. With RLS
--     enabled and no matching policy, Postgres's documented default is
--     deny-all for that command — so every SELECT (anon's and the admin's)
--     has always executed without error but returned zero rows, regardless
--     of how much real data exists. This is why anon's SELECT "worked" but
--     returned nothing, and — the important correction — why the Admin
--     Dashboard/Admin Enquiries page has shown 0 enquiries the entire time
--     despite real rows existing (verified: 8 real rows in enquiries, 3 in
--     enquiry_items, completely untouched by this migration).
--
-- This migration does two things, both required to reach the requested end
-- state (anon: insert-only; admin: full read + the existing 0014 update):
--   1. Revokes the undocumented anon SELECT grant on both tables.
--   2. Adds the missing admin-gated SELECT policy on both tables, matching
--      this project's exact existing is_admin() convention (0002/0005/
--      0008/0012/0014). The base SELECT GRANT for `authenticated` already
--      exists on both tables — only the policy was missing — so no grant
--      statement is needed for this half.
--
-- Does NOT touch: the existing anon INSERT policies on either table (still
-- required and left exactly as-is), the existing admin UPDATE policy on
-- enquiries (0014), categories, products, product_images, product_features,
-- product_specifications, profiles, social_videos, social_video_products,
-- promotions, promotion_products, or any of their policies/grants. Does
-- NOT grant DELETE to anyone on either table — deliberately out of scope,
-- matching "DELETE = remain unchanged / not introduced".
--
-- Does NOT touch the also-undocumented anon REFERENCES/TRIGGER/TRUNCATE
-- grants found during this audit — flagged separately, not part of this
-- task's requested fix, and not silently bundled in here.
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push`, do not paste this into the Dashboard SQL Editor,
-- until it has been explicitly approved. Once approved, apply it manually
-- through the Supabase Dashboard SQL Editor, exactly like every prior
-- migration in this project.

revoke select on public.enquiries      from anon;
revoke select on public.enquiry_items  from anon;

create policy "Admins can select enquiries" on enquiries
  for select to authenticated
  using (is_admin());

create policy "Admins can select enquiry items" on enquiry_items
  for select to authenticated
  using (is_admin());

-- End of migration. anon retains exactly INSERT on both tables (unchanged,
-- still required for the customer enquiry/Contact form flow) and loses
-- SELECT (the confirmed exposure). authenticated gains real SELECT
-- visibility for the first time, gated by is_admin() exactly like every
-- other admin-readable table in this project — a signed-in non-admin
-- account (none currently exist in this app) still cannot read any
-- enquiry. No existing row, table, or unrelated policy/grant is touched.
