import { normalizeText, type HikeSummary } from "./hike-summary";
import {
  ACCOMMODATIONS,
  DIFFICULTIES,
  MONTHS,
  STATUSES,
  STYLES,
  type Accommodation,
  type Difficulty,
  type Month,
  type Status,
  type Style,
} from "./schema";

// Upper bounds are inclusive; length_days may be fractional.
export const LENGTH_BUCKETS = [
  { id: "short", label: "≤ 3 days", over: 0, upTo: 3 },
  { id: "medium", label: "4–7 days", over: 3, upTo: 7 },
  { id: "long", label: "8–14 days", over: 7, upTo: 14 },
  { id: "epic", label: "15+ days", over: 14, upTo: Infinity },
] as const;
export type LengthBucket = (typeof LENGTH_BUCKETS)[number]["id"];

// "either" hikes can be walked with a light or a full pack, so they match both.
export const PACK_FILTERS = ["light", "full"] as const;
export type PackFilter = (typeof PACK_FILTERS)[number];

export const SORT_KEYS = [
  "obscurity",
  "longest",
  "shortest",
  "difficulty",
  "name",
] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const MAX_COMPARE = 4;

export type Filters = {
  q: string;
  style: Style | "all";
  country: string;
  month: Month | "all";
  minObscurity: number;
  status: Status | "all";
  difficulty: Difficulty | "all";
  pack: PackFilter | "all";
  accommodation: Accommodation | "all";
  length: LengthBucket | "all";
};

export const INITIAL_FILTERS: Filters = {
  q: "",
  style: "all",
  country: "all",
  month: "all",
  minObscurity: 1,
  status: "all",
  difficulty: "all",
  pack: "all",
  accommodation: "all",
  length: "all",
};

export type HikeQuery = {
  filters: Filters;
  sort: SortKey;
  compare: string[];
};

export const INITIAL_QUERY: HikeQuery = {
  filters: INITIAL_FILTERS,
  sort: "obscurity",
  compare: [],
};

export function filterHikes<T extends HikeSummary>(
  hikes: T[],
  filters: Filters,
): T[] {
  const tokens = normalizeText(filters.q).split(/\s+/).filter(Boolean);
  const bucket = LENGTH_BUCKETS.find((b) => b.id === filters.length);
  return hikes.filter((h) => {
    if (tokens.some((t) => !h.search.includes(t))) return false;
    if (filters.style !== "all" && h.style !== filters.style) return false;
    if (filters.country !== "all" && h.country !== filters.country) return false;
    if (filters.month !== "all" && !h.best_seasons.includes(filters.month))
      return false;
    if (h.obscurity < filters.minObscurity) return false;
    if (filters.status !== "all" && h.status !== filters.status) return false;
    if (filters.difficulty !== "all" && h.difficulty !== filters.difficulty)
      return false;
    if (
      filters.pack !== "all" &&
      h.pack_weight !== filters.pack &&
      h.pack_weight !== "either"
    )
      return false;
    if (
      filters.accommodation !== "all" &&
      !h.accommodation.includes(filters.accommodation)
    )
      return false;
    if (bucket && !(h.length_days > bucket.over && h.length_days <= bucket.upTo))
      return false;
    return true;
  });
}

const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  easy: 0,
  moderate: 1,
  hard: 2,
  "very-hard": 3,
};

// Every comparator falls back to name so the order is deterministic; the
// detail page's prev/next relies on reproducing the list order exactly.
export function sortHikes<T extends HikeSummary>(hikes: T[], sort: SortKey): T[] {
  const byName = (a: T, b: T) => a.name.localeCompare(b.name, "en");
  const primary: Record<SortKey, (a: T, b: T) => number> = {
    obscurity: (a, b) => b.obscurity - a.obscurity,
    longest: (a, b) => b.length_days - a.length_days,
    shortest: (a, b) => a.length_days - b.length_days,
    difficulty: (a, b) =>
      DIFFICULTY_ORDER[b.difficulty] - DIFFICULTY_ORDER[a.difficulty],
    name: () => 0,
  };
  return [...hikes].sort((a, b) => primary[sort](a, b) || byName(a, b));
}

export function applyQuery<T extends HikeSummary>(
  hikes: T[],
  query: HikeQuery,
): T[] {
  return sortHikes(filterHikes(hikes, query.filters), query.sort);
}

export function countActiveFilters(filters: Filters): number {
  return (Object.keys(INITIAL_FILTERS) as (keyof Filters)[]).filter(
    (k) => filters[k] !== INITIAL_FILTERS[k],
  ).length;
}

export function uniqueCountries(hikes: { country: string }[]): string[] {
  return Array.from(new Set(hikes.map((h) => h.country))).sort();
}

// ---- URL (de)serialization -------------------------------------------------
// Defaults are omitted so an unfiltered view has a clean URL.

function oneOf<T extends string>(
  allowed: readonly T[],
  value: string | null,
): T | "all" {
  return value !== null && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : "all";
}

type ParamReader = { get(name: string): string | null };

export function parseQuery(params: ParamReader): HikeQuery {
  const obs = Number(params.get("obs"));
  const sort = params.get("sort");
  const compare = (params.get("cmp") ?? "")
    .split(",")
    .filter((s) => /^[a-z0-9-]+$/.test(s));
  return {
    filters: {
      q: params.get("q") ?? "",
      style: oneOf(STYLES, params.get("style")),
      country: params.get("country") || "all",
      month: oneOf(MONTHS, params.get("month")),
      minObscurity: Number.isInteger(obs) && obs >= 1 && obs <= 5 ? obs : 1,
      status: oneOf(STATUSES, params.get("status")),
      difficulty: oneOf(DIFFICULTIES, params.get("diff")),
      pack: oneOf(PACK_FILTERS, params.get("pack")),
      accommodation: oneOf(ACCOMMODATIONS, params.get("stay")),
      length: oneOf(
        LENGTH_BUCKETS.map((b) => b.id),
        params.get("days"),
      ),
    },
    sort: (SORT_KEYS as readonly string[]).includes(sort ?? "")
      ? (sort as SortKey)
      : INITIAL_QUERY.sort,
    compare: Array.from(new Set(compare)).slice(0, MAX_COMPARE),
  };
}

export function serializeQuery(query: HikeQuery): string {
  const { filters: f } = query;
  const p = new URLSearchParams();
  const q = f.q.trim();
  if (q) p.set("q", q);
  if (f.style !== "all") p.set("style", f.style);
  if (f.country !== "all") p.set("country", f.country);
  if (f.month !== "all") p.set("month", f.month);
  if (f.minObscurity > 1) p.set("obs", String(f.minObscurity));
  if (f.status !== "all") p.set("status", f.status);
  if (f.difficulty !== "all") p.set("diff", f.difficulty);
  if (f.pack !== "all") p.set("pack", f.pack);
  if (f.accommodation !== "all") p.set("stay", f.accommodation);
  if (f.length !== "all") p.set("days", f.length);
  if (query.sort !== INITIAL_QUERY.sort) p.set("sort", query.sort);
  if (query.compare.length > 0) p.set("cmp", query.compare.join(","));
  return p.toString();
}

export function withQuery(path: string, qs: string): string {
  return qs ? `${path}?${qs}` : path;
}

// Toggle a slug in the compare selection; adding beyond the cap is a no-op.
export function toggleCompare(compare: string[], slug: string): string[] {
  if (compare.includes(slug)) return compare.filter((s) => s !== slug);
  return compare.length >= MAX_COMPARE ? compare : [...compare, slug];
}
