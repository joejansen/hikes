import { geoEqualEarth, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import landTopo from "world-atlas/land-110m.json";
import countriesTopo from "world-atlas/countries-110m.json";
import type { Hike } from "@/lib/schema";
import { WorldMapInteractive } from "./world-map-interactive";

const WIDTH = 960;
const HEIGHT = 500;

const land = feature(
  landTopo as unknown as Topology,
  (landTopo as unknown as Topology).objects.land as GeometryCollection,
) as unknown as FeatureCollection<Geometry>;

const countryBorders = mesh(
  countriesTopo as unknown as Topology,
  (countriesTopo as unknown as Topology).objects.countries as GeometryCollection,
  (a, b) => a !== b,
);

const projection = geoEqualEarth().fitSize([WIDTH, HEIGHT], land).precision(0.1);
const pathFn = geoPath(projection);
const LAND_PATH = pathFn(land) ?? "";
const BORDERS_PATH = pathFn(countryBorders) ?? "";

export function WorldMap({ hikes }: { hikes: Hike[] }) {
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
      landPath={LAND_PATH}
      bordersPath={BORDERS_PATH}
      pins={pins}
    />
  );
}
