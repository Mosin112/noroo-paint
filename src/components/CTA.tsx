import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, shadows, spacing, text } from '../theme';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
};

// Primary CTA: red vertical gradient + faint top highlight. Ghost CTA:
// white bg, navy border + text.
//
// Layering — the touch surface is the Pressable itself, not an overlay
// on top of it. Earlier attempts kept the Pressable as a child of the
// gradient frame (and later, on top of it via absoluteFill) — both
// patterns left Android's tap region collapsing to the <Text> child on
// some devices, so periphery taps died.
//
// The current pattern:
//   <View wrap>              ← provides outer padding from screen edges
//     <View shadowHost>      ← carries the iOS shadow / Android elevation.
//                              No overflow:'hidden' so the shadow renders.
//       <Pressable button>   ← THIS is the touch surface. Has the radius,
//                              overflow:'hidden' (to clip the gradient),
//                              padding (for height) — its layout box equals
//                              the visible button.
//         <LinearGradient pointerEvents="none" />
//         <topHighlight pointerEvents="none" />
//         <Text>label</Text>
//       </Pressable>
//     </View>
//   </View>

export function CTA({ label, onPress, variant = 'primary', disabled, loading }: Props) {
  const isGhost = variant === 'ghost';
  const isInactive = disabled || loading;
  return (
    <View style={styles.wrap}>
      <View style={[styles.shadowHost, !isGhost && !isInactive && shadows.cta]}>
        <Pressable
          onPress={onPress}
          disabled={isInactive}
          android_ripple={isInactive ? undefined : { color: isGhost ? colors.tint : '#cd1017' }}
          style={({ pressed }) => [
            styles.button,
            isGhost ? styles.ghost : styles.primary,
            isInactive && styles.disabled,
            pressed && !isInactive && styles.pressed,
          ]}
        >
          {!isGhost ? (
            <>
              <LinearGradient
                pointerEvents="none"
                colors={['#f2333d', '#e5141b', '#cd1017']}
                locations={[0, 0.55, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[StyleSheet.absoluteFill, styles.noTouch]}
              />
              <View pointerEvents="none" style={[styles.topHighlight, styles.noTouch]} />
            </>
          ) : null}
          {loading ? (
            <ActivityIndicator color={isGhost ? colors.navy : '#fff'} />
          ) : (
            <Text style={isGhost ? text.ctaGhost : text.cta}>{label}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.ctaMarginTop,
    paddingHorizontal: spacing.ctaMarginH,
    paddingBottom: spacing.ctaMarginV,
  },
  // Shadow lives here. Needs a solid bg + borderRadius + NO overflow:hidden
  // for iOS to paint the shadow. backgroundColor matches the primary
  // button colour so the shadow tint reads correctly when the button
  // is visible.
  shadowHost: {
    borderRadius: radii.cta,
    backgroundColor: colors.accent,
  },
  // The actual touch surface. Pressable's hit region equals this layout
  // box on every platform — full-width via alignSelf:stretch, clipped to
  // the radius via overflow:'hidden'. Padding gives it height; no
  // absolute positioning involved.
  button: {
    alignSelf: 'stretch',
    borderRadius: radii.cta,
    overflow: 'hidden',
    paddingVertical: spacing.ctaPad + 1,
    paddingHorizontal: spacing.ctaPad,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: { backgroundColor: colors.accent },   // solid fallback under the gradient
  ghost: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.rule,
  },
  // 1px white highlight along the very top — fakes the inset highlight
  // RN doesn't support natively.
  topHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  noTouch: { pointerEvents: 'none' as const },
  pressed: { opacity: 0.95 },
  disabled: { opacity: 0.4 },
});
