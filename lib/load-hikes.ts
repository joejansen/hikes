import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { type Hike, hikesFileSchema } from "./schema";

let cache: Hike[] | null = null;

export function loadHikes(): Hike[] {
  if (cache) return cache;
  const raw = readFileSync(join(process.cwd(), "data", "hikes.yaml"), "utf8");
  const parsed = parse(raw);
  const result = hikesFileSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`data/hikes.yaml failed validation:\n${issues}`);
  }
  const slugs = new Set<string>();
  for (const h of result.data) {
    if (slugs.has(h.slug)) {
      throw new Error(`Duplicate slug in data/hikes.yaml: ${h.slug}`);
    }
    slugs.add(h.slug);
  }
  cache = result.data;
  return cache;
}

export function findHike(slug: string): Hike | undefined {
  return loadHikes().find((h) => h.slug === slug);
}
