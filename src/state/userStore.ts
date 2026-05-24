import { create } from 'zustand';
import {
  getProfile,
  updateProfile,
  getDefaultAddress,
  upsertDefaultAddress,
  type Profile,
  type Address,
} from '../api/client';

// Single source of truth for the signed-in user's editable details:
// full name + phone (profiles table) and default delivery address.
// AccountScreen reads/writes here, CheckoutScreen seeds its form from it.

type State = {
  profile: Profile | null;
  defaultAddress: Address | null;
  hydrated: boolean;
  loading: boolean;
  hydrate: () => Promise<void>;
  saveProfile: (patch: { full_name?: string; phone?: string }) => Promise<void>;
  saveDefaultAddress: (input: { line1: string; suburb?: string; postcode: string }) => Promise<void>;
  clear: () => void;
};

export const useUserStore = create<State>((set) => ({
  profile: null,
  defaultAddress: null,
  hydrated: false,
  loading: false,

  hydrate: async () => {
    set({ loading: true });
    try {
      const [profile, address] = await Promise.all([
        getProfile().catch(() => null),
        getDefaultAddress().catch(() => null),
      ]);
      set({ profile, defaultAddress: address, hydrated: true, loading: false });
    } catch {
      set({ loading: false, hydrated: true });
    }
  },

  saveProfile: async (patch) => {
    const updated = await updateProfile(patch);
    set({ profile: updated });
  },

  saveDefaultAddress: async (input) => {
    const updated = await upsertDefaultAddress(input);
    set({ defaultAddress: updated });
  },

  clear: () => set({ profile: null, defaultAddress: null, hydrated: false, loading: false }),
}));
