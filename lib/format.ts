export { countryFlag } from "./countries";

export function obscurityStars(n: number): string {
  return "●".repeat(n) + "○".repeat(5 - n);
}

export function formatLength(km?: number, days?: number): string {
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (km) parts.push(`${km}km`);
  return parts.join(" · ");
}

export function formatElevation(m?: number): string {
  if (!m) return "";
  return `${m.toLocaleString("en-US")}m gain`;
}

// Average effort per day, e.g. "14 km · 800 m up". Empty when neither
// distance nor gain is known.
export function formatDailyAverage(
  days: number,
  km?: number,
  gainM?: number,
): string {
  const parts: string[] = [];
  if (km) parts.push(`${Math.round(km / days)} km`);
  if (gainM) {
    parts.push(`${(Math.round(gainM / days / 10) * 10).toLocaleString("en-US")} m up`);
  }
  return parts.join(" · ");
}
