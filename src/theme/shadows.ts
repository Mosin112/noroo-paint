import type { ViewStyle } from 'react-native';

// v2.5 — depth tiers.
//
// React Native only supports a single shadow per view (no layered or inset
// shadows), so each tier is one tuned set of shadow* props + Android
// `elevation`. Apply to any View that needs the lift. The view MUST have a
// solid backgroundColor and MUST NOT be clipped by overflow:'hidden' on
// iOS — otherwise iOS swallows the shadow.

export const shadows = {
  // Cards, category tiles, summary panels — sitting on the page.
  resting: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  } satisfies ViewStyle,

  // Pressed / actively-selected tile, sheets that overlap content.
  raised: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 8,
  } satisfies ViewStyle,

  // Primary CTA — the red lift that signals "tap here".
  cta: {
    shadowColor: '#e5141b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.40,
    shadowRadius: 16,
    elevation: 10,
  } satisfies ViewStyle,
} as const;

export type ShadowTier = keyof typeof shadows;
