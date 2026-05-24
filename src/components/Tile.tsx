import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing, text } from '../theme';

type Props = {
  label: string;       // small uppercase caption
  title: string;       // main tile title
  selected?: boolean;
  onPress?: () => void;
};

export function Tile({ label, title, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected && styles.selected,
        pressed && !selected && styles.pressed,
      ]}
    >
      <Text style={text.tileLabel}>{label}</Text>
      <Text style={text.tileTitle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    backgroundColor: '#fff',
    borderRadius: radii.tile,
    paddingVertical: spacing.tileV,
    paddingHorizontal: spacing.tileH,
    gap: 6,
  },
  selected: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  pressed: { borderColor: colors.fieldBorderHover },
});

export function TileGrid({ children }: { children: React.ReactNode }) {
  return <View style={tileGridStyles.grid}>{children}</View>;
}

const tileGridStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
