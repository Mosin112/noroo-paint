// Metro config wrapped with Sentry's serializer.
//
// Why this file exists: @sentry/react-native lazy-loads OpenTelemetry via
// a dynamic import("@opentelemetry/..."). Hermes (RN's release JS engine)
// doesn't support dynamic import(), so the release bundle errors with
// "Invalid expression encountered" at the OTEL line.
// getSentryExpoConfig() rewrites those dynamic imports into static requires
// (or stubs them when the package isn't installed) so Hermes can compile.

const { getSentryExpoConfig } = require('@sentry/react-native/metro');

module.exports = getSentryExpoConfig(__dirname);
