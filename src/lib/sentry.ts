// Sentry temporarily disabled.
//
// @sentry/react-native 7.x lazy-loads OpenTelemetry via a dynamic import()
// that Hermes can't compile, so it was breaking Android release builds.
// We'll re-introduce it once we either:
//   - pin Sentry to a Hermes-friendly version,
//   - or add a Babel plugin that rewrites the OTEL import.
//
// The exported surface stays identical so callers in App.tsx /
// ErrorBoundary don't need to change.

export function initSentry(): void {
  /* no-op until Sentry is rewired */
}

export function captureError(err: unknown, context?: Record<string, unknown>): void {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console
    console.error('[Noroo]', err, context);
  }
}

export function wrap<T>(component: T): T {
  return component;
}
