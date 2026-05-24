import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Screen, ScreenHeader, Heading, Field, CTA, Summary, ProgressBar, Alert,
  type SummaryLine,
} from '../../components';
import { useBasketStore, calculateTotals } from '../../state';
import { useUserStore } from '../../state/userStore';
import { useAuthStore } from '../../state/authStore';
import { checkZone, postOrder } from '../../api/client';
import type { ShopStackParamList } from '../../navigation/types';
import { colors, text } from '../../theme';

type Props = NativeStackScreenProps<ShopStackParamList, 'Checkout'>;

// Strict postcode = first 4 digits. PRD §16: full list TBC at kick-off.
function extractPostcode(addr: string): string | null {
  const m = addr.match(/\b(\d{4})\b/);
  return m ? m[1] : null;
}

export function CheckoutScreen({ navigation }: Props) {
  const items = useBasketStore((s) => s.items);
  const clearBasket = useBasketStore((s) => s.clear);
  const profile = useUserStore((s) => s.profile);
  const defaultAddress = useUserStore((s) => s.defaultAddress);
  const saveProfile = useUserStore((s) => s.saveProfile);
  const saveDefaultAddress = useUserStore((s) => s.saveDefaultAddress);
  const isGuest = useAuthStore((s) => s.mode === 'guest');

  // Seed from the saved profile/address when present; the prototype's Marcus
  // details fall back in for guest sessions so the demo flow stays usable.
  const initialAddress = defaultAddress
    ? `${defaultAddress.line1}${defaultAddress.postcode ? ', ' + defaultAddress.postcode : ''}`
    : '14 Mill Lane, Joondalup 6027';
  const initialContact = profile?.full_name || profile?.phone
    ? [profile?.full_name, profile?.phone].filter(Boolean).join(' · ')
    : 'Marcus McCabe · 0412 884 102';

  const [address, setAddress] = useState(initialAddress);
  const [contact, setContact] = useState(initialContact);
  const [inZone, setInZone] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const postcode = extractPostcode(address);

  useEffect(() => {
    let cancelled = false;
    if (!postcode) {
      setInZone(false);
      return;
    }
    checkZone(postcode).then((res) => { if (!cancelled) setInZone(res.in_zone); });
    return () => { cancelled = true; };
  }, [postcode]);

  // Trigger OOS modal whenever address resolves out-of-zone.
  useEffect(() => {
    if (!inZone && postcode) {
      navigation.navigate('OutOfZone', { postcode });
    }
  }, [inZone, postcode, navigation]);

  const totals = calculateTotals(items, inZone);

  const lines: SummaryLine[] = items.flatMap<SummaryLine>((it) => ([
    {
      key: `${it.product.name}${it.product.tin_size ? ' ' + it.product.tin_size : ''} × ${it.quantity}`,
      value: `$${(it.product.price_aud * it.quantity).toFixed(2)}`,
    },
    ...(it.colour_name ? [{
      key: 'Colour',
      value: `${it.brand ? it.brand + ' ' : ''}${it.colour_name}`,
    } as SummaryLine] : []),
  ])).concat([
    {
      key: 'Delivery',
      value: totals.freeDelivery ? 'Free' : `$${totals.delivery.toFixed(2)}`,
      emphasis: totals.freeDelivery ? 'good' : undefined,
    },
    { key: 'GST', value: `$${totals.gst.toFixed(2)}` },
    { key: 'Total', value: `$${totals.total.toFixed(2)}`, emphasis: 'total' },
  ]);

  const [name, ...phoneParts] = contact.split('·').map((s) => s.trim());
  const phone = phoneParts.join(' · ');
  const formValid = !!postcode && inZone && name.length >= 2 && phone.replace(/\D/g, '').length >= 9 && items.length > 0;

  const placeOrder = async () => {
    if (!formValid) return;
    setSubmitting(true);
    try {
      const res = await postOrder({
        customer_name: name,
        customer_phone: phone.replace(/\s/g, ''),
        delivery: { line1: address, postcode: postcode! },
        items: items.map((it) => ({
          product_id: it.product.id,
          brand: it.brand,
          colour_name: it.colour_name,
          quantity: it.quantity,
        })),
      });
      // Stash the address + contact so next checkout pre-fills correctly.
      // Fire-and-forget — order placement already succeeded; this is best-effort.
      if (!isGuest) {
        void saveDefaultAddress({ line1: address, postcode: postcode! });
        void saveProfile({ full_name: name, phone: phone.replace(/\s/g, '') });
      }
      clearBasket();
      navigation.navigate('Confirmed', { orderNumber: res.order_number });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen
      footer={<CTA label="Place order" loading={submitting} disabled={!formValid} onPress={placeOrder} />}
    >
      <ProgressBar step={4} totalSteps={5} />
      <ScreenHeader title="Place order" onBack={() => navigation.goBack()} />
      <Heading title="Almost done" sub="Address, contact details. Free over $400 in Perth metro." />

      <Field
        label={inZone && postcode ? 'Deliver to ✓ Perth metro' : 'Deliver to'}
        value={address}
        onChangeText={setAddress}
        autoCapitalize="words"
      />
      <Field
        label="Name & phone"
        value={contact}
        onChangeText={setContact}
      />

      <View style={{ marginTop: 8 }}>
        <Summary lines={lines} />
      </View>

      <Alert title="No refunds on tinted product.">
        <Text style={[text.alertBody, { color: colors.warn, fontStyle: 'italic' }]}>
          All custom-tinted tins are final sale. See our terms.
        </Text>
      </Alert>
    </Screen>
  );
}

const styles = StyleSheet.create({});
