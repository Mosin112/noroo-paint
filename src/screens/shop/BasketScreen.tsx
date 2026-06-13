import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Trash2, ShoppingBag } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Screen, ScreenHeader, Heading, RowItem, CTA, Summary, FooterLink, type SummaryLine,
} from '../../components';
import { useBasketStore, calculateTotals } from '../../state';
import { RANGE_META } from '../../types/domain';
import type { ShopStackParamList } from '../../navigation/types';
import { colors, rangeColor, text } from '../../theme';

type Props = NativeStackScreenProps<ShopStackParamList, 'Basket'>;

export function BasketScreen({ navigation }: Props) {
  const items = useBasketStore((s) => s.items);
  const remove = useBasketStore((s) => s.remove);

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
          // v2.3 prototype basket title format: "<Brand short> <Finish> <Size>"
          // for paints, just product.name for accessories.
          const title = it.product.category === 'Accessories'
            ? it.product.name
            : `${meta.short || ''} ${it.product.finish ?? ''} ${it.product.tin_size ?? ''}`.trim();
          const subtitle = it.product.category === 'Accessories'
            ? `Accessory · qty ${it.quantity}`
            : `${(it.brand ? it.brand + ' ' : '') + (it.colour_name ?? 'Colour not specified')} · qty ${it.quantity}`;
          return (
            <View key={it.id} style={styles.basketRow}>
              <View style={{ flex: 1 }}>
                <RowItem
                  swatchColor={accent}
                  title={title}
                  subtitle={subtitle}
                  right={`$${(it.product.price_aud * it.quantity).toFixed(2)}`}
                />
              </View>
              <Pressable onPress={() => remove(it.id)} hitSlop={8} style={styles.trash}>
                <Trash2 size={16} color={colors.muted} />
              </Pressable>
            </View>
          );
        })
      )}

      {!empty && (
        <View style={{ marginTop: 14 }}>
          <Summary lines={lines} />
          <Text style={[text.alertBody, { color: colors.muted, fontSize: 11, marginTop: 6 }]}>
            Final delivery fee is confirmed at checkout based on postcode.
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  basketRow: { flexDirection: 'row', alignItems: 'center' },
  trash: { padding: 8, marginLeft: 4 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIcon: {
    width: 66, height: 66, borderRadius: 33,
    backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  emptyText: { textAlign: 'center', color: colors.muted, fontSize: 13 },
});
