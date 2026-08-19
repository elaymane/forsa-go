"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { X, Plus, type LucideIcon } from "lucide-react";

interface TagPickerProps {
  /** The form field name — the hidden input submits under this name. */
  name: string;
  /** Real, existing values already used elsewhere — shown as pickable suggestions. */
  suggestions: string[];
  defaultValue?: string;
  /** What joins multiple selected values in the submitted string — " / " for cities, ", " for specialization/level. */
  separator: string;
  inputClassName: string;
  placeholder?: string;
  icon: LucideIcon;
}

export default function TagPicker({
  name,
  suggestions,
  defaultValue,
  separator,
  inputClassName,
  placeholder,
  icon: Icon,
}: TagPickerProps) {
  const [values, setValues] = useState<string[]>(() =>
    defaultValue
      ? defaultValue
          .split(separator.trim() || ",")
          .map((v) => v.trim())
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

  // Real, existing values only — never the ones already picked.
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = suggestions.filter((s) => !values.includes(s));
    return q ? pool.filter((s) => s.toLowerCase().includes(q)) : pool;
  }, [suggestions, values, query]);

  // A brand-new value — only offered when it genuinely doesn't match anything existing.
  const isNew =
    query.trim().length > 0 &&
    !suggestions.some((s) => s.toLowerCase() === query.trim().toLowerCase()) &&
    !values.some((s) => s.toLowerCase() === query.trim().toLowerCase());

  const addValue = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || values.includes(trimmed)) return;
    setValues((prev) => [...prev, trimmed]);
    setQuery("");
  };

  const removeValue = (value: string) => setValues((prev) => prev.filter((v) => v !== value));

  return (
    <div ref={wrapperRef} className="relative">
      {/* Hidden field — joined with the given separator, matching the exact
          format this field already uses elsewhere, so nothing downstream needs to change. */}
      <input type="hidden" name={name} value={values.join(separator)} />

      <div className={`flex flex-wrap items-center gap-1.5 ${inputClassName}`}>
        {values.map((value) => (
          <span
            key={value}
            className="flex items-center gap-1 rounded-lg bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
          >
            <Icon size={11} /> {value}
            <button type="button" onClick={() => removeValue(value)} aria-label={`Remove ${value}`}>
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
              if (isNew) addValue(query);
              else if (matches[0]) addValue(matches[0]);
            }
          }}
          placeholder={values.length === 0 ? placeholder : "Add another..."}
          className="min-w-[120px] flex-1 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {open && (matches.length > 0 || isNew) && (
        <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#0B1220]">
          {matches.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => addValue(value)}
              className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm text-gray-800 transition hover:bg-gray-100 dark:text-white dark:hover:bg-white/5"
            >
              <Icon size={13} /> {value}
            </button>
          ))}
          {isNew && (
            <button
              type="button"
              onClick={() => addValue(query)}
              className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm text-purple-600 transition hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-500/10"
            >
              <Plus size={13} /> Add "{query.trim()}" as new
            </button>
          )}
        </div>
      )}
    </div>
  );
}
