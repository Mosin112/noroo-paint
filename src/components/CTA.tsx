import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
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
// Touch handling — uses TouchableOpacity instead of Pressable.
//   Pressable's hit region got reported repeatedly as "only the centre
//   works" on real Android devices, even though every web-side verification
//   showed the layout box covering the full visible button. TouchableOpacity
//   has been the most reliable RN Android touchable for years — its hit
//   region is the whole touchable view, no special clipping/collapsing
//   quirks. We trade Pressable's per-platform ripple feedback for a uniform
//   activeOpacity squeeze, which is fine for a single primary CTA.
//
// Layering:
//   - <View wrap>          : outer padding from screen edges
//     - <TouchableOpacity> : THE touch surface + the visible button. Carries
//                            radius, padding, shadow, and bg fallback.
//                            Has overflow:'hidden' to clip the gradient.
//     - <LinearGradient>   : absolute fill inside the touchable. Doesn't
//                            need pointerEvents:'none' because TO swallows
//                            touches at its boundary regardless.
//     - <Text>             : centred content.

export function CTA({ label, onPress, variant = 'primary', disabled, loading }: Props) {
  const isGhost = variant === 'ghost';
  const isInactive = disabled || loading;
  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        onPress={onPress}
        disabled={isInactive}
        activeOpacity={0.85}
        style={[
          styles.button,
          isGhost ? styles.ghost : styles.primary,
          !isGhost && !isInactive && shadows.cta,
          isInactive && styles.disabled,
        ]}
      >
        {!isGhost ? (
          <>
            <LinearGradient
              colors={['#f2333d', '#e5141b', '#cd1017']}
              locations={[0, 0.55, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.topHighlight} />
          </>
        ) : null}
        {loading ? (
          <ActivityIndicator color={isGhost ? colors.navy : '#fff'} />
        ) : (
          <Text style={isGhost ? text.ctaGhost : text.cta}>{label}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.ctaMarginTop,
    paddingHorizontal: spacing.ctaMarginH,
    paddingBottom: spacing.ctaMarginV,
  },
  // The touch surface + the visible button — one element, no nesting.
  // alignSelf:'stretch' gives it the parent's content width; overflow:hidden
  // clips the gradient to the radius. Padding sets the height.
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
  primary: { backgroundColor: colors.accent }, // solid fallback under the gradient
  ghost: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.rule,
  },
  topHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  disabled: { opacity: 0.4 },
});
