import type { Hike, Month, Status, Style } from "./schema";

export type Filters = {
  style: Style | "all";
  country: string;
  month: Month | "all";
  minObscurity: number;
  status: Status | "all";
};

export const INITIAL_FILTERS: Filters = {
  style: "all",
  country: "all",
  month: "all",
  minObscurity: 1,
  status: "all",
};

export function filterHikes(hikes: Hike[], filters: Filters): Hike[] {
  return hikes.filter((h) => {
    if (filters.style !== "all" && h.style !== filters.style) return false;
    if (filters.country !== "all" && h.country !== filters.country) return false;
    if (filters.month !== "all" && !h.best_seasons.includes(filters.month))
      return false;
    if (h.obscurity < filters.minObscurity) return false;
    if (filters.status !== "all" && h.status !== filters.status) return false;
    return true;
  });
}

export function uniqueCountries(hikes: Hike[]): string[] {
  return Array.from(new Set(hikes.map((h) => h.country))).sort();
}
