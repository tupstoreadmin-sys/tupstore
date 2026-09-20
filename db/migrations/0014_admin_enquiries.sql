-- Tupstore — Admin Enquiry Status Update migration
-- Adds ONLY the one missing piece needed for Admin Enquiry Management
-- (Step 4): the ability for an admin to update an enquiry's `status`.
--
-- WHY THIS IS NEEDED: verified empirically (not assumed) that `authenticated`
-- already has working SELECT access to both `enquiries` and `enquiry_items`
-- in the live project today — a grant/policy that predates this migration
-- and is not captured in any file in db/migrations/ (flagged as a
-- documentation gap during Step 4's own audit, not something this file
-- attempts to fix or redeclare, since its exact existing policy name is
-- unknown and redeclaring it risks a collision). What is confirmed MISSING
-- is UPDATE: a direct test against a non-existent id
-- (`.update({status:'contacted'}).eq('id', '00000000-...')`) returned a
-- genuine Postgres 42501 "permission denied for table enquiries" — the
-- grant-level check that runs before RLS even evaluates row matches, not a
-- "0 rows matched" response. Without this, an admin cannot move an enquiry
-- from new -> contacted -> closed at all.
--
-- Does NOT touch: categories, products, product_images, product_features,
-- product_specifications, profiles, social_videos, social_video_products,
-- promotions, promotion_products, enquiry_items, or any of their existing
-- policies/grants/data. Does NOT add INSERT or DELETE for `authenticated`
-- on enquiries — out of scope for this task (admins only view and change
-- status; they do not create or delete enquiry records). Does NOT touch
-- the existing anon "Public insert access" policy on enquiries, and does
-- NOT touch whatever pre-existing SELECT access already works today.
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push`, do not paste this into the Dashboard SQL Editor,
-- until it has been explicitly approved. Once approved, apply it manually
-- through the Supabase Dashboard SQL Editor, exactly like every prior
-- migration in this project.

grant update on public.enquiries to authenticated;

create policy "Admins can update enquiries" on enquiries
  for update to authenticated
  using (is_admin())
  with check (is_admin());

-- End of migration. No existing table, policy, grant, or row is touched.
-- A signed-in non-admin account (none currently exist in this app — there
-- is no customer login, only admin accounts ever hold `authenticated`)
-- satisfies is_admin() = false and still cannot update any enquiry.
-- customer_name/customer_phone/customer_email/customer_message/created_at
-- remain effectively unchanged by the Admin UI (it only ever sends
-- `{status: ...}`), though this policy itself permits updating any column
-- on the row — matching this project's established whole-table-grant
-- convention (categories/products/social_videos/promotions all grant
-- whole-table UPDATE too, relying on the admin API layer's own field
-- allowlist for practical scoping, not a column-level GRANT).
