import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert as RNAlert } from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, ScreenHeader, Heading, Field, CTA } from '../../components';
import { useAuthStore } from '../../state';
import { useUserStore } from '../../state/userStore';
import { deleteAccount, listMyOrders, type OrderSummary } from '../../api/client';
import type { AccountStackParamList } from '../../navigation/types';
import { colors, radii, spacing, text } from '../../theme';
import { OrderCard } from './OrderCard';

// Joins "<address line>" and "<postcode>" the way the Account UI presents.
function formatAddress(line1: string, postcode: string): string {
  if (!line1) return '';
  return postcode ? `${line1.trim()}, ${postcode}` : line1.trim();
}
function parseAddress(combined: string): { line1: string; postcode: string } {
  const m = combined.match(/\b(\d{4})\s*$/);
  if (!m) return { line1: combined.trim(), postcode: '' };
  const postcode = m[1];
  const line1 = combined.replace(/,\s*\d{4}\s*$/, '').replace(/\s*\d{4}\s*$/, '').trim();
  return { line1, postcode };
}


export function AccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AccountStackParamList>>();
  const email = useAuthStore((s) => s.email);
  const mode = useAuthStore((s) => s.mode);
  const signOut = useAuthStore((s) => s.signOut);

  const profile = useUserStore((s) => s.profile);
  const defaultAddress = useUserStore((s) => s.defaultAddress);
  const saveProfile = useUserStore((s) => s.saveProfile);
  const saveDefaultAddress = useUserStore((s) => s.saveDefaultAddress);

  const isGuest = mode === 'guest';

  // Local edit buffers; flush to Supabase only when the user taps the
  // tick button next to the field (no autosave on blur — too easy to
  // half-type and lose work).
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [addressJustSaved, setAddressJustSaved] = useState(false);
  const [nameJustSaved, setNameJustSaved] = useState(false);
  const [phoneJustSaved, setPhoneJustSaved] = useState(false);

  // Recent-orders preview: top 3 only. The "See more →" row underneath
  // opens the full list. Guests get a sign-in nudge instead of an empty
  // preview — no Supabase session means there's nothing scoped to them.
  const [recent, setRecent] = useState<OrderSummary[] | null>(null);
  useEffect(() => {
    if (isGuest) { setRecent([]); return; }
    let cancelled = false;
    listMyOrders(3)
      .then((rows) => { if (!cancelled) setRecent(rows); })
      .catch(() => { if (!cancelled) setRecent([]); });
    return () => { cancelled = true; };
  }, [isGuest, profile?.id]);

  // Sync from the store whenever it (re)hydrates. No prototype fallback —
  // guest mode also starts empty so users type their own details.
  useEffect(() => {
    setAddress(defaultAddress ? formatAddress(defaultAddress.line1, defaultAddress.postcode) : '');
  }, [defaultAddress]);

  useEffect(() => {
    setName(profile?.full_name ?? '');
    setPhone(profile?.phone ?? '');
  }, [profile]);

  // Truthy change since last save? Used to decide whether the tick is
  // "ready to save" (accent/green) or "already saved" (muted/check).
  const savedAddress = defaultAddress
    ? formatAddress(defaultAddress.line1, defaultAddress.postcode)
    : '';
  const addressDirty = address.trim() !== savedAddress.trim();
  const savedName = profile?.full_name ?? '';
  const savedPhone = profile?.phone ?? '';
  const nameDirty = name.trim() !== savedName.trim();
  const phoneDirty = phone.replace(/\s/g, '') !== savedPhone.replace(/\s/g, '');

  const persistAddress = async () => {
    if (isGuest) {
      RNAlert.alert('Sign in to save', 'Guest sessions don’t persist details — sign in to keep them across installs.');
      return;
    }
    const { line1, postcode } = parseAddress(address);
    if (!line1 || !postcode) {
      RNAlert.alert('Address needs a postcode', 'Add the 4-digit postcode at the end, e.g. "14 Mill Lane, Joondalup 6027".');
      return;
    }
    setAddressSaving(true);
    try {
      await saveDefaultAddress({ line1, postcode });
      setAddressJustSaved(true);
      setTimeout(() => setAddressJustSaved(false), 2000);
    } catch (e) {
      RNAlert.alert("Couldn't save address", e instanceof Error ? e.message : 'Try again.');
    } finally {
      setAddressSaving(false);
    }
  };

  const persistName = async () => {
    if (isGuest) {
      RNAlert.alert('Sign in to save', 'Guest sessions don’t persist details — sign in to keep them across installs.');
      return;
    }
    const full_name = name.trim();
    if (!full_name) {
      RNAlert.alert('Name needed', 'Enter your full name before saving.');
      return;
    }
    setNameSaving(true);
    try {
      // Preserve the phone we already have on file; we only edit one side here.
      await saveProfile({ full_name, phone: savedPhone });
      setNameJustSaved(true);
      setTimeout(() => setNameJustSaved(false), 2000);
    } catch (e) {
      RNAlert.alert("Couldn't save name", e instanceof Error ? e.message : 'Try again.');
    } finally {
      setNameSaving(false);
    }
  };

  const persistPhone = async () => {
    if (isGuest) {
      RNAlert.alert('Sign in to save', 'Guest sessions don’t persist details — sign in to keep them across installs.');
      return;
    }
    const cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone) {
      RNAlert.alert('Phone needed', 'Enter your phone number before saving.');
      return;
    }
    setPhoneSaving(true);
    try {
      await saveProfile({ full_name: savedName, phone: cleanPhone });
      setPhoneJustSaved(true);
      setTimeout(() => setPhoneJustSaved(false), 2000);
    } catch (e) {
      RNAlert.alert("Couldn't save phone", e instanceof Error ? e.message : 'Try again.');
    } finally {
      setPhoneSaving(false);
    }
  };

  const SaveTick = ({ ready, saving, justSaved, onPress }: {
    ready: boolean; saving: boolean; justSaved: boolean; onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={saving || (!ready && !justSaved)}
      hitSlop={8}
      style={[
        styles.tick,
        ready && !saving && styles.tickReady,
        justSaved && styles.tickDone,
      ]}
    >
      {saving ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Check
          size={16}
          color={ready || justSaved ? '#fff' : colors.muted}
          strokeWidth={3}
        />
      )}
    </Pressable>
  );

  const confirmDelete = () => {
    RNAlert.alert(
      'Delete your account?',
      'This permanently removes your saved address, colours, and order history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              await signOut();
            } catch (e) {
              RNAlert.alert(
                'Could not delete your account',
                e instanceof Error ? e.message : 'Try again later.'
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen
      footer={
        <>
          <CTA label="Sign out" variant="ghost" onPress={() => { void signOut(); }} />
          {!isGuest && (
            <Pressable onPress={confirmDelete} disabled={deleting} hitSlop={8} style={styles.deleteWrap}>
              <Text style={styles.deleteText}>
                {deleting ? 'Deleting…' : 'Delete account'}
              </Text>
            </Pressable>
          )}
        </>
      }
    >
      <ScreenHeader title="Account" />
      <Heading title="Your account" sub={isGuest ? 'Guest mode — sign in to keep your details across installs.' : undefined} />

      <Field
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="Your full name"
        autoCapitalize="words"
        trailingAction={
          <SaveTick
            ready={nameDirty && name.trim().length > 0}
            saving={nameSaving}
            justSaved={nameJustSaved}
            onPress={persistName}
          />
        }
      />
      <Field label="Email" readonlyValue={email ?? '—'} />
      <Field
        label="Phone number"
        value={phone}
        onChangeText={setPhone}
        placeholder="0400 000 000"
        keyboardType="phone-pad"
        trailingAction={
          <SaveTick
            ready={phoneDirty && phone.replace(/\s/g, '').length > 0}
            saving={phoneSaving}
            justSaved={phoneJustSaved}
            onPress={persistPhone}
          />
        }
      />
      <Field
        label="Address"
        value={address}
        onChangeText={setAddress}
        placeholder="14 Mill Lane, Joondalup 6027"
        trailingAction={
          <SaveTick
            ready={addressDirty && address.trim().length > 0}
            saving={addressSaving}
            justSaved={addressJustSaved}
            onPress={persistAddress}
          />
        }
      />

      {/* Saved colours used to surface here, but the Account screen is the
          wrong place for them — users were treating them like saved
          favourites instead of a typing shortcut. They still appear on the
          Colour step when the user has any past picks. */}

      <Text style={[text.fieldLabel, { marginTop: 18, marginBottom: 10 }]}>RECENT ORDERS</Text>
      {isGuest ? (
        <View style={styles.guestNudge}>
          <Text style={styles.guestNudgeText}>Sign in to keep an order history across installs.</Text>
        </View>
      ) : recent === null ? (
        <View style={styles.previewLoading}>
          <ActivityIndicator color={colors.navy} />
        </View>
      ) : recent.length === 0 ? (
        <View style={styles.previewEmpty}>
          <Text style={text.rowSubtitle}>No orders yet — they'll appear here after your first checkout.</Text>
        </View>
      ) : (
        <>
          {recent.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              onPress={() => navigation.navigate('OrderDetail', { orderId: o.id, orderNumber: o.order_number })}
            />
          ))}
          {/* See more → opens the full Recent Orders sub-page. Only shown
              when we actually have orders to show; hidden if the user has
              ≤3 orders and the preview already lists them all. */}
          {recent.length >= 3 && (
            <Pressable
              onPress={() => navigation.navigate('RecentOrders')}
              android_ripple={{ color: colors.rule2 }}
              hitSlop={8}
              style={({ pressed }) => [styles.seeMore, pressed && styles.seeMorePressed]}
            >
              <Text style={styles.seeMoreText}>See more</Text>
              <ChevronRight size={16} color={colors.navy} />
            </Pressable>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Recent-orders preview chrome (cards live in OrderCard.tsx; these are
  // the surrounding states + the "See more" tail row).
  previewLoading: {
    paddingVertical: 22,
    alignItems: 'center',
  },
  previewEmpty: {
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: radii.field,
    paddingVertical: 14,
    paddingHorizontal: spacing.fieldH,
    backgroundColor: '#fff',
  },
  guestNudge: {
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: radii.field,
    paddingVertical: 14,
    paddingHorizontal: spacing.fieldH,
    backgroundColor: '#fff',
  },
  guestNudgeText: { fontSize: 13, color: colors.muted },
  seeMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 2,
    marginBottom: 8,
  },
  seeMorePressed: { opacity: 0.5 },
  seeMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
    marginRight: 4,
  },
  deleteWrap: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 18, marginBottom: 8 },
  deleteText: { color: colors.warn, fontSize: 12, fontWeight: '500' },
  tick: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.rule2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Green for "ready to save" — red read as "warning / wrong" in user
  // testing. Once saved, we keep the same green for the brief justSaved
  // confirmation pulse so the colour change reinforces "yes, persisted".
  tickReady: { backgroundColor: colors.good },
  tickDone: { backgroundColor: colors.good },
});
