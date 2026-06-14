import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, TextInputProps } from 'react-native';
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

// On web RN-web leaves the browser's native :focus outline on <input>,
// which renders as an orange/yellow rectangle around the field. Kill it
// here — the wrapper's red border + soft ring is our focus affordance.
const KILL_WEB_OUTLINE = Platform.OS === 'web'
  ? ({ outlineWidth: 0, outlineStyle: 'none' } as any)
  : null;

// v2.3 fields read as calm at rest:
//   - Resting: neutral grey border.
//   - Focused: red border (softer than the saturated brand red) + light ring + red label.
//   - Required: red asterisk in the label only — the border doesn't shout.
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
  // Treat empty / whitespace-only strings as empty so the placeholder
  // styling kicks in. Numbers (used for some inputs) coerce naturally.
  const value = input.value;
  const isEmpty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

  return (
    <View style={[styles.wrap, focused && styles.wrapFocused]}>
      <View style={styles.labelRow}>
        <Text style={focused ? text.fieldLabelAccent : text.fieldLabel}>
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
            style={[
              styles.input,
              styles.inputFlex,
              // Placeholder appearance — slightly smaller, normal weight,
              // so it doesn't look like the user already typed something.
              isEmpty ? styles.inputPlaceholderTone : styles.inputTypedTone,
              KILL_WEB_OUTLINE,
              style,
            ]}
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
  // Soft red border — toned down from the previous 1.5px saturated red +
  // 18% opacity ring (felt like an error state). Now it's the same width
  // with a near-invisible glow that just hints at focus.
  wrapFocused: {
    borderColor: '#F2A0A4',
    shadowColor: colors.accent,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Asterisk stays in the strong brand red so required-ness reads at a glance.
  requiredStar: { color: colors.accent, fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputFlex: { flex: 1 },
  input: { padding: 0, margin: 0, fontFamily: text.fieldValue.fontFamily },
  // Typed value — full ink weight, real size.
  inputTypedTone: { fontSize: 14, fontWeight: '600', color: colors.ink },
  // Placeholder hint — smaller, normal weight, muted color.
  inputPlaceholderTone: { fontSize: 13, fontWeight: '400', color: colors.ink },
  actionWrap: { marginLeft: 6 },
});
