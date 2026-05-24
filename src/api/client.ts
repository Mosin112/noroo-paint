// API client stub — wires up the endpoints from PRD §11 against a base URL.
// Endpoints return seed data in dev mode so screens are usable without a backend.

import axios from 'axios';
import { SEED_PRODUCTS, PERTH_METRO_POSTCODES } from '../data/seedProducts';
import type { Product, ProductCategory, PaintFinish, TinSize, TintingBase, ZoneCheck } from '../types/domain';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.noroopaint.com.au/v1';
const USE_SEED = !process.env.EXPO_PUBLIC_API_BASE_URL;

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
});

export type ProductFilters = {
  category?: ProductCategory;
  finish?: PaintFinish;
  tin_size?: TinSize;
  tinting_base?: TintingBase;
};

export async function listProducts(filters: ProductFilters = {}): Promise<Product[]> {
  if (USE_SEED) {
    return SEED_PRODUCTS.filter((p) => {
      if (!p.is_active) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.finish && p.finish !== filters.finish) return false;
      if (filters.tin_size && p.tin_size !== filters.tin_size) return false;
      if (filters.tinting_base && p.tinting_base !== filters.tinting_base) return false;
      return true;
    });
  }
  const { data } = await http.get<Product[]>('/products', { params: filters });
  return data;
}

export async function checkZone(postcode: string): Promise<ZoneCheck> {
  if (USE_SEED) {
    const inZone = PERTH_METRO_POSTCODES.has(postcode.trim());
    return { in_zone: inZone, label: inZone ? 'Perth metro' : null };
  }
  const { data } = await http.get<ZoneCheck>('/zones/check', { params: { postcode } });
  return data;
}

export type OrderRequest = {
  guest_email?: string;
  customer_name: string;
  customer_phone: string;
  delivery: { line1: string; suburb?: string; postcode: string };
  notes?: string;
  items: { product_id: string; brand: string | null; colour_name: string | null; quantity: number }[];
};

export type OrderResponse = {
  id: string;
  order_number: string;
};

export async function postOrder(req: OrderRequest): Promise<OrderResponse> {
  if (USE_SEED) {
    // Mock an order number per PRD §8.4 — MMDD-A format.
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return { id: `mock-${Date.now()}`, order_number: `${mm}${dd}-A` };
  }
  const { data } = await http.post<OrderResponse>('/orders', req);
  return data;
}

// Auth stubs — wired to a real /auth/otp/* later. In MVP scaffold the
// "request" succeeds locally and "verify" accepts any 6-digit code.
export async function requestOtp(email: string): Promise<void> {
  if (USE_SEED) return;
  await http.post('/auth/otp/request', { email });
}

export async function verifyOtp(email: string, code: string): Promise<{ token: string }> {
  if (USE_SEED) {
    if (!/^\d{6}$/.test(code)) throw new Error("That code didn't match — try again");
    return { token: 'mock-jwt' };
  }
  const { data } = await http.post<{ token: string }>('/auth/otp/verify', { email, code });
  return data;
}
