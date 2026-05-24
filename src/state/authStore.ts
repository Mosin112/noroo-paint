import { create } from 'zustand';

export type AuthState = {
  // 'signed-in' (verified OTP), 'guest', or 'signed-out'
  mode: 'signed-out' | 'guest' | 'signed-in';
  email: string | null;
  signInAsGuest: () => void;
  signIn: (email: string) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  mode: 'signed-out',
  email: null,
  signInAsGuest: () => set({ mode: 'guest', email: null }),
  signIn: (email) => set({ mode: 'signed-in', email }),
  signOut: () => set({ mode: 'signed-out', email: null }),
}));
