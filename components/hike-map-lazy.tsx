"use client";

import dynamic from "next/dynamic";

// MapLibre needs the DOM, so the map is client-only and code-split.
export const HikeMapLazy = dynamic(
  () => import("./hike-map").then((m) => m.HikeMap),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 h-full min-h-[200px] flex items-center justify-center text-sm text-neutral-500">
        Loading map…
      </div>
    ),
  },
);
