import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ensam-casa.ma",
      },
    ],
  },
  experimental: {
    // Next.js defaults Server Actions to a 1MB body limit — too small for a
    // real photo (receipt uploads especially). Raised here, but capped
    // below Vercel's own hard ~4.5MB serverless function payload ceiling,
    // which cannot be configured away even on paid plans — going above it
    // would just fail at the platform level instead of the framework level.
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default withSentryConfig(nextConfig, {
  // Only set if you also want source-map upload for readable stack traces —
  // optional, works fine without it, just shows minified traces in Sentry.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
});
