"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Hike } from "@/lib/schema";
import { MAX_COMPARE, withQuery } from "@/lib/hike-filters";
import {
  countryFlag,
  formatDailyAverage,
  formatElevation,
  formatLength,
  obscurityStars,
} from "@/lib/format";
import { DIFFICULTY_STYLES } from "./hike-card";
import { SeasonStrip } from "./season-strip";
import { StatusBadge } from "./status-badge";
import { useHikeQuery } from "./use-hike-query";

export function CompareView({ hikes }: { hikes: Hike[] }) {
  const { query, qs, setCompare } = useHikeQuery(hikes);

  const selected = useMemo(
    () =>
      query.compare
        .map((slug) => hikes.find((h) => h.slug === slug))
        .filter((h): h is Hike => h !== undefined),
    [hikes, query.compare],
  );
  const selectedSlugs = query.compare;
  const canAdd = selected.length < MAX_COMPARE;

  const picker = canAdd && (
    <HikePicker
      hikes={hikes}
      exclude={selectedSlugs}
      onPick={(slug) => setCompare([...selectedSlugs, slug])}
    />
  );

  if (selected.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center">
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Nothing selected yet. Tick <em>compare</em> on up to {MAX_COMPARE}{" "}
          cards in the{" "}
          <Link href={withQuery("/", qs)} className="underline">
            list
          </Link>
          , or add hikes here.
        </p>
        {picker}
      </div>
    );
  }

  const rows: { label: string; render: (h: Hike) => React.ReactNode }[] = [
    {
      label: "Where",
      render: (h) => (
        <>
          {countryFlag(h.country)} {h.country}
          {h.region ? ` · ${h.region}` : ""}
        </>
      ),
    },
    { label: "Status", render: (h) => <StatusBadge status={h.status} /> },
    {
      label: "Length",
      render: (h) => formatLength(h.length_km, h.length_days) || "—",
    },
    {
      label: "Elevation gain",
      render: (h) => formatElevation(h.elevation_gain_m) || "—",
    },
    {
      label: "Per day",
      render: (h) =>
        formatDailyAverage(h.length_days, h.length_km, h.elevation_gain_m) || "—",
    },
    {
      label: "Difficulty",
      render: (h) => (
        <span className={DIFFICULTY_STYLES[h.difficulty]}>{h.difficulty}</span>
      ),
    },
    { label: "Style", render: (h) => h.style },
    { label: "Pack", render: (h) => h.pack_weight },
    { label: "Sleeping in", render: (h) => h.accommodation.join(", ") },
    {
      label: "Best months",
      render: (h) => <SeasonStrip seasons={h.best_seasons} />,
    },
    {
      label: "Obscurity",
      render: (h) => (
        <span className="font-mono" title={`${h.obscurity}/5`}>
          {obscurityStars(h.obscurity)}
        </span>
      ),
    },
    {
      label: "Highlights",
      render: (h) => <BulletList items={h.highlights} sign="+" tone="text-emerald-600 dark:text-emerald-400" />,
    },
    {
      label: "Downsides",
      render: (h) =>
        h.downsides.length > 0 ? (
          <BulletList items={h.downsides} sign="−" tone="text-rose-600 dark:text-rose-400" />
        ) : (
          "—"
        ),
    },
    {
      label: "Notes",
      render: (h) =>
        h.notes.trim() ? (
          <span className="whitespace-pre-wrap">{h.notes.trim()}</span>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {picker}
        <button
          type="button"
          onClick={() => setCompare([])}
          className="text-xs text-neutral-500 underline hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          Clear all
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <table className="w-full text-sm border-collapse table-fixed min-w-[640px]">
          <colgroup>
            <col className="w-28" />
            {selected.map((h) => (
              <col key={h.slug} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <td />
              {selected.map((h) => (
                <th key={h.slug} scope="col" className="text-left align-top p-3">
                  <Link
                    href={withQuery(`/hikes/${h.slug}`, qs)}
                    className="font-semibold text-base leading-tight hover:underline"
                  >
                    {h.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setCompare(selectedSlugs.filter((s) => s !== h.slug))}
                    className="block mt-1 text-xs font-normal text-neutral-500 underline hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className="border-b last:border-b-0 border-neutral-100 dark:border-neutral-800"
              >
                <th
                  scope="row"
                  className="text-left align-top p-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500"
                >
                  {row.label}
                </th>
                {selected.map((h) => (
                  <td key={h.slug} className="align-top p-3">
                    {row.render(h)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BulletList({
  items,
  sign,
  tone,
}: {
  items: string[];
  sign: string;
  tone: string;
}) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className={`select-none ${tone}`}>{sign}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function HikePicker({
  hikes,
  exclude,
  onPick,
}: {
  hikes: Hike[];
  exclude: string[];
  onPick: (slug: string) => void;
}) {
  const groups = useMemo(() => {
    const available = hikes
      .filter((h) => !exclude.includes(h.slug))
      .sort((a, b) => a.name.localeCompare(b.name, "en"));
    return [
      { label: "Shortlisted", items: available.filter((h) => h.status === "shortlisted") },
      { label: "Done", items: available.filter((h) => h.status === "done") },
      {
        label: "Everything else",
        items: available.filter(
          (h) => h.status !== "shortlisted" && h.status !== "done",
        ),
      },
    ].filter((g) => g.items.length > 0);
  }, [hikes, exclude]);

  return (
    <select
      value=""
      onChange={(e) => e.target.value && onPick(e.target.value)}
      aria-label="Add a hike to the comparison"
      className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1.5 text-sm text-neutral-900 dark:text-neutral-100 max-w-full"
    >
      <option value="">+ Add a hike…</option>
      {groups.map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.items.map((h) => (
            <option key={h.slug} value={h.slug}>
              {h.name} ({h.country})
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
