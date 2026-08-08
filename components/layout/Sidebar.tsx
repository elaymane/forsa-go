"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon, MessageCircle, Crown } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import { getNavItems, getAdminNavItem, getManagerNavItem, type NavItem } from "@/lib/navigation";
import { useTheme } from "@/lib/theme/ThemeProvider";
import type { User } from "@/lib/db/auth";
import { hasUnlimitedTracking } from "@/lib/subscription";
import type { Locale } from "@/lib/i18n/translations";
import { t } from "@/lib/i18n/translations";
import ComingSoonPopup from "./ComingSoonPopup";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  user: User;
  isAdmin?: boolean;
  locale: Locale;
}

export default function Sidebar({ open, onToggle, mobileOpen, onMobileClose, user, isAdmin, locale }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const baseItems = isAdmin ? [...getNavItems(locale), getAdminNavItem(locale)] : getNavItems(locale);
  const navItems = user.managerTier ? [...baseItems, getManagerNavItem()] : baseItems;
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Backdrop — mobile only, closes the drawer on tap */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden" onClick={onMobileClose} />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col justify-between
        border-r border-black/10 bg-white transition-transform duration-300 ease-in-out
        dark:border-white/10 dark:bg-[#020617]
        w-64 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:transition-[width]
        ${open ? "md:w-64" : "md:w-20"}`}
      >
      {/* TOP */}
      <div className="p-4">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggle}
              aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
              className="hidden rounded-lg bg-black/5 p-2 transition hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 md:block"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
              <span className="text-sm font-bold text-white">{initials}</span>
            </div>

            {open && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-gray-400">Forsa Go</p>
              </div>
            )}
          </div>

          <button
            onClick={onMobileClose}
            aria-label="Close menu"
            className="rounded-lg bg-black/5 p-2 transition hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} open={open} />
          ))}
        </nav>

        {open && (
          <button
            onClick={() => setShowComingSoon(true)}
            className="mt-6 flex w-full items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 text-left transition hover:bg-purple-500/10"
          >
            <MessageCircle size={18} className="shrink-0 text-purple-500" />
            <span className="text-sm">{t(locale).sidebar.askAssistant}</span>
          </button>
        )}
      </div>

      {showComingSoon && (
        <ComingSoonPopup
          title={t(locale).sidebar.comingSoonTitle}
          body={t(locale).sidebar.comingSoonBody}
          closeLabel={t(locale).sidebar.close}
          onClose={() => setShowComingSoon(false)}
        />
      )}

      {/* BOTTOM */}
      <div className="space-y-5 p-4">
        {!hasUnlimitedTracking(user) && (
        <div className="flex justify-center">
          {open ? (
            <div className="w-full rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
              <p className="text-sm font-semibold">{t(locale).sidebar.goPremium}</p>
              <Link
                href="/subscribe"
                className="mt-2 block w-full rounded-lg bg-purple-500 py-2 text-center text-sm text-white transition hover:bg-purple-600"
              >
                {t(locale).sidebar.upgrade}
              </Link>
            </div>
          ) : (
            <Link href="/subscribe" className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500">
              <Crown size={18} className="text-white" />
            </Link>
          )}
        </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg bg-black/5 p-2 transition hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <div className="flex justify-center gap-4 text-gray-400">
          <a
            href="https://www.instagram.com/forsago__"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-purple-500"
          >
            <FaInstagram size={14} />
          </a>
          <a
            href="https://www.tiktok.com/@forsago__"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="hover:text-purple-500"
          >
            <FaTiktok size={14} />
          </a>
        </div>
      </div>
    </aside>
    </>
  );
}

function NavLink({ item, open }: { item: NavItem; open: boolean }) {
  const pathname = usePathname();
  const isActive = pathname?.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition
      ${
        isActive
          ? "bg-purple-500/20 text-purple-500"
          : "text-gray-500 hover:bg-purple-500/10 dark:text-gray-400"
      }`}
    >
      <Icon size={20} className="shrink-0" />
      {open && <span>{item.label}</span>}
    </Link>
  );
}
