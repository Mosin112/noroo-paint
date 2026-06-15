import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, shadows, text } from '../theme';

// Two row variants in the v2.3 summary:
//   - `product` rows have a primary name + a smaller meta line below
//     (qty, colour) + a price on the right.
//   - `kv` rows are the trailing delivery / GST / total numbers.
// `divider: true` draws a top divider — used to break "items" from "totals".

export type SummaryLine = {
  key: string;
  value: string;
  // Small muted subtitle under the key (used for "× 1 · White" etc.)
  subtitle?: string;
  // Reserved values for visual emphasis.
  emphasis?: 'good' | 'total';
  // Top-border on the row — separates items from totals or totals from grand total.
  divider?: boolean;
};

export function Summary({ lines }: { lines: SummaryLine[] }) {
  return (
    <View style={styles.wrap}>
      {lines.map((l, i) => (
        <View
          key={i}
          style={[
            styles.row,
            l.divider && styles.rowDivider,
            l.emphasis === 'total' && styles.rowTotal,
          ]}
        >
          <View style={styles.left}>
            <Text
              style={[
                l.subtitle ? styles.rowKeyName : text.summaryKey,
                l.emphasis === 'total' && styles.totalKey,
              ]}
            >
              {l.key}
            </Text>
            {l.subtitle ? <Text style={styles.rowSub}>{l.subtitle}</Text> : null}
          </View>
          <Text
            style={[
              text.summaryValue,
              l.subtitle ? styles.rowValueBig : null,
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
    backgroundColor: colors.paper,
    borderRadius: radii.summary,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.rule2,
    // v2.5 — resting lift so the summary panel sits above the page bg
    // rather than reading as a flat box.
    ...shadows.resting,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 6,
  },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.rule, marginTop: 4, paddingTop: 10 },
  rowTotal: { borderTopWidth: 1, borderTopColor: colors.rule, marginTop: 4, paddingTop: 10 },
  left: { flex: 1, minWidth: 0 },
  rowKeyName: { fontSize: 12.5, fontWeight: '600', color: colors.ink, lineHeight: 16 },
  rowSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  rowValueBig: { fontSize: 12.5, fontWeight: '700', color: colors.ink },
  totalKey: { fontWeight: '700', color: colors.ink, fontSize: 13 },
  totalVal: { fontWeight: '700', fontSize: 15 },
});
