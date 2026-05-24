import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { colors, radii } from '../theme';

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
};

export function QtyStepper({ value, onChange, min = 1, max = Infinity }: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const minusDisabled = value <= min;

  return (
    <View style={styles.wrap}>
      <Pressable onPress={dec} disabled={minusDisabled} style={[styles.btn, minusDisabled && styles.btnDisabled]}>
        <Minus size={14} color={colors.qtyText} />
      </Pressable>
      <Text style={styles.num}>{value}</Text>
      <Pressable onPress={inc} style={styles.btn}>
        <Plus size={14} color={colors.qtyText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: radii.qty,
    overflow: 'hidden',
  },
  btn: { backgroundColor: colors.qtyBg, paddingVertical: 6, paddingHorizontal: 12 },
  btnDisabled: { opacity: 0.4 },
  num: { paddingVertical: 6, paddingHorizontal: 14, fontWeight: '600', minWidth: 30, textAlign: 'center' },
});
