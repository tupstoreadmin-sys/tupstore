-- Tupstore — Admin Foundation migration
-- Adds ONLY what admin authentication/authorization needs: a `profiles`
-- table (auth.users -> role), its own RLS, and a SECURITY DEFINER helper
-- for future policies to check admin status without RLS recursion.
--
-- Does NOT touch: categories, products, product_images, product_features,
-- product_specifications, enquiries, enquiry_items, or any of their
-- existing RLS policies/grants. Purely additive. Safe to run once against
-- the live production database (ref yaxrsclmzbwcwqdwejzf) via the Supabase
-- Dashboard's SQL Editor.
--
-- NOT applied automatically — this file was written for you to review and
-- run yourself, exactly like the customer_email migration earlier in this
-- project. No code in this repo executes this file.

-- ── profiles ──────────────────────────────────────────────────────────────
-- One row per Supabase Auth user, used ONLY to distinguish an authorized
-- admin from any other authenticated user. There is no public signup in
-- this app, and no INSERT/UPDATE policy for `authenticated` on this table
-- below — a signed-in user can never grant or edit their own role. Rows
-- are created/edited only via the Dashboard (service-role), by the project
-- owner, when provisioning an admin (see the implementation report for the
-- exact steps).
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

alter table profiles enable row level security;

-- A signed-in user may read only their own profile row — this is what lets
-- the frontend ask "am I an admin?" right after login. Deliberately no
-- insert/update/delete policy for `authenticated`.
create policy "Users can read own profile" on profiles
  for select to authenticated
  using (id = auth.uid());

grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;

-- ── is_admin() ────────────────────────────────────────────────────────────
-- SECURITY DEFINER helper for LATER admin RLS policies (on products,
-- categories, enquiries, etc. — none of which are added by this migration)
-- to check "is auth.uid() an admin?" without those policies querying
-- `profiles` under the caller's own restricted RLS context, which is the
-- standard Supabase-recommended way to avoid RLS self-recursion. Running
-- as the function owner lets it read `profiles` internally regardless of
-- the calling user's own RLS-visible rows; the only thing it ever exposes
-- to the caller is a single true/false answer.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- End of migration. Existing anon policies on categories/products/
-- product_images/product_features/product_specifications/enquiries/
-- enquiry_items are completely untouched by this file.
