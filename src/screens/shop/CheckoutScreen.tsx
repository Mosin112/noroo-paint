import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert as RNAlert } from 'react-native';
import { Check } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  Screen, ScreenHeader, Heading, Field, CTA, Summary, ProgressBar, Alert,
  SegmentControl, PickupMap,
  type SummaryLine,
} from '../../components';
import { useBasketStore, calculateTotals } from '../../state';
import { useUserStore } from '../../state/userStore';
import { useAuthStore } from '../../state/authStore';
import { usePendingCheckoutStore } from '../../state/pendingCheckoutStore';
import { checkZone, postOrder, sendOrderEmail } from '../../api/client';
import { PICKUP_LOCATION, type DeliveryMode } from '../../types/domain';
import type { ShopStackParamList } from '../../navigation/types';
import { colors, text } from '../../theme';

type Props = NativeStackScreenProps<ShopStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Props) {
  const items = useBasketStore((s) => s.items);
  const clearBasket = useBasketStore((s) => s.clear);
  // saved profile + address are still persisted on order so the Account
  // tab reflects the latest details, but we don't read them here — the
  // form is always blank on entry per the v2.3 follow-up feedback.
  const saveProfile = useUserStore((s) => s.saveProfile);
  const saveDefaultAddress = useUserStore((s) => s.saveDefaultAddress);
  const isGuest = useAuthStore((s) => s.mode === 'guest');
  const userEmail = useAuthStore((s) => s.email);

  const [mode, setMode] = useState<DeliveryMode>('delivery');
  // Per user feedback (v2.3 follow-up): every checkout starts blank — no
  // pre-fill from saved profile or default address. People should type the
  // details for the order they're actually placing.
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [suburb, setSuburb] = useState('');
  const [postcode, setPostcode] = useState('');
  const [notes, setNotes] = useState('');

  // Tri-state zone check so we can distinguish "still checking" from
  // "already checked and not in zone". The old binary `inZone` caused a
  // race: the auto-navigation to OutOfZone fired on every 4-digit postcode
  // BEFORE checkZone resolved, kicking valid in-zone customers off the
  // screen mid-typing. We now only show the out-of-zone status inline.
  type ZoneStatus = 'idle' | 'in-zone' | 'out-of-zone';
  const [zoneStatus, setZoneStatus] = useState<ZoneStatus>('idle');
  const inZone = zoneStatus === 'in-zone';
  const [submitting, setSubmitting] = useState(false);

  // Reorder hand-off: if a past-order Reorder action seeded the
  // pendingCheckout store, drop those values straight into the form so
  // the user doesn't have to retype anything. Uses useFocusEffect (not
  // useEffect) because navigating back to Checkout from OrderDetail
  // re-uses the existing screen instance — mount-only effects don't
  // re-run, so a second reorder would silently ignore the new hint.
  // The hint self-clears on consume so a regular Checkout focus is a
  // no-op.
  useFocusEffect(
    useCallback(() => {
      const hint = usePendingCheckoutStore.getState().consume();
      if (!hint) return;
      setMode(hint.mode);
      if (hint.name !== undefined) setName(hint.name);
      if (hint.phone !== undefined) setPhone(hint.phone);
      if (hint.line1 !== undefined) setLine1(hint.line1);
      if (hint.line2 !== undefined) setLine2(hint.line2);
      if (hint.suburb !== undefined) setSuburb(hint.suburb);
      if (hint.postcode !== undefined) setPostcode(hint.postcode);
      if (hint.notes !== undefined) setNotes(hint.notes);
    }, []),
  );

  useEffect(() => {
    let cancelled = false;
    if (mode === 'pickup') { setZoneStatus('in-zone'); return; }
    const trimmed = postcode.trim();
    if (!/^\d{4}$/.test(trimmed)) { setZoneStatus('idle'); return; }
    checkZone(trimmed)
      .then((res) => {
        if (cancelled) return;
        setZoneStatus(res.in_zone ? 'in-zone' : 'out-of-zone');
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [postcode, mode]);

  // Pickup forces $0 delivery so the running totals don't smuggle a hidden
  // $25 fee through the GST + Total lines.
  const totals = mode === 'pickup'
    ? (() => {
        const subtotal = items.reduce((s, it) => s + it.product.price_aud * it.quantity, 0);
        const gst = subtotal * 0.10;
        return { subtotal, delivery: 0, gst, total: subtotal + gst, freeDelivery: true };
      })()
    : calculateTotals(items, inZone);

  // "Pickup" row replaces "Delivery" when in pickup mode.
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
    mode === 'pickup'
      ? { key: 'Pickup', value: 'Free', emphasis: 'good' }
      : {
          key: 'Delivery',
          value: totals.freeDelivery ? 'Free' : `$${totals.delivery.toFixed(2)}`,
          emphasis: totals.freeDelivery ? 'good' : undefined,
        },
    { key: 'GST (10%)', value: `$${totals.gst.toFixed(2)}` },
    { key: 'Total', value: `$${totals.total.toFixed(2)}`, emphasis: 'total' },
  ]);

  // Validation — different rules for pickup vs delivery. We deliberately
  // DON'T require `inZone` here: the zone check is async and the form
  // would block while it resolved (and worse, it sometimes resolved
  // wrong if the user typed fast). postOrder hits the server-side check
  // and surfaces an error if the postcode is out of zone — the inline
  // red badge already warns the user before they tap.
  const phoneDigits = phone.replace(/\D/g, '');
  const baseValid = name.trim().length >= 2 && phoneDigits.length >= 9 && items.length > 0;
  const deliveryValid = line1.trim().length >= 5 &&
    suburb.trim().length >= 2 &&
    /^\d{4}$/.test(postcode.trim());
  const formValid = baseValid && (mode === 'pickup' ? true : deliveryValid);

  const placeOrder = async () => {
    if (!formValid) return;
    setSubmitting(true);
    try {
      const timeoutMs = 15_000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Order request timed out. Check your connection and try again.')), timeoutMs)
      );

      // For pickup orders we record the store location in delivery_address_line1
      // so the fulfilment side sees it without a join. delivery_postcode keeps
      // a placeholder so the not-null constraint is satisfied.
      const deliveryPayload = mode === 'pickup'
        ? {
            line1: `${PICKUP_LOCATION.name} · ${PICKUP_LOCATION.address}`,
            suburb: 'Welshpool',
            postcode: '6106',
          }
        : { line1: line1.trim(), line2: line2.trim() || undefined, suburb: suburb.trim(), postcode: postcode.trim() };

      const res = await Promise.race([
        postOrder({
          customer_name: name.trim(),
          customer_phone: phoneDigits,
          delivery_mode: mode,
          delivery: deliveryPayload,
          notes: notes.trim() || undefined,
          items: items.map((it) => ({
            product_id: it.product.id,
            brand: it.brand,
            colour_name: it.colour_name,
            quantity: it.quantity,
          })),
        }),
        timeoutPromise,
      ]);

      // Persist delivery address + profile so the Account tab reflects the
      // user's latest details. The Checkout form itself no longer pre-fills.
      if (!isGuest && mode === 'delivery') {
        void saveDefaultAddress({ line1: line1.trim(), suburb: suburb.trim(), postcode: postcode.trim() });
      }
      if (!isGuest) {
        void saveProfile({ full_name: name.trim(), phone: phoneDigits });
      }

      // Build the Confirmed-screen payload from in-memory state so we don't
      // have to round-trip the order back from Supabase. (We also fire-and-
      // forget the order-email Edge Function next.)
      const confirmedItems = items.map((it) => ({
        name: it.product.name,
        tin_size: it.product.tin_size,
        finish: it.product.finish,
        brand: it.brand,
        colour_name: it.colour_name,
        quantity: it.quantity,
        unitPrice: it.product.price_aud,
        lineTotal: it.product.price_aud * it.quantity,
      }));
      const confirmedOrder = {
        orderNumber: res.order_number,
        mode,
        customerName: name.trim(),
        customerPhone: phoneDigits,
        address: mode === 'delivery'
          ? { line1: line1.trim(), line2: line2.trim() || undefined, suburb: suburb.trim(), postcode: postcode.trim() }
          : undefined,
        pickupName: mode === 'pickup' ? PICKUP_LOCATION.name : undefined,
        pickupAddress: mode === 'pickup' ? PICKUP_LOCATION.address : undefined,
        pickupHours: mode === 'pickup' ? PICKUP_LOCATION.hours : undefined,
        notes: notes.trim() || undefined,
        items: confirmedItems,
        subtotal: totals.subtotal,
        delivery: totals.delivery,
        gst: totals.gst,
        total: totals.total,
      };

      // Fire the order-notification email via the Edge Function. Fire-and-
      // forget — the order is already in the DB, the email is bonus.
      void sendOrderEmail({ ...confirmedOrder, customerEmail: userEmail }).catch(() => undefined);

      clearBasket();
      navigation.navigate('Confirmed', { order: confirmedOrder });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Order failed. Please try again.';
      RNAlert.alert("We couldn't place your order", message);
    } finally {
      setSubmitting(false);
    }
  };

  const ctaLabel = mode === 'pickup' ? 'Place order' : 'Place order';

  return (
    <Screen
      stickyHeader={<ProgressBar step={4} totalSteps={5} />}
      footer={<CTA label={ctaLabel} loading={submitting} disabled={!formValid} onPress={placeOrder} />}
    >
      {/* Back always lands on Basket, not the previous stack entry.
          On the normal flow goBack() would do the same, but the Reorder
          hand-off enters Checkout directly without a Basket frame
          underneath — explicit navigate gives both paths the same
          "review your items" detour. */}
      <ScreenHeader title="Delivery details" onBack={() => navigation.navigate('Basket')} />
      <Heading
        title="Choose your delivery address"
        sub="Enter your address — to organise delivery, or select to pick up from the store."
      />

      <SegmentControl<DeliveryMode>
        value={mode}
        onChange={setMode}
        options={[
          { value: 'pickup', label: 'Pick up in store' },
          { value: 'delivery', label: 'Delivery' },
        ]}
      />

      <Field
        label="Full name"
        required
        value={name}
        onChangeText={setName}
        placeholder="Your full name"
        autoCapitalize="words"
      />
      <Field
        label="Phone"
        required
        value={phone}
        onChangeText={setPhone}
        placeholder="0400 000 000"
        keyboardType="phone-pad"
      />

      {mode === 'delivery' ? (
        <>
          <Text style={[text.fieldLabel, styles.sectionLabel]}>DELIVERY ADDRESS</Text>
          <Field
            label="Address line 1"
            required
            value={line1}
            onChangeText={setLine1}
            placeholder="14 Mill Lane"
            autoCapitalize="words"
          />
          <Field
            label="Address line 2 (optional)"
            value={line2}
            onChangeText={setLine2}
            placeholder="Unit, level, etc."
          />
          <View style={styles.row}>
            <View style={styles.suburbCol}>
              <Field
                label="Suburb"
                required
                value={suburb}
                onChangeText={setSuburb}
                placeholder="Suburb"
                autoCapitalize="words"
              />
            </View>
            <View style={styles.postcodeCol}>
              <Field
                label="Postcode"
                required
                value={postcode}
                onChangeText={(v) => setPostcode(v.replace(/\D/g, '').slice(0, 4))}
                placeholder="6000"
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          </View>

          {zoneStatus === 'in-zone' && /^\d{4}$/.test(postcode.trim()) ? (
            <View style={styles.zoneOk}>
              <Check size={14} color={colors.good} strokeWidth={2.5} />
              <Text style={styles.zoneOkText}>Perth metro · free delivery on orders $400+</Text>
            </View>
          ) : null}
          {zoneStatus === 'out-of-zone' ? (
            <View style={styles.zoneBad}>
              <Text style={styles.zoneBadText}>
                Outside our delivery area · we currently deliver across Perth metro
              </Text>
            </View>
          ) : null}
        </>
      ) : (
        <>
          <Text style={[text.fieldLabel, styles.sectionLabel]}>PICK UP FROM</Text>
          <View style={styles.pickCard}>
            <View style={styles.pickInfo}>
              <Text style={styles.pickName}>{PICKUP_LOCATION.name}</Text>
              <Text style={styles.pickLine}>{PICKUP_LOCATION.address}</Text>
              <Text style={styles.pickLine}>{PICKUP_LOCATION.hours}</Text>
            </View>
            <PickupMap />
          </View>
          <View style={styles.zoneOk}>
            <Check size={14} color={colors.good} strokeWidth={2.5} />
            <Text style={styles.zoneOkText}>Ready for pickup · usually same business day</Text>
          </View>
        </>
      )}

      <Field
        label={mode === 'pickup' ? 'Pick up notes (optional)' : 'Delivery notes (optional)'}
        value={notes}
        onChangeText={setNotes}
        placeholder="e.g. leave at side gate"
      />

      <View style={{ marginTop: 8 }}>
        <Summary lines={lines} />
      </View>

      <Alert title="No refunds on tinted product.">
        <Text style={[text.alertBody, { color: colors.warn, fontStyle: 'italic' }]}>
          All custom-tinted tins are final sale. See our terms.
        </Text>
      </Alert>

      <Text style={styles.paymentNote}>
        Our team will reach out to you for payment details.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { marginTop: 10, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8 },
  suburbCol: { flex: 1.6 },
  postcodeCol: { flex: 1 },
  zoneOk: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.goodBg,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
    marginTop: 2, marginBottom: 8,
  },
  zoneOkText: { color: colors.good, fontSize: 12, fontWeight: '700' },
  zoneBad: {
    backgroundColor: colors.warnBg,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
    marginTop: 2, marginBottom: 8,
  },
  zoneBadText: { color: colors.warn, fontSize: 12, fontWeight: '600', lineHeight: 16 },
  pickCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.paper,
    borderWidth: 1, borderColor: colors.rule,
    borderRadius: 13, paddingVertical: 13, paddingHorizontal: 15,
    marginBottom: 8,
  },
  pickInfo: { flex: 1, minWidth: 0 },
  pickName: { fontSize: 14, fontWeight: '700', color: colors.ink },
  pickLine: { fontSize: 12, color: colors.muted, marginTop: 3 },
  paymentNote: {
    fontSize: 10.5, color: colors.muted, lineHeight: 14,
    paddingHorizontal: 2, paddingTop: 4,
  },
});
