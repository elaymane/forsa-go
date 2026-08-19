import * as Sentry from "@sentry/nextjs";

// Only reports errors if a real DSN is configured — safe to leave blank locally.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Capture 100% of errors, but only a slice of performance traces —
    // full tracing on every request isn't necessary for an app this size.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    debug: false,
  });
}
