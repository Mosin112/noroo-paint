import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, ScreenHeader, Heading, Tile, Alert, ProgressBar } from '../../components';
import { WHERE_TILES } from '../../types/domain';
import type { ShopStackParamList } from '../../navigation/types';
import { colors, text } from '../../theme';
import { Text } from 'react-native';

type Props = NativeStackScreenProps<ShopStackParamList, 'Where'>;

export function WhereScreen({ navigation }: Props) {
  return (
    <Screen>
      <ProgressBar step={1} totalSteps={5} />
      <ScreenHeader title="New order" />
      <Heading title="Where's the paint going?" sub="We'll filter the products for you." />
      <View style={styles.grid}>
        {WHERE_TILES.map((t) => (
          <View key={t.category} style={styles.tileWrap}>
            <Tile
              label="Where"
              title={t.label}
              onPress={() => navigation.navigate('Finish', { category: t.category })}
            />
          </View>
        ))}
      </View>
      <View style={styles.alertWrap}>
        <Alert>
          <Text style={text.alertBody}>
            <Text style={{ color: colors.accent, fontWeight: '600' }}>Free delivery</Text>
            {' on Perth-metro orders $400+'}
          </Text>
        </Alert>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tileWrap: { width: '48%' },
  alertWrap: { marginTop: 14 },
});
