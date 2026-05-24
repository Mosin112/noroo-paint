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
          pressed && !disabled && !loading && styles.pressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={isGhost ? colors.accent : '#fff'} />
        ) : (
          <Text style={[text.cta, isGhost && { color: colors.accent }]}>{label}</Text>
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
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.accent },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.9 },
});
