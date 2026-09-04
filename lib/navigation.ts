import { LayoutDashboard, Compass, ShieldCheck, CalendarDays, ClipboardList, Building2, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { t, type Locale } from "@/lib/i18n/translations";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function getNavItems(locale: Locale): NavItem[] {
  const i = t(locale).nav;
  return [
    { label: i.dashboard, href: "/dashboard", icon: LayoutDashboard },
    { label: i.opportunities, href: "/opportunities", icon: Compass },
    { label: i.organizations, href: "/organizations", icon: Building2 },
    { label: i.applications, href: "/applications", icon: ClipboardList },
    { label: i.calendar, href: "/calendar", icon: CalendarDays },
  ];
}

export function getAdminNavItem(locale: Locale): NavItem {
  return { label: t(locale).nav.admin, href: "/admin", icon: ShieldCheck };
}

/** Shown only to accounts with an active manager tier — links to their linked-accounts dashboard. */
export function getManagerNavItem(): NavItem {
  return { label: "Manager", href: "/manager", icon: Users };
}
