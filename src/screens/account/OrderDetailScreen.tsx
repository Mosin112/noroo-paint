import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert as RNAlert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { Screen, ScreenHeader, Heading, CTA, Summary } from '../../components';
import type { SummaryLine } from '../../components';
import { getOrderDetail, type OrderDetail } from '../../api/client';
import { useBasketStore } from '../../state/basketStore';
import { useAllProducts } from '../../data/useProducts';
import { usePendingCheckoutStore } from '../../state/pendingCheckoutStore';
import type { Product } from '../../types/domain';
import type { AccountStackParamList, RootStackParamList } from '../../navigation/types';
import { colors, radii, spacing, text } from '../../theme';

type Props = NativeStackScreenProps<AccountStackParamList, 'OrderDetail'>;

// Detail page for one past order. Tap-through from Recent Orders. Shows
// items + totals + the address the order shipped to (or the pickup
// location), plus a Reorder CTA that:
//   1. Clears the current basket and refills it with the original items
//      (looked up against the live product catalogue so prices are
//      current — we don't reuse the historical unit prices).
//   2. Drops the original customer/address/delivery-mode into the
//      pendingCheckout store so the Checkout form lands pre-filled.
//   3. Navigates to the Shop tab → Checkout screen so the user finishes
//      in two taps.

export function OrderDetailScreen({ route, navigation }: Props) {
  const { orderId, orderNumber } = route.params;
  const rootNav = useNavigation<NavigationProp<RootStackParamList>>();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  const clearBasket = useBasketStore((s) => s.clear);
  const addToBasket = useBasketStore((s) => s.add);
  const setPending = usePendingCheckoutStore((s) => s.set);

  // Cached catalogue — used to find the live Product for each historical
  // line item so the reorder reflects current prices and availability.
  const { data: products } = useAllProducts();
  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    (products ?? []).forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  useEffect(() => {
    let cancelled = false;
    getOrderDetail(orderId)
      .then((d) => { if (!cancelled) setOrder(d); })
      .catch(() => { if (!cancelled) setOrder(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orderId]);

  // Per-line lookup: green-tick if the product is still active in the
  // catalogue, otherwise we flag it so the user knows that line will be
  // skipped on reorder.
  const reorderable = useMemo(() => {
    if (!order) return [] as Array<{ ok: boolean; product?: Product; line: OrderDetail['items'][number] }>;
    return order.items.map((line) => {
      const p = line.product_id ? productById.get(line.product_id) : undefined;
      return { ok: !!p, product: p, line };
    });
  }, [order, productById]);

  const anyReorderable = reorderable.some((r) => r.ok);
  const anyUnavailable = reorderable.some((r) => !r.ok);

  const doReorder = () => {
    if (!order) return;
    const apply = () => {
      setReordering(true);
      try {
        clearBasket();
        for (const r of reorderable) {
          if (!r.ok || !r.product) continue;
          addToBasket({
            product: r.product,
            brand: r.line.brand,
            colour_name: r.line.colour_name,
            notes: undefined,
            quantity: r.line.quantity,
          });
        }
        setPending({
          mode: order.delivery_mode,
          name: order.customer_name,
          phone: order.customer_phone,
          line1: order.delivery_address_line1,
          suburb: order.delivery_suburb ?? '',
          postcode: order.delivery_postcode,
          notes: order.notes ?? undefined,
        });
        // Jump to Shop tab → Checkout. The Checkout screen reads the
        // pending hint on mount and seeds its form once.
        rootNav.navigate('Main', {
          screen: 'Shop',
          params: { screen: 'Checkout' },
        });
      } finally {
        setReordering(false);
      }
    };
    // If the basket already has items, confirm before replacing.
    const currentCount = useBasketStore.getState().items.length;
    if (currentCount > 0) {
      RNAlert.alert(
        'Replace your basket?',
        `Your basket has ${currentCount} item${currentCount === 1 ? '' : 's'}. Reordering #${order.order_number} will clear it and add this order's items instead.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Replace & reorder', style: 'destructive', onPress: apply },
        ],
      );
    } else {
      apply();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Screen>
        <ScreenHeader title={`Order #${orderNumber}`} onBack={() => navigation.goBack()} />
        <View style={styles.empty}><ActivityIndicator color={colors.navy} /></View>
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen>
        <ScreenHeader title={`Order #${orderNumber}`} onBack={() => navigation.goBack()} />
        <View style={styles.empty}>
          <Text style={text.rowSubtitle}>We couldn't load this order. Try again later.</Text>
        </View>
      </Screen>
    );
  }

  // Per-line "title + sub" + currency for the Summary block. Mirrors the
  // basket / email format: "{name} — {finish} {size}" / "× qty · {colour}".
  const itemLines: SummaryLine[] = order.items.flatMap<SummaryLine>((line) => {
    const finishBit = line.finish_snapshot ? ` — ${line.finish_snapshot}` : '';
    const sizeBit = line.tin_size_snapshot ? ` ${line.tin_size_snapshot}` : '';
    const head = `${line.product_name_snapshot}${finishBit}${sizeBit} × ${line.quantity}`;
    const out: SummaryLine[] = [{
      key: head,
      value: `$${Number(line.line_total_aud).toFixed(2)}`,
    }];
    if (line.colour_name) {
      out.push({
        key: 'Colour',
        value: `${line.brand ? line.brand + ' ' : ''}${line.colour_name}`,
      });
    }
    return out;
  });

  const totalsLines: SummaryLine[] = [
    order.delivery_mode === 'pickup'
      ? { key: 'Pickup', value: 'Free', emphasis: 'good' }
      : { key: 'Delivery', value: Number(order.delivery_aud) === 0 ? 'Free' : `$${Number(order.delivery_aud).toFixed(2)}`, emphasis: Number(order.delivery_aud) === 0 ? 'good' : undefined },
    { key: 'GST (10%)', value: `$${Number(order.gst_aud).toFixed(2)}` },
    { key: 'Total', value: `$${Number(order.total_aud).toFixed(2)}`, emphasis: 'total' },
  ];

  return (
    <Screen
      footer={
        <CTA
          label={reordering ? 'Adding to basket…' : 'Reorder'}
          loading={reordering}
          disabled={!anyReorderable}
          onPress={doReorder}
        />
      }
    >
      <ScreenHeader title={`Order #${order.order_number}`} onBack={() => navigation.goBack()} />
      <Heading
        title={`Order #${order.order_number}`}
        sub={`${formatDate(order.created_at)} · ${order.delivery_mode === 'pickup' ? 'Pickup' : 'Delivery'} · ${order.status}`}
      />

      <Text style={[text.fieldLabel, styles.label]}>Items</Text>
      <Summary lines={itemLines} />

      <Text style={[text.fieldLabel, styles.label]}>Totals</Text>
      <Summary lines={totalsLines} />

      <Text style={[text.fieldLabel, styles.label]}>{order.delivery_mode === 'pickup' ? 'Pickup contact' : 'Delivered to'}</Text>
      <View style={styles.addressBox}>
        <Text style={styles.addressName}>{order.customer_name}</Text>
        {order.delivery_mode === 'delivery' && (
          <Text style={styles.addressLine}>
            {order.delivery_address_line1}
            {order.delivery_suburb ? `, ${order.delivery_suburb}` : ''}
            {order.delivery_postcode ? ` ${order.delivery_postcode}` : ''}
          </Text>
        )}
        <Text style={styles.addressLine}>{order.customer_phone}</Text>
      </View>

      {anyUnavailable ? (
        <Text style={styles.warn}>
          Some items in this order are no longer in the catalogue and will be skipped when you reorder.
        </Text>
      ) : null}
    </Screen>
  );
}

function formatDate(iso: string): string {
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
    alignItems: 'center',
    paddingVertical: 28,
  },
  label: { marginTop: 14, marginBottom: 6 },
  addressBox: {
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: radii.field,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  addressName: { fontSize: 14, fontWeight: '700', color: colors.ink },
  addressLine: { fontSize: 13, color: colors.ink2 ?? colors.ink, marginTop: 2 },
  warn: {
    marginTop: 12,
    fontSize: 12,
    color: colors.warn,
    lineHeight: 17,
  },
});
