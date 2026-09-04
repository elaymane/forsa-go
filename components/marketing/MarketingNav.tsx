"use client";

import Link from "next/link";
import Image from "next/image";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeProvider";
// LanguageSwitcher removed — the app is French-only now
import { t, type Locale } from "@/lib/i18n/translations";

export default function MarketingNav({ loggedIn, locale }: { loggedIn: boolean; locale: Locale }) {
  const { theme, toggleTheme } = useTheme();
  const i = t(locale).nav;
  const LINKS = [
    { label: i.opportunities, href: "/opportunities" },
    { label: i.organizations, href: "/organizations" },
    { label: i.howItWorks, href: "/#journey" },
    { label: i.pricing, href: "/subscribe" },
  ];

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-white/90 px-6 py-5 backdrop-blur-md dark:bg-[#020617]/90 sm:px-10">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/logo-icon.png" alt="Forsa Go" width={36} height={36} className="h-9 w-9 rounded-xl" />
        <span className="font-display font-semibold">Forsa Go</span>
      </Link>

      <div className="hidden items-center gap-8 md:flex">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-xl border border-gray-300 bg-gray-100 p-2 transition hover:scale-105 dark:border-white/10 dark:bg-white/5"
        >
          {theme === "dark" ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-gray-700" />}
        </button>
        {loggedIn ? (
          <Link
            href="/dashboard"
            className="rounded-xl bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
          >
            {i.goToDashboard}
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white sm:block"
            >
              {i.login}
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
            >
              {i.signup}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
