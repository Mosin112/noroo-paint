import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert as RNAlert } from 'react-native';
import { X } from 'lucide-react-native';
import { Screen, ScreenHeader, Heading, Field, CTA, SavedColourChip } from '../../components';
import { useAuthStore, useSavedColoursStore } from '../../state';
import { useUserStore } from '../../state/userStore';
import { deleteAccount } from '../../api/client';
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

  // Local edit buffers; flush to Supabase on blur.
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Sync from the store whenever it (re)hydrates.
  useEffect(() => {
    setAddress(
      defaultAddress
        ? formatAddress(defaultAddress.line1, defaultAddress.postcode)
        : isGuest ? '14 Mill Lane, Joondalup 6027' : ''
    );
  }, [defaultAddress, isGuest]);

  useEffect(() => {
    setContact(
      profile
        ? formatContact(profile.full_name, profile.phone)
        : isGuest ? 'Marcus McCabe · 0412 884 102' : ''
    );
  }, [profile, isGuest]);

  const persistAddress = () => {
    if (isGuest) return;
    const { line1, postcode } = parseAddress(address);
    if (!line1 || !postcode) return;
    void saveDefaultAddress({ line1, postcode });
  };

  const persistContact = () => {
    if (isGuest) return;
    const { full_name, phone } = parseContact(contact);
    if (!full_name && !phone) return;
    void saveProfile({ full_name, phone });
  };

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
        onBlur={persistAddress}
      />
      <Field
        label="Name & phone"
        value={contact}
        onChangeText={setContact}
        onBlur={persistContact}
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
      <View style={styles.orderRow}>
        <Text style={text.rowSubtitle}>No orders yet — they'll appear here after checkout.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  savedRow: { flexDirection: 'row', flexWrap: 'wrap' },
  savedItem: { flexDirection: 'row', alignItems: 'center', marginRight: 6 },
  x: { padding: 4, marginLeft: -8, marginRight: 8 },
  orderRow: {
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: radii.field,
    padding: spacing.fieldH,
    backgroundColor: '#fff',
  },
  deleteWrap: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 18, marginBottom: 8 },
  deleteText: { color: colors.warn, fontSize: 12, fontWeight: '500' },
});
