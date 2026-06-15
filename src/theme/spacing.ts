// Spacing, radii — from PRD §3.3. Values are RN points (px equivalents).

export const spacing = {
  bodyH: 18,        // phone screen body horizontal padding
  sectionH: 22,     // H1/sub horizontal margin
  fieldV: 10,       // field vertical padding
  fieldH: 14,       // field horizontal padding
  fieldGap: 8,      // gap below each field
  tileV: 18,
  tileH: 14,
  chipV: 6,
  chipH: 12,
  ctaPad: 14,
  ctaMarginV: 18,
  ctaMarginTop: 14,
  ctaMarginH: 18,
  summaryV: 10,
  summaryH: 14,
  alertV: 12,
  alertH: 14,
  progressGap: 4,
  statusV: 14,
  statusH: 26,
  statusBottom: 6,
  navV: 8,
  navH: 18,
} as const;

// v2.5 — radius tokens standardised to the design-system spec:
//   tile 18 · field 14 · summary 16 · otp 14 · chip 999 (pill) · cta 16
// Older values (field 10, tile 12, summary 10) felt flat — bumped to the
// next step up so the depth tiers in `shadows` have room to read.
export const radii = {
  field: 14,
  tile: 18,
  chip: 999,
  cta: 16,
  summary: 16,
  alert: 14,
  qty: 10,
  swatch: 8,
  otp: 14,
  progress: 2,
} as const;

export const sizes = {
  swatch: 28,
  successCircle: 64,
  progressHeight: 3,
  fieldBorder: 1,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
} as const;
