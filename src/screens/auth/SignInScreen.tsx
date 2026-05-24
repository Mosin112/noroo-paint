import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Screen, ScreenHeader, Heading, Field, CTA, FooterLink } from '../../components';
import { useAuthStore } from '../../state/authStore';
import { colors, spacing, text } from '../../theme';
import { OtpModal } from './OtpModal';

// PRD §5.2 — sign in is "you@email.com" + a 6-digit code, or guest fallback.

function isValidContact(v: string): boolean {
  const trimmed = v.trim();
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phone = /^[\d\s+()-]{9,14}$/;
  return email.test(trimmed) || (phone.test(trimmed) && trimmed.replace(/\D/g, '').length >= 9);
}

export function SignInScreen() {
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const mode = useAuthStore((s) => s.mode);
  const requestOtp = useAuthStore((s) => s.requestOtp);
  const signInAsGuest = useAuthStore((s) => s.signInAsGuest);
  const resetOtpFlow = useAuthStore((s) => s.resetOtpFlow);
  const lastError = useAuthStore((s) => s.lastError);

  const enabled = isValidContact(contact) && !submitting;

  const sendCode = async () => {
    if (!enabled) return;
    setSubmitting(true);
    try {
      await requestOtp(contact.trim());
    } catch {
      // Error is surfaced via authStore.lastError
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Screen
        footer={
          <>
            <CTA label="Send me a code" disabled={!enabled} loading={submitting} onPress={sendCode} />
            <FooterLink label="Continue as guest →" onPress={signInAsGuest} />
          </>
        }
      >
        <ScreenHeader title="Welcome" rightAction={<View />} />
        <Heading
          title="Please Sign Up"
          sub="We'll remember your address, last order and saved colours. Or continue as a guest."
        />
        <Field
          label="Email or mobile"
          required
          placeholder="you@email.com"
          value={contact}
          onChangeText={setContact}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        <Text style={styles.helper}>
          We'll email you a code. No password to remember.
        </Text>
        {lastError ? <Text style={styles.error}>{lastError}</Text> : null}
      </Screen>

      <OtpModal visible={mode === 'awaiting-otp'} onClose={resetOtpFlow} />
    </>
  );
}

const styles = StyleSheet.create({
  helper: {
    ...text.alertBody,
    color: colors.muted,
    fontSize: 11.5,
    paddingHorizontal: 4,
    paddingTop: spacing.fieldGap,
  },
  error: {
    ...text.alertBody,
    color: colors.accent,
    paddingHorizontal: 4,
    paddingTop: spacing.fieldGap,
  },
});
