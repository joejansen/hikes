import { describe, expect, it } from "vitest";
import { COUNTRY_CODES, countryFlag, flagFromCode } from "@/lib/countries";
import {
  INITIAL_FILTERS,
  INITIAL_QUERY,
  MAX_COMPARE,
  applyQuery,
  countActiveFilters,
  filterHikes,
  parseQuery,
  serializeQuery,
  sortHikes,
  toggleCompare,
  type Filters,
  type HikeQuery,
} from "@/lib/hike-filters";
import { toSummary, type HikeSummary } from "@/lib/hike-summary";
import { loadHikes, loadSummaries } from "@/lib/load-hikes";
import { haversineKm, nearestHikes, similarHikes } from "@/lib/related";
import { hikeSchema, type Hike } from "@/lib/schema";

function hike(overrides: Partial<Hike> = {}): HikeSummary {
  return toSummary(
    hikeSchema.parse({
      slug: "test-hike",
      name: "Test Hike",
      country: "Nepal",
      coordinates: [28, 84],
      style: "hut-to-hut",
      accommodation: ["teahouse"],
      pack_weight: "light",
      length_days: 5,
      difficulty: "moderate",
      best_seasons: ["October"],
      highlights: ["Glacier views"],
      obscurity: 3,
      ...overrides,
    }),
  );
}

const slugs = (hs: HikeSummary[]) => hs.map((h) => h.slug);
const filters = (f: Partial<Filters>): Filters => ({ ...INITIAL_FILTERS, ...f });

describe("countries", () => {
  it("derives flags from ISO codes", () => {
    expect(flagFromCode("NP")).toBe("🇳🇵");
    expect(countryFlag("United Kingdom")).toBe("🇬🇧");
    expect(countryFlag("Atlantis")).toBe("");
  });

  it("has a well-formed code for every entry", () => {
    for (const code of Object.values(COUNTRY_CODES)) {
      expect(code).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("rejects unknown countries at schema level", () => {
    expect(() => hike({ country: "Atlantis" })).toThrow(/unknown country/);
  });
});

describe("data/hikes.yaml", () => {
  it("loads, validates, and every country has a flag", () => {
    const hikes = loadHikes();
    expect(hikes.length).toBeGreaterThan(0);
    for (const h of hikes) expect(countryFlag(h.country)).not.toBe("");
  });
});

describe("filterHikes", () => {
  const a = hike({ slug: "a", name: "Alpha", country: "Nepal" });
  const b = hike({
    slug: "b",
    name: "Piton des Neiges",
    country: "Réunion (France)",
    style: "full-pack",
    accommodation: ["camping", "hut"],
    pack_weight: "full",
    length_days: 3,
    difficulty: "hard",
    best_seasons: ["May", "June"],
    highlights: ["Volcanic cirque"],
    obscurity: 5,
    status: "shortlisted",
  });
  const c = hike({ slug: "c", name: "Gamma", pack_weight: "either", length_days: 3.5 });
  const all = [a, b, c];

  it("returns everything for initial filters", () => {
    expect(filterHikes(all, INITIAL_FILTERS)).toHaveLength(3);
  });

  it("searches name, country, and highlights, ignoring case and diacritics", () => {
    expect(slugs(filterHikes(all, filters({ q: "reunion" })))).toEqual(["b"]);
    expect(slugs(filterHikes(all, filters({ q: "VOLCANIC" })))).toEqual(["b"]);
    expect(slugs(filterHikes(all, filters({ q: "nepal glacier" })))).toEqual(["a", "c"]);
    expect(filterHikes(all, filters({ q: "nepal volcanic" }))).toEqual([]);
  });

  it("applies each structured filter", () => {
    expect(slugs(filterHikes(all, filters({ style: "full-pack" })))).toEqual(["b"]);
    expect(slugs(filterHikes(all, filters({ country: "Nepal" })))).toEqual(["a", "c"]);
    expect(slugs(filterHikes(all, filters({ month: "June" })))).toEqual(["b"]);
    expect(slugs(filterHikes(all, filters({ minObscurity: 4 })))).toEqual(["b"]);
    expect(slugs(filterHikes(all, filters({ status: "shortlisted" })))).toEqual(["b"]);
    expect(slugs(filterHikes(all, filters({ difficulty: "hard" })))).toEqual(["b"]);
    expect(slugs(filterHikes(all, filters({ accommodation: "hut" })))).toEqual(["b"]);
  });

  it("treats 'either' pack weight as matching light and full", () => {
    expect(slugs(filterHikes(all, filters({ pack: "light" })))).toEqual(["a", "c"]);
    expect(slugs(filterHikes(all, filters({ pack: "full" })))).toEqual(["b", "c"]);
  });

  it("buckets length with inclusive upper bounds, covering fractional days", () => {
    expect(slugs(filterHikes(all, filters({ length: "short" })))).toEqual(["b"]);
    expect(slugs(filterHikes(all, filters({ length: "medium" })))).toEqual(["a", "c"]);
    expect(filterHikes(all, filters({ length: "epic" }))).toEqual([]);
  });

  it("counts active filters", () => {
    expect(countActiveFilters(INITIAL_FILTERS)).toBe(0);
    expect(countActiveFilters(filters({ q: "x", minObscurity: 3 }))).toBe(2);
  });
});

describe("sortHikes", () => {
  const a = hike({ slug: "a", name: "B-name", obscurity: 2, length_days: 9, difficulty: "hard" });
  const b = hike({ slug: "b", name: "A-name", obscurity: 2, length_days: 2, difficulty: "easy" });
  const c = hike({ slug: "c", name: "C-name", obscurity: 5, length_days: 4, difficulty: "moderate" });

  it("sorts by each key with name as tiebreak", () => {
    expect(slugs(sortHikes([a, b, c], "obscurity"))).toEqual(["c", "b", "a"]);
    expect(slugs(sortHikes([a, b, c], "longest"))).toEqual(["a", "c", "b"]);
    expect(slugs(sortHikes([a, b, c], "shortest"))).toEqual(["b", "c", "a"]);
    expect(slugs(sortHikes([a, b, c], "difficulty"))).toEqual(["a", "c", "b"]);
    expect(slugs(sortHikes([a, b, c], "name"))).toEqual(["b", "a", "c"]);
  });

  it("does not mutate its input", () => {
    const input = [a, b, c];
    sortHikes(input, "name");
    expect(slugs(input)).toEqual(["a", "b", "c"]);
  });
});

describe("query <-> URL", () => {
  it("serializes the default query to an empty string", () => {
    expect(serializeQuery(INITIAL_QUERY)).toBe("");
    expect(parseQuery(new URLSearchParams(""))).toEqual(INITIAL_QUERY);
  });

  it("round-trips a fully specified query", () => {
    const query: HikeQuery = {
      filters: {
        q: "hot springs",
        style: "mixed",
        country: "Réunion (France)",
        month: "July",
        minObscurity: 4,
        status: "shortlisted",
        difficulty: "very-hard",
        pack: "light",
        accommodation: "refuge",
        length: "long",
      },
      sort: "shortest",
      compare: ["a-b", "c"],
    };
    expect(parseQuery(new URLSearchParams(serializeQuery(query)))).toEqual(query);
  });

  it("falls back to defaults for invalid values", () => {
    const parsed = parseQuery(
      new URLSearchParams(
        "style=nope&month=Smarch&obs=9&status=x&diff=x&pack=either&stay=x&days=x&sort=x&cmp=OK,,a,a,b,c,d,e",
      ),
    );
    expect(parsed).toEqual({ ...INITIAL_QUERY, compare: ["a", "b", "c", "d", "e"] });
  });

  it("drops values missing from the catalog before capping compare", () => {
    const known = ["a", "b", "c", "d", "e"].map((slug) => ({ slug, country: "Nepal" }));
    const parsed = parseQuery(
      new URLSearchParams("country=Narnia&cmp=x1,x2,x3,x4,e,a,b,c,d"),
      known,
    );
    expect(parsed.filters.country).toBe("all");
    expect(parsed.compare).toEqual(["e", "a", "b", "c"]);
    expect(
      parseQuery(new URLSearchParams("country=Nepal"), known).filters.country,
    ).toBe("Nepal");
    // Without a catalog, values pass through so links can carry them.
    expect(
      parseQuery(new URLSearchParams("country=Narnia&cmp=x1")),
    ).toMatchObject({ filters: { country: "Narnia" }, compare: ["x1"] });
  });

  it("applyQuery filters then sorts", () => {
    const a = hike({ slug: "a", name: "Zed", obscurity: 5 });
    const b = hike({ slug: "b", name: "Abe", obscurity: 5 });
    const c = hike({ slug: "c", name: "Low", obscurity: 1 });
    const query = { ...INITIAL_QUERY, filters: filters({ minObscurity: 2 }) };
    expect(slugs(applyQuery([a, b, c], query))).toEqual(["b", "a"]);
  });
});

describe("toggleCompare", () => {
  it("adds, removes, and caps the selection", () => {
    expect(toggleCompare([], "a")).toEqual(["a"]);
    expect(toggleCompare(["a", "b"], "a")).toEqual(["b"]);
    const full = Array.from({ length: MAX_COMPARE }, (_, i) => `h${i}`);
    expect(toggleCompare(full, "extra")).toEqual(full);
  });
});

describe("related hikes", () => {
  it("computes great-circle distance", () => {
    // Paris -> London is ~344 km.
    expect(haversineKm([48.8566, 2.3522], [51.5074, -0.1278])).toBeCloseTo(344, -1);
    expect(haversineKm([10, 10], [10, 10])).toBe(0);
  });

  const origin = hike({ slug: "origin", coordinates: [0, 0] });
  const near = hike({ slug: "near", coordinates: [0, 1], style: "full-pack", difficulty: "very-hard", length_days: 30 });
  const far = hike({ slug: "far", coordinates: [0, 90] });

  it("nearestHikes orders by distance and excludes the hike itself", () => {
    const result = nearestHikes(origin, [far, origin, near], 5);
    expect(result.map((r) => r.hike.slug)).toEqual(["near", "far"]);
    expect(result[0].km).toBeCloseTo(111, -1);
  });

  it("similarHikes ranks by trip character, not location, and honors exclusions", () => {
    expect(slugs(similarHikes(origin, [near, far, origin], 5))).toEqual(["far", "near"]);
    expect(slugs(similarHikes(origin, [near, far], 5, ["far"]))).toEqual(["near"]);
  });

  it("works across the real dataset", () => {
    const all = loadSummaries();
    const nearest = nearestHikes(all[0], all, 4);
    expect(nearest).toHaveLength(4);
    expect(similarHikes(all[0], all, 4, nearest.map((n) => n.hike.slug))).toHaveLength(4);
  });
});
