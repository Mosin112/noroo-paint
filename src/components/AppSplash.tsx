import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Easing, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

// Single splash. The native Android splash is a flat navy fill (no
// artwork) — see app.json. When JS mounts, this component paints over
// it; the content (Noroo card, PAINT EXPRESS wordmark, tagline, dots)
// FADES IN from the same navy in ~280ms so there is no perceived jump
// from native → JS. After a short hold, the whole splash dissolves into
// the SignIn screen with another short fade.
//
// The result is: solid navy frame → navy + content fades in → navy +
// content holds → fades out to SignIn. No image-mismatch flash, no
// "two splash screens".

const FADE_IN_MS = 260;
const HOLD_MS = 1100;
const FADE_OUT_MS = 320;

export function AppSplash({ onDone }: { onDone: () => void }) {
  // Whole-wrap opacity for the exit fade (1 → 0).
  const fade = useRef(new Animated.Value(1)).current;
  // Content opacity for the entrance fade (0 → 1). Wrap is navy from
  // frame one so the user sees solid navy, then the artwork appears.
  const contentFade = useRef(new Animated.Value(0)).current;
  // Tiny scale-up on the card during the entrance + slight scale-down
  // on exit so the splash feels like it materialises and recedes
  // instead of popping.
  const cardScale = useRef(new Animated.Value(0.92)).current;
  // Three dots that pulse out-of-phase.
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    function pulse(value: Animated.Value, delay: number) {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(value, { toValue: 0.3, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      );
    }
    const a = pulse(dot1, 0);
    const b = pulse(dot2, 200);
    const c = pulse(dot3, 400);
    a.start(); b.start(); c.start();

    // Entrance: artwork fades in from navy + card eases up to 1.0.
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: FADE_IN_MS,
        easing: Easing.bezier(0.0, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: FADE_IN_MS,
        easing: Easing.bezier(0.0, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]).start();

    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 0,
          duration: FADE_OUT_MS,
          easing: Easing.bezier(0.4, 0.0, 0.6, 1),
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 0.97,
          duration: FADE_OUT_MS,
          easing: Easing.bezier(0.4, 0.0, 0.6, 1),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) onDone();
      });
    }, FADE_IN_MS + HOLD_MS);

    return () => {
      clearTimeout(t);
      a.stop(); b.stop(); c.stop();
    };
  }, [cardScale, contentFade, dot1, dot2, dot3, fade, onDone]);

  return (
    <Animated.View style={[styles.wrap, { opacity: fade }]} pointerEvents="none">
      <LinearGradient
        colors={['#2e4d7d', '#1f365c', '#101f3a']}
        locations={[0, 0.46, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.content, { opacity: contentFade }]}>
        <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}>
          <Image
            source={require('../../assets/noroo-paint-logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Noroo Paint"
          />
        </Animated.View>
        <View style={styles.wordmarkRow}>
          <Text style={[styles.wordmark, styles.wordmarkPaint]}>PAINT</Text>
          <Text style={[styles.wordmark, styles.wordmarkExpress]}> EXPRESS</Text>
        </View>
        <Text style={styles.tagline}>Paint, delivered fast.</Text>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    elevation: 999,
  },
  // Container around all the art so we can fade it in over the navy
  // backdrop without re-animating the navy itself.
  content: { alignItems: 'center', justifyContent: 'center' },
  card: {
    width: 220, height: 220,
    backgroundColor: '#fff',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 22 },
    elevation: 12,
  },
  logo: { width: '76%', height: '60%' },
  wordmarkRow: { flexDirection: 'row', alignItems: 'baseline' },
  wordmark: { fontSize: 26, fontWeight: '800', letterSpacing: 1 },
  wordmarkPaint: { color: '#fff' },
  wordmarkExpress: { color: colors.accent },
  tagline: {
    color: '#AEBBD3',
    fontSize: 14,
    marginTop: 10,
    letterSpacing: 0.2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 18,
  },
  dot: {
    width: 7, height: 7,
    borderRadius: 4,
    backgroundColor: '#5C6F93',
  },
});
