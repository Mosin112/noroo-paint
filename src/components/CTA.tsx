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
// Tap-region notes (the bit that keeps biting on Android):
//   - The Pressable carries NO overflow:'hidden'. RN-Android collapses
//     the touch region of a Pressable that has overflow:'hidden' on
//     some devices, killing periphery taps even when the visible bg
//     is full-width.
//   - The gradient + top highlight live inside an inner clipper <View>
//     that owns the borderRadius + overflow:'hidden'. That View is
//     pointerEvents:'none' so it cannot capture taps under any
//     circumstances.
//   - collapsable={false} on the Pressable stops Android from merging
//     it into a parent ViewGroup — another known hit-testing pitfall
//     with elevated, clipped views.
//   - Shadow lives on a sibling <View> (shadowHost) that wraps the
//     Pressable. iOS shadows need a solid bg + no clipping on the
//     shadow-carrier — keeping it on a separate view sidesteps that.

export function CTA({ label, onPress, variant = 'primary', disabled, loading }: Props) {
  const isGhost = variant === 'ghost';
  const isInactive = disabled || loading;
  return (
    <View style={styles.wrap}>
      <View style={[styles.shadowHost, !isGhost && !isInactive && shadows.cta]}>
        <Pressable
          onPress={onPress}
          disabled={isInactive}
          collapsable={false}
          android_ripple={isInactive ? undefined : { color: isGhost ? colors.tint : '#cd1017', borderless: false }}
          hitSlop={4}
          style={({ pressed }) => [
            styles.button,
            isGhost ? styles.ghost : styles.primary,
            isInactive && styles.disabled,
            pressed && !isInactive && styles.pressed,
          ]}
        >
          {!isGhost ? (
            <View pointerEvents="none" style={styles.clipFill}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.ctaMarginTop,
    paddingHorizontal: spacing.ctaMarginH,
    paddingBottom: spacing.ctaMarginV,
  },
  shadowHost: {
    borderRadius: radii.cta,
    backgroundColor: colors.accent,
  },
  // The visible button + the touch surface. NO overflow here.
  button: {
    alignSelf: 'stretch',
    borderRadius: radii.cta,
    paddingVertical: spacing.ctaPad + 1,
    paddingHorizontal: spacing.ctaPad,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: { backgroundColor: colors.accent },
  ghost: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.rule,
  },
  // Inner clipper — owns the radius + overflow so the gradient gets
  // masked without putting overflow:'hidden' on the Pressable itself.
  clipFill: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radii.cta,
    overflow: 'hidden',
  },
  topHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  noTouch: { pointerEvents: 'none' as const },
  pressed: { opacity: 0.95 },
  disabled: { opacity: 0.4 },
});
