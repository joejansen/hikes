import { loadHikes } from "@/lib/load-hikes";
import { HikeMapBrowser } from "@/components/hike-map-browser";

export const metadata = { title: "Map · Hike Research" };

export default function MapPage() {
  const hikes = loadHikes();
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? null;
  return (
    <div>
      <section className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Map</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          One pin per hike. Filter to narrow the set, hover for a quick card,
          click to open the detail page. Switch between outdoor, streets, and
          satellite layers.
        </p>
      </section>
      <HikeMapBrowser hikes={hikes} apiKey={apiKey} />
    </div>
  );
}
