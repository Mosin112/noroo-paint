import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import type { OrderSummary } from '../../api/client';
import { colors, radii, shadows } from '../../theme';

// Single tappable order card. Used on the Account screen (top 3
// preview) and RecentOrdersScreen (full history). Layout matches the
// v2.6 mock — order number bold up top, "<date> · <count> items" meta
// line, total + chevron on the right.

type Props = {
  order: OrderSummary;
  onPress: () => void;
};

export function OrderCard({ order, onPress }: Props) {
  const items = `${order.item_count} ${order.item_count === 1 ? 'item' : 'items'}`;
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.rule2 }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.body}>
        <Text style={styles.number}>#{order.order_number}</Text>
        <Text style={styles.meta}>{formatOrderDate(order.created_at)} · {items}</Text>
      </View>
      <Text style={styles.total}>${Number(order.total_aud).toFixed(2)}</Text>
      <ChevronRight size={18} color={colors.muted} style={styles.chev} />
    </Pressable>
  );
}

function formatOrderDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radii.field,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    ...shadows.resting,
  },
  cardPressed: { backgroundColor: colors.tint },
  body: { flex: 1 },
  number: { fontSize: 16, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 12.5, color: colors.muted, marginTop: 4 },
  total: { fontSize: 16, fontWeight: '700', color: colors.ink, marginRight: 4 },
  chev: { marginLeft: 6 },
});
