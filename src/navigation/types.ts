// Strongly-typed nav params per react-navigation docs.
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Product, DeliveryMode } from '../types/domain';

// Snapshot of the order shown on the Confirmed screen. We pass the data
// through navigation rather than re-fetching so the success screen lands
// instantly even on slow connections.
export type ConfirmedOrder = {
  orderNumber: string;
  mode: DeliveryMode;
  customerName: string;
  customerPhone: string;
  // For delivery orders.
  address?: { line1: string; line2?: string; suburb: string; postcode: string };
  // For pickup — name + address of the store the customer is collecting from.
  pickupName?: string;
  pickupAddress?: string;
  pickupHours?: string;
  notes?: string;
  items: Array<{
    name: string;
    tin_size?: string | null;
    finish?: string | null;
    brand?: string | null;
    colour_name?: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  delivery: number;
  gst: number;
  total: number;
};

export type ShopStackParamList = {
  Where: undefined;
  Finish: { category: string };
  Colour: { product: Product };
  Basket: undefined;
  Checkout: undefined;
  OutOfZone: { postcode: string };
  Confirmed: { order: ConfirmedOrder };
};

export type AccountStackParamList = {
  AccountHome: undefined;
  RecentOrders: undefined;
};

export type MainTabParamList = {
  Shop: NavigatorScreenParams<ShopStackParamList>;
  BasketTab: undefined;
  Account: NavigatorScreenParams<AccountStackParamList>;
};

export type RootStackParamList = {
  SignIn: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};
