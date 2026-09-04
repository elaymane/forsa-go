"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface FilterContextValue {
  selectedFilters: string[];
  setSelectedFilters: (filters: string[]) => void;
  selectedCities: string[];
  setSelectedCities: (cities: string[]) => void;
  selectedLevels: string[];
  setSelectedLevels: (levels: string[]) => void;
  closingSoon: boolean;
  setClosingSoon: (value: boolean) => void;
  sort: string;
  setSort: (sort: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [closingSoon, setClosingSoon] = useState(false);
  const [sort, setSort] = useState("Newest");
  const [searchQuery, setSearchQuery] = useState("");

  const value = useMemo(
    () => ({
      selectedFilters,
      setSelectedFilters,
      selectedCities,
      setSelectedCities,
      selectedLevels,
      setSelectedLevels,
      closingSoon,
      setClosingSoon,
      sort,
      setSort,
      searchQuery,
      setSearchQuery,
    }),
    [selectedFilters, selectedCities, selectedLevels, closingSoon, sort, searchQuery]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return ctx;
}
