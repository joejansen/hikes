import { readFileSync } from "node:fs";
import { join } from "node:path";
import { geoEqualEarth, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Hike } from "@/lib/schema";
import { WorldMapInteractive } from "./world-map-interactive";

const WIDTH = 960;
const HEIGHT = 500;

function loadTopo(file: string): Topology {
  const path = join(process.cwd(), "node_modules", "world-atlas", file);
  return JSON.parse(readFileSync(path, "utf8")) as Topology;
}

export function WorldMap({ hikes }: { hikes: Hike[] }) {
  const landTopo = loadTopo("land-110m.json");
  const countriesTopo = loadTopo("countries-110m.json");

  const land = feature(
    landTopo,
    landTopo.objects.land as GeometryCollection,
  ) as unknown as FeatureCollection<Geometry>;

  const countryBorders = mesh(
    countriesTopo,
    countriesTopo.objects.countries as GeometryCollection,
    (a, b) => a !== b,
  );

  const projection = geoEqualEarth()
    .fitSize([WIDTH, HEIGHT], land)
    .precision(0.1);
  const pathFn = geoPath(projection);

  const landPath = pathFn(land) ?? "";
  const bordersPath = pathFn(countryBorders) ?? "";

  const pins = hikes
    .map((h) => {
      const projected = projection([h.coordinates[1], h.coordinates[0]]);
      if (!projected) return null;
      return {
        slug: h.slug,
        name: h.name,
        country: h.country,
        x: projected[0],
        y: projected[1],
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return (
    <WorldMapInteractive
      width={WIDTH}
      height={HEIGHT}
      landPath={landPath}
      bordersPath={bordersPath}
      pins={pins}
    />
  );
}
