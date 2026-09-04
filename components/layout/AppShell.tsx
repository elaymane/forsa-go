"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { FilterProvider } from "@/lib/filters/FilterContext";
import type { Notification } from "@/lib/db/notifications";
import type { User } from "@/lib/db/auth";
import type { Locale } from "@/lib/i18n/translations";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  notifications: Notification[];
  user: User;
  isAdmin?: boolean;
  showFilters?: boolean;
  cities?: string[];
  locale: Locale;
}

export default function AppShell({ children, title, subtitle, notifications, user, isAdmin, showFilters, cities, locale }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <FilterProvider>
      <div className="flex min-h-screen overflow-x-hidden bg-[#F8FAFC] text-[#0F172A] dark:bg-[#020617] dark:text-white">
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          user={user}
          isAdmin={isAdmin}
          locale={locale}
        />

        <div
          className={`min-w-0 flex-1 transition-[margin] duration-300 ease-in-out ${
            sidebarOpen ? "md:ml-64" : "md:ml-20"
          }`}
        >
          <Topbar
            title={title}
            subtitle={subtitle}
            notifications={notifications}
            user={user}
            showFilters={showFilters}
            onMobileMenuOpen={() => setMobileOpen(true)}
            cities={cities}
            locale={locale}
          />

          <div className="space-y-6 px-4 pb-10 sm:px-6 lg:px-8">{children}</div>
        </div>
      </div>
    </FilterProvider>
  );
}
