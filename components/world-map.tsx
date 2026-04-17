import { readFileSync } from "node:fs";
import { join } from "node:path";
import { geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import Link from "next/link";
import type { Hike } from "@/lib/schema";

const WIDTH = 960;
const HEIGHT = 500;

function loadLand(): FeatureCollection<Geometry> {
  const path = join(
    process.cwd(),
    "node_modules",
    "world-atlas",
    "land-110m.json",
  );
  const topo = JSON.parse(readFileSync(path, "utf8")) as Topology;
  const land = feature(
    topo,
    topo.objects.land as GeometryCollection,
  ) as unknown as FeatureCollection<Geometry>;
  return land;
}

export function WorldMap({ hikes }: { hikes: Hike[] }) {
  const land = loadLand();
  const projection = geoEqualEarth()
    .fitSize([WIDTH, HEIGHT], land)
    .precision(0.1);
  const pathFn = geoPath(projection);
  const landPath = pathFn(land) ?? "";

  const pins = hikes
    .map((h) => {
      const projected = projection([h.coordinates[1], h.coordinates[0]]);
      if (!projected) return null;
      return { hike: h, x: projected[0], y: projected[1] };
    })
    .filter((p): p is { hike: Hike; x: number; y: number } => p !== null);

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label="World map of catalogued hikes"
      >
        <rect
          x={0}
          y={0}
          width={WIDTH}
          height={HEIGHT}
          className="fill-neutral-50 dark:fill-neutral-950"
        />
        <path
          d={landPath}
          className="fill-neutral-200 dark:fill-neutral-800 stroke-neutral-300 dark:stroke-neutral-700"
          strokeWidth={0.5}
        />
        {pins.map(({ hike, x, y }) => (
          <Link
            key={hike.slug}
            href={`/hikes/${hike.slug}`}
            aria-label={hike.name}
          >
            <g className="group cursor-pointer">
              <circle
                cx={x}
                cy={y}
                r={6}
                className="fill-sky-500/30 group-hover:fill-sky-500/60 transition"
              />
              <circle
                cx={x}
                cy={y}
                r={3}
                className="fill-sky-600 group-hover:fill-sky-400 transition"
              />
              <title>
                {hike.name} · {hike.country}
              </title>
            </g>
          </Link>
        ))}
      </svg>
    </div>
  );
}
