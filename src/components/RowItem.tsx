import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { PaintBucket } from 'lucide-react-native';
import { colors, text } from '../theme';

type Props = {
  // Hex colour for the thumbnail tile + paint-tin icon. v2.3 derives this
  // from the product's category accent (range colour).
  swatchColor?: string;
  // Override the default paint-tin icon (e.g. brush for accessories).
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: string | React.ReactNode;
  onPress?: () => void;
};

// Light-tinted square with a coloured paint-tin glyph. Matches v2.3 §9 —
// no image files, recolours from the range accent automatically.
export function RowItem({
  swatchColor = colors.navy,
  icon,
  title,
  subtitle,
  right,
  onPress,
}: Props) {
  const tile = hexAlpha(swatchColor, 0.13);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.rowHover }]}
    >
      <View style={[styles.thumb, { backgroundColor: tile }]}>
        {icon ?? <PaintBucket size={20} color={swatchColor} strokeWidth={1.8} />}
      </View>
      <View style={styles.meta}>
        <Text style={text.rowTitle} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text style={text.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {typeof right === 'string' ? <Text style={text.price}>{right}</Text> : right}
    </Pressable>
  );
}

function hexAlpha(hex: string, alpha: number): string {
  const m = hex.replace('#', '');
  if (m.length !== 6) return colors.tint;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
  },
  thumb: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flex: 1, minWidth: 0 },
});
