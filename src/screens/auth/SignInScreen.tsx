import React, { useState } from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';
import { Screen, ScreenHeader, Heading, Field, CTA, FooterLink } from '../../components';
import { useAuthStore } from '../../state/authStore';
import { colors, spacing, text } from '../../theme';
import { OtpModal } from './OtpModal';

// v2.3 sign in: brand logo at top → "Paint, delivered fast." → email field.
// Email-only per PRD §5 MVP decision (SMS OTP is Phase 2).

function isValidContact(v: string): boolean {
  const trimmed = v.trim();
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email.test(trimmed);
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
        <View style={styles.logoWrap}>
          <Image
            // Noroo Paint wordmark — used inside the app per v2.3 prototype.
            // (The Paint Express paint-tin mark stays as the launcher icon.)
            source={require('../../../assets/noroo-paint-logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Noroo Paint"
          />
        </View>
        <Heading
          align="center"
          title="Paint, delivered fast."
          sub="Save your details once. We'll remember your address, last order and saved colours."
        />
        <Field
          label="Email"
          required
          placeholder="you@email.com"
          value={contact}
          onChangeText={setContact}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        <Text style={styles.helper}>
          We'll email you a 6-digit code. No password to remember.
        </Text>
        {lastError ? <Text style={styles.error}>{lastError}</Text> : null}
      </Screen>

      <OtpModal visible={mode === 'awaiting-otp'} onClose={resetOtpFlow} />
    </>
  );
}

const styles = StyleSheet.create({
  logoWrap: { alignItems: 'center', paddingTop: 6, paddingBottom: 4 },
  logo: { height: 110, width: '74%', maxWidth: 260 },
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
