"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Hike } from "@/lib/schema";
import {
  type Filters,
  INITIAL_FILTERS,
  filterHikes,
  uniqueCountries,
} from "@/lib/hike-filters";
import { HikeFilterBar } from "./hike-filter-bar";

const HikeMap = dynamic(
  () => import("./hike-map").then((m) => m.HikeMap),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 h-[560px] flex items-center justify-center text-sm text-neutral-500">
        Loading map…
      </div>
    ),
  },
);

type Props = {
  hikes: Hike[];
  apiKey: string | null;
};

export function HikeMapBrowser({ hikes, apiKey }: Props) {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  const countries = useMemo(() => uniqueCountries(hikes), [hikes]);
  const visible = useMemo(
    () => filterHikes(hikes, filters),
    [hikes, filters],
  );

  const reset = () => setFilters(INITIAL_FILTERS);

  return (
    <div>
      <HikeFilterBar
        filters={filters}
        onChange={setFilters}
        countries={countries}
        onReset={reset}
      />

      <div className="mb-3 text-sm text-neutral-500">
        {visible.length} of {hikes.length} hikes shown on the map
      </div>

      <HikeMap hikes={visible} apiKey={apiKey} />

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
                href={`/hikes/${h.slug}`}
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
