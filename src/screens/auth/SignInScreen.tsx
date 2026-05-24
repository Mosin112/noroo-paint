import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Screen, ScreenHeader, Heading, Field, CTA, FooterLink } from '../../components';
import { useAuthStore } from '../../state';
import { colors, spacing, text } from '../../theme';

// PRD §5.2 — sign-in is "you@email.com" + a 6-digit code, or guest fallback.
// MVP: skip the OTP step in this scaffold; the OTP modal can land in Phase 1 finish.

function isValidContact(v: string): boolean {
  const trimmed = v.trim();
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phone = /^[\d\s+()-]{9,14}$/;
  return email.test(trimmed) || (phone.test(trimmed) && trimmed.replace(/\D/g, '').length >= 9);
}

export function SignInScreen() {
  const [contact, setContact] = useState('');
  const signIn = useAuthStore((s) => s.signIn);
  const signInAsGuest = useAuthStore((s) => s.signInAsGuest);

  const enabled = isValidContact(contact);

  return (
    <Screen
      footer={
        <>
          <CTA label="Send me a code" disabled={!enabled} onPress={() => signIn(contact.trim())} />
          <FooterLink label="Continue as guest →" onPress={signInAsGuest} />
        </>
      }
    >
      <ScreenHeader title="Welcome" rightAction={<View />} />
      <Heading
        title="Save your details"
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
        We'll text or email you a 6-digit code. No password to remember.
      </Text>
    </Screen>
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
});
