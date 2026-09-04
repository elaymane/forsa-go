import "server-only";
import { cookies } from "next/headers";
import { after } from "next/server";
import { logPageView } from "./db/analytics";

const VISITOR_COOKIE = "forsa_visitor";

/**
 * Logs a page view without adding any latency to the response. Uses
 * Next.js's after() so the database write is guaranteed to actually run
 * (unlike a bare un-awaited async call, which risks being cut off if the
 * serverless function freezes right after the response is sent) while
 * still never delaying what the user sees.
 *
 * Pass the already-fetched user id (most pages have it a line away) rather
 * than re-querying it here — no point paying for a second lookup.
 */
export async function trackPageView(path: string, userId: string | null = null): Promise<void> {
  const store = await cookies();
  const visitorId = store.get(VISITOR_COOKIE)?.value;
  if (!visitorId) return; // shouldn't happen once middleware has run, but never block on it

  after(async () => {
    try {
      await logPageView(visitorId, userId, path);
    } catch {
      // Analytics is best-effort — a failure here should never affect the page.
    }
  });
}
