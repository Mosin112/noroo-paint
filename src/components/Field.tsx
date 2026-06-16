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
// here — the wrapper's border is our focus affordance.
const KILL_WEB_OUTLINE = Platform.OS === 'web'
  ? ({ outlineWidth: 0, outlineStyle: 'none' } as any)
  : null;

// v2.5 fields:
//   - Resting: neutral grey border. The whole frame is calm.
//   - Focused: navy border + a faint navy shadow ring.
//   - Required: red asterisk on the label only — the border NEVER turns
//     red, so the "you need to fill this" message is carried by the
//     label, not by a panicky red box around the input.
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
        <Text style={[text.fieldLabel, focused && styles.labelFocused]}>
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
    borderRadius: radii.field,
    paddingVertical: spacing.fieldV,
    paddingHorizontal: spacing.fieldH,
    marginBottom: 9,
    gap: 3,
  },
  // Border-only focus state. We had a navy shadow + elevation ring here
  // briefly during the v2.5 refresh — Android rebuilds the view's hardware
  // layer on every elevation toggle, which dismisses the IME (email field
  // wouldn't open the keyboard) and flickers neighbouring fields on the
  // Colour screen. Border colour alone is plenty of affordance and is the
  // only safe change on Android (no layer rebuild).
  wrapFocused: {
    borderColor: colors.navy,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  labelFocused: { color: colors.navy },
  // Red is reserved for the asterisk on required fields — the only red
  // accent inside a field's chrome.
  requiredStar: { color: colors.accent, fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputFlex: { flex: 1 },
  input: { padding: 0, margin: 0, fontFamily: text.fieldValue.fontFamily },
  inputTone: { fontSize: 14, fontWeight: '500', color: colors.ink },
  actionWrap: { marginLeft: 6 },
});
