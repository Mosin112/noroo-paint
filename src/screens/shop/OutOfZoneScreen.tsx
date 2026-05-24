import React, { useState } from 'react';
import { Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenHeader, Heading, Field, CTA, Alert, FooterLink } from '../../components';
import type { ShopStackParamList } from '../../navigation/types';
import { colors, text } from '../../theme';

type Props = NativeStackScreenProps<ShopStackParamList, 'OutOfZone'>;

export function OutOfZoneScreen({ route, navigation }: Props) {
  const { postcode } = route.params;
  const [notified, setNotified] = useState(false);

  return (
    <Screen
      footer={
        <>
          <CTA
            label={notified ? 'Added to waitlist' : 'Notify me when you expand'}
            variant="ghost"
            disabled={notified}
            onPress={() => setNotified(true)}
          />
          <FooterLink label="‹ Back to checkout" onPress={() => navigation.goBack()} />
        </>
      }
    >
      <ScreenHeader title="Address" onBack={() => navigation.goBack()} />
      <Heading title="Sorry — not yet" sub="We only deliver in the Perth metro at the moment." />
      <Field
        label="Postcode"
        required
        readonlyValue={`${postcode} · outside delivery zone`}
        style={{ color: colors.accent }}
      />
      <Alert title="Where we deliver">
        <Text style={[text.alertBody, { color: colors.ink2 }]}>
          Perth metro only — Yanchep in the north down to Mandurah in the south. We'll expand soon.
        </Text>
      </Alert>
    </Screen>
  );
}
