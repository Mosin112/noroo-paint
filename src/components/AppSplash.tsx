import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Easing, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

// Single splash. The native Android splash is a flat navy fill (no logo
// image) — see app.json → splash-navy-blank.png. When JS mounts, this
// component lights up the same navy backdrop and animates the artwork
// IN from nothing, exactly matching the Paint Express Splash HTML
// prototype:
//
//   disc        : scale 0.72 → 1.05 → 1.0, opacity 0 → 1, 700ms cubic
//                 (0.2, 0.8, 0.2, 1)
//   wordmark    : opacity 0 + translateY 10 → opacity 1, 550ms with
//                 250ms delay (ease-out)
//   tagline     : same fade-up, 420ms delay
//   dots        : 1.2s pulse, 200ms / 400ms phase offsets
//
// After a short hold, the splash fades out into SignIn.

// Halved from 900ms — the intro animations carry their own visual
// "beat", and customers were waiting too long after they landed.
const HOLD_AFTER_INTRO_MS = 450;
// Staggered exit — disc dissolves first, then the wordmark / tagline /
// dots, then the navy backdrop. Each piece fades in 360ms; the stagger
// between starts is 140ms, so the whole exit takes roughly 360+280ms.
// A subtle 1.0 → 1.05 zoom on the content group runs underneath for
// the "pulled into the next screen" feel.
const FADE_OUT_MS = 360;
const STAGGER_MS = 140;
// Pull the prototype's curves out so the timing reads at a glance.
const DISC_DURATION = 700;
const WORD_DURATION = 550;
const WORD_DELAY = 250;
const TAG_DELAY = 420;

const DISC_EASING = Easing.bezier(0.2, 0.8, 0.2, 1);
const FADE_UP_EASING = Easing.bezier(0.0, 0.0, 0.2, 1);

export function AppSplash({ onDone }: { onDone: () => void }) {
  // Three separate exit fades so the splash peels away in layers.
  // Disc leaves first, then the wordmark/tagline/dots, then the navy
  // wrap — the user reads it as the artwork "exiting" before the
  // background, which feels less like a hard cut than a single
  // opacity fade.
  const wrapFade = useRef(new Animated.Value(1)).current;
  const tailFade = useRef(new Animated.Value(1)).current;
  // Subtle scale-up on exit — content zooms toward the viewer for
  // the "pulled into the next screen" feel.
  const exitScale = useRef(new Animated.Value(1)).current;

  // Per the prototype's @keyframes discIn: 0→1.05→1.0 scale, 0→1 opacity.
  // RN can't do a 3-stop keyframe in one timing(), so we chain
  // 0.72→1.05 then 1.05→1.0 to match the visual.
  const discScale = useRef(new Animated.Value(0.72)).current;
  const discOpacity = useRef(new Animated.Value(0)).current;

  // Word + tagline ease up from translateY 10 + opacity 0.
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordTranslate = useRef(new Animated.Value(10)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const tagTranslate = useRef(new Animated.Value(10)).current;

  // Three dots pulse out-of-phase once the intro lands.
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

    Animated.parallel([
      // Disc: 0.72 → 1.05 (60%) → 1.0 in 700ms, opacity 0 → 1 in 700ms.
      Animated.sequence([
        Animated.parallel([
          Animated.timing(discScale, {
            toValue: 1.05,
            duration: DISC_DURATION * 0.6,
            easing: DISC_EASING,
            useNativeDriver: true,
          }),
          Animated.timing(discOpacity, {
            toValue: 1,
            duration: DISC_DURATION * 0.6,
            easing: DISC_EASING,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(discScale, {
          toValue: 1,
          duration: DISC_DURATION * 0.4,
          easing: DISC_EASING,
          useNativeDriver: true,
        }),
      ]),
      // Wordmark fade-up at 250ms.
      Animated.sequence([
        Animated.delay(WORD_DELAY),
        Animated.parallel([
          Animated.timing(wordOpacity, { toValue: 1, duration: WORD_DURATION, easing: FADE_UP_EASING, useNativeDriver: true }),
          Animated.timing(wordTranslate, { toValue: 0, duration: WORD_DURATION, easing: FADE_UP_EASING, useNativeDriver: true }),
        ]),
      ]),
      // Tagline fade-up at 420ms.
      Animated.sequence([
        Animated.delay(TAG_DELAY),
        Animated.parallel([
          Animated.timing(tagOpacity, { toValue: 1, duration: WORD_DURATION, easing: FADE_UP_EASING, useNativeDriver: true }),
          Animated.timing(tagTranslate, { toValue: 0, duration: WORD_DURATION, easing: FADE_UP_EASING, useNativeDriver: true }),
        ]),
      ]),
    ]).start(() => {
      // Start the dots only after the intro completes — feels less busy
      // than having them pulsing while the disc is still scaling in.
      a.start(); b.start(); c.start();
    });

    // After the intro + a short hold, peel the splash away in layers.
    // 1) Disc: fades via discOpacity (reused — was 1 after intro).
    // 2) Tail (wordmark + tagline + dots): fades via tailFade, 140ms
    //    after the disc starts so it visibly trails behind.
    // 3) Wrap (navy backdrop + LinearGradient): fades via wrapFade,
    //    another 140ms later, so the background is the last thing to
    //    leave the screen.
    // A gentle scale-up on the content group runs across the whole
    // exit for the "pulled into the next screen" feel.
    const introMs = Math.max(DISC_DURATION, TAG_DELAY + WORD_DURATION);
    const exitEasing = Easing.bezier(0.0, 0.0, 0.2, 1);
    const t = setTimeout(() => {
      // Stop the dot loop so the dots fade with the tail instead of
      // continuing to pulse during the exit.
      a.stop(); b.stop(); c.stop();
      const total = FADE_OUT_MS + STAGGER_MS * 2;
      Animated.parallel([
        Animated.timing(exitScale, { toValue: 1.05, duration: total, easing: exitEasing, useNativeDriver: true }),
        // Disc fades first.
        Animated.timing(discOpacity, { toValue: 0, duration: FADE_OUT_MS, easing: exitEasing, useNativeDriver: true }),
        // Tail fades after 140ms.
        Animated.sequence([
          Animated.delay(STAGGER_MS),
          Animated.timing(tailFade, { toValue: 0, duration: FADE_OUT_MS, easing: exitEasing, useNativeDriver: true }),
        ]),
        // Wrap fades after another 140ms.
        Animated.sequence([
          Animated.delay(STAGGER_MS * 2),
          Animated.timing(wrapFade, { toValue: 0, duration: FADE_OUT_MS, easing: exitEasing, useNativeDriver: true }),
        ]),
      ]).start(({ finished }) => {
        if (finished) onDone();
      });
    }, introMs + HOLD_AFTER_INTRO_MS);

    return () => {
      clearTimeout(t);
      a.stop(); b.stop(); c.stop();
    };
  }, [discOpacity, discScale, dot1, dot2, dot3, exitScale, onDone, tagOpacity, tagTranslate, tailFade, wordOpacity, wordTranslate, wrapFade]);

  return (
    <Animated.View style={[styles.wrap, { opacity: wrapFade }]} pointerEvents="none">
      {/* Radial-ish navy backdrop — RN doesn't support radial gradients
          natively, so we use a top-to-bottom approximation that reads
          identically with the eye drawn to the centre. */}
      <LinearGradient
        colors={['#2f5290', '#1f365c', '#13244a']}
        locations={[0, 0.46, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[
          styles.contentGroup,
          {
            transform: [{ scale: exitScale }],
          },
        ]}
      >
      <Animated.View
        style={[
          styles.disc,
          {
            opacity: discOpacity,
            transform: [{ scale: discScale }],
          },
        ]}
      >
        <Image
          source={require('../../assets/noroo-paint-logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Noroo Paint"
        />
      </Animated.View>
      <Animated.View style={[styles.tail, { opacity: tailFade }]}>
        <Animated.View
          style={[
            styles.wordmarkRow,
            { opacity: wordOpacity, transform: [{ translateY: wordTranslate }] },
          ]}
        >
          <Text style={[styles.wordmark, styles.wordmarkPaint]}>PAINT</Text>
          <Text style={[styles.wordmark, styles.wordmarkExpress]}> EXPRESS</Text>
        </Animated.View>
        <Animated.Text
          style={[
            styles.tagline,
            { opacity: tagOpacity, transform: [{ translateY: tagTranslate }] },
          ]}
        >
          Paint, delivered fast.
        </Animated.Text>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
      </Animated.View>
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
  // Wraps the disc + wordmark + tagline + dots so the exit translate/
  // scale move them together — the navy backdrop stays put and fades
  // independently.
  contentGroup: { alignItems: 'center', justifyContent: 'center' },
  // Wordmark + tagline + dots share this wrapper so they can fade as
  // a unit during the staggered exit, AFTER the disc has dissolved.
  tail: { alignItems: 'center', justifyContent: 'center' },
  // Smaller than the previous 220×220 to match the HTML prototype's
  // 156×156 — the smaller disc gives the wordmark + dots more vertical
  // room without crowding the centre.
  disc: {
    width: 156, height: 156,
    backgroundColor: '#fff',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 22 },
    elevation: 12,
  },
  logo: { width: '78%', height: '60%' },
  wordmarkRow: { flexDirection: 'row', alignItems: 'baseline' },
  wordmark: { fontSize: 24, fontWeight: '800', letterSpacing: 1.2 },
  wordmarkPaint: { color: '#fff' },
  wordmarkExpress: { color: '#ff5560' },
  tagline: {
    color: '#aebbd3',
    fontSize: 13,
    marginTop: 8,
    letterSpacing: 0.2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 14,
  },
  dot: {
    width: 7, height: 7,
    borderRadius: 4,
    backgroundColor: '#5c6f93',
  },
});
