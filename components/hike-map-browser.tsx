"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { HikeSummary } from "@/lib/hike-summary";
import { filterHikes, uniqueCountries, withQuery } from "@/lib/hike-filters";
import { HikeFilterBar } from "./hike-filter-bar";
import { HikeMapLazy } from "./hike-map-lazy";
import { useHikeQuery } from "./use-hike-query";

const MAP_HEIGHT_PX = 560;

type Props = {
  hikes: HikeSummary[];
  apiKey: string | null;
};

export function HikeMapBrowser({ hikes, apiKey }: Props) {
  const { query, qs, setFilters, reset } = useHikeQuery();

  const countries = useMemo(() => uniqueCountries(hikes), [hikes]);
  const visible = useMemo(
    () => filterHikes(hikes, query.filters),
    [hikes, query.filters],
  );

  return (
    <div>
      <HikeFilterBar
        filters={query.filters}
        onChange={setFilters}
        countries={countries}
        onReset={reset}
      />

      <div className="mb-3 text-sm text-neutral-500" aria-live="polite">
        {visible.length} of {hikes.length} hikes shown on the map
      </div>

      <div style={{ height: MAP_HEIGHT_PX }}>
        <HikeMapLazy
          hikes={visible}
          apiKey={apiKey}
          linkQuery={qs}
          height={MAP_HEIGHT_PX}
        />
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 text-neutral-500 italic">
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
        <ul className="mt-6 text-sm text-neutral-600 dark:text-neutral-400 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
          {visible.map((h) => (
            <li key={h.slug}>
              <Link
                href={withQuery(`/hikes/${h.slug}`, qs)}
                className="hover:text-neutral-900 dark:hover:text-neutral-100 hover:underline"
              >
                {h.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
