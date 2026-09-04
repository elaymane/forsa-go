"use client";

import { useServerInsertedHTML } from "next/navigation";

/**
 * A genuinely raw <script> tag for the AdSense verification script, using
 * the same proven pattern as WebsiteJsonLd. Real developer reports (Next.js
 * GitHub discussions) show Google's initial site-verification crawler can
 * fail to detect scripts loaded via next/script's Script component, even
 * with afterInteractive — likely because it isn't a plain static tag, just
 * a specially-loaded one. This avoids that by injecting a genuine raw tag,
 * without reintroducing the React "script tag" hydration warning fixed
 * earlier for WebsiteJsonLd.
 */
export default function AdSenseScript() {
  useServerInsertedHTML(() => (
    <script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2777951700747270"
      crossOrigin="anonymous"
    />
  ));
  return null;
}
