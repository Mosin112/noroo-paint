import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenHeader, ProgressBar, CTA } from '../../components';
import { colors, sizes, spacing, text } from '../../theme';
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
          <Check size={32} color="#fff" strokeWidth={3} />
        </View>
        <Text style={styles.headline}>Order sent</Text>
        <Text style={[text.subHeading, styles.subhead]}>
          Office aims to confirm and dispatch within 1 hour. We'll email you when it's out the door.
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
    width: sizes.successCircle,
    height: sizes.successCircle,
    borderRadius: sizes.successCircle / 2,
    backgroundColor: colors.good,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headline: { fontSize: 18, fontWeight: '600', color: colors.ink },
  subhead: { textAlign: 'center', marginTop: 6 },
});
