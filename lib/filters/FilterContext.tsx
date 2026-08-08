"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface FilterContextValue {
  selectedFilters: string[];
  setSelectedFilters: (filters: string[]) => void;
  selectedCities: string[];
  setSelectedCities: (cities: string[]) => void;
  sort: string;
  setSort: (sort: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [sort, setSort] = useState("Newest");
  const [searchQuery, setSearchQuery] = useState("");

  const value = useMemo(
    () => ({ selectedFilters, setSelectedFilters, selectedCities, setSelectedCities, sort, setSort, searchQuery, setSearchQuery }),
    [selectedFilters, selectedCities, sort, searchQuery]
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
