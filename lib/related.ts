import type { HikeSummary } from "./hike-summary";

const EARTH_RADIUS_KM = 6371;
const rad = (deg: number) => (deg * Math.PI) / 180;

// Great-circle distance between two [lat, lon] points.
export function haversineKm(
  a: readonly [number, number],
  b: readonly [number, number],
): number {
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export type Nearby<T> = { hike: T; km: number };

export function nearestHikes<T extends HikeSummary>(
  hike: HikeSummary,
  all: T[],
  count: number,
): Nearby<T>[] {
  return all
    .filter((h) => h.slug !== hike.slug)
    .map((h) => ({ hike: h, km: haversineKm(hike.coordinates, h.coordinates) }))
    .sort((a, b) => a.km - b.km || a.hike.slug.localeCompare(b.hike.slug))
    .slice(0, count);
}

const DIFFICULTY_RANK = { easy: 0, moderate: 1, hard: 2, "very-hard": 3 };

function jaccard<T>(a: readonly T[], b: readonly T[]): number {
  const union = new Set([...a, ...b]).size;
  if (union === 0) return 0;
  return a.filter((x) => b.includes(x)).length / union;
}

// Heuristic "feels like the same kind of trip" score; higher is more similar.
// Location is deliberately ignored: that is what nearestHikes is for.
export function similarity(a: HikeSummary, b: HikeSummary): number {
  const lengthRatio = Math.abs(Math.log(a.length_days / b.length_days));
  const packCompatible =
    a.pack_weight === b.pack_weight ||
    a.pack_weight === "either" ||
    b.pack_weight === "either";
  return (
    (a.style === b.style ? 2 : 0) +
    Math.max(
      0,
      2 - Math.abs(DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty]),
    ) +
    2 * Math.max(0, 1 - lengthRatio / Math.log(3)) +
    (1 - Math.abs(a.obscurity - b.obscurity) / 4) +
    1.5 * jaccard(a.accommodation, b.accommodation) +
    jaccard(a.best_seasons, b.best_seasons) +
    (packCompatible ? 1 : 0)
  );
}

export function similarHikes<T extends HikeSummary>(
  hike: HikeSummary,
  all: T[],
  count: number,
  excludeSlugs: readonly string[] = [],
): T[] {
  return all
    .filter((h) => h.slug !== hike.slug && !excludeSlugs.includes(h.slug))
    .map((h) => ({ hike: h, score: similarity(hike, h) }))
    .sort((a, b) => b.score - a.score || a.hike.slug.localeCompare(b.hike.slug))
    .slice(0, count)
    .map((x) => x.hike);
}
