import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { Screen, ScreenHeader, Heading, Field, CTA, SavedColourChip } from '../../components';
import { useAuthStore, useSavedColoursStore } from '../../state';
import { colors, radii, spacing, text } from '../../theme';

export function AccountScreen() {
  const email = useAuthStore((s) => s.email);
  const mode = useAuthStore((s) => s.mode);
  const signOut = useAuthStore((s) => s.signOut);
  const savedColours = useSavedColoursStore((s) => s.colours);
  const removeColour = useSavedColoursStore((s) => s.remove);

  const [address, setAddress] = useState('14 Mill Lane, Joondalup 6027');
  const [contact, setContact] = useState('Marcus McCabe · 0412 884 102');

  const isGuest = mode === 'guest';

  return (
    <Screen footer={<CTA label="Sign out" variant="ghost" onPress={() => { void signOut(); }} />}>
      <ScreenHeader title="Account" />
      <Heading title="Your account" sub={isGuest ? 'Guest mode — sign in to keep your details across installs.' : undefined} />

      <Field label="Email" readonlyValue={email ?? '—'} />
      <Field label="Delivery address" value={address} onChangeText={setAddress} />
      <Field label="Name & phone" value={contact} onChangeText={setContact} />

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
});
