import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert as RNAlert } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Screen, ScreenHeader, Heading, Field, CTA, SavedColourChip } from '../../components';
import { useAuthStore, useSavedColoursStore } from '../../state';
import { useUserStore } from '../../state/userStore';
import { deleteAccount, listMyOrders, type OrderSummary } from '../../api/client';
import { colors, radii, spacing, text } from '../../theme';

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

function formatContact(name: string | null, phone: string | null): string {
  if (!name && !phone) return '';
  return [name, phone].filter(Boolean).join(' · ');
}
function parseContact(combined: string): { full_name: string; phone: string } {
  const [name, ...rest] = combined.split('·').map((s) => s.trim());
  return { full_name: name ?? '', phone: rest.join(' · ').replace(/\s/g, '') };
}

export function AccountScreen() {
  const email = useAuthStore((s) => s.email);
  const mode = useAuthStore((s) => s.mode);
  const signOut = useAuthStore((s) => s.signOut);

  const savedColours = useSavedColoursStore((s) => s.colours);
  const removeColour = useSavedColoursStore((s) => s.remove);

  const profile = useUserStore((s) => s.profile);
  const defaultAddress = useUserStore((s) => s.defaultAddress);
  const saveProfile = useUserStore((s) => s.saveProfile);
  const saveDefaultAddress = useUserStore((s) => s.saveDefaultAddress);

  const isGuest = mode === 'guest';

  // Local edit buffers; flush to Supabase only when the user taps the
  // tick button next to the field (no autosave on blur — too easy to
  // half-type and lose work).
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);
  const [addressJustSaved, setAddressJustSaved] = useState(false);
  const [contactJustSaved, setContactJustSaved] = useState(false);

  // Recent orders for the signed-in user. Fetched lazily on mount; guest
  // mode never sees orders here (no Supabase session = nothing to scope to).
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  useEffect(() => {
    if (isGuest) { setOrders([]); return; }
    let cancelled = false;
    listMyOrders(10)
      .then((rows) => { if (!cancelled) setOrders(rows); })
      .catch(() => { if (!cancelled) setOrders([]); });
    return () => { cancelled = true; };
  }, [isGuest, profile?.id]);

  // Sync from the store whenever it (re)hydrates. No prototype fallback —
  // guest mode also starts empty so users type their own details.
  useEffect(() => {
    setAddress(defaultAddress ? formatAddress(defaultAddress.line1, defaultAddress.postcode) : '');
  }, [defaultAddress]);

  useEffect(() => {
    setContact(profile ? formatContact(profile.full_name, profile.phone) : '');
  }, [profile]);

  // Truthy address change since last save? Used to decide whether the tick
  // is "ready to save" (accent) or "already saved" (muted/check).
  const savedAddress = defaultAddress
    ? formatAddress(defaultAddress.line1, defaultAddress.postcode)
    : '';
  const addressDirty = address.trim() !== savedAddress.trim();
  const savedContact = profile ? formatContact(profile.full_name, profile.phone) : '';
  const contactDirty = contact.trim() !== savedContact.trim();

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

  const persistContact = async () => {
    if (isGuest) {
      RNAlert.alert('Sign in to save', 'Guest sessions don’t persist details — sign in to keep them across installs.');
      return;
    }
    const { full_name, phone } = parseContact(contact);
    if (!full_name && !phone) {
      RNAlert.alert('Enter your name and phone', 'Format: Name · 0400 000 000');
      return;
    }
    setContactSaving(true);
    try {
      await saveProfile({ full_name, phone });
      setContactJustSaved(true);
      setTimeout(() => setContactJustSaved(false), 2000);
    } catch (e) {
      RNAlert.alert("Couldn't save details", e instanceof Error ? e.message : 'Try again.');
    } finally {
      setContactSaving(false);
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

      <Field label="Email" readonlyValue={email ?? '—'} />
      <Field
        label="Delivery address"
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
      <Field
        label="Name & phone"
        value={contact}
        onChangeText={setContact}
        placeholder="Your name · 0400 000 000"
        trailingAction={
          <SaveTick
            ready={contactDirty && contact.trim().length > 0}
            saving={contactSaving}
            justSaved={contactJustSaved}
            onPress={persistContact}
          />
        }
      />

      <Text style={[text.fieldLabel, { marginTop: 12, marginBottom: 6 }]}>SAVED COLOURS</Text>
      <View style={styles.savedRow}>
        {savedColours.length === 0 ? (
          <Text style={[text.alertBody, { color: colors.muted }]}>None saved yet.</Text>
        ) : (
          savedColours.map((c) => (
            <View key={c.id} style={styles.savedItem}>
              <SavedColourChip brand={c.brand} colourName={c.colour_name} />
              <Pressable onPress={() => removeColour(c.id)} hitSlop={6} style={styles.x}>
                <X size={12} color={colors.muted} />
              </Pressable>
            </View>
          ))
        )}
      </View>

      <Text style={[text.fieldLabel, { marginTop: 18, marginBottom: 6 }]}>RECENT ORDERS</Text>
      {orders === null ? (
        <View style={styles.orderRow}>
          <ActivityIndicator color={colors.navy} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.orderRow}>
          <Text style={text.rowSubtitle}>No orders yet — they'll appear here after checkout.</Text>
        </View>
      ) : (
        <View style={styles.orderList}>
          {orders.map((o) => (
            <View key={o.id} style={styles.orderItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderNumber}>#{o.order_number}</Text>
                <Text style={styles.orderMeta}>
                  {formatOrderDate(o.created_at)} · {o.delivery_mode === 'pickup' ? 'Pickup' : 'Delivery'}
                </Text>
              </View>
              <Text style={styles.orderTotal}>${Number(o.total_aud).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

// "22 May" style — keeps the row compact.
function formatOrderDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  } catch {
    return iso.slice(0, 10);
  }
}

const styles = StyleSheet.create({
  savedRow: { flexDirection: 'row', flexWrap: 'wrap' },
  savedItem: { flexDirection: 'row', alignItems: 'center', marginRight: 6 },
  x: { padding: 4, marginLeft: -8, marginRight: 8 },
  orderList: { gap: 0 },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
  },
  orderNumber: { fontSize: 13, fontWeight: '700', color: colors.ink },
  orderMeta: { fontSize: 11, color: colors.muted, marginTop: 2 },
  orderTotal: { fontSize: 13, fontWeight: '700', color: colors.ink },
  orderRow: {
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: radii.field,
    padding: spacing.fieldH,
    backgroundColor: '#fff',
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
  tickReady: { backgroundColor: colors.accent },
  tickDone: { backgroundColor: colors.good },
});
