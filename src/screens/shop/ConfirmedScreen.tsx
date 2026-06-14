import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenHeader, ProgressBar, CTA, Summary, type SummaryLine } from '../../components';
import { colors, spacing, text } from '../../theme';
import type { ShopStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ShopStackParamList, 'Confirmed'>;

// Order summary line builder — keeps Pickup vs Delivery copy in one place.
function buildLines(order: Props['route']['params']['order']): SummaryLine[] {
  const lines: SummaryLine[] = [];
  for (const it of order.items) {
    const sizeBit = it.tin_size ? ` ${it.tin_size}` : '';
    const colourBit = it.colour_name
      ? `${it.brand ? it.brand + ' ' : ''}${it.colour_name}`
      : null;
    const subtitle = colourBit ? `× ${it.quantity} · ${colourBit}` : `× ${it.quantity}`;
    lines.push({
      key: `${it.name}${sizeBit}`,
      subtitle,
      value: `$${it.lineTotal.toFixed(2)}`,
    });
  }
  // Top divider separates the items block from the totals block.
  if (order.mode === 'pickup') {
    lines.push({ key: 'Pickup', value: 'Free', emphasis: 'good', divider: true });
  } else {
    lines.push({
      key: 'Delivery',
      value: order.delivery === 0 ? 'Free' : `$${order.delivery.toFixed(2)}`,
      emphasis: order.delivery === 0 ? 'good' : undefined,
      divider: true,
    });
  }
  lines.push({ key: 'GST (10%)', value: `$${order.gst.toFixed(2)}` });
  lines.push({ key: 'Total', value: `$${order.total.toFixed(2)}`, emphasis: 'total' });
  return lines;
}

export function ConfirmedScreen({ route, navigation }: Props) {
  const { order } = route.params;
  const lines = buildLines(order);

  return (
    <Screen
      footer={
        <CTA
          label="Start another order"
          variant="ghost"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Where' }] })}
        />
      }
    >
      <ProgressBar step={5} totalSteps={5} />
      <ScreenHeader title={`Order #${order.orderNumber}`} />

      <View style={styles.center}>
        <View style={styles.circle}>
          <Check size={36} color="#fff" strokeWidth={3} />
        </View>
        <Text style={styles.headline}>Order sent</Text>
        <Text style={[text.subHeading, styles.subhead]}>
          Your order has been received! Our team will reach out to you for further details.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>ORDER DETAILS</Text>
      <View style={styles.detailsCard}>
        <Text style={styles.detailHeader}>
          {order.mode === 'pickup' ? 'PICK UP FROM' : 'DELIVER TO'}
        </Text>
        {order.mode === 'pickup' ? (
          <>
            {order.pickupName ? <Text style={styles.detailName}>{order.pickupName}</Text> : null}
            {order.pickupAddress ? <Text style={styles.detailLine}>{order.pickupAddress}</Text> : null}
            {order.pickupHours ? <Text style={styles.detailLine}>{order.pickupHours}</Text> : null}
            {order.customerName ? (
              <Text style={[styles.detailLine, styles.detailLineGap]}>
                {order.customerName}{order.customerPhone ? ` · ${order.customerPhone}` : ''}
              </Text>
            ) : null}
          </>
        ) : (
          <>
            <Text style={styles.detailName}>{order.customerName}</Text>
            {order.address?.line1 ? <Text style={styles.detailLine}>{order.address.line1}</Text> : null}
            {order.address?.line2 ? <Text style={styles.detailLine}>{order.address.line2}</Text> : null}
            {order.address?.suburb || order.address?.postcode ? (
              <Text style={styles.detailLine}>
                {`${order.address?.suburb ?? ''} ${order.address?.postcode ?? ''}`.trim()}
              </Text>
            ) : null}
            {order.customerPhone ? (
              <Text style={[styles.detailLine, styles.detailLineGap]}>{order.customerPhone}</Text>
            ) : null}
          </>
        )}
      </View>

      {order.notes ? (
        <>
          <Text style={styles.sectionLabel}>NOTES</Text>
          <View style={styles.detailsCard}>
            <Text style={styles.detailLine}>{order.notes}</Text>
          </View>
        </>
      ) : null}

      <Text style={styles.sectionLabel}>ORDER SUMMARY</Text>
      <Summary lines={lines} />

      <Text style={[text.smallNote, { marginTop: 6, marginBottom: 8 }]}>
        No refunds on tinted product.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 14,
    paddingHorizontal: spacing.sectionH - spacing.bodyH,
  },
  circle: {
    width: 74, height: 74,
    borderRadius: 37,
    backgroundColor: colors.good,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: colors.good,
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  headline: { fontSize: 19, fontWeight: '700', color: colors.navy, letterSpacing: -0.19 },
  subhead: { textAlign: 'center', marginTop: 6 },
  sectionLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: colors.muted,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 6,
  },
  detailsCard: {
    backgroundColor: colors.paper,
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 14,
    shadowColor: '#142B5C',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    marginBottom: 8,
  },
  detailHeader: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  detailName: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  detailLine: { fontSize: 12.5, color: colors.ink2, lineHeight: 18 },
  detailLineGap: { marginTop: 8 },
});
