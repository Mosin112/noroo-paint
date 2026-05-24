import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radii, spacing, text } from '../theme';
import { captureError } from '../lib/sentry';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; err: Error | null };

// React error boundary. Catches anything thrown by descendants during
// render / lifecycle and reports via Sentry, plus shows a friendly fallback
// instead of a white-screen crash.

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, err: null };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, err };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    captureError(err, { componentStack: info.componentStack });
  }

  reset = () => this.setState({ hasError: false, err: null });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>
          The app hit an unexpected error. Our team's been notified — try again.
        </Text>
        {this.state.err?.message ? (
          <Text style={styles.detail} numberOfLines={3}>{this.state.err.message}</Text>
        ) : null}
        <Pressable onPress={this.reset} style={styles.cta}>
          <Text style={styles.ctaText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.sectionH,
    justifyContent: 'center',
    gap: 12,
  },
  title: { ...text.screenH1 },
  body: { ...text.subHeading, lineHeight: 18 },
  detail: {
    fontSize: 11,
    color: colors.muted,
    fontFamily: 'monospace',
    marginTop: 8,
    padding: spacing.alertV,
    borderRadius: radii.alert,
    backgroundColor: colors.rule2,
  },
  cta: {
    marginTop: 16,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: radii.cta,
    alignItems: 'center',
  },
  ctaText: { ...text.cta },
});
