import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/state/authStore';
import { assertEnvOrThrow } from './src/lib/env';
import { initSentry, wrap as sentryWrap } from './src/lib/sentry';
import { ErrorBoundary, AppSplash } from './src/components';
import { usePrefetchProducts } from './src/data/useProducts';
import { colors } from './src/theme';

// Warms the React Query cache for the product catalogue as soon as
// QueryClientProvider mounts. Has to live inside the provider, so it's
// a tiny child component rather than a top-level call.
function PrefetchWarmer() {
  usePrefetchProducts();
  return null;
}

// Keep the native splash visible while we mount the JS splash. Once the
// JS one renders, it covers the screen and the native one can hide.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

// Crash visibly at boot if a production build is missing Supabase creds.
// Seed mode is dev-only — never ship the offline fallback to the store.
assertEnvOrThrow();
initSentry();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

function App() {
  // Show the JS splash on top of the navigator. AppSplash calls back when
  // its ~1.7s + fade animation finishes; only then do we let the real app
  // become interactive.
  const [splashGone, setSplashGone] = useState(false);

  // Restore any existing Supabase session on cold start (PRD §5.1).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await useAuthStore.getState().hydrate();
      } finally {
        // Hide the NATIVE splash as soon as auth is restored. The JS
        // AppSplash sits on top so the user sees a seamless transition
        // from the native splash → JS splash → navigator.
        if (!cancelled) await SplashScreen.hideAsync().catch(() => undefined);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <PrefetchWarmer />
            <StatusBar style="dark" />
            <RootNavigator />
            {!splashGone ? <AppSplash onDone={() => setSplashGone(true)} /> : null}
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default sentryWrap(App);
