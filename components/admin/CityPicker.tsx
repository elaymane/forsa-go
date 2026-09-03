"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { X, MapPin, Plus } from "lucide-react";

interface CityPickerProps {
  citySuggestions: string[];
  defaultValue?: string;
  inputClassName: string;
}

export default function CityPicker({ citySuggestions, defaultValue, inputClassName }: CityPickerProps) {
  const [cities, setCities] = useState<string[]>(() =>
    defaultValue
      ? defaultValue
          .split("/")
          .map((c) => c.trim())
          .filter(Boolean)
      : []
  );
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Real, existing cities only — never the ones already picked.
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = citySuggestions.filter((c) => !cities.includes(c));
    return q ? pool.filter((c) => c.toLowerCase().includes(q)) : pool;
  }, [citySuggestions, cities, query]);

  // A brand-new city — only offered when it genuinely doesn't match anything existing.
  const isNew =
    query.trim().length > 0 &&
    !citySuggestions.some((c) => c.toLowerCase() === query.trim().toLowerCase()) &&
    !cities.some((c) => c.toLowerCase() === query.trim().toLowerCase());

  const addCity = (city: string) => {
    const trimmed = city.trim();
    if (!trimmed || cities.includes(trimmed)) return;
    setCities((prev) => [...prev, trimmed]);
    setQuery("");
  };

  const removeCity = (city: string) => setCities((prev) => prev.filter((c) => c !== city));

  return (
    <div ref={wrapperRef} className="relative">
      {/* Hidden field — matches the existing "City1 / City2" format exactly, so
          nothing on the server side (parseCities, sitemap, filters) needs to change. */}
      <input type="hidden" name="location" value={cities.join(" / ")} />

      <div className={`flex flex-wrap items-center gap-1.5 ${inputClassName}`}>
        {cities.map((city) => (
          <span
            key={city}
            className="flex items-center gap-1 rounded-lg bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
          >
            <MapPin size={11} /> {city}
            <button type="button" onClick={() => removeCity(city)} aria-label={`Remove ${city}`}>
              <X size={12} className="ml-0.5 hover:text-red-500" />
            </button>
          </span>
        ))}
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (isNew) addCity(query);
              else if (matches[0]) addCity(matches[0]);
            }
          }}
          placeholder={cities.length === 0 ? "Casablanca..." : "Add another city..."}
          className="min-w-[120px] flex-1 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {open && (matches.length > 0 || isNew) && (
        <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#0B1220]">
          {matches.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => addCity(city)}
              className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm text-gray-800 transition hover:bg-gray-100 dark:text-white dark:hover:bg-white/5"
            >
              <MapPin size={13} /> {city}
            </button>
          ))}
          {isNew && (
            <button
              type="button"
              onClick={() => addCity(query)}
              className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm text-purple-600 transition hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-500/10"
            >
              <Plus size={13} /> Add "{query.trim()}" as a new city
            </button>
          )}
        </div>
      )}
    </div>
  );
}
