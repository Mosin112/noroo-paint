-- Paint Express catalogue — sourced from "Paint Express.xlsx" (June 2026).
-- 26 SKUs across 7 categories. Prices are inc-GST AUD per supplier sheet.
--
-- This script fully replaces the products table. order_items.product_id is
-- ON DELETE SET NULL (migration 003), so historical orders survive the wipe
-- with their snapshot columns intact.
--
-- After running the schema + this seed on a FRESH Supabase project, every
-- price in the catalogue matches the supplier sheet. If you only need to
-- refresh prices on an existing project (and want to preserve product IDs
-- so historical orders keep their references), run
-- db/migrations/007_prices_2026_06.sql instead.

begin;

-- Wipe + reseed in a single transaction so the catalogue is never empty
-- in the middle of the operation.
delete from products;

insert into products (category, name, finish, tin_size, tinting_base, price_aud, swatch_hex, is_active) values
  -- Interior — Noroo Norutone Premium Interior Paint
  ('Interior', 'Noroo Norutone Premium Interior Paint', 'Low Sheen', '1L',  'Tintable',         44.00,  '#e9e2cf', true),
  ('Interior', 'Noroo Norutone Premium Interior Paint', 'Low Sheen', '4L',  'Tintable',         82.50,  '#f4ede0', true),
  ('Interior', 'Noroo Norutone Premium Interior Paint', 'Low Sheen', '10L', 'Tintable',         184.80, '#fafaf7', true),
  ('Interior', 'Noroo Norutone Premium Interior Paint', 'Matt',      '1L',  'White Base Only',  44.00,  '#ffffff', true),
  ('Interior', 'Noroo Norutone Premium Interior Paint', 'Matt',      '4L',  'White Base Only',  82.50,  '#ffffff', true),
  ('Interior', 'Noroo Norutone Premium Interior Paint', 'Matt',      '10L', 'White Base Only',  184.80, '#ffffff', true),

  -- Exterior — Noroo Norusol Premium Exterior Paint
  ('Exterior', 'Noroo Norusol Premium Exterior Paint',  'Low Sheen', '4L',  'Tintable',         88.00,  '#d6c9a8', true),
  ('Exterior', 'Noroo Norusol Premium Exterior Paint',  'Low Sheen', '10L', 'Tintable',         195.80, '#d6c9a8', true),

  -- Ceilings — Noroo Norutone Ceiling
  ('Ceilings', 'Noroo Norutone Ceiling',                'Ultra Flat','4L',  'White Base Only',  55.00,  '#ffffff', true),
  ('Ceilings', 'Noroo Norutone Ceiling',                'Ultra Flat','10L', 'White Base Only',  99.00,  '#ffffff', true),

  -- Trim — Noroo Multi Plus Premium Acrylic Trim
  ('Trim',     'Noroo Multi Plus Premium Acrylic Trim', 'Semi Gloss','1L',  'Tintable',         55.00,  '#3a4a55', true),
  ('Trim',     'Noroo Multi Plus Premium Acrylic Trim', 'Semi Gloss','4L',  'Tintable',         99.00,  '#3a4a55', true),
  ('Trim',     'Noroo Multi Plus Premium Acrylic Trim', 'Semi Gloss','10L', 'Tintable',         198.00, '#3a4a55', true),
  ('Trim',     'Noroo Multi Plus Premium Acrylic Trim', 'Gloss',     '1L',  'White Base Only',  55.00,  '#ffffff', true),
  ('Trim',     'Noroo Multi Plus Premium Acrylic Trim', 'Gloss',     '4L',  'White Base Only',  99.00,  '#ffffff', true),
  ('Trim',     'Noroo Multi Plus Premium Acrylic Trim', 'Gloss',     '10L', 'White Base Only',  198.00, '#ffffff', true),

  -- Undercoat — Noroo Multi Primer Acrylic Sealer Undercoat (no finish, white only)
  ('Undercoat', 'Noroo Multi Primer Acrylic Sealer Undercoat', null, '4L',  'White Base Only',  71.50,  '#ffffff', true),
  ('Undercoat', 'Noroo Multi Primer Acrylic Sealer Undercoat', null, '10L', 'White Base Only',  143.00, '#ffffff', true),

  -- Premium All-in-One — Noroo All Cover Ultra Premium All-in-One
  ('Premium All-in-One', 'Noroo All Cover Ultra Premium All-in-One', 'Eggshell', '4L',  'White Base Only', 84.70,  '#f4ede0', true),
  ('Premium All-in-One', 'Noroo All Cover Ultra Premium All-in-One', 'Eggshell', '10L', 'White Base Only', 198.00, '#f4ede0', true),

  -- Accessories — no finish, no tin size, no tinting (Unipro brand per supplier sheet)
  ('Accessories', '6 pack 230mm Roller Covers',  null, null, null, 18.15, '#fafaf7', true),
  ('Accessories', '6 pack 270mm Roller Covers',  null, null, null, 23.65, '#fafaf7', true),
  ('Accessories', '230mm Roller Frame',          null, null, null, 11.55, '#fafaf7', true),
  ('Accessories', '270mm Roller Frame',          null, null, null, 18.15, '#fafaf7', true),
  ('Accessories', '63mm Wall Brush',             null, null, null, 14.10, '#fafaf7', true),
  ('Accessories', '50mm Cutter Brush',           null, null, null, 11.55, '#fafaf7', true);

commit;
