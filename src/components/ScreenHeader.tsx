import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, MoreVertical, ShoppingCart } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useBasketStore } from '../state/basketStore';
import { colors, spacing, text } from '../theme';

type Props = {
  title?: string;
  onBack?: () => void;
  // Custom right slot — wins over `showCart` when both are passed.
  rightAction?: React.ReactNode;
  // Render a circular cart button on the right that navigates into the
  // Shop stack's Basket screen. Includes a count badge when non-empty.
  showCart?: boolean;
};

// v2.3 nav row: a 36×36 white circular pill on each side (back + cart),
// title centred. Buttons have a 1px rule border + tiny shadow so they
// float over the cool page background instead of disappearing into it.
export function ScreenHeader({ title, onBack, rightAction, showCart }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.slot}>
        {onBack ? (
          <Pressable onPress={onBack} style={({ pressed }) => [styles.circleBtn, pressed && styles.btnPressed]} hitSlop={6}>
            <ChevronLeft size={22} color={colors.ink2} />
          </Pressable>
        ) : null}
      </View>
      <Text style={text.navTitle} numberOfLines={1}>{title}</Text>
      <View style={[styles.slot, styles.rightSlot]}>
        {rightAction ?? (showCart ? <CartButton /> : null)}
      </View>
    </View>
  );
}

function CartButton() {
  const nav = useNavigation<any>();
  const count = useBasketStore((s) => s.items.reduce((n, it) => n + it.quantity, 0));
  return (
    <Pressable
      onPress={() => nav.navigate('Basket')}
      style={({ pressed }) => [styles.circleBtn, pressed && styles.btnPressed]}
      hitSlop={6}
    >
      <ShoppingCart size={18} color={colors.ink2} strokeWidth={1.8} />
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

// kept around for screens that want a bare overflow icon (not used after v2.3).
export function HeaderMenuIcon() {
  return <MoreVertical size={18} color={colors.muted} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.navV + 2,
    paddingHorizontal: spacing.navH - 2,
  },
  slot: { width: 36, height: 36, alignItems: 'flex-start', justifyContent: 'center' },
  rightSlot: { alignItems: 'flex-end' },
  circleBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.paper,
    borderWidth: 1, borderColor: colors.rule,
    alignItems: 'center', justifyContent: 'center',
    // Subtle shadow per Design System §4 (only the phone frame in the
    // prototype has a meaningful shadow; here we use a very soft one
    // so the buttons separate from the bg).
    shadowColor: '#142B5C',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  btnPressed: { backgroundColor: colors.rule2 },
  badge: {
    position: 'absolute',
    top: -3, right: -3,
    minWidth: 16, height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.accent,
    borderWidth: 1.5, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
