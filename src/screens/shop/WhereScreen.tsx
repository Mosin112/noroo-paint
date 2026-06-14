import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Home, Building2, Square, DoorClosed, Layers, Sparkles, Brush,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Screen, ScreenHeader, Heading, Tile, Alert, ProgressBar } from '../../components';
import { WHERE_TILES } from '../../types/domain';
import type { ProductCategory } from '../../types/domain';
import type { ShopStackParamList } from '../../navigation/types';
import { colors, text } from '../../theme';

type Props = NativeStackScreenProps<ShopStackParamList, 'Where'>;

// Per-category icon. Navy on resting, white on selected.
const CATEGORY_ICONS: Record<ProductCategory, LucideIcon> = {
  Interior: Home,
  Exterior: Building2,
  Ceilings: Square,
  Trim: DoorClosed,
  Undercoat: Layers,
  'Premium All-in-One': Sparkles,
  Accessories: Brush,
};

export function WhereScreen({ navigation }: Props) {
  const standardTiles = WHERE_TILES.filter((t) => t.category !== 'Accessories');
  const accessoriesTile = WHERE_TILES.find((t) => t.category === 'Accessories');

  return (
    <Screen>
      <ProgressBar step={1} totalSteps={5} />
      <ScreenHeader title="New order" showCart />
      <Heading title="Where's the paint going?" sub="Choose a category of paint." />

      <View style={styles.grid}>
        {standardTiles.map((t) => {
          const Icon = CATEGORY_ICONS[t.category];
          return (
            <View key={t.category} style={styles.tileWrap}>
              <Tile
                title={t.label}
                icon={<Icon size={19} color={colors.navy} strokeWidth={1.6} />}
                onPress={() => navigation.navigate('Finish', { category: t.category })}
              />
            </View>
          );
        })}
      </View>

      {accessoriesTile ? (
        <View style={styles.accessoriesWrap}>
          <Tile
            fullWidth
            title={accessoriesTile.label}
            icon={<Brush size={19} color={colors.navy} strokeWidth={1.6} />}
            onPress={() => navigation.navigate('Finish', { category: accessoriesTile.category })}
          />
        </View>
      ) : null}

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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  tileWrap: { width: '48%' },
  accessoriesWrap: { marginTop: 9 },
  alertWrap: { marginTop: 14 },
});
