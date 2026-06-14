import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, TextInputProps } from 'react-native';
import { colors, spacing, text } from '../theme';

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
//   - Focused: soft red border + faint ring + red asterisk in label.
//   - Required: red asterisk in the label only — the border doesn't shout.
//
// IMPORTANT: keep one consistent TextInput style. We used to swap
// fontSize+fontWeight when value crossed empty→filled to make placeholders
// look lighter — Android's keyboard dismisses on font-property changes
// mid-typing (real-device bug from the v0.2.0 APK). Now we use a single
// style and rely on placeholderTextColor for the muted look.
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
            style={[styles.input, styles.inputFlex, styles.inputTone, KILL_WEB_OUTLINE, style]}
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
  // Soft red border + barely-there glow. Calm at rest, clear on focus.
  wrapFocused: {
    borderColor: '#F2A0A4',
    shadowColor: colors.accent,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  requiredStar: { color: colors.accent, fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputFlex: { flex: 1 },
  input: { padding: 0, margin: 0, fontFamily: text.fieldValue.fontFamily },
  // Single consistent input tone — see comment on the component for the
  // Android keyboard bug we used to trip when this style toggled mid-typing.
  inputTone: { fontSize: 14, fontWeight: '500', color: colors.ink },
  actionWrap: { marginLeft: 6 },
});
