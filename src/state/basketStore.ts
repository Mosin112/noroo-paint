import { create } from 'zustand';
import type { BasketItem, Product } from '../types/domain';

type AddInput = {
  product: Product;
  brand: string | null;
  colour_name: string | null;
  notes?: string;
  quantity: number;
};

type State = {
  items: BasketItem[];
  add: (input: AddInput) => void;
  update: (id: string, patch: Partial<BasketItem>) => void;
  remove: (id: string) => void;
  clear: () => void;
};

let n = 0;
const nextId = () => `bi-${Date.now()}-${++n}`;

export const useBasketStore = create<State>((set) => ({
  items: [],
  add: ({ product, brand, colour_name, notes, quantity }) =>
    set((s) => ({
      items: [
        ...s.items,
        { id: nextId(), product, brand, colour_name, notes, quantity },
      ],
    })),
  update: (id, patch) =>
    set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })),
  remove: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
  clear: () => set({ items: [] }),
}));

// Selectors — keep totals out of components so the rule lives in one place.
export const FREE_DELIVERY_THRESHOLD = 400;
export const FLAT_DELIVERY = 25;
export const GST_RATE = 0.10;

export type Totals = {
  subtotal: number;
  delivery: number;
  gst: number;
  total: number;
  freeDelivery: boolean;
};

export function calculateTotals(items: BasketItem[], inZone: boolean): Totals {
  const subtotal = items.reduce((sum, it) => sum + it.product.price_aud * it.quantity, 0);
  // Out-of-zone is blocked at checkout, so delivery cost only matters when in-zone.
  const freeDelivery = inZone && subtotal >= FREE_DELIVERY_THRESHOLD;
  const delivery = inZone ? (freeDelivery ? 0 : FLAT_DELIVERY) : FLAT_DELIVERY;
  const gst = (subtotal + delivery) * GST_RATE;
  const total = subtotal + delivery + gst;
  return { subtotal, delivery, gst, total, freeDelivery };
}
