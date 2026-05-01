import { loadHikes } from "@/lib/load-hikes";
import { WorldMap } from "@/components/world-map";

export const metadata = { title: "Map · Hike Research" };

export default function MapPage() {
  const hikes = loadHikes();
  return (
    <div>
      <section className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Map</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          One pin per hike. Scroll or use the controls to zoom; drag to pan.
          Hover a pin for the name, click to open the detail page.
        </p>
      </section>
      <WorldMap hikes={hikes} />
      <ul className="mt-6 text-sm text-neutral-600 dark:text-neutral-400 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
        {hikes.map((h) => (
          <li key={h.slug}>
            <a
              href={`/hikes/${h.slug}`}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 hover:underline"
            >
              {h.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
