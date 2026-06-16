import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, ScreenHeader, Heading } from '../../components';
import { useAuthStore } from '../../state';
import { listMyOrders, type OrderSummary } from '../../api/client';
import type { AccountStackParamList } from '../../navigation/types';
import { colors, radii, spacing, text } from '../../theme';

// Full list of the signed-in user's past orders. Reached from the
// Account screen's "Recent orders →" entry. Guests get a sign-in nudge
// instead of an empty list.
export function RecentOrdersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AccountStackParamList>>();
  const mode = useAuthStore((s) => s.mode);
  const isGuest = mode === 'guest';

  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  useEffect(() => {
    if (isGuest) { setOrders([]); return; }
    let cancelled = false;
    listMyOrders(null)
      .then((rows) => { if (!cancelled) setOrders(rows); })
      .catch(() => { if (!cancelled) setOrders([]); });
    return () => { cancelled = true; };
  }, [isGuest]);

  return (
    <Screen>
      <ScreenHeader title="Recent orders" onBack={() => navigation.goBack()} />
      <Heading
        title="Your orders"
        sub={isGuest
          ? 'Guest sessions don’t persist orders — sign in to keep a history.'
          : 'Every paint order you’ve placed, newest first.'}
      />

      {orders === null ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.navy} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={text.rowSubtitle}>
            {isGuest
              ? 'No orders to show — sign in and place your first order.'
              : "No orders yet — they'll appear here after your first checkout."}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {orders.map((o) => (
            <View key={o.id} style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.number}>#{o.order_number}</Text>
                <Text style={styles.meta}>
                  {formatOrderDate(o.created_at)} · {o.delivery_mode === 'pickup' ? 'Pickup' : 'Delivery'}
                </Text>
              </View>
              <Text style={styles.total}>${Number(o.total_aud).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

// "22 May 2026" — slightly longer than the Account preview so the date
// is unambiguous when scrolling a longer history.
function formatOrderDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

const styles = StyleSheet.create({
  empty: {
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: radii.field,
    padding: spacing.fieldH,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
  },
  list: { gap: 0 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
  },
  number: { fontSize: 14, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  total: { fontSize: 14, fontWeight: '700', color: colors.ink },
});
