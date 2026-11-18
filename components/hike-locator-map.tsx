"use client";

import type { HikeSummary } from "@/lib/hike-summary";
import { HikeMapLazy } from "./hike-map-lazy";

const HEIGHT_PX = 300;

// Small map on the detail page: the hike itself highlighted, plus its
// neighbors as regular pins.
export function HikeLocatorMap({
  hikes,
  focusSlug,
  apiKey,
}: {
  hikes: HikeSummary[];
  focusSlug: string;
  apiKey: string | null;
}) {
  return (
    <div style={{ height: HEIGHT_PX }}>
      <HikeMapLazy
        hikes={hikes}
        focusSlug={focusSlug}
        apiKey={apiKey}
        height={HEIGHT_PX}
      />
    </div>
  );
}
