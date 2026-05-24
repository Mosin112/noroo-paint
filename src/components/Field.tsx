import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, radii, spacing, text } from '../theme';

type Props = TextInputProps & {
  label: string;
  required?: boolean;
  rightAdornment?: React.ReactNode;
  // Renders next to the input itself (e.g. a "save" tick button).
  trailingAction?: React.ReactNode;
  // Renders an immutable display value instead of an input (e.g. masked card)
  readonlyValue?: string;
};

export function Field({
  label,
  required,
  rightAdornment,
  trailingAction,
  readonlyValue,
  style,
  ...input
}: Props) {
  return (
    <View style={[styles.wrap, required && styles.wrapRequired]}>
      <View style={styles.labelRow}>
        <Text style={required ? text.fieldLabelAccent : text.fieldLabel}>
          {label}
          {required ? ' *' : ''}
        </Text>
        {rightAdornment}
      </View>
      <View style={styles.inputRow}>
        {readonlyValue !== undefined ? (
          <Text style={[text.fieldValue, styles.input, styles.inputFlex]}>{readonlyValue}</Text>
        ) : (
          <TextInput
            style={[text.fieldValue, styles.input, styles.inputFlex, style]}
            placeholderTextColor={colors.muted}
            {...input}
          />
        )}
        {trailingAction ? <View style={styles.actionWrap}>{trailingAction}</View> : null}
      </View>
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
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputFlex: { flex: 1 },
  input: { padding: 0, margin: 0 },
  actionWrap: { marginLeft: 6 },
});
