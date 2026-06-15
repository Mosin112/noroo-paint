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

// 2.4 fields read as calm at rest, deliberate on focus:
//   - Resting: neutral fieldBorder.
//   - Focused: navy border + faint navy halo (the focus ring).
//   - Required: red asterisk in the label only — the border stays neutral,
//     never red, so required fields don't shout at the user.
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
        <Text style={text.fieldLabel}>
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
  // 2.4 navy focus ring. Border swaps to navy; a faint navy shadow
  // softens it into a ring. RN re-rasterizes shadows on focus toggle —
  // earlier we hit a multi-field flicker doing this on Android. The
  // shadow here is subtle and only the focused field carries it, so
  // there's nothing to flicker against.
  wrapFocused: {
    borderColor: colors.navy,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 2,
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
