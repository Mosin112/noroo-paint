import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Trash2, ShoppingBag, PaintBucket } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Screen, ScreenHeader, Heading, CTA, Summary, FooterLink,
  QtyStepper, ProgressBar, type SummaryLine,
} from '../../components';
import { useBasketStore, calculateTotals } from '../../state';
import { RANGE_META } from '../../types/domain';
import type { ShopStackParamList } from '../../navigation/types';
import { colors, rangeColor, text } from '../../theme';

type Props = NativeStackScreenProps<ShopStackParamList, 'Basket'>;

// Light tint of the range accent for the thumbnail tile background.
function hexAlpha(hex: string, alpha: number): string {
  const m = hex.replace('#', '');
  if (m.length !== 6) return colors.tint;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function BasketScreen({ navigation }: Props) {
  const items = useBasketStore((s) => s.items);
  const remove = useBasketStore((s) => s.remove);
  const update = useBasketStore((s) => s.update);

  // For the basket totals we assume in-zone (delivery is confirmed at checkout).
  const totals = calculateTotals(items, true);
  const empty = items.length === 0;
  const itemCount = items.reduce((n, it) => n + it.quantity, 0);

  const lines: SummaryLine[] = [
    { key: 'Subtotal', value: `$${totals.subtotal.toFixed(2)}` },
    {
      key: 'Delivery',
      value: totals.freeDelivery ? 'Free' : `$${totals.delivery.toFixed(2)}`,
      emphasis: totals.freeDelivery ? 'good' : undefined,
    },
    { key: 'GST (10%)', value: `$${totals.gst.toFixed(2)}` },
    { key: 'Total', value: `$${totals.total.toFixed(2)}`, emphasis: 'total' },
  ];

  return (
    <Screen
      footer={
        empty ? (
          <CTA label="Browse paints" onPress={() => navigation.navigate('Where')} />
        ) : (
          <>
            <CTA label="Continue to checkout" onPress={() => navigation.navigate('Checkout')} />
            <FooterLink label="+ Add another product" onPress={() => navigation.navigate('Where')} />
          </>
        )
      }
    >
      <ProgressBar step={3} totalSteps={5} />
      <ScreenHeader
        title="Your basket"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <Heading
        title="Your basket"
        sub={empty ? 'Nothing here yet.' : `${itemCount} item${itemCount === 1 ? '' : 's'} · review, then check out.`}
      />

      {empty ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <ShoppingBag size={28} color={colors.navy} strokeWidth={1.6} />
          </View>
          <Text style={styles.emptyText}>Your basket is empty — pick a product to get started.</Text>
        </View>
      ) : (
        items.map((it) => {
          const accent = rangeColor(it.product.category);
          const meta = RANGE_META[it.product.category];
          const title = it.product.category === 'Accessories'
            ? it.product.name
            : `${meta.short || ''} ${it.product.finish ?? ''} ${it.product.tin_size ?? ''}`.trim();
          // v2.3 §basket — subtitle shows "<colour|Accessory> · $<unit_price> ea"
          const colour = it.product.category === 'Accessories'
            ? 'Accessory'
            : (it.brand ? it.brand + ' ' : '') + (it.colour_name ?? 'Colour not specified');
          const lineTotal = it.product.price_aud * it.quantity;

          return (
            <View key={it.id} style={styles.card}>
              <View style={[styles.thumb, { backgroundColor: hexAlpha(accent, 0.13) }]}>
                <PaintBucket size={22} color={accent} strokeWidth={1.8} />
              </View>

              <View style={styles.meta}>
                <Text style={styles.itemTitle} numberOfLines={2}>{title}</Text>
                <Text style={styles.itemSub} numberOfLines={1}>
                  {colour} · ${it.product.price_aud.toFixed(2)} ea
                </Text>
              </View>

              <View style={styles.rightCol}>
                <View style={styles.priceRow}>
                  <Text style={styles.lineTotal}>${lineTotal.toFixed(2)}</Text>
                  <Pressable onPress={() => remove(it.id)} hitSlop={6} style={styles.trash}>
                    <Trash2 size={16} color={colors.muted} />
                  </Pressable>
                </View>
                <QtyStepper
                  value={it.quantity}
                  onChange={(q) => update(it.id, { quantity: q })}
                />
              </View>
            </View>
          );
        })
      )}

      {!empty && (
        <View style={{ marginTop: 14 }}>
          <Summary lines={lines} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIcon: {
    width: 66, height: 66, borderRadius: 33,
    backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  emptyText: { textAlign: 'center', color: colors.muted, fontSize: 13 },
  // Card matches v2.3 prototype: white surface, rule border, gentle shadow.
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 15,
    padding: 11,
    marginBottom: 11,
    shadowColor: '#142B5C',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  thumb: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  meta: { flex: 1, minWidth: 0 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: colors.ink, lineHeight: 17 },
  itemSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  rightCol: { alignItems: 'flex-end', gap: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lineTotal: { fontSize: 13, fontWeight: '700', color: colors.ink },
  trash: { padding: 2 },
});
