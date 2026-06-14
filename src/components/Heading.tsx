import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, text } from '../theme';

// Big H1 + muted sub explainer.
//   H1 sits in navy (v2.3 design system §3). Optional `align` for screens
//   like Sign in where everything is centred under the logo.
type Props = {
  title: string;
  sub?: string;
  align?: 'left' | 'center';
};

export function Heading({ title, sub, align = 'left' }: Props) {
  return (
    <View style={[styles.wrap, align === 'center' && styles.center]}>
      <Text style={[text.screenH1, align === 'center' && styles.centerText]}>{title}</Text>
      {sub ? (
        <Text style={[text.subHeading, styles.sub, align === 'center' && styles.centerText]}>{sub}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.sectionH - spacing.bodyH,
    marginTop: 6,
    marginBottom: 12,
  },
  sub: { marginTop: 2 },
  center: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
});
