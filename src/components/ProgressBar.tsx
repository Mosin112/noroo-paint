import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radii, sizes, spacing } from '../theme';

type Props = {
  step: number;       // 1-based current step
  totalSteps: number; // total segments (PRD flow is 5)
};

export function ProgressBar({ step, totalSteps }: Props) {
  return (
    <View style={styles.wrap}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View key={i} style={[styles.seg, i < step && styles.segOn]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: spacing.progressGap,
    paddingHorizontal: spacing.sectionH,
    paddingBottom: 8,
  },
  seg: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.rule2,
  },
  // v2.3: progress fill is navy, not red. Red = primary actions only.
  segOn: { backgroundColor: colors.navy },
});
