import type { Hike } from "./schema";

// The subset of a hike shipped to client components for browsing: everything
// needed to filter, sort, and render a card or map pin, without the long-form
// text. `search` is a pre-normalized haystack for free-text search.
export type HikeSummary = Omit<
  Hike,
  "highlights" | "downsides" | "guide_links" | "notes"
> & { search: string };

// Lowercase and strip diacritics so "reunion" matches "Réunion".
export function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function toSummary(hike: Hike): HikeSummary {
  // `notes` is deliberately excluded from search: it is the owner's commentary
  // rather than a property of the hike, and would make matches surprising.
  const { highlights, downsides, guide_links, notes, ...rest } = hike;
  void downsides;
  void guide_links;
  void notes;
  const search = normalizeText(
    [
      hike.name,
      hike.country,
      hike.region ?? "",
      hike.style,
      ...hike.accommodation,
      ...highlights,
    ].join(" "),
  );
  return { ...rest, search };
}
