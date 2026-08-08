"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BellRing,
  Search,
  ChevronDown,
  SlidersHorizontal,
  X,
  Menu as MenuIcon,
  MapPin,
  Briefcase,
  GraduationCap,
  BookOpen,
  Award,
  FileText,
  Sun,
  Moon,
  Trophy,
  Clock,
  Check,
  Inbox,
} from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useFilters } from "@/lib/filters/FilterContext";
import { relativeTime } from "@/lib/formatting";
import LinkedText from "@/components/ui/LinkedText";
import { markAllNotificationsReadAction, markNotificationReadAction, logoutAction } from "@/app/actions";
import type { Notification } from "@/lib/db/notifications";
import type { User } from "@/lib/db/auth";

/** Picks an icon/color for a notification based on its content — no schema change needed. */
function notificationStyle(notification: Notification) {
  if (notification.title.includes("🎉")) {
    return { icon: Trophy, bg: "bg-emerald-100 dark:bg-emerald-500/20", tone: "text-emerald-600 dark:text-emerald-300" };
  }
  if (notification.title.includes("⏰")) {
    return { icon: Clock, bg: "bg-amber-100 dark:bg-amber-500/20", tone: "text-amber-600 dark:text-amber-300" };
  }
  return { icon: Bell, bg: "bg-purple-100 dark:bg-purple-500/20", tone: "text-purple-600 dark:text-purple-300" };
}

const FILTERS = [
  { name: "Concours", icon: Award },
  { name: "Job", icon: Briefcase },
  { name: "Internship", icon: FileText },
  { name: "Training", icon: BookOpen },
  { name: "Scholarship", icon: GraduationCap },
];

const SORT_OPTIONS = ["Newest", "Oldest", "Deadline"];

interface TopbarProps {
  title?: string;
  subtitle?: string;
  notifications: Notification[];
  user: User;
  showFilters?: boolean;
  onMobileMenuOpen?: () => void;
  cities?: string[];
}

export default function Topbar({
  title,
  subtitle,
  notifications,
  user,
  showFilters = false,
  onMobileMenuOpen,
  cities = [],
}: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { selectedFilters, setSelectedFilters, selectedCities, setSelectedCities, sort, setSort, searchQuery, setSearchQuery } = useFilters();

  const [openFilter, setOpenFilter] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [openSort, setOpenSort] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localNotifications, setLocalNotifications] = useState(notifications);

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const firstName = user.name.split(" ")[0];
  const heading = title ?? `Welcome, ${firstName} 👋`;

  const filterRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unread = localNotifications.filter((n) => !n.read).length;
  const router = useRouter();

  const handleNotificationClick = (n: Notification) => {
    setLocalNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
    if (!n.read) startTransition(() => markNotificationReadAction(n.id));
    setOpenNotif(false);
    if (n.link) router.push(n.link);
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (filterRef.current && !filterRef.current.contains(target)) setOpenFilter(false);
      if (cityRef.current && !cityRef.current.contains(target)) setOpenCity(false);
      if (sortRef.current && !sortRef.current.contains(target)) setOpenSort(false);
      if (notifRef.current && !notifRef.current.contains(target)) setOpenNotif(false);
      if (userRef.current && !userRef.current.contains(target)) setOpenUser(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const toggleFilter = (name: string) => {
    setSelectedFilters(
      selectedFilters.includes(name)
        ? selectedFilters.filter((f) => f !== name)
        : [...selectedFilters, name]
    );
  };

  const toggleCity = (city: string) => {
    setSelectedCities(
      selectedCities.includes(city)
        ? selectedCities.filter((c) => c !== city)
        : [...selectedCities, city]
    );
  };

  const markAllRead = () => {
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    startTransition(() => {
      markAllNotificationsReadAction();
    });
  };

  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-white/10 dark:bg-[#070B14]">
      {/* ROW 1 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuOpen}
            aria-label="Open menu"
            className="rounded-lg bg-black/5 p-2 transition hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 md:hidden"
          >
            <MenuIcon size={18} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{heading}</h1>
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* SEARCH — only relevant on the Opportunities page, where it actually filters something */}
          {showFilters && (
            <div className="relative hidden sm:block sm:w-[220px] lg:w-[300px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-100 py-2 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5"
                placeholder="Search opportunities..."
              />
            </div>
          )}

          {/* THEME */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-xl border border-gray-300 bg-gray-100 p-2 transition hover:scale-105 dark:border-white/10 dark:bg-white/5"
          >
            {theme === "dark" ? (
              <Sun size={18} className="text-yellow-500" />
            ) : (
              <Moon size={18} className="text-gray-700" />
            )}
          </button>

          {/* NOTIFICATIONS */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setOpenNotif((v) => !v)}
              aria-label="Notifications"
              className="relative flex items-center justify-center rounded-xl border border-gray-300 bg-gray-100 p-2 text-gray-600 transition hover:scale-105 hover:text-black dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:text-white"
            >
              {unread > 0 ? <BellRing size={18} /> : <Bell size={18} />}
              {unread > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 px-1 text-[11px] font-bold text-white shadow-lg">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            <AnimatePresence>
              {openNotif && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 z-50 mt-3 w-[calc(100vw-2rem)] max-w-[380px] overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0B1220]"
                >
                  <div className="flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-indigo-500/10 px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-md">
                        <Bell size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Notifications</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {unread > 0 ? `${unread} unread` : "You're all caught up"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={markAllRead}
                      disabled={isPending || unread === 0}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-purple-600 transition hover:bg-purple-100 disabled:pointer-events-none disabled:opacity-40 dark:text-purple-300 dark:hover:bg-purple-500/20"
                    >
                      <Check size={12} /> Mark all
                    </button>
                  </div>

                  <div className="no-scrollbar max-h-96 overflow-y-auto p-2">
                    {localNotifications.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/5 text-gray-400 dark:bg-white/10">
                          <Inbox size={20} />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet.</p>
                      </div>
                    ) : (
                      localNotifications.map((n) => {
                        const style = notificationStyle(n);
                        const Icon = style.icon;
                        return (
                          <button
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`flex w-full gap-3 rounded-2xl p-3 text-left transition hover:bg-black/[0.03] dark:hover:bg-white/5 ${
                              n.read ? "opacity-60" : ""
                            } ${n.link ? "cursor-pointer" : "cursor-default"}`}
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.bg} ${style.tone}`}
                            >
                              <Icon size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold leading-snug">{n.title}</p>
                                {!n.read && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                                )}
                              </div>
                              <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                                <LinkedText text={n.description} />
                              </p>
                              <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                                {relativeTime(n.createdAt)}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* USER */}
          <div ref={userRef} className="relative">
            <button onClick={() => setOpenUser((v) => !v)} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-gray-700 dark:text-gray-300 sm:inline">{firstName}</span>
              <ChevronDown size={14} />
            </button>

            {openUser && (
              <div className="absolute right-0 z-50 mt-2 w-40 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0B1220]">
                <Link
                  href="/profile"
                  onClick={() => setOpenUser(false)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  Profile
                </Link>
                <button
                  onClick={() => startTransition(() => logoutAction())}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div ref={filterRef} className="relative">
          <button
            onClick={() => setOpenFilter((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
          >
            <SlidersHorizontal size={16} />
            Filter
            {selectedFilters.length > 0 && (
              <span className="rounded bg-purple-500 px-1.5 text-xs text-white">
                {selectedFilters.length}
              </span>
            )}
          </button>

          {openFilter && (
            <div className="absolute z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#0B1220]">
              {FILTERS.map((f) => {
                const Icon = f.icon;
                const active = selectedFilters.includes(f.name);
                return (
                  <button
                    key={f.name}
                    onClick={() => toggleFilter(f.name)}
                    className={`flex w-full items-center gap-2 rounded-lg p-2 text-sm transition ${
                      active
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-300"
                        : "text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon size={14} />
                    {f.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {cities.length > 0 && (
        <div ref={cityRef} className="relative">
          <button
            onClick={() => setOpenCity((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
          >
            <MapPin size={16} />
            City
            {selectedCities.length > 0 && (
              <span className="rounded bg-purple-500 px-1.5 text-xs text-white">
                {selectedCities.length}
              </span>
            )}
          </button>

          {openCity && (
            <div className="no-scrollbar absolute z-50 mt-2 max-h-72 w-56 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#0B1220]">
              {cities.map((city) => {
                const active = selectedCities.includes(city);
                return (
                  <button
                    key={city}
                    onClick={() => toggleCity(city)}
                    className={`flex w-full items-center gap-2 rounded-lg p-2 text-sm transition ${
                      active
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-300"
                        : "text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-white/5"
                    }`}
                  >
                    <MapPin size={13} />
                    {city}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        )}

        <div ref={sortRef} className="relative">
          <button
            onClick={() => setOpenSort((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            {sort}
            <ChevronDown size={14} />
          </button>

          {openSort && (
            <div className="absolute z-50 mt-2 w-36 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0B1220]">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSort(s);
                    setOpenSort(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-white/5"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {(selectedFilters.length > 0 || selectedCities.length > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            {selectedFilters.map((f) => (
              <div
                key={f}
                className="flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-sm text-purple-700 dark:text-purple-300"
              >
                {f}
                <button onClick={() => toggleFilter(f)} aria-label={`Remove ${f} filter`}>
                  <X size={12} />
                </button>
              </div>
            ))}
            {selectedCities.map((c) => (
              <div
                key={c}
                className="flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-700 dark:text-indigo-300"
              >
                <MapPin size={11} /> {c}
                <button onClick={() => toggleCity(c)} aria-label={`Remove ${c} filter`}>
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setSelectedFilters([]);
                setSelectedCities([]);
              }}
              className="text-xs text-red-500 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
