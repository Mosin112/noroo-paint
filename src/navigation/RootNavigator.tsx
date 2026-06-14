import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ShoppingCart, ShoppingBag, User } from 'lucide-react-native';

import type { RootStackParamList, MainTabParamList, ShopStackParamList } from './types';
import { useAuthStore } from '../state';
import { useBasketStore } from '../state/basketStore';
import { colors, fontFamily } from '../theme';

import { SignInScreen } from '../screens/auth/SignInScreen';
import { WhereScreen } from '../screens/shop/WhereScreen';
import { FinishScreen } from '../screens/shop/FinishScreen';
import { ColourScreen } from '../screens/shop/ColourScreen';
import { BasketScreen } from '../screens/shop/BasketScreen';
import { CheckoutScreen } from '../screens/shop/CheckoutScreen';
import { OutOfZoneScreen } from '../screens/shop/OutOfZoneScreen';
import { ConfirmedScreen } from '../screens/shop/ConfirmedScreen';
import { AccountScreen } from '../screens/account/AccountScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const ShopStack = createNativeStackNavigator<ShopStackParamList>();

function ShopNavigator() {
  return (
    <ShopStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <ShopStack.Screen name="Where"     component={WhereScreen} />
      <ShopStack.Screen name="Finish"    component={FinishScreen} />
      <ShopStack.Screen name="Colour"    component={ColourScreen} />
      <ShopStack.Screen name="Basket"    component={BasketScreen} />
      <ShopStack.Screen name="Checkout"  component={CheckoutScreen} />
      <ShopStack.Screen name="OutOfZone" component={OutOfZoneScreen} options={{ presentation: 'modal' }} />
      <ShopStack.Screen name="Confirmed" component={ConfirmedScreen} options={{ gestureEnabled: false }} />
    </ShopStack.Navigator>
  );
}

// Placeholder for the Basket tab. The listeners.tabPress in MainTabs swallows
// every tap and navigates into the Shop stack's Basket screen instead — this
// view never actually renders. (The previous useEffect-on-mount approach
// only fired the first time the tab was tapped.)
function BasketTabPlaceholder() {
  return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
}

// Cart icon with a count badge — appears whenever the basket is non-empty.
function BasketTabIcon({ color, size }: { color: string; size: number }) {
  const count = useBasketStore((s) => s.items.reduce((n, it) => n + it.quantity, 0));
  return (
    <View>
      <ShoppingCart size={size} color={color} />
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      ) : null}
    </View>
  );
}

function MainTabs() {
  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily, fontSize: 11, fontWeight: '600' },
        tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.rule },
      }}
    >
      <MainTab.Screen
        name="Shop"
        component={ShopNavigator}
        options={{ tabBarLabel: 'Shop', tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} /> }}
        listeners={() => ({
          tabPress: (e) => {
            // Guests get bumped back to SignIn when they try to enter the
            // shop. Signing out flips auth.mode → 'signed-out' which causes
            // RootNavigator to present the SignIn modal. They can re-enter
            // as guest from there, but the tab acts as a sign-up prompt.
            if (useAuthStore.getState().mode === 'guest') {
              e.preventDefault();
              void useAuthStore.getState().signOut();
            }
          },
        })}
      />
      <MainTab.Screen
        name="BasketTab"
        component={BasketTabPlaceholder}
        options={{
          tabBarLabel: 'Basket',
          tabBarIcon: ({ color, size }) => <BasketTabIcon color={color} size={size} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Every tap navigates into the Shop stack's Basket screen so the
            // existing checkout flow keeps working without duplicating the route.
            e.preventDefault();
            navigation.navigate('Shop', { screen: 'Basket' });
          },
        })}
      />
      <MainTab.Screen
        name="Account"
        component={AccountScreen}
        options={{ tabBarLabel: 'Account', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }}
      />
    </MainTab.Navigator>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.paper,
    text: colors.ink,
    border: colors.rule,
    primary: colors.navy,
  },
};

export function RootNavigator() {
  const mode = useAuthStore((s) => s.mode);
  // 'awaiting-otp' stays on SignIn so the OTP modal overlays it. Only fully
  // verified or guest sessions get the Main tabs.
  const isAuthed = mode === 'signed-in' || mode === 'guest';

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthed ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          // SignIn is the only screen when signed-out, so it doesn't need
          // modal presentation. On Android, native-stack modals run inside a
          // Dialog window whose IME attaches to the wrong window — that's
          // the "tap email field, keyboard flashes and dies" bug from the
          // v0.2.0 APK. Default push presentation fixes it.
          <RootStack.Screen name="SignIn" component={SignInScreen} options={{ gestureEnabled: false }} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
