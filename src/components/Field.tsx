import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, radii, spacing, text } from '../theme';

type Props = TextInputProps & {
  label: string;
  required?: boolean;
  rightAdornment?: React.ReactNode;
  // Renders an immutable display value instead of an input (e.g. masked card)
  readonlyValue?: string;
};

export function Field({ label, required, rightAdornment, readonlyValue, style, ...input }: Props) {
  return (
    <View style={[styles.wrap, required && styles.wrapRequired]}>
      <View style={styles.labelRow}>
        <Text style={required ? text.fieldLabelAccent : text.fieldLabel}>
          {label}
          {required ? ' *' : ''}
        </Text>
        {rightAdornment}
      </View>
      {readonlyValue !== undefined ? (
        <Text style={[text.fieldValue, styles.input]}>{readonlyValue}</Text>
      ) : (
        <TextInput
          style={[text.fieldValue, styles.input, style]}
          placeholderTextColor={colors.muted}
          {...input}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    backgroundColor: '#fff',
    borderRadius: radii.field,
    paddingVertical: spacing.fieldV,
    paddingHorizontal: spacing.fieldH,
    marginBottom: spacing.fieldGap,
    gap: 4,
  },
  wrapRequired: { borderColor: colors.accent },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: { padding: 0, margin: 0 },
});
