"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#020617] px-6 text-center text-white">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-gray-400">
          We've been notified and are looking into it. Try again in a moment.
        </p>
        <button
          onClick={reset}
          className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
