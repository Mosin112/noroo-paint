import React, { useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ShoppingCart, ShoppingBag, User } from 'lucide-react-native';

import type { RootStackParamList, MainTabParamList, ShopStackParamList } from './types';
import { useAuthStore } from '../state';
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

// The Basket tab redirects into the nested Shop stack so the Basket screen
// only ever exists in one place (and its in-stack Checkout navigation works).
function BasketTabRedirect() {
  const nav = useNavigation<any>();
  useEffect(() => {
    nav.navigate('Shop', { screen: 'Basket' });
  }, [nav]);
  return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
}

function MainTabs() {
  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.rule },
      }}
    >
      <MainTab.Screen
        name="Shop"
        component={ShopNavigator}
        options={{ tabBarLabel: 'Shop', tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} /> }}
      />
      <MainTab.Screen
        name="BasketTab"
        component={BasketTabRedirect}
        options={{ tabBarLabel: 'Basket', tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} /> }}
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
  colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.paper, text: colors.ink, border: colors.rule, primary: colors.accent },
};

export function RootNavigator() {
  const mode = useAuthStore((s) => s.mode);
  const isAuthed = mode !== 'signed-out';

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthed ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          <RootStack.Screen name="SignIn" component={SignInScreen} options={{ presentation: 'modal', gestureEnabled: false }} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
