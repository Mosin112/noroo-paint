import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Screen, ScreenHeader, Heading, Chip, ChipRow, RowItem, ProgressBar, Alert, ProductBanner,
} from '../../components';
import {
  FINISHES,
  RANGE_META,
  WHERE_TILES,
  type PaintFinish,
  type Product,
  type ProductCategory,
} from '../../types/domain';
import { listProducts } from '../../api/client';
import type { ShopStackParamList } from '../../navigation/types';
import { colors, rangeColor, text } from '../../theme';

type Props = NativeStackScreenProps<ShopStackParamList, 'Finish'>;

export function FinishScreen({ route, navigation }: Props) {
  const category = route.params.category as ProductCategory;
  const isAccessory = category === 'Accessories';
  const meta = RANGE_META[category];
  const accent = rangeColor(category);
  const whereLabel = WHERE_TILES.find((t) => t.category === category)?.label ?? category;

  // Load every active product in this category once; finish is a client-side
  // filter so the chip row reacts instantly.
  const [all, setAll] = useState<Product[]>([]);
  useEffect(() => {
    let cancelled = false;
    listProducts({ category })
      .then((r) => { if (!cancelled) setAll(r); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [category]);

  // Distinct finishes available in this category — drives the chip row.
  const availableFinishes = useMemo<PaintFinish[]>(() => {
    if (isAccessory) return [];
    const seen = new Set<PaintFinish>();
    const ordered: PaintFinish[] = [];
    for (const f of FINISHES) {
      if (all.some((p) => p.finish === f)) { seen.add(f); ordered.push(f); }
    }
    return ordered;
  }, [all, isAccessory]);

  // Some categories (Undercoat) have a single product with no finish — every
  // SKU has finish: null. Treat them like accessories: no chip row, just
  // show the size variants directly.
  const hasFinishes = availableFinishes.length > 0;
  const skipFinishFilter = isAccessory || !hasFinishes;

  // Pick the first available finish whenever the category's data lands.
  const [finish, setFinish] = useState<PaintFinish | null>(null);
  useEffect(() => {
    if (hasFinishes && !availableFinishes.includes(finish as PaintFinish)) {
      setFinish(availableFinishes[0]);
    }
  }, [availableFinishes, finish, hasFinishes]);

  const visibleProducts = useMemo(() => {
    if (skipFinishFilter) return all;
    if (!finish) return [];
    return all.filter((p) => p.finish === finish);
  }, [all, finish, skipFinishFilter]);

  const showFinishChips = !isAccessory && availableFinishes.length > 1;

  return (
    <Screen>
      <ProgressBar step={2} totalSteps={5} />
      <ScreenHeader title={whereLabel} onBack={() => navigation.goBack()} showCart />
      <Heading
        title={isAccessory ? 'Accessories' : 'Choose your paint'}
        sub={
          isAccessory
            ? 'Tap an item to add it to your basket.'
            : 'Pick a finish, then pick a size.'
        }
      />

      {!isAccessory && meta.full ? (
        <ProductBanner tag={meta.tag} name={meta.full} accentHex={accent} />
      ) : null}

      {showFinishChips ? (
        <ChipRow>
          {availableFinishes.map((f) => (
            <Chip key={f} label={f} selected={finish === f} onPress={() => setFinish(f)} />
          ))}
        </ChipRow>
      ) : null}

      {visibleProducts.length === 0 ? (
        <Text style={styles.empty}>No products in this combination.</Text>
      ) : (
        <View>
          {visibleProducts.map((p) => {
            // For finished paint: "Multi Primer Semi Gloss · 4L". For
            // finish-less SKUs (Undercoat): "Multi Primer · 4L" — no
            // empty finish slot leaving a double space.
            const titleHead = [meta.short || p.name, p.finish].filter(Boolean).join(' ');
            const title = isAccessory ? p.name : `${titleHead} · ${p.tin_size ?? ''}`;
            const subtitle = isAccessory
              ? 'Accessory'
              : `${whereLabel} · ${p.tinting_base ?? p.finish ?? ''}`;
            return (
              <RowItem
                key={p.id}
                swatchColor={accent}
                title={title}
                subtitle={subtitle}
                right={`$${p.price_aud.toFixed(2)}`}
                onPress={() => navigation.navigate('Colour', { product: p })}
              />
            );
          })}
        </View>
      )}

      <View style={styles.alertWrap}>
        <Alert variant="info">
          <Text style={text.alertBody}>
            <Text style={{ color: colors.navy, fontWeight: '700' }}>Free delivery</Text>
            {' within Perth Metro'}
          </Text>
        </Alert>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { paddingVertical: 24, textAlign: 'center', color: colors.muted },
  alertWrap: { marginTop: 14 },
});
