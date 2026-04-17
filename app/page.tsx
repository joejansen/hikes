import { HikeBrowser } from "@/components/hike-browser";
import { loadHikes } from "@/lib/load-hikes";

export default function Home() {
  const hikes = loadHikes();
  return (
    <div>
      <section className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          Hikes worth considering
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl">
          A personal catalog of hut-to-hut routes. Favors the quieter,
          less-touristy end of the scale — obscurity 5 is &ldquo;barely documented&rdquo;,
          obscurity 1 is Tour du Mont Blanc.
        </p>
      </section>
      <HikeBrowser hikes={hikes} />
    </div>
  );
}
