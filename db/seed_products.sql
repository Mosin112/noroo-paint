-- Seed catalogue for the products table. Idempotent: deletes any existing
-- rows with the same name+tin_size first, then re-inserts. Safe to run again
-- as the catalogue evolves before the real CSV from kick-off arrives.
--
-- Values mirror src/data/seedProducts.ts verbatim. Swatch hex rotates through
-- the PRD §6.2 default set so rows render distinguishable swatches even with
-- no product image set.

-- Snapshot the existing names so we can replace cleanly.
delete from products where name in (
  'Trade Matt', 'Value Matt', 'Ceiling Flat',
  'Trade Low Sheen', 'Trade Semi-Gloss', 'Trade Gloss',
  'Trade Eggshell', 'Weathershield',
  'Acrylic Undercoat', 'All-in-One Premium',
  '9-inch Roller Cover', 'Roller Frame', 'Wall Brush 75mm', 'Cutter Brush 38mm'
);

insert into products (category, name, finish, tin_size, tinting_base, price_aud, swatch_hex, is_active) values
  -- Interior / Matt
  ('Interior', 'Trade Matt',        'Matt',       '10L', 'Tintable',        89,  '#e9e2cf', true),
  ('Interior', 'Trade Matt',        'Matt',       '4L',  'Tintable',        42,  '#f4ede0', true),
  ('Interior', 'Value Matt',        'Matt',       '10L', 'Tintable',        59,  '#fafaf7', true),

  -- Ceilings
  ('Ceilings', 'Ceiling Flat',      'Ultra Flat', '10L', 'White Base Only', 54,  '#ffffff', true),

  -- Interior / Low Sheen
  ('Interior', 'Trade Low Sheen',   'Low Sheen',  '10L', 'Tintable',        95,  '#d6c9a8', true),
  ('Interior', 'Trade Low Sheen',   'Low Sheen',  '4L',  'Tintable',        45,  '#fdf3ec', true),

  -- Trim — Semi Gloss / Gloss
  ('Trim',     'Trade Semi-Gloss',  'Semi Gloss', '4L',  'Tintable',        55,  '#3a4a55', true),
  ('Trim',     'Trade Semi-Gloss',  'Semi Gloss', '1L',  'Tintable',        22,  '#e9e2cf', true),
  ('Trim',     'Trade Gloss',       'Gloss',      '4L',  'Tintable',        58,  '#f4ede0', true),
  ('Trim',     'Trade Gloss',       'Gloss',      '1L',  'Tintable',        24,  '#fafaf7', true),

  -- Interior / Eggshell (PRD §6.5 reconciliation — replaces prototype Satin)
  ('Interior', 'Trade Eggshell',    'Eggshell',   '10L', 'Tintable',        92,  '#ffffff', true),

  -- Exterior
  ('Exterior', 'Weathershield',     'Low Sheen',  '10L', 'Tintable',        109, '#d6c9a8', true),
  ('Exterior', 'Weathershield',     'Semi Gloss', '4L',  'Tintable',        54,  '#fdf3ec', true),

  -- Undercoat (no finish — base coat)
  ('Undercoat', 'Acrylic Undercoat', null,        '4L',  'White Base Only', 38,  '#3a4a55', true),
  ('Undercoat', 'Acrylic Undercoat', null,        '10L', 'White Base Only', 78,  '#e9e2cf', true),

  -- Premium All-in-One
  ('Premium All-in-One', 'All-in-One Premium', 'Low Sheen', '10L', 'Tintable', 125, '#f4ede0', true),

  -- Accessories — no finish, no tin, no tinting
  ('Accessories', '9-inch Roller Cover', null, null, null, 9,  '#fafaf7', true),
  ('Accessories', 'Roller Frame',        null, null, null, 14, '#fafaf7', true),
  ('Accessories', 'Wall Brush 75mm',     null, null, null, 18, '#fafaf7', true),
  ('Accessories', 'Cutter Brush 38mm',   null, null, null, 12, '#fafaf7', true);
