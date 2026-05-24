import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

type Props = {
  children: React.ReactNode;
  // If provided, the children render inside a ScrollView with PRD body padding.
  scroll?: boolean;
  // Optional fixed footer (e.g. CTA) outside the scroll area.
  footer?: React.ReactNode;
};

export function Screen({ children, scroll = true, footer }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.body]}>{children}</View>
        )}
        {footer ? <View style={{ paddingBottom: insets.bottom }}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function ScreenSection({ children }: { children: React.ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  body: { paddingHorizontal: spacing.bodyH, paddingBottom: 24 },
  section: { paddingHorizontal: spacing.sectionH - spacing.bodyH, marginBottom: 16 },
});
