"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  type Filters,
  type HikeQuery,
  INITIAL_QUERY,
  parseQuery,
  serializeQuery,
} from "@/lib/hike-filters";

const TYPING_DELAY_MS = 200;

// Read the carried filter/sort/compare query string from the URL, for
// components that only need to pass it along in links.
export function useCarriedQuery(): string {
  return serializeQuery(parseQuery(useSearchParams()));
}

// Filter / sort / compare state, mirrored into the URL so views are shareable
// and survive navigation.
//
// The URL is read once on mount; after that React state is the source of
// truth and the URL is written (via replaceState) as a side effect. Driving
// inputs directly from useSearchParams would lag behind typing, because Next
// applies history updates in a transition.
//
// Discrete changes (selects, checkboxes, sort) are written immediately. Only
// search-text changes are debounced, since browsers rate-limit replaceState.
// A pending write is flushed on any click before the click is handled:
// Next turns replaceState into a router action, and one landing in the middle
// of a link navigation cancels that navigation.
//
// `known` is the catalog, used to drop URL values that do not exist.
//
// Components using this hook must be rendered inside <Suspense>
// (useSearchParams opts the subtree out of prerendering).
export function useHikeQuery(
  known: readonly { slug: string; country: string }[],
) {
  const params = useSearchParams();
  const pathname = usePathname();
  const [query, setQuery] = useState<HikeQuery>(() => parseQuery(params, known));
  const qs = useMemo(() => serializeQuery(query), [query]);
  // Re-run the sync whenever the URL changes underneath us (e.g. a header
  // link that was rendered with an older query): state wins, the URL converges.
  const urlKey = params.toString();
  const writtenText = useRef(query.filters.q);
  const text = query.filters.q;

  useEffect(() => {
    const write = () => {
      writtenText.current = text;
      // A navigation may already have committed.
      if (window.location.pathname !== pathname) return;
      if (window.location.search.replace(/^\?/, "") === qs) return;
      window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
    };
    if (text === writtenText.current) {
      write();
      return;
    }
    const cancel = () => {
      clearTimeout(timer);
      document.removeEventListener("click", flush, true);
    };
    const flush = () => {
      cancel();
      write();
    };
    const timer = setTimeout(flush, TYPING_DELAY_MS);
    document.addEventListener("click", flush, true);
    return cancel;
  }, [qs, pathname, urlKey, text]);

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
