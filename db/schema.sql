-- Tupperware Exclusive Store — Supabase schema
-- Design reference: ../DATABASE_DESIGN.md
-- Read-only catalog + write-only enquiries. No auth, no admin panel —
-- the Supabase Dashboard (service-role) is the temporary admin surface.
--
-- Idempotent: safe to re-run against a fresh database.

-- ── Extensions ────────────────────────────────────────────────────────────
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists pg_trgm;    -- fast ILIKE search on products.name

-- ── updated_at trigger helper ────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ── categories ────────────────────────────────────────────────────────────
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  tagline     text,
  image       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_categories_updated_at
  before update on categories
  for each row execute function set_updated_at();

-- ── products ──────────────────────────────────────────────────────────────
create table if not exists products (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  image           text not null,
  badge           text,
  featured        boolean not null default false,
  category_id     uuid not null references categories(id) on delete restrict,
  price           numeric(10,2) not null check (price >= 0),
  original_price  numeric(10,2) check (original_price >= 0),
  rating          numeric(2,1) check (rating between 0 and 5),
  capacity        text,
  availability    text not null default 'in_stock'
                    check (availability in ('in_stock', 'out_of_stock', 'preorder')),
  description     text,
  colors          text[],
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

create index if not exists idx_products_category_id on products (category_id);
create index if not exists idx_products_featured     on products (featured) where featured = true;
create index if not exists idx_products_price        on products (price);
create index if not exists idx_products_name_trgm    on products using gin (name gin_trgm_ops);

-- ── product_images (future-ready) ────────────────────────────────────────
create table if not exists product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  url         text not null,
  alt_text    text,
  sort_order  int not null default 0,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_product_images_product_id on product_images (product_id);

-- ── product_features (future-ready) ──────────────────────────────────────
create table if not exists product_features (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  label       text not null,
  sort_order  int not null default 0
);

create index if not exists idx_product_features_product_id on product_features (product_id);

-- ── product_specifications (future-ready) ────────────────────────────────
create table if not exists product_specifications (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  spec_key    text not null,
  spec_value  text not null,
  sort_order  int not null default 0,
  unique (product_id, spec_key)
);

create index if not exists idx_product_specs_product_id on product_specifications (product_id);

-- ── enquiries ─────────────────────────────────────────────────────────────
create table if not exists enquiries (
  id                 uuid primary key default gen_random_uuid(),
  customer_name      text,
  customer_phone     text,
  customer_email     text,
  customer_message   text,
  status             text not null default 'new'
                        check (status in ('new', 'contacted', 'closed')),
  created_at         timestamptz not null default now()
);

create index if not exists idx_enquiries_status     on enquiries (status);
create index if not exists idx_enquiries_created_at on enquiries (created_at desc);

-- ── enquiry_items ─────────────────────────────────────────────────────────
create table if not exists enquiry_items (
  id                 uuid primary key default gen_random_uuid(),
  enquiry_id         uuid not null references enquiries(id) on delete cascade,
  product_id         uuid not null references products(id) on delete restrict,
  quantity           int not null check (quantity > 0),
  selected_color     text,
  price_at_enquiry   numeric(10,2) not null,
  created_at         timestamptz not null default now()
);

create index if not exists idx_enquiry_items_enquiry_id on enquiry_items (enquiry_id);
create index if not exists idx_enquiry_items_product_id on enquiry_items (product_id);

-- ── Row Level Security ────────────────────────────────────────────────────
alter table categories              enable row level security;
alter table products                enable row level security;
alter table product_images          enable row level security;
alter table product_features        enable row level security;
alter table product_specifications  enable row level security;
alter table enquiries               enable row level security;
alter table enquiry_items           enable row level security;

-- Public read access — catalog data only. No insert/update/delete policy is
-- defined for `anon` on any of these tables, so those actions are denied by
-- default under RLS.
create policy "Public read access" on categories
  for select to anon using (true);

create policy "Public read access" on products
  for select to anon using (true);

create policy "Public read access" on product_images
  for select to anon using (true);

create policy "Public read access" on product_features
  for select to anon using (true);

create policy "Public read access" on product_specifications
  for select to anon using (true);

-- Public insert access — enquiries only. No select/update/delete policy for
-- `anon`, so a customer can submit an enquiry but never read any enquiry
-- back (including their own). Only the Dashboard (service-role) can view
-- them. See DATABASE_DESIGN.md §13 for the `.insert().select()` pitfall
-- this implies for the client code that will eventually call this.
create policy "Public insert access" on enquiries
  for insert to anon with check (true);

create policy "Public insert access" on enquiry_items
  for insert to anon with check (true);

-- ── Base table privileges ─────────────────────────────────────────────────
-- RLS policies alone are not sufficient — Postgres also requires the `anon`
-- role to hold the base GRANT for an operation before RLS is even
-- evaluated. Tables created via raw SQL (as above) do NOT get this
-- automatically the way tables created through the Supabase Table Editor
-- UI do. Without these grants, every anon request fails with
-- `permission denied for table ...` (Postgres error 42501) regardless of
-- how permissive the RLS policies above are.
grant usage on schema public to anon;

grant select on public.categories              to anon;
grant select on public.products                to anon;
grant select on public.product_images          to anon;
grant select on public.product_features        to anon;
grant select on public.product_specifications  to anon;

grant insert on public.enquiries      to anon;
grant insert on public.enquiry_items  to anon;
