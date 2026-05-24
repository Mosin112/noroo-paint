// Boot-time environment validation.
//
// In dev (__DEV__ === true) missing env vars fall back to seed mode for
// offline iteration. In production builds they're a hard error: a build
// that ships without Supabase credentials cannot place real orders and
// would silently corrupt user expectations — better to crash visibly.

import { SUPABASE_CONFIGURED } from '../api/supabase';

export type EnvCheck = {
  ok: boolean;
  missing: string[];
  mode: 'production-supabase' | 'dev-seed' | 'dev-supabase';
};

export function validateEnv(): EnvCheck {
  const missing: string[] = [];
  if (!process.env.EXPO_PUBLIC_SUPABASE_URL) missing.push('EXPO_PUBLIC_SUPABASE_URL');
  if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) missing.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');

  const dev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

  if (!SUPABASE_CONFIGURED && !dev) {
    return { ok: false, missing, mode: 'production-supabase' };
  }
  return {
    ok: true,
    missing,
    mode: SUPABASE_CONFIGURED ? (dev ? 'dev-supabase' : 'production-supabase') : 'dev-seed',
  };
}

// Throwing variant used at App boot — surfaces the failure as a red error
// screen rather than allowing a degraded session to start.
export function assertEnvOrThrow(): void {
  const r = validateEnv();
  if (!r.ok) {
    throw new Error(
      `Production build is missing required environment variables: ${r.missing.join(', ')}. ` +
        `Set them via EAS secrets before building, or via .env for local dev.`
    );
  }
}
