import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Screen, ScreenHeader, Heading, Field, CTA, ProgressBar,
  QtyStepper, SavedColourChip,
} from '../../components';
import { useBasketStore, useSavedColoursStore } from '../../state';
import type { ShopStackParamList } from '../../navigation/types';
import { colors, radii, spacing, text } from '../../theme';

type Props = NativeStackScreenProps<ShopStackParamList, 'Colour'>;

export function ColourScreen({ route, navigation }: Props) {
  const { product } = route.params;
  const isAccessory = product.category === 'Accessories';

  // Always start blank. White-base products used to auto-fill "White" but
  // that pre-filled value confused customers; they now type their own.
  const [brand, setBrand] = useState('');
  const [colourName, setColourName] = useState('');
  const [notes, setNotes] = useState('');
  const [qty, setQty] = useState(1);
  const [activeSaved, setActiveSaved] = useState<string | null>(null);

  const savedColours = useSavedColoursStore((s) => s.colours);
  const addToBasket = useBasketStore((s) => s.add);
  const upsertColour = useSavedColoursStore((s) => s.upsert);

  // Shake animation (PRD §7.1) — Animated translateX, ±4px, 300ms.
  const shake = React.useRef(new Animated.Value(0)).current;
  const triggerShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: -4, duration: 75, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 4,  duration: 75, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -4, duration: 75, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0,  duration: 75, easing: Easing.linear, useNativeDriver: true }),
    ]).start();
  };

  // Accessories: clear the colour state — they don't surface this UI anyway.
  useEffect(() => {
    if (isAccessory) {
      setBrand('');
      setColourName('');
    }
  }, [isAccessory]);

  const canContinue = isAccessory || colourName.trim().length > 0;

  const handleContinue = () => {
    if (!canContinue) {
      triggerShake();
      return;
    }
    if (!isAccessory) {
      upsertColour(brand.trim() || null, colourName.trim());
    }
    addToBasket({
      product,
      brand: isAccessory ? null : (brand.trim() || null),
      colour_name: isAccessory ? null : colourName.trim(),
      notes: notes.trim() || undefined,
      quantity: qty,
    });
    navigation.navigate('Basket');
  };

  // v2.3 — same prompt for all paint products (no more white-only special copy).
  const subCopy = isAccessory
    ? 'No tinting needed for accessories.'
    : 'Please be specific. As much information as possible ensures a correct tint.';

  return (
    <Screen
      footer={<CTA label="Add to basket" onPress={handleContinue} disabled={!canContinue} />}
    >
      <ProgressBar step={3} totalSteps={5} />
      <ScreenHeader title="Colour" onBack={() => navigation.goBack()} showCart />
      <Heading
        title={isAccessory ? 'Confirm accessory' : 'Choose your colour'}
        sub={subCopy}
      />

      {!isAccessory && (
        <>
          <Field
            label="Brand (optional)"
            value={brand}
            onChangeText={(v) => { setBrand(v); setActiveSaved(null); }}
            placeholder="e.g. Dulux"
          />
          <Animated.View style={{ transform: [{ translateX: shake }] }}>
            <Field
              label="Colour name"
              required
              value={colourName}
              onChangeText={(v) => { setColourName(v); setActiveSaved(null); }}
              placeholder="e.g. Natural White"
            />
          </Animated.View>
        </>
      )}

      {!isAccessory && savedColours.length > 0 && (
        <View style={styles.savedWrap}>
          <Text style={[text.fieldLabel, { marginBottom: 6 }]}>YOUR SAVED COLOURS · TAP TO USE</Text>
          <View style={styles.savedChips}>
            {savedColours.map((c) => (
              <SavedColourChip
                key={c.id}
                brand={c.brand}
                colourName={c.colour_name}
                hot={activeSaved === c.id}
                onPress={() => {
                  setBrand(c.brand ?? '');
                  setColourName(c.colour_name);
                  setActiveSaved(c.id);
                }}
              />
            ))}
          </View>
        </View>
      )}

      <Field
        label="Order notes (optional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Add any product or tinting notes here for our team"
        multiline
        numberOfLines={3}
        style={{ minHeight: 60, textAlignVertical: 'top' }}
      />

      <View style={styles.qtyRow}>
        <Text style={text.fieldLabel}>QUANTITY</Text>
        <QtyStepper value={qty} onChange={setQty} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  savedWrap: { marginTop: 6, marginBottom: 4 },
  savedChips: { flexDirection: 'row', flexWrap: 'wrap' },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.fieldBorder,
    borderRadius: radii.field,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 6,
    marginBottom: spacing.fieldGap,
    backgroundColor: '#fff',
  },
});
