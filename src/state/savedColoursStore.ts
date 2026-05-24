import { create } from 'zustand';
import type { SavedColour } from '../types/domain';
import {
  listSavedColours,
  upsertSavedColour as apiUpsert,
  deleteSavedColour as apiDelete,
} from '../api/client';
import { useAuthStore } from './authStore';

// Saved colours live in two places per PRD §7.1:
//   - Signed-in: synced to Supabase (saved_colours table, RLS-scoped)
//   - Guest:     local-only, lost on app reinstall
//
// We always hold the canonical list in this store; sync calls fire-and-forget
// on signed-in writes so the UI never blocks on the network.

const GUEST_SEED: SavedColour[] = [
  { id: 'guest-1', brand: 'Dulux',     colour_name: 'Natural White',   last_used_at: new Date().toISOString() },
  { id: 'guest-2', brand: 'Taubmans',  colour_name: 'Crisp White',     last_used_at: new Date().toISOString() },
  { id: 'guest-3', brand: 'Dulux',     colour_name: 'Lexicon Quarter', last_used_at: new Date().toISOString() },
  { id: 'guest-4', brand: 'Colorbond', colour_name: 'Monument',        last_used_at: new Date().toISOString() },
];

type State = {
  colours: SavedColour[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  upsert: (brand: string | null, colour_name: string) => void;
  remove: (id: string) => void;
  reset: () => void;
};

function isSignedIn() {
  return useAuthStore.getState().mode === 'signed-in';
}

export const useSavedColoursStore = create<State>((set, get) => ({
  colours: GUEST_SEED,
  hydrated: false,

  hydrate: async () => {
    if (!isSignedIn()) {
      set({ colours: GUEST_SEED, hydrated: true });
      return;
    }
    const remote = await listSavedColours().catch(() => []);
    set({ colours: remote, hydrated: true });
  },

  upsert: (brand, colour_name) => {
    const now = new Date().toISOString();
    const norm = (v: string | null | undefined) => (v ?? '').trim().toLowerCase();

    // Optimistic local update — bumps the matching row to the front, or
    // inserts a new one. Server upsert below corrects the id on success.
    set((s) => {
      const match = s.colours.find(
        (c) => norm(c.brand) === norm(brand) && norm(c.colour_name) === norm(colour_name)
      );
      if (match) {
        return {
          colours: [{ ...match, last_used_at: now }, ...s.colours.filter((c) => c.id !== match.id)],
        };
      }
      return {
        colours: [{ id: `local-${Date.now()}`, brand, colour_name, last_used_at: now }, ...s.colours],
      };
    });

    if (isSignedIn()) {
      // Fire-and-forget — on success, reconcile the local id with the server id.
      apiUpsert(brand, colour_name)
        .then((saved) => {
          set((s) => ({
            colours: s.colours.map((c) =>
              norm(c.brand) === norm(brand) && norm(c.colour_name) === norm(colour_name)
                ? saved
                : c
            ),
          }));
        })
        .catch(() => undefined);
    }
  },

  remove: (id) => {
    set((s) => ({ colours: s.colours.filter((c) => c.id !== id) }));
    if (isSignedIn() && !id.startsWith('local-') && !id.startsWith('guest-')) {
      apiDelete(id).catch(() => undefined);
    }
  },

  reset: () => set({ colours: GUEST_SEED, hydrated: false }),
}));
