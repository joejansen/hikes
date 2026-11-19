import { Suspense } from "react";
import { loadSummaries } from "@/lib/load-hikes";
import { readMapApiKey } from "@/lib/map-key";
import { HikeMapBrowser } from "@/components/hike-map-browser";

export const metadata = { title: "Map · Hike Research" };

export default function MapPage() {
  const hikes = loadSummaries();
  const apiKey = readMapApiKey();
  return (
    <div>
      <section className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Map</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          One pin per hike. Filter to narrow the set, hover for a quick card,
          click to open the detail page.
          {apiKey && " Switch between outdoor, streets, and satellite layers."}
        </p>
      </section>
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading map…</p>}>
        <HikeMapBrowser hikes={hikes} apiKey={apiKey} />
      </Suspense>
    </div>
  );
}
