import React, { useState } from 'react';
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

// v2.3 fields read as calm at rest:
//   - Resting: neutral grey border, regardless of `required`.
//   - Focused: red border + soft red ring + red label.
//   - Required: shows a red asterisk in the label so the user still knows
//     it's mandatory without the field shouting at them.
// This matches the prototype's "outline-only-when-active" behaviour from
// the Address form spec (Design System §11).
export function Field({
  label,
  required,
  rightAdornment,
  trailingAction,
  readonlyValue,
  style,
  onFocus,
  onBlur,
  ...input
}: Props) {
  const [focused, setFocused] = useState(false);
  const showRedHighlight = focused;

  return (
    <View style={[styles.wrap, showRedHighlight && styles.wrapFocused]}>
      <View style={styles.labelRow}>
        <Text style={showRedHighlight ? text.fieldLabelAccent : text.fieldLabel}>
          {label}
          {required ? <Text style={styles.requiredStar}> *</Text> : null}
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
            onFocus={(e) => { setFocused(true); onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); onBlur?.(e); }}
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
    borderWidth: 1.5,
    borderColor: colors.fieldBorder,
    backgroundColor: colors.paper,
    borderRadius: 12,
    paddingVertical: spacing.fieldV,
    paddingHorizontal: spacing.fieldH,
    marginBottom: 9,
    gap: 3,
  },
  // Soft focus ring — red border + glow only while the field is active.
  wrapFocused: {
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // The asterisk stays red regardless of focus so required-ness is still
  // visible at rest.
  requiredStar: { color: colors.accent, fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputFlex: { flex: 1 },
  input: { padding: 0, margin: 0 },
  actionWrap: { marginLeft: 6 },
});
