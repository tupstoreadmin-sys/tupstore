-- Tupstore — Newsletter Subscribers migration
-- New, standalone table backing the Footer "SIGN UP FOR UPDATES" form
-- (src/components/layout/Footer.jsx). The form already exists and already
-- collects name + email; this migration only adds the storage for it.
--
-- BACKEND ONLY. Does not touch: enquiries, enquiry_items, products,
-- categories, product_images, product_features, product_specifications,
-- promotions, promotion_products, social_videos, social_video_products,
-- profiles, or any of their existing policies/grants/data.
--
-- Mirrors this project's established enquiries pattern (db/schema.sql,
-- 0014/0015):
--   - anon: INSERT only. No select/update/delete policy for anon at all,
--     so a visitor can subscribe but can never read back any subscriber
--     row, including their own — same shape as enquiries.
--   - authenticated admins: SELECT gated by the existing public.is_admin()
--     helper (0001) — reused unmodified, no new admin-auth mechanism.
--   - service_role: SELECT granted explicitly, up front. 0016/0017 showed
--     that service_role has no default privileges on tables in this
--     project and must be granted per table — granting it here now avoids
--     repeating that same fix later for this table.
--
-- Email uniqueness is enforced case-insensitively via a unique index on
-- lower(email), so "user@example.com" and "User@Example.com" cannot both
-- subscribe. A duplicate INSERT fails with Postgres error 23505
-- (unique_violation) — src/api/newsletterApi.js is expected to catch that
-- code and surface it as an "already subscribed" result, not a generic
-- error.
--
-- NOT applied automatically. This file is for review only — do not run
-- `supabase db push`, do not paste this into the Dashboard SQL Editor,
-- until it has been explicitly approved. Once approved, apply it manually
-- through the Supabase Dashboard SQL Editor, exactly like every prior
-- migration in this project.

create table if not exists newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  created_at  timestamptz not null default now()
);

-- Case-insensitive uniqueness — not a plain `unique` on `email`, which
-- would still allow "user@example.com" and "User@Example.com" as two
-- separate rows.
create unique index if not exists idx_newsletter_subscribers_email_lower
  on public.newsletter_subscribers (lower(email));

create index if not exists idx_newsletter_subscribers_created_at
  on public.newsletter_subscribers (created_at desc);

alter table newsletter_subscribers enable row level security;

create policy "Public insert access" on newsletter_subscribers
  for insert to anon with check (true);

create policy "Admins can select newsletter subscribers" on newsletter_subscribers
  for select to authenticated
  using (is_admin());

-- Base table privileges — `grant usage on schema public to anon` and
-- `to authenticated` were already granted by db/schema.sql /
-- 0001_admin_foundation.sql; only this table's own per-role grants are
-- needed here.
grant insert on public.newsletter_subscribers to anon;
grant select on public.newsletter_subscribers to authenticated;
grant select on public.newsletter_subscribers to service_role;

-- End of migration. anon can insert only, never read/update/delete.
-- authenticated admins can select (gated by is_admin()), matching every
-- other admin-readable table. service_role can select, granted from the
-- start. No existing table, policy, grant, Storage bucket, or row is
-- touched. No Admin UI is created by this migration — out of scope unless
-- separately requested.
