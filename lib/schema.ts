import { z } from "zod";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const STYLES = ["hut-to-hut", "full-pack", "day-hike", "mixed"] as const;
export const ACCOMMODATIONS = [
  "refuge",
  "hut",
  "teahouse",
  "guesthouse",
  "homestay",
  "bnb",
  "hotel",
  "camping",
  "bivy",
] as const;
export const PACK_WEIGHTS = ["light", "full", "either"] as const;
export const DIFFICULTIES = ["easy", "moderate", "hard", "very-hard"] as const;
export const STATUSES = [
  "researching",
  "shortlisted",
  "done",
  "passed",
] as const;

export const guideLinkSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
});

export const hikeSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase alphanumeric + dashes"),
  name: z.string().min(1),
  country: z.string().min(1),
  region: z.string().optional(),
  coordinates: z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]),
  style: z.enum(STYLES),
  accommodation: z.array(z.enum(ACCOMMODATIONS)).min(1),
  pack_weight: z.enum(PACK_WEIGHTS),
  length_km: z.number().positive().optional(),
  length_days: z.number().positive(),
  elevation_gain_m: z.number().nonnegative().optional(),
  difficulty: z.enum(DIFFICULTIES),
  best_seasons: z.array(z.enum(MONTHS)).min(1),
  highlights: z.array(z.string().min(1)).min(1),
  downsides: z.array(z.string().min(1)).default([]),
  guide_links: z.array(guideLinkSchema).default([]),
  obscurity: z.number().int().min(1).max(5),
  status: z.enum(STATUSES).default("researching"),
  notes: z.string().default(""),
});

export const hikesFileSchema = z.array(hikeSchema);

export type Hike = z.infer<typeof hikeSchema>;
export type GuideLink = z.infer<typeof guideLinkSchema>;
export type Month = (typeof MONTHS)[number];
export type Style = (typeof STYLES)[number];
export type Accommodation = (typeof ACCOMMODATIONS)[number];
export type PackWeight = (typeof PACK_WEIGHTS)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
export type Status = (typeof STATUSES)[number];

export { MONTHS };
