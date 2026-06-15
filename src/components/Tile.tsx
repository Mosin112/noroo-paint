import React, { useState } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, shadows, spacing, text } from '../theme';

type Props = {
  label?: string;       // small uppercase caption (optional in v2.3 layout)
  title: string;        // main tile title
  // Render an icon at the top-left in a small rounded square.
  icon?: React.ReactNode;
  selected?: boolean;
  // Tile spans the full grid row (used for the Accessories card in v2.3).
  fullWidth?: boolean;
  onPress?: () => void;
};

// 2.4 tile: resting shadow + radius 18. Pressed state swaps the shadow
// to `raised` so the tile visibly "lifts" when touched. Icon square is
// filled with a soft navy-tinted linear gradient.

export function Tile({ label, title, icon, selected, fullWidth, onPress }: Props) {
  const [active, setActive] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setActive(true)}
      onPressOut={() => setActive(false)}
      style={[
        styles.base,
        fullWidth && styles.fullWidth,
        selected && styles.selected,
        active ? shadows.raised : shadows.resting,
      ]}
    >
      {icon ? (
        <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
          {!selected ? (
            <LinearGradient
              colors={['#EEF3FC', '#E2EAF8']}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={[StyleSheet.absoluteFill, styles.iconGradient]}
            />
          ) : null}
          <View style={styles.iconInner}>{icon}</View>
        </View>
      ) : null}
      {label ? <Text style={text.tileLabel}>{label}</Text> : null}
      <Text style={text.tileTitle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.paper,
    borderRadius: radii.tile,
    paddingVertical: spacing.tileV,
    paddingHorizontal: spacing.tileH,
    gap: 8,
  },
  // Per v2.3: selected tile uses navy border + tint background.
  selected: { borderColor: colors.navy, backgroundColor: colors.tint },
  fullWidth: { width: '100%', flexBasis: '100%', flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: colors.tint, // fallback under gradient
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  iconWrapSelected: { backgroundColor: '#fff' },
  iconGradient: { borderRadius: 12 },
  iconInner: { alignItems: 'center', justifyContent: 'center' },
});

export function TileGrid({ children }: { children: React.ReactNode }) {
  return <View style={tileGridStyles.grid}>{children}</View>;
}

const tileGridStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
