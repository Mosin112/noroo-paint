import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Screen, ScreenHeader, Heading, RowItem, CTA, Summary, type SummaryLine,
} from '../../components';
import { useBasketStore, calculateTotals } from '../../state';
import type { ShopStackParamList } from '../../navigation/types';
import { colors, text } from '../../theme';

type Props = NativeStackScreenProps<ShopStackParamList, 'Basket'>;

export function BasketScreen({ navigation }: Props) {
  const items = useBasketStore((s) => s.items);
  const remove = useBasketStore((s) => s.remove);

  // For the basket totals we assume in-zone (delivery is confirmed at checkout).
  const totals = calculateTotals(items, true);
  const empty = items.length === 0;

  const lines: SummaryLine[] = [
    { key: 'Subtotal', value: `$${totals.subtotal.toFixed(2)}` },
    {
      key: 'Delivery',
      value: totals.freeDelivery ? 'Free' : `$${totals.delivery.toFixed(2)}`,
      emphasis: totals.freeDelivery ? 'good' : undefined,
    },
    { key: 'GST', value: `$${totals.gst.toFixed(2)}` },
    { key: 'Total', value: `$${totals.total.toFixed(2)}`, emphasis: 'total' },
  ];

  return (
    <Screen
      footer={
        !empty ? (
          <CTA label="Continue to checkout" onPress={() => navigation.navigate('Checkout')} />
        ) : (
          <CTA label="Browse paints" onPress={() => navigation.navigate('Where')} />
        )
      }
    >
      <ScreenHeader title="Basket" onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
      <Heading title={empty ? 'Your basket is empty' : 'Your basket'} sub={empty ? 'Pick a product to get started.' : `${items.length} item${items.length === 1 ? '' : 's'}`} />

      {items.map((it) => {
        const subtitle = it.product.category === 'Accessories'
          ? `qty ${it.quantity}`
          : `${it.brand ? it.brand + ' ' : ''}${it.colour_name ?? 'Colour not yet specified'} · qty ${it.quantity}`;
        return (
          <View key={it.id} style={styles.basketRow}>
            <View style={{ flex: 1 }}>
              <RowItem
                swatchColor={it.product.swatch_hex}
                title={`${it.product.name}${it.product.tin_size ? ' · ' + it.product.tin_size : ''}`}
                subtitle={subtitle}
                right={`$${(it.product.price_aud * it.quantity).toFixed(2)}`}
              />
            </View>
            <Pressable onPress={() => remove(it.id)} hitSlop={8} style={styles.trash}>
              <Trash2 size={16} color={colors.muted} />
            </Pressable>
          </View>
        );
      })}

      {!empty && (
        <View style={{ marginTop: 16 }}>
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
});
