import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/state/authStore';
import { assertEnvOrThrow } from './src/lib/env';
import { initSentry, wrap as sentryWrap } from './src/lib/sentry';
import { ErrorBoundary } from './src/components';
import { colors } from './src/theme';

// Crash visibly at boot if a production build is missing Supabase creds.
// Seed mode is dev-only — never ship the offline fallback to the store.
assertEnvOrThrow();
initSentry();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

function App() {
  // Restore any existing Supabase session on cold start (PRD §5.1).
  useEffect(() => {
    void useAuthStore.getState().hydrate();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="dark" />
            <RootNavigator />
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default sentryWrap(App);
