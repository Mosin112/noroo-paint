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
// Layout is intentionally Pressable-on-top:
//   - <View> wrap owns the outer padding (button inset from screen edges).
//   - <View> frame inside owns the borderRadius + shadows + overflow:'hidden'
//     so the gradient is clipped to the radius. iOS shadow is on the frame
//     too — frame has a solid bg fallback so the shadow renders.
//   - <LinearGradient> + top-highlight sit at the bottom of the stack with
//     pointerEvents:'none' so they paint but don't capture taps.
//   - <Pressable> sits ON TOP via absoluteFill — its hit region is the
//     entire visible button area, regardless of what's painted behind it.
//   Previously the Pressable was the parent and the gradient was an overlay
//   inside it; on Android the Pressable's tap region collapsed to its <Text>
//   child even with pointerEvents:'none' on the overlays. This layering
//   pattern guarantees the Pressable owns the full hit box.

export function CTA({ label, onPress, variant = 'primary', disabled, loading }: Props) {
  const isGhost = variant === 'ghost';
  const isInactive = disabled || loading;
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.frame,
          isGhost ? styles.ghostFrame : styles.primaryFrame,
          !isGhost && !isInactive && shadows.cta,
          isInactive && styles.disabled,
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
        <Pressable
          onPress={onPress}
          disabled={isInactive}
          android_ripple={isInactive ? undefined : { color: isGhost ? colors.tint : '#cd1017' }}
          style={({ pressed }) => [
            styles.pressableFill,
            pressed && !isInactive && styles.pressed,
          ]}
        >
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
  // Houses the radius, shadow, and the gradient (clipped by overflow).
  // Must have a solid backgroundColor so iOS renders the shadow.
  frame: {
    borderRadius: radii.cta,
    overflow: 'hidden',
    minHeight: 48,
  },
  primaryFrame: { backgroundColor: colors.accent },
  ghostFrame: {
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
  // The Pressable sits on top of everything decorative — taps land here.
  // Uses absoluteFill so its hit region == the frame's visible area, on
  // every platform and regardless of how Android composes the painted layers.
  pressableFill: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    paddingVertical: spacing.ctaPad + 1,
    paddingHorizontal: spacing.ctaPad,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noTouch: { pointerEvents: 'none' as const },
  pressed: { opacity: 0.95 },
  disabled: { opacity: 0.4 },
});
