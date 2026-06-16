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

// Primary CTA: red vertical gradient with a faint top highlight and a
// brand-red glow underneath. Ghost CTA: white bg, navy border + text.
//
// Layering (the only nuance worth knowing):
//   - Pressable carries shadows.cta + a solid bg fallback. It MUST NOT have
//     overflow:'hidden' or iOS clips the shadow.
//   - A sibling <View> inside the Pressable holds borderRadius +
//     overflow:'hidden' and hosts the absolutely-positioned LinearGradient,
//     so the gradient is clipped to the radius without disturbing the
//     shadow.
//   - Wrap owns padding (not margin) so the Pressable's tap region is
//     identical to its visible box on every platform — Android was
//     collapsing margin+Pressable and the hit region overflowed.

export function CTA({ label, onPress, variant = 'primary', disabled, loading }: Props) {
  const isGhost = variant === 'ghost';
  const isInactive = disabled || loading;
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        disabled={isInactive}
        android_ripple={isInactive ? undefined : { color: isGhost ? colors.tint : '#cd1017' }}
        style={({ pressed }) => [
          styles.base,
          isGhost ? styles.ghost : styles.primaryFrame,
          !isGhost && !isInactive && shadows.cta,
          isInactive && styles.disabled,
          pressed && !isInactive && styles.pressed,
        ]}
      >
        {!isGhost ? (
          // pointerEvents set on EVERY overlay layer, both via props (legacy
          // RN compat) and style.pointerEvents (RN 0.76+ canonical). On
          // some Android builds, props-only pointerEvents="none" failed to
          // cascade to LinearGradient, leaving the gradient swallowing
          // periphery taps — that's the "only the centre works" bug.
          <View style={[styles.clip, styles.noTouch]} pointerEvents="none">
            <LinearGradient
              pointerEvents="none"
              colors={['#f2333d', '#e5141b', '#cd1017']}
              locations={[0, 0.55, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[StyleSheet.absoluteFill, styles.noTouch]}
            />
            <View pointerEvents="none" style={[styles.topHighlight, styles.noTouch]} />
          </View>
        ) : null}
        {loading ? (
          <ActivityIndicator color={isGhost ? colors.navy : '#fff'} />
        ) : (
          <Text style={isGhost ? text.ctaGhost : text.cta}>{label}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.ctaMarginTop,
    paddingHorizontal: spacing.ctaMarginH,
    paddingBottom: spacing.ctaMarginV,
  },
  base: {
    alignSelf: 'stretch',
    paddingVertical: spacing.ctaPad + 1,
    paddingHorizontal: spacing.ctaPad,
    borderRadius: radii.cta,
    alignItems: 'center',
    justifyContent: 'center',
    // No overflow:'hidden' here — would clip the iOS shadow.
  },
  // Solid fallback below the gradient + the "solid bg required for shadow".
  primaryFrame: { backgroundColor: colors.accent },
  ghost: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.rule,
  },
  // Sits inside the Pressable, fills it, clips the gradient + top
  // highlight to the radius. Stacks below the Text via DOM order.
  clip: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radii.cta,
    overflow: 'hidden',
  },
  // 1px white highlight along the very top — fakes the inset highlight
  // RN doesn't support natively.
  topHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  // RN 0.76+ canonical: pointer-events in style. Belt+suspenders with the
  // legacy prop above so we cover every version that ships through Expo.
  noTouch: { pointerEvents: 'none' as const },
  pressed: { opacity: 0.95 },
  disabled: { opacity: 0.4 },
});
