import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, ScreenHeader, Heading } from '../../components';
import { useAuthStore } from '../../state';
import { listMyOrders, type OrderSummary } from '../../api/client';
import type { AccountStackParamList } from '../../navigation/types';
import { colors, radii, spacing, text } from '../../theme';
import { OrderCard } from './OrderCard';

// Full list of the signed-in user's past orders. Reached from the
// Account screen's "See more →" entry under the recent-orders preview.
// Guests get a sign-in nudge instead of an empty list.
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
      <ScreenHeader title="Your orders" onBack={() => navigation.goBack()} />
      <Heading
        title="Recent orders"
        sub={isGuest
          ? 'Guest sessions don’t persist orders — sign in to keep a history.'
          : 'Tap an order to view details or reorder.'}
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
            <OrderCard
              key={o.id}
              order={o}
              onPress={() => navigation.navigate('OrderDetail', { orderId: o.id, orderNumber: o.order_number })}
            />
          ))}
        </View>
      )}
    </Screen>
  );
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
  list: { paddingTop: 4 },
});
