// Strongly-typed nav params per react-navigation docs.
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Product } from '../types/domain';

export type ShopStackParamList = {
  Where: undefined;
  Finish: { category: string };
  Colour: { product: Product };
  Basket: undefined;
  Checkout: undefined;
  OutOfZone: { postcode: string };
  Confirmed: { orderNumber: string };
};

export type MainTabParamList = {
  Shop: NavigatorScreenParams<ShopStackParamList>;
  BasketTab: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  SignIn: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};
