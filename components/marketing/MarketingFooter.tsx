import Link from "next/link";
import { t, type Locale } from "@/lib/i18n/translations";
import { TYPE_ROUTES } from "@/lib/facetRoutes";

export default function MarketingFooter({ locale }: { locale: Locale }) {
  const i = t(locale).footer;
  const nav = t(locale).nav;
  const PRODUCT_LINKS = [
    { label: nav.opportunities, href: "/opportunities" },
    { label: nav.organizations, href: "/organizations" },
    { label: nav.pricing, href: "/subscribe" },
    { label: "FAQ", href: "/faq" },
  ];
  const CATEGORY_LINKS = Object.entries(TYPE_ROUTES).map(([slug, cfg]) => ({
    label: cfg.typeLabel,
    href: `/${slug}`,
  }));
  const LEGAL_LINKS = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ];

  return (
    <footer className="border-t border-black/10 bg-white/40 px-6 py-12 dark:border-white/10 dark:bg-white/[0.02] sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col justify-between gap-10 sm:flex-row">
        <div className="max-w-xs">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo-icon.png" alt="Forsa Go" className="h-9 w-9 rounded-xl" />
            <span className="font-display font-semibold">Forsa Go</span>
          </Link>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{i.tagline}</p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{i.product}</p>
          <div className="space-y-2">
            {PRODUCT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Browse by category</p>
          <div className="space-y-2">
            {CATEGORY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Legal</p>
          <div className="space-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-5xl border-t border-black/5 pt-6 text-center text-xs text-gray-400 dark:border-white/5">
        © {new Date().getFullYear()} Forsa Go. {i.madeIn}
      </div>
    </footer>
  );
}
