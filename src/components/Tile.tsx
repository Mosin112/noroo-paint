import React from 'react';
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

// v2.5 Tile:
//   - resting shadow at rest, raised shadow while pressed (swapped via
//     Pressable's pressed callback)
//   - solid white bg required so iOS actually paints the shadow
//   - icon chip is a soft navy-tinted LinearGradient so the chrome reads
//     as depth, not as a flat solid block

export function Tile({ label, title, icon, selected, fullWidth, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        pressed ? shadows.raised : shadows.resting,
        selected && styles.selected,
      ]}
    >
      {icon ? (
        <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
          {!selected ? (
            <LinearGradient
              colors={['#eef3fc', '#e2eaf8']}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.iconGradient}
            />
          ) : null}
          <View style={styles.iconGlyph}>{icon}</View>
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
    borderColor: colors.rule2,
    backgroundColor: colors.paper,
    borderRadius: radii.tile,
    paddingVertical: spacing.tileV,
    paddingHorizontal: spacing.tileH,
    gap: 8,
  },
  // Selected tile reads as the navy brand — opaque tint + navy border.
  selected: { borderColor: colors.navy, backgroundColor: colors.tint },
  fullWidth: { width: '100%', flexBasis: '100%', flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 38, height: 38,
    borderRadius: 11,
    overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.tint, // selected-state colour shows through when selected
  },
  iconWrapSelected: { backgroundColor: '#fff' },
  iconGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  iconGlyph: { alignItems: 'center', justifyContent: 'center' },
});

export function TileGrid({ children }: { children: React.ReactNode }) {
  return <View style={tileGridStyles.grid}>{children}</View>;
}

const tileGridStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
