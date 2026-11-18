"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { parseQuery, serializeQuery, withQuery } from "@/lib/hike-filters";

const LINKS = [
  { href: "/", label: "List" },
  { href: "/map", label: "Map" },
  { href: "/compare", label: "Compare" },
];

const LINK_CLASS = "hover:text-neutral-900 dark:hover:text-neutral-100";

// Carries the current filter/sort/compare query between pages so switching
// from list to map (or back from a hike) keeps the same view.
export function NavLinks() {
  const pathname = usePathname();
  const qs = serializeQuery(parseQuery(useSearchParams()));
  return <NavLinkList qs={qs} pathname={pathname} />;
}

// Also used as the prerendered Suspense fallback, without a query.
export function NavLinkList({
  qs = "",
  pathname,
}: {
  qs?: string;
  pathname?: string;
}) {
  return (
    <>
      <Link
        href={withQuery("/", qs)}
        className="font-semibold text-lg tracking-tight"
      >
        🥾 Hike Research
      </Link>
      <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
        {LINKS.map((l) => (
        <Link
          key={l.href}
          href={withQuery(l.href, qs)}
          aria-current={pathname === l.href ? "page" : undefined}
          className={`${LINK_CLASS} aria-[current=page]:text-neutral-900 aria-[current=page]:font-medium dark:aria-[current=page]:text-neutral-100`}
        >
          {l.label}
        </Link>
        ))}
      </div>
    </>
  );
}
