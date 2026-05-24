// Seed product list for offline dev — real catalogue lives in Supabase.
// Prices and names follow the prototype's PRODUCTS map; categories extended per PRD §6.

import type { Product } from '../types/domain';
import { DEFAULT_SWATCHES } from '../types/domain';

let n = 0;
const id = () => `seed-${++n}`;
const sw = () => DEFAULT_SWATCHES[(n - 1) % DEFAULT_SWATCHES.length];

export const SEED_PRODUCTS: Product[] = [
  // Interior / Matt
  { id: id(), category: 'Interior', name: 'Trade Matt',   finish: 'Matt',       tin_size: '10L', tinting_base: 'Tintable', price_aud: 89, swatch_hex: sw(), is_active: true },
  { id: id(), category: 'Interior', name: 'Trade Matt',   finish: 'Matt',       tin_size: '4L',  tinting_base: 'Tintable', price_aud: 42, swatch_hex: sw(), is_active: true },
  { id: id(), category: 'Interior', name: 'Value Matt',   finish: 'Matt',       tin_size: '10L', tinting_base: 'Tintable', price_aud: 59, swatch_hex: sw(), is_active: true },

  // Ceilings
  { id: id(), category: 'Ceilings', name: 'Ceiling Flat', finish: 'Ultra Flat', tin_size: '10L', tinting_base: 'White Base Only', price_aud: 54, swatch_hex: sw(), is_active: true },

  // Interior / Low Sheen
  { id: id(), category: 'Interior', name: 'Trade Low Sheen', finish: 'Low Sheen', tin_size: '10L', tinting_base: 'Tintable', price_aud: 95, swatch_hex: sw(), is_active: true },
  { id: id(), category: 'Interior', name: 'Trade Low Sheen', finish: 'Low Sheen', tin_size: '4L',  tinting_base: 'Tintable', price_aud: 45, swatch_hex: sw(), is_active: true },

  // Trim — Semi Gloss / Gloss
  { id: id(), category: 'Trim', name: 'Trade Semi-Gloss', finish: 'Semi Gloss', tin_size: '4L', tinting_base: 'Tintable', price_aud: 55, swatch_hex: sw(), is_active: true },
  { id: id(), category: 'Trim', name: 'Trade Semi-Gloss', finish: 'Semi Gloss', tin_size: '1L', tinting_base: 'Tintable', price_aud: 22, swatch_hex: sw(), is_active: true },
  { id: id(), category: 'Trim', name: 'Trade Gloss',      finish: 'Gloss',      tin_size: '4L', tinting_base: 'Tintable', price_aud: 58, swatch_hex: sw(), is_active: true },
  { id: id(), category: 'Trim', name: 'Trade Gloss',      finish: 'Gloss',      tin_size: '1L', tinting_base: 'Tintable', price_aud: 24, swatch_hex: sw(), is_active: true },

  // Interior / Eggshell (replaces prototype Satin per PRD §6.5 reconciliation)
  { id: id(), category: 'Interior', name: 'Trade Eggshell', finish: 'Eggshell', tin_size: '10L', tinting_base: 'Tintable', price_aud: 92, swatch_hex: sw(), is_active: true },

  // Exterior
  { id: id(), category: 'Exterior', name: 'Weathershield', finish: 'Low Sheen', tin_size: '10L', tinting_base: 'Tintable', price_aud: 109, swatch_hex: sw(), is_active: true },
  { id: id(), category: 'Exterior', name: 'Weathershield', finish: 'Semi Gloss', tin_size: '4L',  tinting_base: 'Tintable', price_aud: 54, swatch_hex: sw(), is_active: true },

  // Undercoat
  { id: id(), category: 'Undercoat', name: 'Acrylic Undercoat', finish: null, tin_size: '4L',  tinting_base: 'White Base Only', price_aud: 38, swatch_hex: sw(), is_active: true },
  { id: id(), category: 'Undercoat', name: 'Acrylic Undercoat', finish: null, tin_size: '10L', tinting_base: 'White Base Only', price_aud: 78, swatch_hex: sw(), is_active: true },

  // Premium All-in-One
  { id: id(), category: 'Premium All-in-One', name: 'All-in-One Premium', finish: 'Low Sheen', tin_size: '10L', tinting_base: 'Tintable', price_aud: 125, swatch_hex: sw(), is_active: true },

  // Accessories — no finish/colour
  { id: id(), category: 'Accessories', name: '9-inch Roller Cover',  finish: null, tin_size: null, tinting_base: null, price_aud: 9,  swatch_hex: '#fafaf7', is_active: true },
  { id: id(), category: 'Accessories', name: 'Roller Frame',         finish: null, tin_size: null, tinting_base: null, price_aud: 14, swatch_hex: '#fafaf7', is_active: true },
  { id: id(), category: 'Accessories', name: 'Wall Brush 75mm',      finish: null, tin_size: null, tinting_base: null, price_aud: 18, swatch_hex: '#fafaf7', is_active: true },
  { id: id(), category: 'Accessories', name: 'Cutter Brush 38mm',    finish: null, tin_size: null, tinting_base: null, price_aud: 12, swatch_hex: '#fafaf7', is_active: true },
];

// Perth metro postcodes — PRD §16 says final list to be supplied at kick-off.
// This is a seeded sample so out-of-zone logic is testable end-to-end.
export const PERTH_METRO_POSTCODES = new Set<string>([
  // Yanchep / north
  '6035', '6036', '6037', '6038',
  // Joondalup band
  '6027', '6028', '6029', '6030', '6031', '6064', '6065',
  // Inner Perth
  '6000', '6003', '6004', '6005', '6006', '6007', '6008', '6009',
  '6050', '6051', '6052', '6053', '6054', '6055', '6056',
  '6100', '6101', '6102', '6103', '6104', '6105', '6106', '6107',
  '6148', '6149', '6150', '6151', '6152', '6153', '6154', '6155',
  '6156', '6157', '6158', '6159', '6160', '6161', '6162', '6163',
  '6164', '6165', '6166', '6167', '6168', '6169', '6170', '6171',
  '6172', '6173', '6174', '6175', '6176', '6177',
  // Rockingham / Mandurah
  '6210', '6211',
]);
