"use client";

import { useMemo, useState } from "react";
import type { Hike, Month, Status, Style } from "@/lib/schema";
import { MONTHS, STATUSES, STYLES } from "@/lib/schema";
import { HikeCard } from "./hike-card";

type SortKey = "obscurity" | "length" | "difficulty" | "name";

const DIFFICULTY_ORDER: Record<Hike["difficulty"], number> = {
  easy: 0,
  moderate: 1,
  hard: 2,
  "very-hard": 3,
};

export function HikeBrowser({ hikes }: { hikes: Hike[] }) {
  const [style, setStyle] = useState<Style | "all">("all");
  const [country, setCountry] = useState<string>("all");
  const [month, setMonth] = useState<Month | "all">("all");
  const [minObscurity, setMinObscurity] = useState<number>(1);
  const [status, setStatus] = useState<Status | "all">("all");
  const [sort, setSort] = useState<SortKey>("obscurity");

  const countries = useMemo(
    () => Array.from(new Set(hikes.map((h) => h.country))).sort(),
    [hikes],
  );

  const visible = useMemo(() => {
    const filtered = hikes.filter((h) => {
      if (style !== "all" && h.style !== style) return false;
      if (country !== "all" && h.country !== country) return false;
      if (month !== "all" && !h.best_seasons.includes(month)) return false;
      if (h.obscurity < minObscurity) return false;
      if (status !== "all" && h.status !== status) return false;
      return true;
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sort) {
        case "obscurity":
          return b.obscurity - a.obscurity || a.name.localeCompare(b.name);
        case "length":
          return (b.length_days ?? 0) - (a.length_days ?? 0);
        case "difficulty":
          return DIFFICULTY_ORDER[b.difficulty] - DIFFICULTY_ORDER[a.difficulty];
        case "name":
          return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [hikes, style, country, month, minObscurity, status, sort]);

  const reset = () => {
    setStyle("all");
    setCountry("all");
    setMonth("all");
    setMinObscurity(1);
    setStatus("all");
    setSort("obscurity");
  };

  return (
    <div>
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 mb-6 flex flex-wrap gap-4 items-end">
        <Field label="Style">
          <Select value={style} onChange={(v) => setStyle(v as Style | "all")}>
            <option value="all">Any</option>
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Country">
          <Select value={country} onChange={setCountry}>
            <option value="all">Any</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Good in">
          <Select value={month} onChange={(v) => setMonth(v as Month | "all")}>
            <option value="all">Any month</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={`Obscurity ≥ ${minObscurity}`}>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={minObscurity}
            onChange={(e) => setMinObscurity(Number(e.target.value))}
            className="w-28 accent-neutral-800 dark:accent-neutral-200"
          />
        </Field>
        <Field label="Status">
          <Select
            value={status}
            onChange={(v) => setStatus(v as Status | "all")}
          >
            <option value="all">Any</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Sort by">
          <Select value={sort} onChange={(v) => setSort(v as SortKey)}>
            <option value="obscurity">obscurity ↓</option>
            <option value="length">length ↓</option>
            <option value="difficulty">difficulty ↓</option>
            <option value="name">name a–z</option>
          </Select>
        </Field>
        <button
          type="button"
          onClick={reset}
          className="ml-auto text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 underline"
        >
          Reset
        </button>
      </div>

      <div className="mb-3 text-sm text-neutral-500">
        {visible.length} of {hikes.length} hikes
      </div>

      {visible.length === 0 ? (
        <p className="text-neutral-500 italic">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((h) => (
            <HikeCard key={h.slug} hike={h} />
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-neutral-500">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100"
    >
      {children}
    </select>
  );
}
