import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing, text } from '../theme';

export type SummaryLine = {
  key: string;
  value: string;
  emphasis?: 'good' | 'total';
};

export function Summary({ lines }: { lines: SummaryLine[] }) {
  return (
    <View style={styles.wrap}>
      {lines.map((l, i) => (
        <View key={l.key} style={[styles.row, i > 0 && styles.rowDivider]}>
          <Text style={[text.summaryKey, l.emphasis === 'total' && styles.totalKey]}>{l.key}</Text>
          <Text
            style={[
              text.summaryValue,
              l.emphasis === 'good' && { color: colors.good },
              l.emphasis === 'total' && styles.totalVal,
            ]}
          >
            {l.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: radii.summary,
    paddingVertical: spacing.summaryV,
    paddingHorizontal: spacing.summaryH,
    backgroundColor: '#fdfbf3',
    marginBottom: 8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.rule2 },
  totalKey: { fontWeight: '600', color: colors.ink },
  totalVal: { fontWeight: '700' },
});
