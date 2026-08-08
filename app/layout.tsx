import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Forsa Go — Never miss an opportunity",
    template: "%s · Forsa Go",
  },
  description:
    "Suivez vos candidatures aux concours au Maroc — ENSA, ENSAM, ENCG et plus. Ne ratez plus jamais une deadline: calendrier, rappels automatiques et suivi de candidature pour concours, emplois, stages PFE et bourses partout au Maroc.",
  keywords: [
    "concours maroc",
    "concours 2026",
    "emploi maroc",
    "offre d'emploi maroc",
    "stage maroc",
    "bourse maroc",
    "formation maroc",
    "concours OFPPT",
    "concours ONCF",
    "concours ONEE",
    "concours ANAPEC",
    "emploi casablanca",
    "emploi rabat",
    "stage informatique",
    "emploi développeur",
    "bourse france",
    "jobs in morocco",
    "internships in morocco",
    "scholarships for moroccan students",
    "government jobs morocco",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Forsa Go",
    title: "Forsa Go — Never miss an opportunity",
    description:
      "Track concours, jobs, internships and scholarships across Morocco in one focused dashboard.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Forsa Go — Your Journey. Every opportunity." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Forsa Go — Never miss an opportunity",
    description:
      "Track concours, jobs, internships and scholarships across Morocco in one focused dashboard.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Forsa Go",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#7C3AED",
};

// Runs before paint so the correct theme class is set immediately,
// avoiding a light-mode flash for users who saved "dark".
const THEME_INIT_SCRIPT = `
  try {
    const saved = localStorage.getItem("forsa-go-theme");
    if (saved === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${manrope.variable} bg-white font-body text-black antialiased transition-colors dark:bg-[#020617] dark:text-white`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Forsa Go",
              url: SITE_URL,
            }),
          }}
        />
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
