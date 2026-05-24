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
  suburb?: string;
  postcode: string;
  state?: string;
  country?: string;
};

export type ZoneCheck = {
  in_zone: boolean;
  label: 'Perth metro' | null;
};

// Maps PRD §6.4 tile labels → product categories.
export const WHERE_TILES: { label: string; category: ProductCategory }[] = [
  { label: 'Indoor walls',  category: 'Interior' },
  { label: 'Outdoor walls', category: 'Exterior' },
  { label: 'Trim & doors',  category: 'Trim' },
  { label: 'Ceiling',       category: 'Ceilings' },
  { label: 'Undercoat',     category: 'Undercoat' },
  { label: 'All-in-One',    category: 'Premium All-in-One' },
  { label: 'Accessories',   category: 'Accessories' },
];

export const FINISHES: PaintFinish[] = [
  'Matt', 'Low Sheen', 'Semi Gloss', 'Gloss', 'Ultra Flat', 'Eggshell',
];

export const TIN_SIZES: TinSize[] = ['1L', '4L', '10L'];

// PRD §6.2 default swatch rotation when a product has no image.
export const DEFAULT_SWATCHES = [
  '#e9e2cf', '#f4ede0', '#fafaf7', '#ffffff', '#d6c9a8', '#fdf3ec', '#3a4a55',
];
