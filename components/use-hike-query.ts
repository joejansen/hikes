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
// React state is the source of truth for rendering; the URL is written from
// it (via replaceState) as a side effect. Driving inputs directly from
// useSearchParams would lag behind typing, because Next applies history
// updates in a transition.
//
// Two directions are kept apart by remembering what this hook last wrote:
//  - state changed, URL still what we wrote  -> write the new query;
//  - URL is no longer what we wrote (back/forward to another entry of the
//    same page, or a link carrying an older query) -> adopt the URL.
// The comparison uses window.location, not useSearchParams, so the lag of
// Next's own bookkeeping cannot make one of our writes look external.
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
  // Changes whenever Next sees the URL change, which re-runs the sync below.
  const urlKey = params.toString();
  const text = query.filters.q;
  // Canonical query string this hook last wrote or adopted; null until the
  // first sync.
  const lastSynced = useRef<string | null>(null);
  const writtenText = useRef(text);

  useEffect(() => {
    // A navigation to another page may already have committed.
    if (window.location.pathname !== pathname) return;

    const fromUrl = parseQuery(
      new URLSearchParams(window.location.search),
      known,
    );
    const urlQs = serializeQuery(fromUrl);
    if (lastSynced.current !== null && urlQs !== lastSynced.current) {
      // Not our write: follow the URL.
      lastSynced.current = urlQs;
      writtenText.current = fromUrl.filters.q;
      // Syncing from an external system (browser history) that offers no
      // subscription we can rely on: Next handles history traversal before
      // popstate listeners run, so this effect is the earliest safe point.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(fromUrl);
      return;
    }

    const write = () => {
      lastSynced.current = qs;
      writtenText.current = text;
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
  }, [qs, pathname, urlKey, text, known]);

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
