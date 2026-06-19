import React from 'react';
import { View, Text, Image, Linking, Pressable, StyleSheet } from 'react-native';
import { colors, radii } from '../theme';

// Square map thumbnail + a "Directions" pill, both linked to the same
// Google Maps URL. Used on the Checkout pickup card and the Confirmed
// screen's order-detail block so customers can hop straight into Maps
// from either screen.
//
// The map is a static asset, not a live map view, to keep the bundle
// light and avoid pulling in a map SDK just for one thumbnail. Tapping
// either the thumbnail or the pill calls Linking.openURL with the same
// short Google Maps URL; the OS hands it off to Maps / Chrome / the
// default browser.

const DEFAULT_MAPS_URL = 'https://maps.app.goo.gl/Ar43rjDT8cYtLroq6';

export function PickupMap({ url = DEFAULT_MAPS_URL }: { url?: string }) {
  const open = () => { void Linking.openURL(url); };
  return (
    <View style={styles.col}>
      <Pressable
        onPress={open}
        android_ripple={{ color: colors.tint, borderless: false }}
        accessibilityRole="link"
        accessibilityLabel="Open pickup location in Maps"
        style={styles.thumb}
      >
        <Image
          source={require('../../assets/pickup-map.png')}
          style={styles.img}
          resizeMode="cover"
        />
      </Pressable>
      <Pressable
        onPress={open}
        android_ripple={{ color: '#13244a', borderless: false }}
        accessibilityRole="button"
        accessibilityLabel="Get directions"
        style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
      >
        <Text style={styles.pillText}>Directions</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  col: { alignItems: 'center', gap: 6 },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: '#fff',
  },
  img: { width: '100%', height: '100%' },
  pill: {
    backgroundColor: colors.navy,
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: radii.field * 2,
  },
  pillPressed: { backgroundColor: '#13244a' },
  pillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
