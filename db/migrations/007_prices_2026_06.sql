-- migration 007 · 2026-06 · update product prices to supplier sheet
--
-- Run this on an EXISTING Supabase project to refresh prices without
-- wiping the products table. Each UPDATE matches on the natural key
-- (category + finish + tin_size for paint; category + name for
-- accessories) so existing product IDs are preserved and historical
-- order_items keep their references intact.
--
-- Source: "Paint Express.xlsx" (June 2026 supplier sheet).
-- All prices are AUD inc-GST.

begin;

-- Interior — Noroo Norutone Premium Interior Paint
update products set price_aud = 44.00  where category = 'Interior' and finish = 'Low Sheen' and tin_size = '1L';
update products set price_aud = 82.50  where category = 'Interior' and finish = 'Low Sheen' and tin_size = '4L';
update products set price_aud = 184.80 where category = 'Interior' and finish = 'Low Sheen' and tin_size = '10L';
update products set price_aud = 44.00  where category = 'Interior' and finish = 'Matt'      and tin_size = '1L';
update products set price_aud = 82.50  where category = 'Interior' and finish = 'Matt'      and tin_size = '4L';
update products set price_aud = 184.80 where category = 'Interior' and finish = 'Matt'      and tin_size = '10L';

-- Exterior — Noroo Norusol Premium Exterior Paint
update products set price_aud = 88.00  where category = 'Exterior' and finish = 'Low Sheen' and tin_size = '4L';
update products set price_aud = 195.80 where category = 'Exterior' and finish = 'Low Sheen' and tin_size = '10L';

-- Ceilings — Noroo Norutone Ceiling
update products set price_aud = 55.00 where category = 'Ceilings' and finish = 'Ultra Flat' and tin_size = '4L';
update products set price_aud = 99.00 where category = 'Ceilings' and finish = 'Ultra Flat' and tin_size = '10L';

-- Trim — Noroo Multi Plus Premium Acrylic Trim
update products set price_aud = 55.00  where category = 'Trim' and finish = 'Semi Gloss' and tin_size = '1L';
update products set price_aud = 99.00  where category = 'Trim' and finish = 'Semi Gloss' and tin_size = '4L';
update products set price_aud = 198.00 where category = 'Trim' and finish = 'Semi Gloss' and tin_size = '10L';
update products set price_aud = 55.00  where category = 'Trim' and finish = 'Gloss'      and tin_size = '1L';
update products set price_aud = 99.00  where category = 'Trim' and finish = 'Gloss'      and tin_size = '4L';
update products set price_aud = 198.00 where category = 'Trim' and finish = 'Gloss'      and tin_size = '10L';

-- Undercoat — Noroo Multi Primer Acrylic Sealer Undercoat (finish IS NULL)
update products set price_aud = 71.50  where category = 'Undercoat' and finish is null and tin_size = '4L';
update products set price_aud = 143.00 where category = 'Undercoat' and finish is null and tin_size = '10L';

-- Premium All-in-One — Noroo All Cover Ultra Premium All-in-One
update products set price_aud = 84.70  where category = 'Premium All-in-One' and finish = 'Eggshell' and tin_size = '4L';
update products set price_aud = 198.00 where category = 'Premium All-in-One' and finish = 'Eggshell' and tin_size = '10L';

-- Accessories — match on name (case-insensitive) since they have no finish/size
update products set price_aud = 18.15 where category = 'Accessories' and lower(name) = lower('6 pack 230mm Roller Covers');
update products set price_aud = 23.65 where category = 'Accessories' and lower(name) = lower('6 pack 270mm Roller Covers');
update products set price_aud = 11.55 where category = 'Accessories' and lower(name) = lower('230mm Roller Frame');
update products set price_aud = 18.15 where category = 'Accessories' and lower(name) = lower('270mm Roller Frame');
update products set price_aud = 14.10 where category = 'Accessories' and lower(name) = lower('63mm Wall Brush');
update products set price_aud = 11.55 where category = 'Accessories' and lower(name) = lower('50mm Cutter Brush');

-- Sanity check: every active product must now have a non-zero price.
-- Surface anything that didn't match so you don't ship $0.00 SKUs.
do $$
declare
  zero_count int;
begin
  select count(*) into zero_count
    from products
   where is_active = true and (price_aud is null or price_aud = 0);
  if zero_count > 0 then
    raise warning 'migration 007: % active product(s) still have price = 0 — check the catalogue for stragglers', zero_count;
  end if;
end $$;

commit;
