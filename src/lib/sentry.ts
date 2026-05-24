// Crash + error reporting via Sentry. No-op when EXPO_PUBLIC_SENTRY_DSN is
// unset, so local dev and CI never spam the production project.
//
// On real builds, EAS injects the DSN via the eas.json env block (see
// README for the secret name).

import * as Sentry from '@sentry/react-native';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

let initialized = false;

export function initSentry(): void {
  if (initialized || !DSN) return;
  Sentry.init({
    dsn: DSN,
    enableAutoSessionTracking: true,
    // Keep traces light in MVP; we can crank this once we know what we want
    // to monitor. tracesSampleRate=0 disables performance traces entirely.
    tracesSampleRate: 0,
    // PII gates: defer to Sentry's beforeSend hook to scrub if we ever
    // accidentally pass user emails or order details into capture context.
    sendDefaultPii: false,
    // Quieter logs in dev so the Metro terminal stays readable.
    debug: typeof __DEV__ !== 'undefined' && __DEV__,
  });
  initialized = true;
}

export function captureError(err: unknown, context?: Record<string, unknown>): void {
  if (!DSN) {
    // eslint-disable-next-line no-console
    console.error('[Noroo]', err, context);
    return;
  }
  Sentry.withScope((scope) => {
    if (context) {
      for (const [k, v] of Object.entries(context)) scope.setExtra(k, v);
    }
    Sentry.captureException(err);
  });
}

// Convenience for AppRoot — wraps the navigator so unhandled errors below
// it get captured. Returns a no-op wrapper if Sentry is disabled.
export function wrap<T>(component: T): T {
  if (!DSN) return component;
  return Sentry.wrap(component as any) as T;
}
