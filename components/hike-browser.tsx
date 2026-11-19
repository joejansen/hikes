"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { HikeSummary } from "@/lib/hike-summary";
import {
  MAX_COMPARE,
  type SortKey,
  applyQuery,
  toggleCompare,
  uniqueCountries,
  withQuery,
} from "@/lib/hike-filters";
import { HikeFilterBar, FilterField, FilterSelect } from "./hike-filter-bar";
import { HikeCard } from "./hike-card";
import { useHikeQuery } from "./use-hike-query";

export function HikeBrowser({ hikes }: { hikes: HikeSummary[] }) {
  const { query, qs, setFilters, setSort, setCompare, reset } = useHikeQuery(hikes);

  const countries = useMemo(() => uniqueCountries(hikes), [hikes]);
  const visible = useMemo(() => applyQuery(hikes, query), [hikes, query]);
  const selected = useMemo(
    () =>
      query.compare
        .map((slug) => hikes.find((h) => h.slug === slug))
        .filter((h): h is HikeSummary => h !== undefined),
    [hikes, query.compare],
  );
  const compareFull = query.compare.length >= MAX_COMPARE;
  const toggleCompareSlug = (slug: string) =>
    setCompare(toggleCompare(query.compare, slug));

  return (
    <div className={selected.length > 0 ? "pb-20" : undefined}>
      <HikeFilterBar
        filters={query.filters}
        onChange={setFilters}
        countries={countries}
        onReset={reset}
        trailing={
          <FilterField label="Sort by">
            <FilterSelect
              value={query.sort}
              onChange={(v) => setSort(v as SortKey)}
            >
              <option value="obscurity">obscurity ↓</option>
              <option value="longest">longest first</option>
              <option value="shortest">shortest first</option>
              <option value="difficulty">difficulty ↓</option>
              <option value="name">name a–z</option>
            </FilterSelect>
          </FilterField>
        }
      />

      <div className="mb-3 text-sm text-neutral-500" aria-live="polite">
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
          {visible.map((h) => {
            const checked = query.compare.includes(h.slug);
            return (
              <HikeCard
                key={h.slug}
                hike={h}
                href={withQuery(`/hikes/${h.slug}`, qs)}
                compare={{
                  checked,
                  disabled: !checked && compareFull,
                  onToggle: () => toggleCompareSlug(h.slug),
                }}
              />
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <div className="fixed bottom-4 inset-x-4 z-20 mx-auto max-w-3xl rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white/95 dark:bg-neutral-900/95 backdrop-blur shadow-lg px-4 py-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-neutral-500 mr-1">
            Compare {selected.length}/{MAX_COMPARE}
          </span>
          {selected.map((h) => (
            <button
              key={h.slug}
              type="button"
              onClick={() => toggleCompareSlug(h.slug)}
              title="Remove from comparison"
              className="text-xs px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 max-w-[11rem] truncate"
            >
              {h.name} <span aria-hidden>×</span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCompare([])}
              className="text-xs text-neutral-500 underline hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Clear
            </button>
            {selected.length >= 2 ? (
              <Link
                href={withQuery("/compare", qs)}
                className="text-sm font-medium px-3 py-1.5 rounded bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90"
              >
                Compare →
              </Link>
            ) : (
              <span className="text-xs text-neutral-500">Pick one more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
