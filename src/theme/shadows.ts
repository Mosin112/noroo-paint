// 2.4 elevation tokens. RN only supports a single shadow per view (no
// layered or inset shadows), so each tier is tuned to approximate the
// soft, slightly-displaced feel of the design-system layered shadows.
// Pair shadowColor + shadowOffset/Opacity/Radius for iOS with elevation
// for Android. Any view using these MUST have a solid backgroundColor
// (RN can't shadow a transparent box) and must NOT have overflow:'hidden'
// on iOS — both clip the shadow.

import type { ViewStyle } from 'react-native';

export const shadows: Record<'resting' | 'raised' | 'cta', ViewStyle> = {
  // Resting state for cards, tiles, summary panels.
  resting: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  // Pressed/active state for interactive tiles — softer feel of "lift".
  raised: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 8,
  },
  // Brand-red glow under primary CTAs.
  cta: {
    shadowColor: '#E5141B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.40,
    shadowRadius: 16,
    elevation: 10,
  },
};
