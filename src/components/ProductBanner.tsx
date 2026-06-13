import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

// Range banner on the Finish screen. Left border + faint tinted background
// in the range accent; uppercase tag + navy product name (Design System §9).
//
// Implements `<div class="prodbanner" style="border-left:4px solid #c; background:#c0d">`
// from the v2.3 prototype.

type Props = {
  tag: string;
  name: string;
  accentHex: string;
};

// Cheap RGBA blend so the background sits at ~5% of the accent. Works for
// any 6-digit hex value; falls back to plain navy tint if parsing fails.
function tintBg(hex: string): string {
  const m = hex.replace('#', '');
  if (m.length !== 6) return colors.tint;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.07)`;
}

export function ProductBanner({ tag, name, accentHex }: Props) {
  return (
    <View style={[styles.wrap, { borderLeftColor: accentHex, backgroundColor: tintBg(accentHex) }]}>
      <Text style={[styles.tag, { color: accentHex }]}>{tag}</Text>
      <Text style={styles.name}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderLeftWidth: 4,
    borderRadius: 11,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginTop: 2,
    marginBottom: 14,
  },
  tag: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 17,
  },
});
