import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../theme';

type Props = {
  children: React.ReactNode;
  // If provided, the children render inside a ScrollView with PRD body padding.
  scroll?: boolean;
  // Optional fixed footer (e.g. CTA) outside the scroll area.
  footer?: React.ReactNode;
  // Optional fixed header rendered above the scroll area — pass things
  // here that should stay pinned while the body scrolls (e.g. the
  // ProgressBar on the Checkout / Address screen).
  stickyHeader?: React.ReactNode;
};

// v2.5 — the page background is a vertical gradient from a near-white
// top into the neutral bg, approximating the radial we sketched in the
// design without needing react-native-svg here. The gradient sits in the
// safe-area frame, so the gutters above the notch and below the home
// indicator pick up the neutral bg cleanly.
const PAGE_BG = ['#f7f9fd', '#eef1f7', '#e6eaf2'] as const;

export function Screen({ children, scroll = true, footer, stickyHeader }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <LinearGradient
        colors={[...PAGE_BG]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {stickyHeader ? <View style={styles.stickyHeader}>{stickyHeader}</View> : null}
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
  stickyHeader: { paddingHorizontal: spacing.bodyH },
  section: { paddingHorizontal: spacing.sectionH - spacing.bodyH, marginBottom: 16 },
});
