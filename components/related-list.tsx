"use client";

import Link from "next/link";
import { countryFlag } from "@/lib/format";
import { withQuery } from "@/lib/hike-filters";
import { useCarriedQuery } from "./use-hike-query";

export type RelatedItem = {
  slug: string;
  name: string;
  country: string;
  detail: string;
};

// Links to other hikes that keep the current filter/compare query, so
// following one does not lose the list context. Must be rendered inside
// <Suspense>; RelatedListView is the query-less prerendered fallback.
export function RelatedList({ items }: { items: RelatedItem[] }) {
  return <RelatedListView items={items} qs={useCarriedQuery()} />;
}

export function RelatedListView({
  items,
  qs = "",
}: {
  items: RelatedItem[];
  qs?: string;
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.slug}>
          <Link
            href={withQuery(`/hikes/${item.slug}`, qs)}
            className="font-medium hover:underline"
          >
            {item.name}
          </Link>
          <div className="text-xs text-neutral-500">
            {countryFlag(item.country)} {item.country} · {item.detail}
          </div>
        </li>
      ))}
    </ul>
  );
}
