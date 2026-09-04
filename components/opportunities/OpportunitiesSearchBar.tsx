"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Search, Award, Briefcase, FileText, BookOpen, GraduationCap, MapPin, CalendarClock, X, Flame } from "lucide-react";
import { useFilters } from "@/lib/filters/FilterContext";
import { EDUCATION_LEVELS } from "@/types/opportunity";
import { t, type Locale } from "@/lib/i18n/translations";

const TYPE_OPTIONS = [
  { name: "Concours", icon: Award },
  { name: "Job", icon: Briefcase },
  { name: "Internship", icon: FileText },
  { name: "Training", icon: BookOpen },
  { name: "Scholarship", icon: GraduationCap },
];

const SORT_OPTIONS = ["Newest", "Oldest", "Deadline"];

export default function OpportunitiesSearchBar({ cities, locale }: { cities: string[]; locale: Locale }) {
  const i = t(locale).typeLabels;
  const {
    searchQuery,
    setSearchQuery,
    selectedFilters,
    setSelectedFilters,
    selectedLevels,
    setSelectedLevels,
    selectedCities,
    setSelectedCities,
    closingSoon,
    setClosingSoon,
    sort,
    setSort,
  } = useFilters();

  const [openType, setOpenType] = useState(false);
  const [openLevel, setOpenLevel] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [openSort, setOpenSort] = useState(false);
  const [cityQuery, setCityQuery] = useState("");

  const typeRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setOpenType(false);
      if (levelRef.current && !levelRef.current.contains(e.target as Node)) setOpenLevel(false);
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setOpenCity(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setOpenSort(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const toggleType = (name: string) =>
    setSelectedFilters(selectedFilters.includes(name) ? selectedFilters.filter((f) => f !== name) : [...selectedFilters, name]);

  const toggleLevel = (level: string) =>
    setSelectedLevels(selectedLevels.includes(level) ? selectedLevels.filter((l) => l !== level) : [...selectedLevels, level]);

  const toggleCity = (city: string) => {
    setSelectedCities(selectedCities.includes(city) ? selectedCities.filter((c) => c !== city) : [...selectedCities, city]);
    setCityQuery("");
  };

  // Real type-ahead — typing narrows the suggestion list, doesn't just show a
  // static checkbox dropdown of every city regardless of what's typed.
  const matchingCities = useMemo(() => {
    const q = cityQuery.trim().toLowerCase();
    const pool = q ? cities.filter((c) => c.toLowerCase().includes(q)) : cities;
    return pool.slice(0, 8);
  }, [cities, cityQuery]);

  return (
    <div className="mb-5 space-y-3">
      {/* SEARCH INPUT */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-gray-100 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5"
          placeholder="Search opportunities..."
        />
      </div>

      {/* TYPE / NIVEAU / VILLE / DATE LIMITE */}
      <div className="flex flex-wrap items-center gap-2">
        {/* TYPE */}
        <div ref={typeRef} className="relative">
          <button
            onClick={() => setOpenType((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
          >
            <Briefcase size={15} className="text-purple-500" />
            Type
            {selectedFilters.length > 0 && (
              <span className="rounded bg-purple-500 px-1.5 text-xs text-white">{selectedFilters.length}</span>
            )}
          </button>
          {openType && (
            <div className="absolute z-50 mt-2 w-52 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#0B1220]">
              {TYPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = selectedFilters.includes(opt.name);
                return (
                  <button
                    key={opt.name}
                    onClick={() => toggleType(opt.name)}
                    className={`flex w-full items-center gap-2 rounded-lg p-2 text-sm transition ${
                      active
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-300"
                        : "text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon size={14} />
                    {i[opt.name as keyof typeof i]}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* NIVEAU */}
        <div ref={levelRef} className="relative">
          <button
            onClick={() => setOpenLevel((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
          >
            <GraduationCap size={15} className="text-teal-500" />
            Niveau
            {selectedLevels.length > 0 && (
              <span className="rounded bg-purple-500 px-1.5 text-xs text-white">{selectedLevels.length}</span>
            )}
          </button>
          {openLevel && (
            <div className="absolute z-50 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#0B1220]">
              {EDUCATION_LEVELS.map((level) => {
                const active = selectedLevels.includes(level);
                return (
                  <button
                    key={level}
                    onClick={() => toggleLevel(level)}
                    className={`flex w-full items-center gap-2 rounded-lg p-2 text-sm transition ${
                      active
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-300"
                        : "text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-white/5"
                    }`}
                  >
                    <GraduationCap size={13} />
                    {level}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* VILLE — real type-ahead */}
        {cities.length > 0 && (
          <div ref={cityRef} className="relative">
            <button
              onClick={() => setOpenCity((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
            >
              <MapPin size={15} className="text-rose-500" />
              Ville
              {selectedCities.length > 0 && (
                <span className="rounded bg-purple-500 px-1.5 text-xs text-white">{selectedCities.length}</span>
              )}
            </button>
            {openCity && (
              <div className="absolute z-50 mt-2 w-60 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#0B1220]">
                <div className="relative mb-2">
                  <MapPin size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    autoFocus
                    value={cityQuery}
                    onChange={(e) => setCityQuery(e.target.value)}
                    placeholder="Tapez une ville..."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-2 text-sm outline-none focus:ring-1 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5"
                  />
                </div>
                <div className="no-scrollbar max-h-56 overflow-y-auto">
                  {matchingCities.length === 0 ? (
                    <p className="p-2 text-xs text-gray-400">Aucune ville trouvée</p>
                  ) : (
                    matchingCities.map((city) => {
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
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DATE LIMITE (sort) */}
        <div ref={sortRef} className="relative">
          <button
            onClick={() => setOpenSort((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
          >
            <CalendarClock size={15} className="text-amber-500" />
            {sort === "Deadline" ? "Date limite" : sort}
          </button>
          {openSort && (
            <div className="absolute z-50 mt-2 w-40 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0B1220]">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSort(s);
                    setOpenSort(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-white/5"
                >
                  {s === "Deadline" ? "Date limite" : s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CLOSING SOON — quick toggle for opportunities with a real, urgent deadline */}
        <button
          onClick={() => setClosingSoon(!closingSoon)}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
            closingSoon
              ? "border-red-500 bg-red-500 text-white"
              : "border-gray-300 bg-gray-100 dark:border-white/10 dark:bg-white/5"
          }`}
        >
          <Flame size={15} className={closingSoon ? "text-white" : "text-red-500"} />
          Ferme bientôt
        </button>

        {(selectedFilters.length > 0 || selectedLevels.length > 0 || selectedCities.length > 0 || closingSoon) && (
          <button
            onClick={() => {
              setSelectedFilters([]);
              setSelectedLevels([]);
              setSelectedCities([]);
              setClosingSoon(false);
            }}
            className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-red-500"
          >
            <X size={13} /> Effacer
          </button>
        )}
      </div>
    </div>
  );
}
