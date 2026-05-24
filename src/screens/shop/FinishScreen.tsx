import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenHeader, Heading, Chip, ChipRow, RowItem, ProgressBar } from '../../components';
import { FINISHES, type PaintFinish, type ProductCategory, WHERE_TILES } from '../../types/domain';
import { listProducts } from '../../api/client';
import type { ShopStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ShopStackParamList, 'Finish'>;

export function FinishScreen({ route, navigation }: Props) {
  const category = route.params.category as ProductCategory;
  const isAccessory = category === 'Accessories';
  const [finish, setFinish] = useState<PaintFinish>('Matt');

  const products = useMemo(() => {
    // Sync since seed mode is synchronous; in prod this'd be react-query.
    return listProducts(isAccessory ? { category } : { category, finish }) as any;
  }, [category, finish, isAccessory]);

  // listProducts is async; resolve to a render-friendly array via inline hook.
  const [items, setItems] = useState<any[]>([]);
  React.useEffect(() => {
    let cancelled = false;
    Promise.resolve(products).then((arr) => { if (!cancelled) setItems(arr ?? []); });
    return () => { cancelled = true; };
  }, [products]);

  const whereLabel = WHERE_TILES.find((t) => t.category === category)?.label ?? category;

  return (
    <Screen>
      <ProgressBar step={2} totalSteps={5} />
      <ScreenHeader title={whereLabel} onBack={() => navigation.goBack()} />
      <Heading title="Finish & product" sub="Pick a sheen, then choose a tin." />
      {!isAccessory && (
        <ChipRow>
          {FINISHES.map((f) => (
            <Chip key={f} label={f} selected={finish === f} onPress={() => setFinish(f)} />
          ))}
        </ChipRow>
      )}
      {items.length === 0 ? (
        <Text style={{ paddingVertical: 24, textAlign: 'center', color: '#7a766d' }}>
          No products in this combination.
        </Text>
      ) : (
        <View>
          {items.map((p) => (
            <RowItem
              key={p.id}
              swatchColor={p.swatch_hex}
              title={`${p.name}${p.tin_size ? ` · ${p.tin_size}` : ''}`}
              subtitle={isAccessory ? 'Accessory' : `${whereLabel} · ${p.finish}`}
              right={`$${p.price_aud}`}
              onPress={() => navigation.navigate('Colour', { product: p })}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
