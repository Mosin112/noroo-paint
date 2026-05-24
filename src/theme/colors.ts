// Color tokens lifted verbatim from PRD §3.1 — do not edit values without product sign-off.

export const colors = {
  bg: '#f6f3ec',
  paper: '#fbf9f4',
  ink: '#1c1b18',
  ink2: '#3a3833',
  muted: '#7a766d',
  rule: '#dcd6c8',
  rule2: '#efeadb',

  // PRD value is oklch(0.62 0.15 35); RN doesn't accept oklch, so we use the
  // sRGB conversion the prototype renders to (warm terracotta).
  accent: '#c0673a',
  accentTint: '#fdf3ec',
  accentBorder: '#f1d9c8',

  good: '#3a6b3e',
  warn: '#8b4a1a',

  fieldBorder: '#e3ddcc',
  fieldBorderHover: '#b8b09a',

  pillGoodBg: '#eef3ee',
  pillWarnBg: '#fbeede',

  qtyBg: '#f7f3e9',
  qtyText: '#6a665b',

  rowHover: '#fafaf7',
} as const;

export type ColorToken = keyof typeof colors;
