import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing, text } from '../theme';

type Variant = 'warn' | 'info';

type Props = {
  children: React.ReactNode;
  title?: string;
  // 'warn' (red tint, red title) is the default for terms / refund notices.
  // 'info' (navy tint) is for informational callouts like delivery messaging.
  variant?: Variant;
};

export function Alert({ children, title, variant = 'warn' }: Props) {
  const isInfo = variant === 'info';
  return (
    <View style={[styles.wrap, isInfo ? styles.info : styles.warn]}>
      {title ? (
        <Text style={[text.alertBody, styles.title, isInfo && styles.titleInfo]}>{title}</Text>
      ) : null}
      {typeof children === 'string' ? (
        <Text style={text.alertBody}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: radii.alert,
    paddingVertical: spacing.alertV,
    paddingHorizontal: spacing.alertH,
    marginBottom: 10,
  },
  warn: { backgroundColor: colors.redTint, borderColor: colors.accentBorder },
  info: { backgroundColor: colors.tint, borderColor: '#CDD9EE' },
  title: { color: colors.accent, fontWeight: '700', marginBottom: 4 },
  titleInfo: { color: colors.navy },
});
