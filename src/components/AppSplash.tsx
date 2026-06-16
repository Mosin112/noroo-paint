import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Easing, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

// Single splash. The native Android splash is a composite that matches
// THIS component's static frame pixel-for-pixel (see app.json →
// assets/splash-noroo.png). The user therefore sees one continuous
// splash: native paints it during JS bundle load, this component mounts
// on top with identical content, the dots start pulsing, then it
// dissolves into SignIn. No fade-in (would create a swap-flash because
// native is already at full opacity), only a smooth fade-out.

const HOLD_MS = 1200;
const FADE_OUT_MS = 380;

export function AppSplash({ onDone }: { onDone: () => void }) {
  // Whole-wrap opacity for the exit fade (1 → 0).
  const fade = useRef(new Animated.Value(1)).current;
  // Tiny scale-down on the card during exit so the splash feels like
  // it recedes into the SignIn screen rather than blinking off.
  const cardScale = useRef(new Animated.Value(1)).current;
  // Three dots that pulse out-of-phase. Resting opacity 0.4 matches the
  // native composite, so when JS takes over the dots are already at
  // their visible "dim" state and start animating from there.
  const dot1 = useRef(new Animated.Value(0.4)).current;
  const dot2 = useRef(new Animated.Value(0.4)).current;
  const dot3 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    function pulse(value: Animated.Value, delay: number) {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(value, { toValue: 0.4, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      );
    }
    const a = pulse(dot1, 0);
    const b = pulse(dot2, 200);
    const c = pulse(dot3, 400);
    a.start(); b.start(); c.start();

    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 0,
          duration: FADE_OUT_MS,
          // Standard material out curve — quick at first, soft landing.
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 0.96,
          duration: FADE_OUT_MS,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) onDone();
      });
    }, HOLD_MS);

    return () => {
      clearTimeout(t);
      a.stop(); b.stop(); c.stop();
    };
  }, [cardScale, dot1, dot2, dot3, fade, onDone]);

  return (
    <Animated.View style={[styles.wrap, { opacity: fade }]} pointerEvents="none">
      <LinearGradient
        colors={['#2e4d7d', '#1f365c', '#101f3a']}
        locations={[0, 0.46, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
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
