import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radii } from '../theme';

type Props = {
  brand?: string | null;
  colourName: string;
  hot?: boolean;
  onPress?: () => void;
};

export function SavedColourChip({ brand, colourName, hot, onPress }: Props) {
  const label = brand ? `${brand} ${colourName}` : colourName;
  return (
    <Pressable onPress={onPress} style={[styles.base, hot && styles.hot]}>
      <Text style={[styles.text, hot && styles.hotText]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: radii.chip,
    backgroundColor: colors.paper,
    borderWidth: 1.5,
    borderColor: colors.rule,
    marginRight: 5,
    marginBottom: 5,
  },
  // Hot (currently-applied) saved colour uses navy per design system §5.
  hot: { backgroundColor: colors.navy, borderColor: colors.navy },
  text: { fontSize: 11, color: colors.ink2, fontWeight: '600' },
  hotText: { color: '#fff' },
});
