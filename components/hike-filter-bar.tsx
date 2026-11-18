"use client";

import type {
  Accommodation,
  Difficulty,
  Month,
  Status,
  Style,
} from "@/lib/schema";
import {
  ACCOMMODATIONS,
  DIFFICULTIES,
  MONTHS,
  STATUSES,
  STYLES,
} from "@/lib/schema";
import {
  type Filters,
  LENGTH_BUCKETS,
  type LengthBucket,
  PACK_FILTERS,
  type PackFilter,
  countActiveFilters,
} from "@/lib/hike-filters";

type Props = {
  filters: Filters;
  onChange: (next: Filters) => void;
  countries: string[];
  onReset: () => void;
  trailing?: React.ReactNode;
};

export function HikeFilterBar({
  filters,
  onChange,
  countries,
  onReset,
  trailing,
}: Props) {
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });
  const active = countActiveFilters(filters);

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 mb-6">
      <input
        type="search"
        value={filters.q}
        onChange={(e) => update("q", e.target.value)}
        placeholder="Search name, country, region, highlights…"
        aria-label="Search hikes"
        className="w-full mb-4 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
      <div className="flex flex-wrap gap-x-4 gap-y-3 items-end">
        <Field label="Country">
          <Select value={filters.country} onChange={(v) => update("country", v)}>
            <option value="all">Any</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Good in">
          <Select
            value={filters.month}
            onChange={(v) => update("month", v as Month | "all")}
          >
            <option value="all">Any month</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Length">
          <Select
            value={filters.length}
            onChange={(v) => update("length", v as LengthBucket | "all")}
          >
            <option value="all">Any</option>
            {LENGTH_BUCKETS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Difficulty">
          <Select
            value={filters.difficulty}
            onChange={(v) => update("difficulty", v as Difficulty | "all")}
          >
            <option value="all">Any</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Style">
          <Select
            value={filters.style}
            onChange={(v) => update("style", v as Style | "all")}
          >
            <option value="all">Any</option>
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Pack">
          <Select
            value={filters.pack}
            onChange={(v) => update("pack", v as PackFilter | "all")}
          >
            <option value="all">Any</option>
            {PACK_FILTERS.map((p) => (
              <option key={p} value={p}>
                {p} possible
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Sleeping in">
          <Select
            value={filters.accommodation}
            onChange={(v) => update("accommodation", v as Accommodation | "all")}
          >
            <option value="all">Any</option>
            {ACCOMMODATIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select
            value={filters.status}
            onChange={(v) => update("status", v as Status | "all")}
          >
            <option value="all">Any</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={`Obscurity ≥ ${filters.minObscurity}`}>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={filters.minObscurity}
            onChange={(e) => update("minObscurity", Number(e.target.value))}
            className="w-28 h-[30px] accent-neutral-800 dark:accent-neutral-200"
          />
        </Field>
        {trailing}
        <button
          type="button"
          onClick={onReset}
          className="ml-auto text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 underline"
        >
          Reset{active > 0 ? ` (${active})` : ""}
        </button>
      </div>
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

export { Field as FilterField, Select as FilterSelect };
