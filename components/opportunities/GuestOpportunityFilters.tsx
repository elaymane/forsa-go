"use client";

import { Search, Award, Briefcase, FileText, BookOpen, GraduationCap } from "lucide-react";
import { useFilters } from "@/lib/filters/FilterContext";
import { t, type Locale } from "@/lib/i18n/translations";

const FILTERS = [
  { name: "Concours", icon: Award },
  { name: "Job", icon: Briefcase },
  { name: "Internship", icon: FileText },
  { name: "Training", icon: BookOpen },
  { name: "Scholarship", icon: GraduationCap },
];

export default function GuestOpportunityFilters({ locale }: { locale: Locale }) {
  const { searchQuery, setSearchQuery, selectedFilters, setSelectedFilters } = useFilters();
  const i = t(locale).typeLabels;
  const searchPlaceholder = t(locale).opportunitiesPage.searchPlaceholder;

  const toggleFilter = (name: string) => {
    setSelectedFilters(
      selectedFilters.includes(name) ? selectedFilters.filter((f) => f !== name) : [...selectedFilters, name]
    );
  };

  return (
    <div className="mb-4 space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-gray-100 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5"
          placeholder={searchPlaceholder}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          const active = selectedFilters.includes(f.name);
          return (
            <button
              key={f.name}
              onClick={() => toggleFilter(f.name)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "bg-purple-500 text-white"
                  : "border border-black/10 bg-white text-gray-600 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              }`}
            >
              <Icon size={13} /> {i[f.name as keyof typeof i]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
