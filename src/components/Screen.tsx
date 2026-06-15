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
};

// 2.4 background: a soft top-light → ground gradient. RN can't do radial
// gradients without react-native-svg layering, so we use a 3-stop linear
// gradient with a brighter highlight at the top, fading into the cool
// neutral ground. Visually close enough to the design's radial spot.
export function Screen({ children, scroll = true, footer }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <LinearGradient
        colors={['#F7F9FD', '#EEF1F7', '#E6EAF2']}
        locations={[0, 0.4, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
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
  // The gradient paints behind everything; safe needs a fallback colour
  // for the brief moment before the gradient mounts.
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  body: { paddingHorizontal: spacing.bodyH, paddingBottom: 24 },
  section: { paddingHorizontal: spacing.sectionH - spacing.bodyH, marginBottom: 16 },
});
