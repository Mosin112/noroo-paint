import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing, text } from '../theme';

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

export function Tile({ label, title, icon, selected, fullWidth, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        selected && styles.selected,
        pressed && !selected && styles.pressed,
      ]}
    >
      {icon ? (
        <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
          {icon}
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
    borderWidth: 1.5,
    borderColor: colors.rule,
    backgroundColor: colors.paper,
    borderRadius: 15,
    paddingVertical: spacing.tileV,
    paddingHorizontal: spacing.tileH,
    gap: 8,
  },
  // Per v2.3: selected tile uses navy border + tint background; caption
  // turns navy (handled at the label call-site if needed).
  selected: { borderColor: colors.navy, backgroundColor: colors.tint },
  pressed: { borderColor: colors.fieldBorderHover },
  fullWidth: { width: '100%', flexBasis: '100%', flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: colors.tint,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapSelected: { backgroundColor: '#fff' },
});

export function TileGrid({ children }: { children: React.ReactNode }) {
  return <View style={tileGridStyles.grid}>{children}</View>;
}

const tileGridStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
