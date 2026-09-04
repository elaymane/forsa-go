"use client";

import { useServerInsertedHTML } from "next/navigation";

/**
 * Injects the site-wide WebSite JSON-LD via useServerInsertedHTML instead of
 * next/script's <Script strategy="beforeInteractive">. beforeInteractive
 * scripts in the root layout still trigger React 19's "script tag" warning
 * even through the Script component — this is the same real fix already
 * proven for ThemeInitScript, applied here since this JSON-LD is purely for
 * search engine crawlers and has no actual timing requirement of its own.
 */
export default function WebsiteJsonLd({ siteUrl }: { siteUrl: string }) {
  useServerInsertedHTML(() => (
    <script
      id="website-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Forsa Go",
          url: siteUrl,
        }),
      }}
    />
  ));
  return null;
}
