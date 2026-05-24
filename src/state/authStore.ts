import { create } from 'zustand';
import {
  requestOtp as apiRequestOtp,
  verifyOtp as apiVerifyOtp,
  signOutRemote,
  getCurrentUser,
} from '../api/client';

// Auth flow per PRD §5:
//   signed-out → user enters email → requestOtp() → 'awaiting-otp'
//                                                ↓ verifyOtp(code)
//                                                → 'signed-in'
//   anywhere → signInAsGuest() → 'guest'

export type AuthMode = 'signed-out' | 'awaiting-otp' | 'guest' | 'signed-in';

export type AuthState = {
  mode: AuthMode;
  email: string | null;          // pending or signed-in
  userId: string | null;
  lastError: string | null;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  resetOtpFlow: () => void;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  mode: 'signed-out',
  email: null,
  userId: null,
  lastError: null,

  requestOtp: async (email) => {
    const trimmed = email.trim();
    set({ lastError: null });
    try {
      await apiRequestOtp(trimmed);
      set({ mode: 'awaiting-otp', email: trimmed });
    } catch (e) {
      set({ lastError: e instanceof Error ? e.message : String(e) });
      throw e;
    }
  },

  verifyOtp: async (code) => {
    const email = get().email;
    if (!email) throw new Error('No pending email to verify against');
    set({ lastError: null });
    try {
      const { userId } = await apiVerifyOtp(email, code);
      set({ mode: 'signed-in', userId });
    } catch (e) {
      set({ lastError: e instanceof Error ? e.message : String(e) });
      throw e;
    }
  },

  resetOtpFlow: () => set({ mode: 'signed-out', email: null, lastError: null }),

  signInAsGuest: () => set({ mode: 'guest', email: null, userId: null, lastError: null }),

  signOut: async () => {
    await signOutRemote().catch(() => undefined);
    set({ mode: 'signed-out', email: null, userId: null, lastError: null });
  },

  // Restore a Supabase session on cold start (PRD §5.1 "persistent sessions").
  hydrate: async () => {
    const user = await getCurrentUser().catch(() => null);
    if (user) set({ mode: 'signed-in', email: user.email, userId: user.id });
  },
}));
