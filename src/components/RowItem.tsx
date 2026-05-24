import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, radii, sizes, text } from '../theme';

type Props = {
  swatchColor?: string;
  title: string;
  subtitle?: string;
  right?: string | React.ReactNode;
  onPress?: () => void;
};

export function RowItem({ swatchColor = '#e9e2cf', title, subtitle, right, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.rowHover }]}
    >
      <View style={[styles.swatch, { backgroundColor: swatchColor }]} />
      <View style={styles.meta}>
        <Text style={text.rowTitle}>{title}</Text>
        {subtitle ? <Text style={text.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {typeof right === 'string' ? <Text style={text.price}>{right}</Text> : right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
  },
  swatch: {
    width: sizes.swatch,
    height: sizes.swatch,
    borderRadius: radii.swatch,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  meta: { flex: 1 },
});
