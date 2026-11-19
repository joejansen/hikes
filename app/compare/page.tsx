import { Suspense } from "react";
import { CompareView } from "@/components/compare-view";
import { loadHikes } from "@/lib/load-hikes";

export const metadata = { title: "Compare · Hike Research" };

export default function ComparePage() {
  const hikes = loadHikes();
  return (
    <div>
      <section className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Compare</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Up to four hikes side by side. The selection lives in the URL, so a
          comparison can be bookmarked or shared.
        </p>
      </section>
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
        <CompareView hikes={hikes} />
      </Suspense>
    </div>
  );
}
