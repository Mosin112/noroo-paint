import { create } from 'zustand';
import type { SavedColour } from '../types/domain';

type State = {
  colours: SavedColour[];
  upsert: (brand: string | null, colour_name: string) => void;
  remove: (id: string) => void;
};

const seed: SavedColour[] = [
  { id: 'sc-1', brand: 'Dulux',     colour_name: 'Natural White',   last_used_at: new Date().toISOString() },
  { id: 'sc-2', brand: 'Taubmans',  colour_name: 'Crisp White',     last_used_at: new Date().toISOString() },
  { id: 'sc-3', brand: 'Dulux',     colour_name: 'Lexicon Quarter', last_used_at: new Date().toISOString() },
  { id: 'sc-4', brand: 'Colorbond', colour_name: 'Monument',        last_used_at: new Date().toISOString() },
];

export const useSavedColoursStore = create<State>((set) => ({
  colours: seed,
  upsert: (brand, colour_name) =>
    set((s) => {
      const norm = (v: string | null | undefined) => (v ?? '').trim().toLowerCase();
      const match = s.colours.find(
        (c) => norm(c.brand) === norm(brand) && norm(c.colour_name) === norm(colour_name)
      );
      const now = new Date().toISOString();
      if (match) {
        return {
          colours: [
            { ...match, last_used_at: now },
            ...s.colours.filter((c) => c.id !== match.id),
          ],
        };
      }
      return {
        colours: [
          { id: `sc-${Date.now()}`, brand, colour_name, last_used_at: now },
          ...s.colours,
        ],
      };
    }),
  remove: (id) => set((s) => ({ colours: s.colours.filter((c) => c.id !== id) })),
}));
