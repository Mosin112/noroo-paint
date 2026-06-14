import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors, radii, spacing, text } from '../theme';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
};

// Primary CTA: red, white text. Ghost CTA: white bg, navy border + text.
// Both follow the v2.3 design system §5.
//
// Why this shape:
//   - <View> wrap owns the *padding* (not margin) — the Pressable's box
//     is naturally inset by ctaMarginH on each side without overflow.
//   - <Pressable> uses alignSelf: 'stretch' so it fills the wrap's
//     content area edge-to-edge. RN-web previously collapsed Pressable's
//     hit region to its <Text> child even with the bg painted full-width;
//     using padding-on-parent + alignSelf stretch keeps the layout box
//     and the touch region the same size on every platform.

export function CTA({ label, onPress, variant = 'primary', disabled, loading }: Props) {
  const isGhost = variant === 'ghost';
  const isInactive = disabled || loading;
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        disabled={isInactive}
        android_ripple={isInactive ? undefined : { color: isGhost ? colors.tint : colors.accentPress }}
        style={({ pressed }) => [
          styles.base,
          isGhost ? styles.ghost : styles.primary,
          isInactive && styles.disabled,
          pressed && !isInactive && (isGhost ? styles.ghostPressed : styles.primaryPressed),
        ]}
      >
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
    paddingVertical: spacing.ctaPad,
    paddingHorizontal: spacing.ctaPad,
    borderRadius: radii.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.accent },
  primaryPressed: { backgroundColor: colors.accentPress },
  ghost: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.rule },
  ghostPressed: { borderColor: colors.navy, backgroundColor: colors.tint },
  disabled: { opacity: 0.4 },
});
