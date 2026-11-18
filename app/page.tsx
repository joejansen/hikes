import { Suspense } from "react";
import { HikeBrowser } from "@/components/hike-browser";
import { loadSummaries } from "@/lib/load-hikes";

export default function Home() {
  const hikes = loadSummaries();
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
      <Suspense fallback={<BrowserSkeleton />}>
        <HikeBrowser hikes={hikes} />
      </Suspense>
    </div>
  );
}

// Filters come from the URL query string, which is not known at build time,
// so the browser renders on the client. Prerendering the full unfiltered grid
// as the fallback was measured at 2.4 MB of HTML (cards are serialized twice);
// a skeleton keeps the page small and avoids flashing unfiltered results.
function BrowserSkeleton() {
  return (
    <div aria-busy="true">
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 mb-6 h-[190px] sm:h-[134px]" />
      <p className="text-sm text-neutral-500">Loading hikes…</p>
    </div>
  );
}
