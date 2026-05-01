"use client";

import { useMemo, useState } from "react";
import type { Hike } from "@/lib/schema";
import {
  type Filters,
  INITIAL_FILTERS,
  filterHikes,
  uniqueCountries,
} from "@/lib/hike-filters";
import { HikeFilterBar, FilterField, FilterSelect } from "./hike-filter-bar";
import { HikeCard } from "./hike-card";

type SortKey = "obscurity" | "length" | "difficulty" | "name";

const DIFFICULTY_ORDER: Record<Hike["difficulty"], number> = {
  easy: 0,
  moderate: 1,
  hard: 2,
  "very-hard": 3,
};

export function HikeBrowser({ hikes }: { hikes: Hike[] }) {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [sort, setSort] = useState<SortKey>("obscurity");

  const countries = useMemo(() => uniqueCountries(hikes), [hikes]);

  const visible = useMemo(() => {
    const sorted = [...filterHikes(hikes, filters)];
    sorted.sort((a, b) => {
      switch (sort) {
        case "obscurity":
          return b.obscurity - a.obscurity || a.name.localeCompare(b.name);
        case "length":
          return (b.length_days ?? 0) - (a.length_days ?? 0);
        case "difficulty":
          return DIFFICULTY_ORDER[b.difficulty] - DIFFICULTY_ORDER[a.difficulty];
        case "name":
          return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [hikes, filters, sort]);

  const reset = () => {
    setFilters(INITIAL_FILTERS);
    setSort("obscurity");
  };

  return (
    <div>
      <HikeFilterBar
        filters={filters}
        onChange={setFilters}
        countries={countries}
        onReset={reset}
        trailing={
          <FilterField label="Sort by">
            <FilterSelect value={sort} onChange={(v) => setSort(v as SortKey)}>
              <option value="obscurity">obscurity ↓</option>
              <option value="length">length ↓</option>
              <option value="difficulty">difficulty ↓</option>
              <option value="name">name a–z</option>
            </FilterSelect>
          </FilterField>
        }
      />

      <div className="mb-3 text-sm text-neutral-500">
        {visible.length} of {hikes.length} hikes
      </div>

      {visible.length === 0 ? (
        <p className="text-neutral-500 italic">
          No hikes match those filters. Try loosening them or{" "}
          <button
            type="button"
            onClick={reset}
            className="underline hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            reset
          </button>
          .
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((h) => (
            <HikeCard key={h.slug} hike={h} />
          ))}
        </div>
      )}
    </div>
  );
}
