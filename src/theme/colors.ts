// Paint Express v2.3 — navy + red palette. Replaces the warm cream/terracotta
// scheme from PRD §3.1. Tokens lifted verbatim from the "Paint Express Design
// System" doc; comment values must not drift from the source.
//
// Brand logic: NAVY carries the brand (headings, selected states, links,
// progress, chip-selected). RED is reserved for the primary action only —
// CTAs and required-field highlights. This keeps red feeling intentional
// instead of decorative.

export const colors = {
  // App surfaces — 2.4 cooler-cleaner neutral palette
  bg: '#EEF1F7',
  paper: '#FFFFFF',

  // Text
  ink: '#111C33',
  ink2: '#384663',
  muted: '#6A7892',

  // Borders / dividers
  rule: '#E7EBF3',
  rule2: '#F0F3F9',
  fieldBorder: '#DCE3EF',
  fieldBorderHover: '#B7C2D6',

  // Brand navy (primary) — unchanged
  navy: '#1F365C',
  navyDeep: '#16284A',
  tint: '#EEF3FC', // navy 8% tint — selected tile bg, info alerts, icon tile fill

  // Brand red (action) — sole owner of "primary CTA" and required-field UX
  accent: '#E5141B',
  accentPress: '#C11017',
  accentTint: '#FDECEC',  // legacy name kept for back-compat with v1 code
  redTint: '#FDECEC',
  accentBorder: '#F6CCCC', // for warning alert borders

  // Quantity stepper / muted controls
  qtyBg: '#EEF2F8',
  qtyText: '#3A4A66',

  // Semantic
  good: '#1B7A4B',
  goodBg: '#E7F4EE',
  pillGoodBg: '#E7F4EE', // legacy alias
  warn: '#C0341B',
  warnBg: '#FBEDE9',
  pillWarnBg: '#FBEDE9', // legacy alias
  amber: '#9A6512',
  amberBg: '#FBF2E2',

  // Row hover (interactive list items)
  rowHover: '#FAFBFF',
} as const;

export type ColorToken = keyof typeof colors;

// Per-range accent colours used for product thumbnails + category tags
// (Design System §9). Centralised here so screens just read by category.
export const rangeColors: Record<string, string> = {
  Interior: '#1E8C9C',          // Norutone — teal
  Exterior: '#46A52B',          // Norusol — green
  Ceilings: '#1F9BD4',          // Norutone Ceiling — sky
  Trim: '#C8870A',              // Multi Plus — amber
  Undercoat: '#CE1A7E',         // Multi Primer — magenta
  'Premium All-in-One': '#7A2AA8', // All Cover — purple
  Accessories: '#5C6A85',       // Slate
};

export function rangeColor(category: string | null | undefined): string {
  if (!category) return colors.navy;
  return rangeColors[category] ?? colors.navy;
}
