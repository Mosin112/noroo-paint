import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';

// iOS-style segment control. Two-option toggle used on Checkout to switch
// between Pickup and Delivery (v2.3 design system).

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (next: T) => void;
};

export function SegmentControl<T extends string>({ value, options, onChange }: Props<T>) {
  return (
    <View style={styles.wrap}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.btn, active && styles.btnActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.qtyBg,
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginVertical: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    backgroundColor: colors.paper,
    shadowColor: '#142B5C',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted },
  labelActive: { color: colors.navy },
});
