// Domain types — mirror PRD §6.2 and §10.

export type ProductCategory =
  | 'Interior'
  | 'Exterior'
  | 'Ceilings'
  | 'Trim'
  | 'Undercoat'
  | 'Premium All-in-One'
  | 'Accessories';

export type PaintFinish =
  | 'Matt'
  | 'Low Sheen'
  | 'Semi Gloss'
  | 'Gloss'
  | 'Ultra Flat'
  | 'Eggshell';

export type TinSize = '1L' | '4L' | '10L';

export type TintingBase = 'Tintable' | 'White Base Only';

export type Product = {
  id: string;
  category: ProductCategory;
  name: string;
  finish: PaintFinish | null;          // null for accessories
  tin_size: TinSize | null;            // null for accessories
  tinting_base: TintingBase | null;    // null for accessories
  price_aud: number;
  image_url?: string | null;
  swatch_hex: string;
  is_active: boolean;
};

export type SavedColour = {
  id: string;
  brand: string | null;
  colour_name: string;
  last_used_at: string;
};

export type BasketItem = {
  // Local-only id; basket lives client-side until checkout.
  id: string;
  product: Product;
  brand: string | null;
  colour_name: string | null;          // null for accessories
  notes?: string;
  quantity: number;
};

export type DeliveryAddress = {
  line1: string;
  line2?: string;
  suburb?: string;
  postcode: string;
  state?: string;
  country?: string;
};

// v2.3 §6 — every order is either delivered to the customer or picked up
// from the store. `pickup` mode skips address validation entirely.
export type DeliveryMode = 'delivery' | 'pickup';

// Single hardcoded store location for MVP. Move to a Supabase table when
// we need to support multiple stores.
export const PICKUP_LOCATION = {
  name: 'Perth Paint Supplies',
  address: '236 Planet St, Welshpool WA 6106',
  hours: 'Mon–Fri 7am – 4pm · Sat 8am – 12pm',
} as const;

export type ZoneCheck = {
  in_zone: boolean;
  label: 'Perth metro' | null;
};

// Tile labels mirror the supplier catalogue ("paint express products.xlsx",
// May 2026) so what customers tap matches the wording on the price sheet.
export const WHERE_TILES: { label: string; category: ProductCategory }[] = [
  { label: 'Interior',           category: 'Interior' },
  { label: 'Exterior',           category: 'Exterior' },
  { label: 'Trim',               category: 'Trim' },
  { label: 'Ceilings',           category: 'Ceilings' },
  { label: 'Undercoat',          category: 'Undercoat' },
  { label: 'Premium All-in-One', category: 'Premium All-in-One' },
  { label: 'Accessories',        category: 'Accessories' },
];

export const FINISHES: PaintFinish[] = [
  'Matt', 'Low Sheen', 'Semi Gloss', 'Gloss', 'Ultra Flat', 'Eggshell',
];

// v2.3 §8 — display metadata per category. Short name + range tag drive
// the product banner on the Finish screen; the full name is shown below.
type RangeMeta = { short: string; tag: string; full: string };
export const RANGE_META: Record<ProductCategory, RangeMeta> = {
  Interior: {
    short: 'Norutone',
    tag: 'Premium Interior',
    full: 'Noroo Norutone Premium Interior Paint',
  },
  Exterior: {
    short: 'Norusol',
    tag: 'Premium Exterior',
    full: 'Noroo Norusol Premium Exterior Paint',
  },
  Ceilings: {
    short: 'Norutone Ceiling',
    tag: 'Premium Ultra Flat',
    full: 'Noroo Norutone Ceiling',
  },
  Trim: {
    short: 'Multi Plus',
    tag: 'Acrylic Trim',
    full: 'Noroo Multi Plus Premium Acrylic Trim',
  },
  Undercoat: {
    short: 'Multi Primer',
    tag: 'Sealer Undercoat',
    full: 'Noroo Multi Primer Acrylic Sealer Undercoat',
  },
  'Premium All-in-One': {
    short: 'All Cover',
    tag: 'Ultra Premium',
    full: 'Noroo All Cover Ultra Premium All-in-One',
  },
  Accessories: {
    short: '',
    tag: 'Brushes · rollers',
    full: '',
  },
};

export const TIN_SIZES: TinSize[] = ['1L', '4L', '10L'];

// PRD §6.2 default swatch rotation when a product has no image.
export const DEFAULT_SWATCHES = [
  '#e9e2cf', '#f4ede0', '#fafaf7', '#ffffff', '#d6c9a8', '#fdf3ec', '#3a4a55',
];
