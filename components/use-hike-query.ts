"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  type Filters,
  type HikeQuery,
  INITIAL_QUERY,
  parseQuery,
  serializeQuery,
} from "@/lib/hike-filters";

const URL_WRITE_DELAY_MS = 200;

// Filter / sort / compare state, mirrored into the URL so views are shareable
// and survive navigation.
//
// The URL is read once on mount; after that React state is the source of
// truth and the URL is written (debounced, via replaceState) as a side effect.
// Driving inputs directly from useSearchParams would lag behind typing,
// because Next applies history updates in a transition, and browsers
// rate-limit replaceState.
//
// Components using this hook must be rendered inside <Suspense>
// (useSearchParams opts the subtree out of prerendering).
export function useHikeQuery() {
  const params = useSearchParams();
  const pathname = usePathname();
  const [query, setQuery] = useState<HikeQuery>(() => parseQuery(params));
  const qs = useMemo(() => serializeQuery(query), [query]);
  // Re-run the sync whenever the URL changes underneath us (e.g. a header
  // link clicked inside the debounce window): state wins, the URL converges.
  const urlKey = params.toString();

  useEffect(() => {
    const timer = setTimeout(() => {
      // A navigation may have started since this was scheduled.
      if (window.location.pathname !== pathname) return;
      if (window.location.search.replace(/^\?/, "") === qs) return;
      window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
    }, URL_WRITE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [qs, pathname, urlKey]);

  const setFilters = useCallback(
    (filters: Filters) => setQuery((q) => ({ ...q, filters })),
    [],
  );
  const setSort = useCallback(
    (sort: HikeQuery["sort"]) => setQuery((q) => ({ ...q, sort })),
    [],
  );
  const setCompare = useCallback(
    (compare: string[]) => setQuery((q) => ({ ...q, compare })),
    [],
  );
  // Clears filters and sort but keeps the compare selection.
  const reset = useCallback(
    () => setQuery((q) => ({ ...INITIAL_QUERY, compare: q.compare })),
    [],
  );

  return { query, qs, setFilters, setSort, setCompare, reset };
}
