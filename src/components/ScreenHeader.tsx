import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, MoreVertical } from 'lucide-react-native';
import { colors, spacing, text } from '../theme';

type Props = {
  title?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
};

// Top nav row (Back / Title / Menu) — see prototype `.nav`.
// PRD §3.3: padding 8 18.
export function ScreenHeader({ title, onBack, rightAction }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.slot}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={8}>
            <ChevronLeft size={22} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      <Text style={text.navTitle} numberOfLines={1}>{title}</Text>
      <View style={[styles.slot, styles.right]}>
        {rightAction ?? <MoreVertical size={18} color={colors.muted} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.navV,
    paddingHorizontal: spacing.navH,
  },
  slot: { minWidth: 24 },
  right: { alignItems: 'flex-end' },
});
