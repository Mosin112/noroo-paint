// Supabase client. Returns null when env vars are unset so the rest of the
// API layer can fall back to seed data without runtime errors.
//
// Required env vars (Expo loads EXPO_PUBLIC_* into the bundle automatically):
//   EXPO_PUBLIC_SUPABASE_URL
//   EXPO_PUBLIC_SUPABASE_ANON_KEY
//
// Email OTP delivery is configured in the Supabase dashboard: Auth → SMTP.
// Set those credentials to your AWS SES SMTP user (PRD §2).

import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_CONFIGURED = !!(url && anonKey);

export const supabase: SupabaseClient | null = SUPABASE_CONFIGURED
  ? createClient(url!, anonKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// Helper so callers don't have to null-check on every line.
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured — set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
  return supabase;
}
