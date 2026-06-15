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

// 2.4 standardized corner radii.
export const radii = {
  field: 14,    // text inputs + OTP boxes
  tile: 18,    // category + product tiles
  chip: 999,   // fully rounded chips
  cta: 16,     // primary action button
  summary: 16, // summary cards
  alert: 14,
  qty: 10,
  swatch: 6,
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
