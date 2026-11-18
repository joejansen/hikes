"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { HikeSummary } from "@/lib/hike-summary";
import {
  MAX_COMPARE,
  applyQuery,
  countActiveFilters,
  parseQuery,
  serializeQuery,
  toggleCompare,
  withQuery,
} from "@/lib/hike-filters";

const LINK_CLASS =
  "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100";

// One fetch per page load, shared by every instance; the browser caches the
// static JSON across hike pages.
let indexPromise: Promise<HikeSummary[]> | null = null;
function loadIndex(): Promise<HikeSummary[]> {
  indexPromise ??= fetch("/hikes-index.json")
    .then((r) => {
      if (!r.ok) throw new Error(`hikes-index.json: HTTP ${r.status}`);
      return r.json() as Promise<HikeSummary[]>;
    })
    .catch((err) => {
      indexPromise = null;
      throw err;
    });
  return indexPromise;
}

// Top-of-page navigation on a hike: back to the list with the filters that
// were active, previous/next within that same filtered + sorted set, and a
// shortcut into the comparison.
export function HikeSetNav({ slug }: { slug: string }) {
  const params = useSearchParams();
  const [index, setIndex] = useState<HikeSummary[] | null>(null);
  // Resolved against the catalog once it has loaded, so unknown slugs do not
  // count towards the compare cap.
  const query = useMemo(
    () => parseQuery(params, index ?? undefined),
    [params, index],
  );
  const qs = serializeQuery(query);

  useEffect(() => {
    let cancelled = false;
    loadIndex().then(
      (data) => {
        if (!cancelled) setIndex(data);
      },
      // Prev/next is an enhancement; the back link still works without it.
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const set = useMemo(() => (index ? applyQuery(index, query) : []), [index, query]);
  const position = set.findIndex((h) => h.slug === slug);
  const prev = position > 0 ? set[position - 1] : undefined;
  const next = position >= 0 ? set[position + 1] : undefined;
  const filtered = countActiveFilters(query.filters) > 0;

  const inCompare = query.compare.includes(slug);
  // Same rule as the list's checkboxes: a full comparison is never silently
  // changed; the link then just opens it.
  const compareFull = !inCompare && query.compare.length >= MAX_COMPARE;
  const compareQs = serializeQuery({
    ...query,
    // toggleCompare is a no-op when the selection is already full.
    compare: inCompare ? query.compare : toggleCompare(query.compare, slug),
  });

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <Link href={withQuery("/", qs)} className={LINK_CLASS}>
        ← {filtered ? "back to results" : "all hikes"}
      </Link>
      <Link href={withQuery("/compare", compareQs)} className={LINK_CLASS}>
        {inCompare
          ? "in comparison →"
          : compareFull
            ? "comparison full →"
            : "+ compare"}
      </Link>
      {position >= 0 && (
        <div className="ml-auto flex items-center gap-3 min-w-0">
          {prev && (
            <Link
              href={withQuery(`/hikes/${prev.slug}`, qs)}
              className={`${LINK_CLASS} truncate max-w-[10rem]`}
              title={prev.name}
            >
              ‹ {prev.name}
            </Link>
          )}
          <span className="text-xs text-neutral-400 whitespace-nowrap">
            {position + 1} of {set.length}
            {filtered ? " in results" : ""}
          </span>
          {next && (
            <Link
              href={withQuery(`/hikes/${next.slug}`, qs)}
              className={`${LINK_CLASS} truncate max-w-[10rem]`}
              title={next.name}
            >
              {next.name} ›
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
