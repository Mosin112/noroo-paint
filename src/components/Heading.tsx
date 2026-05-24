import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, text } from '../theme';

// Big H1 + muted sub explainer, with PRD §3.3 margins.
export function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={text.screenH1}>{title}</Text>
      {sub ? <Text style={[text.subHeading, styles.sub]}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.sectionH - spacing.bodyH,
    marginTop: 8,
    marginBottom: 16,
  },
  sub: { marginTop: 4 },
});
