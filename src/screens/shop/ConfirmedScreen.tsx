import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenHeader, ProgressBar, CTA } from '../../components';
import { colors, spacing, text } from '../../theme';
import type { ShopStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ShopStackParamList, 'Confirmed'>;

export function ConfirmedScreen({ route, navigation }: Props) {
  const { orderNumber } = route.params;

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
      <ScreenHeader title={`Order #${orderNumber}`} />
      <View style={styles.center}>
        <View style={styles.circle}>
          <Check size={36} color="#fff" strokeWidth={3} />
        </View>
        <Text style={styles.headline}>Order sent</Text>
        <Text style={[text.subHeading, styles.subhead]}>
          Your order has been received! Our team will reach out to you for further details.
        </Text>
      </View>
      <Text style={[text.smallNote, { paddingHorizontal: spacing.sectionH - spacing.bodyH, marginTop: 16 }]}>
        No refunds on tinted product.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginTop: 24, paddingHorizontal: spacing.sectionH - spacing.bodyH },
  circle: {
    width: 74, height: 74,
    borderRadius: 37,
    backgroundColor: colors.good,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    // v2.3 §10 — ring halo around the success check.
    shadowColor: colors.good,
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  headline: { fontSize: 19, fontWeight: '700', color: colors.navy, letterSpacing: -0.19 },
  subhead: { textAlign: 'center', marginTop: 6 },
});
