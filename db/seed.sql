-- Tupperware Exclusive Store — sample data
-- Design reference: ../DATABASE_DESIGN.md
-- Run after schema.sql. Safe to re-run: every insert is guarded by a
-- "not exists" lookup on the row's natural key (slug / spec_key / etc).

-- ── categories ────────────────────────────────────────────────────────────
insert into categories (slug, name, tagline, image)
select v.slug, v.name, v.tagline, v.image
from (values
  ('kitchen-storage', 'Kitchen Storage', 'Airtight freshness, every day', '/images/cat_kitchen.png'),
  ('bottles-sippers', 'Bottles & Sippers', 'Hydration that travels well', '/images/cat_bottles.png'),
  ('bakeware',        'Bakeware',         'Bake, store, and serve in one', '/images/cat_bakeware.png')
) as v(slug, name, tagline, image)
where not exists (select 1 from categories c where c.slug = v.slug);

-- ── products ──────────────────────────────────────────────────────────────
insert into products
  (slug, name, image, badge, featured, category_id, price, original_price, rating, capacity, availability, description, colors)
select
  v.slug, v.name, v.image, v.badge, v.featured,
  (select id from categories where slug = v.category_slug),
  v.price, v.original_price, v.rating, v.capacity, v.availability, v.description, v.colors
from (values
  (
    'classic-airtight-container-set', 'Classic Airtight Container Set',
    '/images/cat_kitchen.png', 'Best Seller', true, 'kitchen-storage',
    1150.00, 1500.00, 4.8, '1000 ml (Set of 4)', 'in_stock',
    'Keep pantry staples fresh longer with this airtight, stackable 4-piece container set.',
    array['Clear', 'Frosted Blue']
  ),
  (
    'eco-bottle-1l', 'Eco Bottle 1L',
    '/images/cat_bottles.png', null, false, 'bottles-sippers',
    450.00, null, 4.9, '1 L', 'in_stock',
    'A leak-proof everyday bottle built for the daily commute.',
    array['Coral', 'Teal', 'Charcoal']
  ),
  (
    'stackable-spice-organizer', 'Stackable Spice Organizer',
    '/images/cat_kitchen.png', 'New Arrival', true, 'kitchen-storage',
    980.00, null, 4.6, 'Set of 6', 'in_stock',
    'Modular spice jars that stack cleanly in any cabinet.',
    array['Clear']
  ),
  (
    'insulated-lunch-box', 'Insulated Lunch Box',
    '/images/cat_bakeware.png', null, false, 'bakeware',
    1350.00, 1600.00, 4.7, '900 ml', 'out_of_stock',
    'Two-tier insulated lunch box that keeps meals warm for hours.',
    array['Olive', 'Slate']
  )
) as v(slug, name, image, badge, featured, category_slug, price, original_price, rating, capacity, availability, description, colors)
where not exists (select 1 from products p where p.slug = v.slug);

-- ── product_images (gallery — additional shots beyond the hero image) ────
insert into product_images (product_id, url, alt_text, sort_order, is_primary)
select (select id from products where slug = v.product_slug), v.url, v.alt_text, v.sort_order, v.is_primary
from (values
  ('classic-airtight-container-set', '/images/cat_kitchen.png', 'Container set, front view', 0, true),
  ('classic-airtight-container-set', '/images/hero_banner_kitchen.png', 'Container set, in use', 1, false),
  ('eco-bottle-1l', '/images/cat_bottles.png', 'Eco bottle, front view', 0, true),
  ('eco-bottle-1l', '/images/hero_banner_bottles.png', 'Eco bottle, lifestyle shot', 1, false)
) as v(product_slug, url, alt_text, sort_order, is_primary)
where not exists (
  select 1 from product_images pi
  join products p on p.id = pi.product_id
  where p.slug = v.product_slug and pi.url = v.url
);

-- ── product_features ──────────────────────────────────────────────────────
insert into product_features (product_id, label, sort_order)
select (select id from products where slug = v.product_slug), v.label, v.sort_order
from (values
  ('classic-airtight-container-set', 'BPA Free', 0),
  ('classic-airtight-container-set', 'Microwave Safe', 1),
  ('classic-airtight-container-set', 'Dishwasher Safe', 2),
  ('eco-bottle-1l', 'Leak Proof', 0),
  ('eco-bottle-1l', 'BPA Free', 1)
) as v(product_slug, label, sort_order)
where not exists (
  select 1 from product_features pf
  join products p on p.id = pf.product_id
  where p.slug = v.product_slug and pf.label = v.label
);

-- ── product_specifications ───────────────────────────────────────────────
insert into product_specifications (product_id, spec_key, spec_value, sort_order)
select (select id from products where slug = v.product_slug), v.spec_key, v.spec_value, v.sort_order
from (values
  ('classic-airtight-container-set', 'Material', 'Food-grade Polypropylene', 0),
  ('classic-airtight-container-set', 'Set Size', '4 pieces', 1),
  ('eco-bottle-1l', 'Material', 'Tritan Copolyester', 0),
  ('eco-bottle-1l', 'Capacity', '1 Litre', 1)
) as v(product_slug, spec_key, spec_value, sort_order)
where not exists (
  select 1 from product_specifications ps
  join products p on p.id = ps.product_id
  where p.slug = v.product_slug and ps.spec_key = v.spec_key
);

-- ── sample enquiry + items ───────────────────────────────────────────────
insert into enquiries (customer_name, customer_phone, customer_message, status)
select 'Anjali Menon', '+919847000000', 'Interested in the container set — do you have it in frosted blue?', 'new'
where not exists (select 1 from enquiries where customer_phone = '+919847000000');

insert into enquiry_items (enquiry_id, product_id, quantity, selected_color, price_at_enquiry)
select
  (select id from enquiries where customer_phone = '+919847000000'),
  (select id from products where slug = 'classic-airtight-container-set'),
  2, 'Frosted Blue', 1150.00
where not exists (
  select 1 from enquiry_items ei
  join enquiries e on e.id = ei.enquiry_id
  where e.customer_phone = '+919847000000'
);
