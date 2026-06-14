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

export function CTA({ label, onPress, variant = 'primary', disabled, loading }: Props) {
  const isGhost = variant === 'ghost';
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.base,
          isGhost ? styles.ghost : styles.primary,
          (disabled || loading) && styles.disabled,
          pressed && !disabled && !loading && (isGhost ? styles.ghostPressed : styles.primaryPressed),
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
    marginTop: spacing.ctaMarginTop,
    marginHorizontal: spacing.ctaMarginH,
    marginBottom: spacing.ctaMarginV,
  },
  base: {
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
