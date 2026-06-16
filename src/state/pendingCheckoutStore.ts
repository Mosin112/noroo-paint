import { create } from 'zustand';
import type { DeliveryMode } from '../types/domain';

// One-shot pre-fill hint for the Checkout screen. Used by the Reorder
// flow: OrderDetailScreen drops the old order's customer + address +
// delivery mode here, then navigates to Checkout. Checkout reads the
// hint on mount, seeds its form state, and immediately clears the hint
// so reloading the screen doesn't keep re-applying it.

export type PendingCheckout = {
  mode: DeliveryMode;
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  suburb?: string;
  postcode?: string;
  notes?: string;
};

type State = {
  hint: PendingCheckout | null;
  set: (hint: PendingCheckout) => void;
  consume: () => PendingCheckout | null;
};

export const usePendingCheckoutStore = create<State>((set, get) => ({
  hint: null,
  set: (hint) => set({ hint }),
  // Read + clear in one call so the form only seeds once per reorder.
  consume: () => {
    const h = get().hint;
    if (h) set({ hint: null });
    return h;
  },
}));
