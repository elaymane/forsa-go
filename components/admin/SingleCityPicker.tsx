"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { MapPin, Plus } from "lucide-react";

interface SingleCityPickerProps {
  citySuggestions: string[];
  value: string;
  onChange: (value: string) => void;
  className: string;
  placeholder?: string;
}

export default function SingleCityPicker({ citySuggestions, value, onChange, className, placeholder }: SingleCityPickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    return q ? citySuggestions.filter((c) => c.toLowerCase().includes(q)) : citySuggestions;
  }, [citySuggestions, value]);

  const isNew =
    value.trim().length > 0 && !citySuggestions.some((c) => c.toLowerCase() === value.trim().toLowerCase());

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className={className}
        placeholder={placeholder}
      />
      {open && (matches.length > 0 || isNew) && (
        <div className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#0B1220]">
          {matches.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                onChange(city);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm text-gray-800 transition hover:bg-gray-100 dark:text-white dark:hover:bg-white/5"
            >
              <MapPin size={13} /> {city}
            </button>
          ))}
          {isNew && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm text-purple-600 transition hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-500/10"
            >
              <Plus size={13} /> Add "{value.trim()}" as a new city
            </button>
          )}
        </div>
      )}
    </div>
  );
}
