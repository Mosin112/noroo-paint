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
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.chip,
    backgroundColor: colors.rule2,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 4,
    marginBottom: 4,
  },
  hot: { backgroundColor: colors.accent, borderColor: colors.accent },
  text: { fontSize: 11, color: colors.ink2 },
  hotText: { color: '#fff' },
});
