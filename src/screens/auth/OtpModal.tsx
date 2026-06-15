import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuthStore } from '../../state/authStore';
import { requestOtp as apiRequestOtp } from '../../api/client';
import { CTA } from '../../components/CTA';
import { colors, radii, shadows, spacing, text } from '../../theme';

// Six-box OTP entry. Matches PRD §5.3 spec and the Supabase project's
// configured OTP length (set Dashboard → Auth → Configuration → OTP length = 6).
// If Supabase emits a different length the verify call will return a
// generic error and we shake + ask the user to retry.

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function OtpModal({ visible, onClose }: Props) {
  const email = useAuthStore((s) => s.email);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState<number>(RESEND_SECONDS);

  const inputs = useRef<Array<TextInput | null>>([]);
  const shake = useRef(new Animated.Value(0)).current;

  // Reset state and start the resend timer each time the modal opens.
  useEffect(() => {
    if (!visible) return;
    setDigits(Array(CODE_LENGTH).fill(''));
    setErrorText(null);
    setResendIn(RESEND_SECONDS);
    // Focus the first box once it mounts.
    const t = setTimeout(() => inputs.current[0]?.focus(), 150);
    return () => clearTimeout(t);
  }, [visible]);

  // 1Hz countdown for the resend link.
  useEffect(() => {
    if (!visible || resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [visible, resendIn]);

  const triggerShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: -4, duration: 75, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shake, { toValue:  4, duration: 75, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -4, duration: 75, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shake, { toValue:  0, duration: 75, easing: Easing.linear, useNativeDriver: true }),
    ]).start();
  };

  const setDigit = (i: number, raw: string) => {
    // Allow paste of all six digits into any single box.
    const onlyDigits = raw.replace(/\D/g, '');
    if (onlyDigits.length > 1) {
      const next = onlyDigits.slice(0, CODE_LENGTH).split('');
      const padded = [...next, ...Array(CODE_LENGTH - next.length).fill('')].slice(0, CODE_LENGTH);
      setDigits(padded);
      setErrorText(null);
      const focusIdx = Math.min(next.length, CODE_LENGTH - 1);
      inputs.current[focusIdx]?.focus();
      return;
    }
    setDigits((prev) => {
      const next = [...prev];
      next[i] = onlyDigits;
      return next;
    });
    setErrorText(null);
    if (onlyDigits && i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const onKeyPress = (i: number, key: string) => {
    if (key !== 'Backspace') return;
    if (digits[i]) return; // backspace inside the box clears the digit first
    if (i > 0) inputs.current[i - 1]?.focus();
  };

  const code = digits.join('');
  const canSubmit = code.length === CODE_LENGTH && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await verifyOtp(code);
      // success — auth store flips mode to 'signed-in', navigator unmounts SignIn.
    } catch (e) {
      triggerShake();
      setErrorText(e instanceof Error ? e.message : "That code didn't match — try again");
      setDigits(Array(CODE_LENGTH).fill(''));
      inputs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (resendIn > 0 || !email) return;
    await apiRequestOtp(email).catch(() => undefined);
    setResendIn(RESEND_SECONDS);
    setErrorText(null);
  };

  const resendLabel = resendIn > 0
    ? `Resend in 0:${String(resendIn).padStart(2, '0')}`
    : 'Resend code';

  // Don't mount the Modal at all when hidden. On some Android builds, an
  // always-present transparent Modal sometimes keeps an invisible touch
  // layer in the window hierarchy, which swallows taps on the SignIn
  // input below — that's the "tap email field, no keyboard" bug from the
  // real APK. Conditional render avoids the issue entirely.
  if (!visible) return null;

  return (
    <Modal
      visible
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        // iOS uses 'padding'; Android needs 'height' to lift the sheet
        // above the soft keyboard inside a transparent Modal.
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <Pressable style={styles.backdropTap} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={text.screenH1}>Enter the {CODE_LENGTH}-digit code</Text>
          <Text style={[text.subHeading, styles.sub]}>
            {email
              ? `We've sent a verification code to ${email}`
              : "We've sent you a verification code."}
          </Text>

          <Animated.View style={[styles.boxesRow, { transform: [{ translateX: shake }] }]}>
            {digits.map((d, i) => (
              <View key={i} style={styles.boxCell}>
                <TextInput
                  ref={(r) => { inputs.current[i] = r; }}
                  value={d}
                  onChangeText={(v) => setDigit(i, v)}
                  onKeyPress={(e) => onKeyPress(i, e.nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={CODE_LENGTH}
                  textContentType="oneTimeCode"
                  autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                  style={[styles.box, errorText ? styles.boxError : null]}
                  selectTextOnFocus
                  returnKeyType="done"
                />
              </View>
            ))}
          </Animated.View>

          {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

          <Pressable
            onPress={resend}
            disabled={resendIn > 0 || !email}
            hitSlop={8}
            style={styles.resend}
          >
            <Text style={[
              text.footerLink,
              (resendIn > 0 || !email) && { color: colors.muted, textDecorationLine: 'none' },
            ]}>
              {resendLabel}
            </Text>
          </Pressable>

          <CTA label="Verify & continue" disabled={!canSubmit} loading={submitting} onPress={submit} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28,27,24,0.45)',
    justifyContent: 'flex-end',
  },
  backdropTap: { flex: 1 },
  sheet: {
    width: '100%',
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: spacing.sectionH,
    paddingBottom: 12,
  },
  sub: { marginTop: 4, marginBottom: 18 },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginBottom: 4,
  },
  // Tight margins keep 8 boxes legible at mobile widths (~40px each on a 375pt screen).
  boxCell: { flexBasis: 0, flexGrow: 1, flexShrink: 1, marginHorizontal: 2, minWidth: 0 },
  box: {
    alignSelf: 'stretch',
    height: 52,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    backgroundColor: '#fff',
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: colors.ink,
    ...shadows.resting,
  },
  boxError: { borderColor: colors.accent },
  error: {
    color: colors.accent,
    fontSize: 12.5,
    marginTop: 8,
  },
  resend: {
    alignItems: 'flex-start',
    paddingVertical: 10,
    marginBottom: 6,
  },
});
