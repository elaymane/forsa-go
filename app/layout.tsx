import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import ThemeInitScript from "@/components/layout/ThemeInitScript";
import WebsiteJsonLd from "@/components/layout/WebsiteJsonLd";

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

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const GTM_ID = "GTM-KKHJBGJ8";
const GA_MEASUREMENT_ID = "G-CFV41D1Y4C";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Concours, Emplois, Stages et Bourses au Maroc | Forsa Go",
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
  ],
  openGraph: {
    type: "website",
    locale: "fr_MA",
    url: SITE_URL,
    siteName: "Forsa Go",
    title: "Forsa Go — Ne ratez plus jamais une opportunité",
    description:
      "Suivez les concours, emplois, stages et bourses partout au Maroc, dans un seul tableau de bord.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Forsa Go — Votre parcours. Chaque opportunité." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Forsa Go — Ne ratez plus jamais une opportunité",
    description:
      "Suivez les concours, emplois, stages et bourses partout au Maroc, dans un seul tableau de bord.",
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
  width: "device-width",
  initialScale: 1,
  themeColor: "#7C3AED",
};

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
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script
          id="ga-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');`,
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2777951700747270"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <WebsiteJsonLd siteUrl={SITE_URL} />
        <ThemeInitScript />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
