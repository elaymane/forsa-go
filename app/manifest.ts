import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Forsa Go — Track your opportunities",
    short_name: "Forsa Go",
    description: "Track concours, jobs, internships and scholarships in Morocco — all in one place.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#7C3AED",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
