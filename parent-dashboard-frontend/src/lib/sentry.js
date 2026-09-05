import * as Sentry from "@sentry/react";

// No-op unless VITE_SENTRY_DSN is set at build time (see .env.production).
// Errors only — no tracing, no session replay (replay would capture the
// screen, which can show a child's information).
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend(event) {
      // Strip query strings — they can carry ?child=<id> etc.
      if (event.request?.url) {
        event.request.url = event.request.url.split("?")[0];
      }
      return event;
    },
  });
}

export { Sentry };
