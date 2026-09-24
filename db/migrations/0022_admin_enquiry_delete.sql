-- Tupstore — Admin Enquiry Delete migration
-- Adds the one missing piece for admins to delete an enquiry from the
-- Admin Enquiries page: a DELETE policy + grant on public.enquiries for
-- `authenticated`, gated by the existing public.is_admin() function
-- (0001_admin_foundation.sql) — the exact same pattern already used for
-- enquiries' own UPDATE policy (0014_admin_enquiries.sql) and SELECT
-- policy (0015_enquiry_select_security_fix.sql).
--
-- CONFIRMED LIVE STATE BEFORE THIS MIGRATION (direct introspection, not
-- assumed): `authenticated` currently holds SELECT/UPDATE/REFERENCES/
-- TRIGGER/TRUNCATE on enquiries — no DELETE. `anon` holds INSERT only
-- (unchanged, untouched by this migration).
--
-- enquiry_items.enquiry_id already has `on delete cascade`
-- (confirmed via pg_constraint: confdeltype = 'c', from db/schema.sql's
-- original definition) — deleting a row from enquiries therefore already
-- automatically deletes its enquiry_items rows too, at the database
-- constraint level. No enquiry_items DELETE grant or RLS policy is added
-- by this migration: PostgreSQL's own referential-integrity actions (such
-- as this CASCADE) are enforced by the constraint itself, not by the
-- invoking role's own privileges on the child table, and row security does
-- not apply to them (see PostgreSQL's row security documentation: "row
-- security is not applied ... when enforcing referential integrity").
-- Nothing here relies on this documentation alone — the full delete flow
-- (enquiry + its items) is verified empirically as part of this task's own
-- QA, not merely assumed correct from the docs.
--
-- Does NOT touch: hero_slides, hero_slide_features, newsletter_subscribers,
-- products, categories, promotions, promotion_products, social_videos,
-- social_video_products, or any of their existing policies/grants/data.
-- Does not add anon DELETE anywhere — anon retains exactly INSERT on
-- enquiries/enquiry_items, unchanged.
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push`, do not paste this into the Dashboard SQL Editor,
-- until it has been explicitly approved. Once approved, apply it manually
-- through the Supabase Dashboard SQL Editor, exactly like every prior
-- migration in this project.

grant delete on public.enquiries to authenticated;

create policy "Admins can delete enquiries" on enquiries
  for delete to authenticated
  using (is_admin());

-- End of migration. authenticated admins can now delete an enquiry
-- (gated by is_admin(), matching every other admin-only policy in this
-- project). enquiry_items rows for a deleted enquiry are removed
-- automatically via the existing on-delete-cascade FK — no separate
-- grant/policy needed or added for that table. anon privileges on both
-- tables are completely unchanged.
