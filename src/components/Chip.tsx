import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { colors, radii, spacing, text } from '../theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.base, selected && styles.selected]}>
      <Text style={[text.chip, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  base: {
    paddingVertical: spacing.chipV + 1,
    paddingHorizontal: spacing.chipH + 1,
    borderRadius: radii.chip,
    backgroundColor: colors.paper,
    borderWidth: 1.5,
    borderColor: colors.rule,
  },
  // Selected chip in v2.3: navy fill, white text, navy border. Red is
  // reserved for primary CTAs only.
  selected: { backgroundColor: colors.navy, borderColor: colors.navy },
  selectedText: { color: '#fff' },
});
